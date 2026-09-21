"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HospitalAppointment, AppointmentStatus } from "../_reception_types/appointment_types";
import { todayLocalDate, tomorrowLocalDate } from "../_reception_utils/date_utils";

export interface MutationResult {
  success: boolean;
  message: string;
  appointment?: HospitalAppointment;
}

export interface AppointmentStoreState {
  appointments: HospitalAppointment[];
  /** Token sequence is tracked per consultation date so tokens restart every OPD day. */
  lastTokenSeqByDate: Record<string, number>;
  /** Returns null when the (doctor, date, slot) is already occupied. */
  addAppointment: (
    appointment: Omit<HospitalAppointment, "id" | "tokenNo" | "bookedAt">
  ) => HospitalAppointment | null;
  updateStatus: (id: string, status: AppointmentStatus) => void;
  /** Kiosk self check-in: stamps the arrival time on today's live appointment. */
  markCheckedIn: (id: string) => void;
  rescheduleAppointment: (id: string, newDate: string, newSlot: string) => MutationResult;
  cancelAppointment: (id: string, reason: string) => MutationResult;
  getAppointmentsForDate: (date: string) => HospitalAppointment[];
  getNextTokenNo: (date: string) => string;
  resetToDefaults: () => void;
}


/** Demo queue rows. Doctor/department ids intentionally match the Admin staff master. */
const DEFAULT_APPOINTMENTS: HospitalAppointment[] = [
  {
    id: "app-101",
    tokenNo: "T-01",
    uhid: "P-2026-1049",
    patientName: "Sunil Verma",
    phone: "9876543210",
    ageGender: "45 / Male",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    doctorId: "DOC-101",
    doctorName: "Dr. Rajesh Sharma",
    opdRoom: "OPD Clinic Room 104",
    date: todayLocalDate(),
    slot: "10:30 AM",
    status: "WAITING",
    bookedAt: new Date().toISOString(),
  },
  {
    id: "app-102",
    tokenNo: "T-02",
    uhid: "P-2026-1052",
    patientName: "Anjali Gupta",
    phone: "9811122334",
    ageGender: "32 / Female",
    departmentId: "dept-102",
    departmentCode: "NEURO-02",
    departmentName: "Neurology & Neurosurgery",
    doctorId: "DOC-102",
    doctorName: "Dr. Ananya Roy",
    opdRoom: "OPD Clinic 2",
    date: todayLocalDate(),
    slot: "11:00 AM",
    status: "IN_CONSULTATION",
    bookedAt: new Date().toISOString(),
  },
  {
    id: "app-103",
    tokenNo: "T-03",
    uhid: "P-2026-1058",
    patientName: "Ramesh Kumar",
    phone: "9922233445",
    ageGender: "58 / Male",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    doctorId: "DOC-101",
    doctorName: "Dr. Rajesh Sharma",
    opdRoom: "OPD Clinic Room 104",
    date: todayLocalDate(),
    slot: "11:30 AM",
    status: "WAITING",
    bookedAt: new Date().toISOString(),
  },
  {
    id: "app-104",
    tokenNo: "T-04",
    uhid: "P-2026-1065",
    patientName: "Meena Joshi",
    phone: "9765432109",
    ageGender: "29 / Female",
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    departmentName: "Intensive Care & Coronary Care Unit",
    doctorId: "DOC-103",
    doctorName: "Dr. Vikram Sethi",
    opdRoom: "OPD Clinic 3",
    date: todayLocalDate(),
    slot: "12:00 PM",
    status: "WAITING",
    bookedAt: new Date().toISOString(),
  },
  {
    id: "app-105",
    tokenNo: "T-01",
    uhid: "P-2026-1062",
    patientName: "Priya Sharma",
    phone: "9833344556",
    ageGender: "38 / Female",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    doctorId: "DOC-101",
    doctorName: "Dr. Rajesh Sharma",
    opdRoom: "OPD Clinic Room 104",
    date: tomorrowLocalDate(),
    slot: "10:00 AM",
    status: "WAITING",
    bookedAt: new Date().toISOString(),
  },
];


/** Persisted per-day token counter lookup with a safe fallback for never-seen dates. */
function getPersistedSeq(state: AppointmentStoreState, date: string): number {
  return state.lastTokenSeqByDate?.[date] || 0;
}

