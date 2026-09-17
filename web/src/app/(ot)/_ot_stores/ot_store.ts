"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SurgeryRecord {
  id: string;
  surgeryCode: string;
  patientName: string;
  uhid: string;
  procedureName: string;
  otRoom: string;
  surgeonName: string;
  anaesthetistName: string;
  scheduledTime: string;
  pacClearance: "CLEARED" | "PENDING" | "REJECTED";
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  safetyChecklistDone: boolean;
}

interface OtStoreState {
  surgeries: SurgeryRecord[];
  updateSurgeryStatus: (id: string, status: SurgeryRecord["status"]) => void;
  toggleSafetyChecklist: (id: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SURGERIES: SurgeryRecord[] = [
  {
    id: "surg-1",
    surgeryCode: "OT-2026-081",
    patientName: "Anita Roy",
    uhid: "P-2026-9944",
    procedureName: "Total Knee Arthroplasty (Right TKA)",
    otRoom: "Operation Theatre OT-01",
    surgeonName: "Dr. Manoj Patil (MS Ortho)",
    anaesthetistName: "Dr. Priya Nair (MD Anaesthesia)",
    scheduledTime: "08:30 AM - 11:30 AM",
    pacClearance: "CLEARED",
    status: "COMPLETED",
    safetyChecklistDone: true,
  },
  {
    id: "surg-2",
    surgeryCode: "OT-2026-084",
    patientName: "Sunil Verma",
    uhid: "P-2026-9912",
    procedureName: "Primary Percutaneous Coronary Intervention (PTCA)",
    otRoom: "Cath Lab OT-02",
    surgeonName: "Dr. Rajesh Sharma (DM Cardio)",
    anaesthetistName: "Dr. Vikram Sethi (MD)",
    scheduledTime: "12:00 PM - 02:30 PM",
    pacClearance: "CLEARED",
    status: "IN_PROGRESS",
    safetyChecklistDone: true,
  },
  {
    id: "surg-3",
    surgeryCode: "OT-2026-089",
    patientName: "Ramesh Pawar",
    uhid: "P-2026-9990",
    procedureName: "Laparoscopic Cholecystectomy",
    otRoom: "Operation Theatre OT-03",
    surgeonName: "Dr. Ananya Roy (MCh)",
    anaesthetistName: "Dr. Priya Nair (MD)",
    scheduledTime: "03:00 PM - 05:00 PM",
    pacClearance: "CLEARED",
    status: "SCHEDULED",
    safetyChecklistDone: false,
  },
];

export const useOtStore = create<OtStoreState>()(
  persist(
    (set) => ({
      surgeries: DEFAULT_SURGERIES,

      updateSurgeryStatus: (id, status) =>
        set((state) => ({
          surgeries: state.surgeries.map((s) => (s.id === id ? { ...s, status } : s)),
        })),

      toggleSafetyChecklist: (id) =>
        set((state) => ({
          surgeries: state.surgeries.map((s) =>
            s.id === id ? { ...s, safetyChecklistDone: !s.safetyChecklistDone } : s
          ),
        })),

      resetToDefaults: () => set({ surgeries: DEFAULT_SURGERIES }),
    }),
    {
      name: "hms_ot_surgery_store",
    }
  )
);
