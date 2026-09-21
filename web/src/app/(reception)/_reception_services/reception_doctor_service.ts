"use client";

import { useStaffUserStore } from "@/app/(admin)/_admin_stores/admin_user_store";
import { useRosterStore } from "@/app/(admin)/_admin_stores/admin_roster_store";
import { StaffUser } from "@/app/(admin)/_admin_types/staff_user_types";
import { StaffShiftRoster } from "@/app/(admin)/_admin_types/roster_types";
import { HospitalAppointment } from "../_reception_types/appointment_types";
import { dayNameOf, isPastDate, isPastSlot, isValidDateString } from "../_reception_utils/date_utils";

export interface ReceptionDoctor {
  id: string; // canonical staff id, e.g. "DOC-101"
  name: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  room: string;
  status: string;
}

export type AvailabilityStatus =
  | "ACTIVE_SHIFT"
  | "ON_LEAVE"
  | "SUSPENDED"
  | "OFF_DUTY"
  | "NOT_FOUND"
  | "NOT_ACTIVE"
  | "PAST_DATE"
  | "INVALID_DATE";

export interface DoctorAvailabilityResult {
  available: boolean;
  status: AvailabilityStatus;
  reason?: string;
}

export interface DoctorSlot {
  slot: string;
  taken: boolean;
  past: boolean;
  patientName?: string;
  tokenNo?: string;
}

/** Unified OPD slot template shared by the booking drawer, reschedule modal and validators. */
export const OPD_SLOT_TEMPLATE = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
];

const normalizeName = (name: string): string =>
  (name || "")
    .replace(/^dr\.?\s*/i, "")
    .replace(/[^a-z]/gi, "")
    .toLowerCase();

/**
 * Doctor master + OPD availability for the reception desk.
 *
 * Fixes the previous behaviour where:
 *  - three different hard-coded doctor lists disagreed with the staff master,
 *  - the roster "OFF_DUTY" guard could never match (staffId/userId/name comparison was inverted),
 *  - the duty date was ignored and past dates/slots were bookable.
 */
export class ReceptionDoctorService {
  static getDoctors(): ReceptionDoctor[] {
    const users = useStaffUserStore.getState().users;
    const rosters = useRosterStore.getState().rosters;

    return users
      .filter((user: StaffUser) => user.roleCategory === "DOCTOR")
      .map((user: StaffUser) => {
        const shift = this.findRosterEntry(user, rosters);
        return {
          id: user.staffId,
          name: user.fullName,
          departmentId: user.departmentId,
          departmentCode: user.departmentCode,
          departmentName: user.departmentName,
          room: shift?.assignedWardOrRoom || "OPD Clinic",
          status: user.status,
        };
      });
  }

  static getDoctor(doctorId: string): ReceptionDoctor | undefined {
    if (!doctorId) return undefined;
    const normalized = doctorId.trim().toLowerCase();
    return this.getDoctors().find(
      (doc) => doc.id.toLowerCase() === normalized || normalizeName(doc.name) === normalizeName(doctorId)
    );
  }

  /** Roster row for a staff user, joined on canonical ids first and normalised name second. */
  static findRosterEntry(
    user: StaffUser,
    rosters: StaffShiftRoster[]
  ): StaffShiftRoster | undefined {
    const staffKey = (user.staffId || "").toLowerCase();
    const userKey = (user.id || "").toLowerCase();
    const nameKey = normalizeName(user.fullName);

    return rosters.find(
      (r) =>
        Boolean(staffKey && (r.staffId || "").toLowerCase() === staffKey) ||
        Boolean(userKey && (r.userId || "").toLowerCase() === userKey) ||
        Boolean(nameKey && normalizeName(r.staffName) === nameKey)
    );
  }

