"use client";

import { useAppointmentStore } from "../_reception_stores/appointment_store";
import { HospitalAppointment } from "../_reception_types/appointment_types";
import { useRosterStore, StaffShiftRoster } from "@/app/(admin)/_admin_stores/admin_roster_store";
import { useStaffUserStore } from "@/app/(admin)/_admin_stores/admin_user_store";
import { StaffUser } from "@/app/(admin)/_admin_types/staff_user_types";
import { NotificationService } from "@/app/(admin)/_admin_services/notification_service";

export interface DoctorAvailabilityResult {
  available: boolean;
  status: "ACTIVE_SHIFT" | "ON_LEAVE" | "SUSPENDED" | "OFF_DUTY";
  reason?: string;
}

export class AppointmentService {
  /**
   * Validates if a doctor is available on a given date by checking duty roster & leave status
   */
  static checkDoctorAvailability(doctorId: string, date: string): DoctorAvailabilityResult {
    const rosterState = useRosterStore.getState();
    const rosterEntries: StaffShiftRoster[] = rosterState.rosters;

    // 1. Check if the specific day slot is blocked in Roster Master by Doctor
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dateObj = new Date(date);
    const dayName = !isNaN(dateObj.getTime()) ? dayNames[dateObj.getDay()] : "";

    const isBlocked = rosterState.isSlotBlocked
      ? rosterState.isSlotBlocked(dayName, doctorId)
      : !!(rosterState.blockedSlots?.[`${doctorId}-${dayName}`] || rosterState.blockedSlots?.[dayName]);

    if (isBlocked) {
      return {
        available: false,
        status: "OFF_DUTY",
        reason: `OPD Consultation slot on ${dayName} (${date}) is BLOCKED in Roster Master by Doctor. Appointments cannot be booked.`,
      };
    }

    // 2. Check if doctor has an active shift or approved leave in roster
    const docEntry = rosterEntries.find(
      (r: StaffShiftRoster) =>
        r.staffId === doctorId ||
        r.userId === doctorId ||
        r.staffName.toLowerCase().includes(doctorId.toLowerCase())
    );

    if (docEntry) {
      if (docEntry.status === "OFF_DUTY") {
        return {
          available: false,
          status: "ON_LEAVE",
          reason: `Dr. ${docEntry.staffName} is marked OFF DUTY on the roster for ${date}.`,
        };
      }
    }

    // 3. Check user store for active status
    const users: StaffUser[] = useStaffUserStore.getState().users;
    const userDoc = users.find(
      (u: StaffUser) =>
        u.id === doctorId ||
        u.staffId === doctorId ||
        u.fullName.toLowerCase().includes(doctorId.toLowerCase())
    );

    if (userDoc) {
      if (userDoc.status === "SUSPENDED" || userDoc.status === "TERMINATED") {
        return {
          available: false,
          status: "SUSPENDED",
          reason: `Doctor account is ${userDoc.status}. Cannot accept OPD bookings.`,
        };
      }
    }

    return {
      available: true,
      status: "ACTIVE_SHIFT",
    };
  }

  /**
   * Books a new appointment with validation and auto-dispatch
   */
  static bookAppointment(params: {
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
  }): { success: boolean; message: string; appointment?: HospitalAppointment } {
    // 1. Availability check
    const avail = this.checkDoctorAvailability(params.doctorId, params.date);
    if (!avail.available) {
      return {
        success: false,
        message: avail.reason || "Doctor is not available for consultation.",
      };
    }

    // 2. Book in store
    const app = useAppointmentStore.getState().addAppointment({
      ...params,
      status: "WAITING",
    });

    // 3. Dispatch Notification SMS/WhatsApp
    try {
      NotificationService.sendNotification(
        {
          channel: "sms",
          priority: "normal",
          category: "APPOINTMENT_REMINDER",
          patientName: params.patientName,
          recipientRole: "PATIENT",
          recipientContact: params.phone,
          templateKey: "APPOINTMENT_REMINDER",
          templateVariables: {
            patientName: params.patientName,
            doctorName: params.doctorName,
            departmentName: params.departmentName,
            appointmentTime: `${params.date} at ${params.slot}`,
          },
        },
        "OPD Reception Desk",
        "RECEPTIONIST"
      );
    } catch {
      // Non-blocking notification dispatch
    }

    return {
      success: true,
      message: `OPD Queue Token ${app.tokenNo} issued for ${app.doctorName} at ${app.slot}!`,
      appointment: app,
    };
  }

  /**
   * Reschedules an appointment to a new date and time slot
   */
  static reschedule(id: string, newDate: string, newSlot: string): { success: boolean; message: string } {
    const success = useAppointmentStore.getState().rescheduleAppointment(id, newDate, newSlot);
    if (success) {
      return {
        success: true,
        message: `Appointment successfully rescheduled to ${newDate} at ${newSlot}.`,
      };
    }
    return { success: false, message: "Failed to find appointment record." };
  }

  /**
   * Cancels an appointment with reason tracking
   */
  static cancel(id: string, reason: string): { success: boolean; message: string } {
    const success = useAppointmentStore.getState().cancelAppointment(id, reason);
    if (success) {
      return {
        success: true,
        message: "Appointment cancelled successfully.",
      };
    }
    return { success: false, message: "Failed to find appointment record." };
  }
}

