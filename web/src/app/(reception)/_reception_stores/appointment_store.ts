"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HospitalAppointment, AppointmentStatus } from "../_reception_types/appointment_types";

export interface AppointmentStoreState {
  appointments: HospitalAppointment[];
  lastTokenSeq: number;
  addAppointment: (appointment: Omit<HospitalAppointment, "id" | "tokenNo" | "bookedAt">) => HospitalAppointment;
  updateStatus: (id: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (id: string, newDate: string, newSlot: string) => boolean;
  cancelAppointment: (id: string, reason: string) => boolean;
  resetToDefaults: () => void;
}

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
    departmentName: "Cardiology Clinic",
    doctorId: "DOC-101",
    doctorName: "Dr. Rajesh Sharma",
    opdRoom: "OPD 3",
    date: new Date().toISOString().split("T")[0],
    slot: "10:30 AM",
    status: "WAITING",
    bookedAt: new Date().toISOString(),
  },
  {
    id: "app-102",
    tokenNo: "T-02",
    uhid: "P-2026-1052",
    patientName: "Anjali Gupta",
    phone: "9812345678",
    ageGender: "32 / Female",
    departmentId: "dept-102",
    departmentCode: "ORTH-01",
    departmentName: "Orthopedics Clinic",
    doctorId: "DOC-102",
    doctorName: "Dr. Priya Nair",
    opdRoom: "OPD 1",
    date: new Date().toISOString().split("T")[0],
    slot: "10:45 AM",
    status: "IN_CONSULTATION",
    bookedAt: new Date().toISOString(),
  },
  {
    id: "app-103",
    tokenNo: "T-03",
    uhid: "P-2026-1058",
    patientName: "Ramesh Kumar",
    phone: "9898989898",
    ageGender: "58 / Male",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology Clinic",
    doctorId: "DOC-101",
    doctorName: "Dr. Rajesh Sharma",
    opdRoom: "OPD 3",
    date: new Date().toISOString().split("T")[0],
    slot: "11:00 AM",
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
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology Clinic",
    doctorId: "DOC-103",
    doctorName: "Dr. Ananya Roy",
    opdRoom: "OPD 5",
    date: new Date().toISOString().split("T")[0],
    slot: "11:15 AM",
    status: "WAITING",
    bookedAt: new Date().toISOString(),
  },
];

export const useAppointmentStore = create<AppointmentStoreState>()(
  persist(
    (set, get) => ({
      appointments: DEFAULT_APPOINTMENTS,
      lastTokenSeq: 4,

      addAppointment: (item) => {
        const nextSeq = get().lastTokenSeq + 1;
        const tokenNo = `T-${String(nextSeq).padStart(2, "0")}`;
        const newApp: HospitalAppointment = {
          ...item,
          id: `app-${Date.now()}`,
          tokenNo,
          bookedAt: new Date().toISOString(),
        };

        set((state) => ({
          appointments: [newApp, ...state.appointments],
          lastTokenSeq: nextSeq,
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

      rescheduleAppointment: (id, newDate, newSlot) => {
        const target = get().appointments.find((a) => a.id === id);
        if (!target) return false;

        set((state) => ({
          appointments: state.appointments.map((a) =>
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
        return true;
      },

      cancelAppointment: (id, reason) => {
        const target = get().appointments.find((a) => a.id === id);
        if (!target) return false;

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
        return true;
      },

      resetToDefaults: () => {
        set({ appointments: DEFAULT_APPOINTMENTS, lastTokenSeq: 4 });
      },
    }),
    {
      name: "hms_appointment_store",
    }
  )
);