export const useAppointmentStore = create<AppointmentStoreState>()(
  persist(
    (set, get) => ({
      appointments: DEFAULT_APPOINTMENTS,
      lastTokenSeqByDate: {
        [todayLocalDate()]: 4,
        [tomorrowLocalDate()]: 1,
      },

      addAppointment: (item) => {
        const state = get();
        const conflict = state.appointments.find(
          (a) =>
            a.doctorId === item.doctorId &&
            a.date === item.date &&
            a.slot === item.slot &&
            a.status !== "CANCELLED"
        );
        if (conflict) return null;

        const seq = Math.max(
          getPersistedSeq(state, item.date),
          ...state.appointments
            .filter((a) => a.date === item.date)
            .map((a) => parseInt(a.tokenNo.replace(/\D/g, ""), 10) || 0),
          0
        );
        const nextSeq = seq + 1;
        const tokenNo = `T-${String(nextSeq).padStart(2, "0")}`;

        const newApp: HospitalAppointment = {
          ...item,
          id: `app-${Date.now()}`,
          tokenNo,
          bookedAt: new Date().toISOString(),
        };

        set((prev) => ({
          appointments: [newApp, ...prev.appointments],
          lastTokenSeqByDate: { ...prev.lastTokenSeqByDate, [item.date]: nextSeq },
        }));

        return newApp;
      },

      updateStatus: (id, status) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        }));
      },

      markCheckedIn: (id) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id && !a.checkedInAt ? { ...a, checkedInAt: new Date().toISOString() } : a
          ),
        }));
      },

      rescheduleAppointment: (id, newDate, newSlot) => {
        const state = get();
        const target = state.appointments.find((a) => a.id === id);
        if (!target) return { success: false, message: "Appointment record not found." };

        if (target.status === "COMPLETED") {
          return { success: false, message: "A completed consultation cannot be rescheduled." };
        }
        if (target.date === newDate && target.slot === newSlot) {
          return { success: false, message: "Select a different date or time slot to reschedule." };
        }

        const conflict = state.appointments.find(
          (a) =>
            a.id !== id &&
            a.doctorId === target.doctorId &&
            a.date === newDate &&
            a.slot === newSlot &&
            a.status !== "CANCELLED"
        );
        if (conflict) {
          return {
            success: false,
            message: `Slot ${newSlot} on ${newDate} is already booked (token ${conflict.tokenNo} — ${conflict.patientName}).`,
          };
        }

        set((prev) => ({
          appointments: prev.appointments.map((a) =>
            a.id === id
              ? {
                  ...a,
                  rescheduledFromSlot: `${a.date} ${a.slot}`,
                  date: newDate,
                  slot: newSlot,
                  status: "RESCHEDULED",
                }
              : a
          ),
        }));

        return {
          success: true,
          message: `Token ${target.tokenNo} rescheduled to ${newDate} at ${newSlot}.`,
        };
      },

      cancelAppointment: (id, reason) => {
        const target = get().appointments.find((a) => a.id === id);
        if (!target) return { success: false, message: "Appointment record not found." };
        if (target.status === "CANCELLED") {
          return { success: false, message: `Token ${target.tokenNo} is already cancelled.` };
        }
        if (target.status === "COMPLETED") {
          return { success: false, message: "A completed consultation cannot be cancelled." };
        }

        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: "CANCELLED",
                  cancelReason: reason,
                }
              : a
          ),
        }));

        return { success: true, message: `Token ${target.tokenNo} cancelled.` };
      },

      getAppointmentsForDate: (date) => get().appointments.filter((a) => a.date === date),

      getNextTokenNo: (date) => {
        const state = get();
        const seq = Math.max(
          getPersistedSeq(state, date),
          ...state.appointments
            .filter((a) => a.date === date)
            .map((a) => parseInt(a.tokenNo.replace(/\D/g, ""), 10) || 0),
          0
        );
        return `T-${String(seq + 1).padStart(2, "0")}`;
      },

      resetToDefaults: () =>
        set({
          appointments: DEFAULT_APPOINTMENTS,
          lastTokenSeqByDate: { [todayLocalDate()]: 4, [tomorrowLocalDate()]: 1 },
        }),
    }),
    {
      name: "hms_appointment_store",
    }
  )
);

