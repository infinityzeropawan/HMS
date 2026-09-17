"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IpdAdmissionRecord {
  id: string;
  admissionNo: string;
  uhid: string;
  patientName: string;
  age: number;
  gender: string;
  admittedWard: string;
  bedNumber: string;
  attendingDoctor: string;
  admissionDate: string;
  initialDepositAmount: number;
  tpaCashlessApproved: boolean;
  status: "ADMITTED" | "DISCHARGE_PENDING" | "DISCHARGED";
}

interface IpdStoreState {
  admissions: IpdAdmissionRecord[];
  addAdmission: (admission: Omit<IpdAdmissionRecord, "id" | "admissionNo" | "status">) => void;
  resetToDefaults: () => void;
}

const DEFAULT_ADMISSIONS: IpdAdmissionRecord[] = [
  {
    id: "adm-1",
    admissionNo: "IPD-2026-0881",
    uhid: "P-2026-9912",
    patientName: "Sunil Verma",
    age: 42,
    gender: "Male",
    admittedWard: "Intensive Care Unit (ICU)",
    bedNumber: "ICU-BED-01",
    attendingDoctor: "Dr. Rajesh Sharma (DM Cardio)",
    admissionDate: "2026-09-14",
    initialDepositAmount: 25000,
    tpaCashlessApproved: true,
    status: "ADMITTED",
  },
  {
    id: "adm-2",
    admissionNo: "IPD-2026-0895",
    uhid: "P-2026-9944",
    patientName: "Anita Roy",
    age: 58,
    gender: "Female",
    admittedWard: "Female Surgical Ward 3B",
    bedNumber: "WARD-3B-04",
    attendingDoctor: "Dr. Manoj Patil (MS Ortho)",
    admissionDate: "2026-09-15",
    initialDepositAmount: 15000,
    tpaCashlessApproved: true,
    status: "DISCHARGE_PENDING",
  },
  {
    id: "adm-3",
    admissionNo: "IPD-2026-0902",
    uhid: "P-2026-9978",
    patientName: "Rajesh Kulkarni",
    age: 65,
    gender: "Male",
    admittedWard: "Private Deluxe Wing 4th Floor",
    bedNumber: "DELUXE-402",
    attendingDoctor: "Dr. Priya Nair (MD)",
    admissionDate: "2026-09-16",
    initialDepositAmount: 50000,
    tpaCashlessApproved: false,
    status: "ADMITTED",
  },
];

export const useIpdStore = create<IpdStoreState>()(
  persist(
    (set) => ({
      admissions: DEFAULT_ADMISSIONS,

      addAdmission: (admission) =>
        set((state) => ({
          admissions: [
            {
              ...admission,
              id: `adm-${Date.now()}`,
              admissionNo: `IPD-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
              status: "ADMITTED",
            },
            ...state.admissions,
          ],
        })),

      resetToDefaults: () => set({ admissions: DEFAULT_ADMISSIONS }),
    }),
    {
      name: "hms_ipd_admissions_store",
    }
  )
);
