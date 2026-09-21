"use client";

import { useAppointmentStore } from "../_reception_stores/appointment_store";
import { HospitalAppointment } from "../_reception_types/appointment_types";
import { NotificationService } from "@/app/(admin)/_admin_services/notification_service";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import { DoctorAvailabilityResult, ReceptionDoctorService } from "./reception_doctor_service";
import { useReceptionVisitStore } from "../_reception_stores/reception_visit_store";
import { isValidDateString } from "../_reception_utils/date_utils";

export type { DoctorAvailabilityResult };

export interface BookingParams {
  uhid: string;
  patientName: string;
  phone: string;
  ageGender: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  opdRoom: string;
  date: string;
  slot: string;
  /** Optional reception visit to link the issued token back to the triage record. */
  visitId?: string;
}

const ACTOR = "OPD Reception Desk";
const ACTOR_ROLE = "RECEPTIONIST";

/**
 * Front-desk appointment engine.
 *
 * Fixes applied: doctor availability is resolved through `ReceptionDoctorService` (canonical
 * staff ids + duty date + per-doctor clinic blocks + future-date guard), slot conflicts are
 * rejected here and inside the store, and every booking mutation is written to the platform
 * audit ledger.
 */
export class AppointmentService {
  /** Validates whether a doctor can accept a booking on a date. */
  static checkDoctorAvailability(doctorId: string, date: string): DoctorAvailabilityResult {
    return ReceptionDoctorService.checkDoctorAvailability(doctorId, date);
  }

  /** Slots for the booking UI, with taken/past flags resolved from the live queue. */
  static getAvailableSlots(doctorId: string, date: string, excludeAppointmentId?: string) {
    return ReceptionDoctorService.getSlotsForDoctor(
      doctorId,
      date,
      useAppointmentStore.getState().appointments,
      excludeAppointmentId
    );
  }

  /** Books a new appointment with availability + slot-conflict validation. */
  static bookAppointment(
    params: BookingParams
  ): { success: boolean; message: string; appointment?: HospitalAppointment } {
    if (!params.uhid) {
      return { success: false, message: "Select the patient before issuing a token." };
    }
    if (!isValidDateString(params.date)) {
      return { success: false, message: "Select a valid consultation date." };
    }
    if (!params.slot) {
      return { success: false, message: "Select an available time slot." };
    }

    // 1. Doctor availability (staff master, account status, clinic blocks, roster leave, date)
    const availability = this.checkDoctorAvailability(params.doctorId, params.date);
    if (!availability.available) {
      return {
        success: false,
        message: availability.reason || "Doctor is not available for consultation.",
      };
    }

    // 2. Slot capacity: one live token per (doctor, date, slot)
    const state = useAppointmentStore.getState();
    if (
      ReceptionDoctorService.isSlotTaken(
        params.doctorId,
        params.date,
        params.slot,
        state.appointments
      )
    ) {
      return {
        success: false,
        message: `Slot ${params.slot} with ${params.doctorName} on ${params.date} is already booked. Choose another slot.`,
      };
    }

    // 3. Book (the store re-checks the conflict so no caller can bypass it)
    const app = state.addAppointment({
      uhid: params.uhid,
      patientName: params.patientName,
      phone: params.phone,
      ageGender: params.ageGender,
      departmentId: params.departmentId,
      departmentCode: params.departmentCode,
      departmentName: params.departmentName,
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      opdRoom: params.opdRoom,
      date: params.date,
      slot: params.slot,
      status: "WAITING",
    });

    if (!app) {
      return {
        success: false,
        message: "Slot was just taken by another booking. Refresh and pick another slot.",
      };
    }

    // 4. Link the token to the reception triage visit when one was opened
    if (params.visitId) {
      try {
        useReceptionVisitStore.getState().linkAppointment(params.visitId, app.id, app.tokenNo);
      } catch {
        /* visit link is best-effort */
      }
    }

    // 5. Dispatch the appointment reminder (non-blocking)
    try {
      NotificationService.sendNotification(
        {
          channel: "sms",
          priority: "normal",
          category: "APPOINTMENT_REMINDER",
          patientId: params.uhid,
          patientName: params.patientName,
          recipientRole: "PATIENT",
          recipientContact: params.phone,
          templateKey: "TPL_APPOINTMENT_REMINDER",
          templateVariables: {
            patientName: params.patientName,
            doctorName: params.doctorName,
            departmentName: params.departmentName,
            appointmentTime: `${params.date} at ${params.slot}`,
          },
        },
        ACTOR,
        ACTOR_ROLE
      );
    } catch {
      /* Non-blocking notification dispatch */
    }

    this.audit(
      "OPD Token Issued",
      app,
      `Token ${app.tokenNo} issued for ${app.patientName} (${app.uhid}) with ${app.doctorName} on ${app.date} at ${app.slot}.`
    );

    return {
      success: true,
      message: `OPD Queue Token ${app.tokenNo} issued for ${app.doctorName} at ${app.slot}!`,
      appointment: app,
    };
  }