  private static isRosterEntryForUser(entry: StaffShiftRoster, user: StaffUser): boolean {
    const staffKey = (user.staffId || "").toLowerCase();
    const userKey = (user.id || "").toLowerCase();
    const nameKey = normalizeName(user.fullName);
    return (
      Boolean(staffKey && (entry.staffId || "").toLowerCase() === staffKey) ||
      Boolean(userKey && (entry.userId || "").toLowerCase() === userKey) ||
      Boolean(nameKey && normalizeName(entry.staffName) === nameKey)
    );
  }


  /**
   * Validates that a doctor can accept an OPD booking on a given date.
   * Checks: valid/future date, staff-master presence, account status, blocked clinic day,
   * and duty-roster leave status **for that date only**.
   */
  static checkDoctorAvailability(doctorId: string, date: string): DoctorAvailabilityResult {
    if (!isValidDateString(date)) {
      return { available: false, status: "INVALID_DATE", reason: "Select a valid consultation date (YYYY-MM-DD)." };
    }
    if (isPastDate(date)) {
      return {
        available: false,
        status: "PAST_DATE",
        reason: `Consultation date ${date} is in the past. Pick today or a future date.`,
      };
    }

    const doctor = this.getDoctor(doctorId);
    if (!doctor) {
      return {
        available: false,
        status: "NOT_FOUND",
        reason: `Doctor "${doctorId}" is not present in the staff master. Add the doctor in Admin → Staff & RBAC before booking.`,
      };
    }

    if (doctor.status !== "ACTIVE") {
      return {
        available: false,
        status: doctor.status === "INVITED" ? "NOT_ACTIVE" : "SUSPENDED",
        reason: `${doctor.name} account status is ${doctor.status}. OPD bookings are blocked.`,
      };
    }

    const dayName = dayNameOf(date);
    if (useRosterStore.getState().isSlotBlocked(dayName, doctor.id)) {
      return {
        available: false,
        status: "OFF_DUTY",
        reason: `${doctor.name} has BLOCKED the ${dayName} OPD clinic slot in Roster Master (${date}).`,
      };
    }

    const staffUser = useStaffUserStore.getState().users.find((u) => u.staffId === doctor.id);
    if (staffUser) {
      const dutyEntry = useRosterStore
        .getState()
        .rosters.find((r) => r.dutyDate === date && this.isRosterEntryForUser(r, staffUser));

      if (dutyEntry && (dutyEntry.status === "OFF_DUTY" || dutyEntry.status === "ON_LEAVE")) {
        return {
          available: false,
          status: "ON_LEAVE",
          reason: `${doctor.name} is marked ${dutyEntry.status.replace("_", " ")} on the duty roster for ${date}.`,
        };
      }
    }

    return { available: true, status: "ACTIVE_SHIFT" };
  }

  /** Slot template for a doctor/date with taken + past flags resolved from the live queue. */
  static getSlotsForDoctor(
    doctorId: string,
    date: string,
    appointments: HospitalAppointment[],
    excludeAppointmentId?: string
  ): DoctorSlot[] {
    const relevant = appointments.filter(
      (a) =>
        a.doctorId === doctorId &&
        a.date === date &&
        a.status !== "CANCELLED" &&
        a.id !== excludeAppointmentId
    );

    return OPD_SLOT_TEMPLATE.map((slot) => {
      const booked = relevant.find((a) => a.slot === slot);
      return {
        slot,
        taken: Boolean(booked),
        past: isPastSlot(date, slot),
        patientName: booked?.patientName,
        tokenNo: booked?.tokenNo,
      };
    });
  }

  /** True when (doctor, date, slot) is already occupied by a live appointment. */
  static isSlotTaken(
    doctorId: string,
    date: string,
    slot: string,
    appointments: HospitalAppointment[],
    excludeAppointmentId?: string
  ): boolean {
    return appointments.some(
      (a) =>
        a.doctorId === doctorId &&
        a.date === date &&
        a.slot === slot &&
        a.status !== "CANCELLED" &&
        a.id !== excludeAppointmentId
    );
  }
}