  /** Reschedules an appointment to a new date/time slot (availability + conflict checked). */
  static reschedule(id: string, newDate: string, newSlot: string): { success: boolean; message: string } {
    const store = useAppointmentStore.getState();
    const existing = store.appointments.find((a) => a.id === id);
    if (!existing) return { success: false, message: "Failed to find appointment record." };

    const availability = this.checkDoctorAvailability(existing.doctorId, newDate);
    if (!availability.available) {
      return {
        success: false,
        message: availability.reason || "Doctor is not available on the selected date.",
      };
    }

    const result = store.rescheduleAppointment(id, newDate, newSlot);
    if (result.success) {
      this.audit(
        "OPD Appointment Rescheduled",
        { ...existing, date: newDate, slot: newSlot },
        `Token ${existing.tokenNo} (${existing.patientName}) moved from ${existing.date} ${existing.slot} to ${newDate} ${newSlot}.`
      );

      try {
        NotificationService.sendNotification(
          {
            channel: "sms",
            priority: "normal",
            category: "APPOINTMENT_REMINDER",
            patientId: existing.uhid,
            patientName: existing.patientName,
            recipientRole: "PATIENT",
            recipientContact: existing.phone,
            templateKey: "TPL_APPOINTMENT_REMINDER",
            templateVariables: {
              patientName: existing.patientName,
              doctorName: existing.doctorName,
              departmentName: existing.departmentName,
              appointmentTime: `${newDate} at ${newSlot}`,
            },
          },
          ACTOR,
          ACTOR_ROLE
        );
      } catch {
        /* Non-blocking notification dispatch */
      }
    }

    return { success: result.success, message: result.message };
  }

  /** Cancels an appointment with reason tracking. */
  static cancel(id: string, reason: string): { success: boolean; message: string } {
    const store = useAppointmentStore.getState();
    const existing = store.appointments.find((a) => a.id === id);
    const result = store.cancelAppointment(id, reason);

    if (result.success && existing) {
      this.audit(
        "OPD Appointment Cancelled",
        existing,
        `Token ${existing.tokenNo} (${existing.patientName}) cancelled. Reason: ${reason}.`
      );
    }

    return { success: result.success, message: result.message };
  }

  /** Moves a waiting patient into the consultation room (audited). */
  static callPatientIn(id: string): { success: boolean; message: string } {
    const app = useAppointmentStore.getState().appointments.find((a) => a.id === id);
    if (!app) return { success: false, message: "Appointment record not found." };
    if (app.status === "CANCELLED") {
      return { success: false, message: `Token ${app.tokenNo} is cancelled and cannot be called in.` };
    }
    if (app.status === "IN_CONSULTATION") {
      return { success: false, message: `${app.patientName} is already in consultation.` };
    }

    useAppointmentStore.getState().updateStatus(id, "IN_CONSULTATION");
    this.audit(
      "OPD Patient Called In",
      app,
      `Token ${app.tokenNo} (${app.patientName}) moved to consultation with ${app.doctorName}.`
    );

    return { success: true, message: `Patient ${app.patientName} called in to ${app.opdRoom}.` };
  }

  private static audit(action: string, appointment: HospitalAppointment, details: string): void {
    try {
      PlatformAuditService.recordAuditEvent({
        actor: ACTOR,
        actorRole: ACTOR_ROLE,
        action,
        category: "GOVERNANCE_EVENT",
        entity: `Appointment: ${appointment.tokenNo} (${appointment.uhid})`,
        ipAddress: "192.168.1.105",
        riskLevel: "INFO",
        details,
      });
    } catch {
      /* audit logging must never block the desk */
    }
  }
}
