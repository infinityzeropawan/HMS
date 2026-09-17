"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DoctorInpatientRecord {
  id: string;
  ipdId: string;
  uhid: string;
  patientName: string;
  age: number;
  gender: string;
  bedNumber: string;
  wardName: string;
  admissionDate: string;
  primaryDiagnosis: string;
  attendingNurse: string;
  vitals: {
    bp: string;
    pulse: number;
    spO2: number;
    temp: string;
  };
  roundStatus: "DUE" | "COMPLETED" | "CRITICAL";
  lastRoundNote?: string;
  lastRoundTime?: string;
  dischargeReady: boolean;
}

interface DoctorIpdStoreState {
  inpatients: DoctorInpatientRecord[];
  addRoundNote: (id: string, note: string, dischargeReady?: boolean) => void;
  updateVitals: (id: string, vitals: DoctorInpatientRecord["vitals"]) => void;
  resetToDefaults: () => void;
}

const DEFAULT_INPATIENTS: DoctorInpatientRecord[] = [
  {
    id: "ipd-101",
    ipdId: "IPD-2026-0881",
    uhid: "P-2026-9912",
    patientName: "Sunil Verma",
    age: 42,
    gender: "Male",
    bedNumber: "ICU-BED-01",
    wardName: "Intensive Care Unit (ICU)",
    admissionDate: "2026-09-14",
    primaryDiagnosis: "Acute Anterolateral Myocardial Infarction (Post-PTCA)",
    attendingNurse: "Nurse Sunita Deshmukh",
    vitals: { bp: "128/82", pulse: 74, spO2: 98, temp: "98.4 °F" },
    roundStatus: "DUE",
    lastRoundNote: "Post-op Day 2. Chest pain subsided. Troponin levels trending down. Continue dual antiplatelet therapy.",
    lastRoundTime: "2026-09-16 09:30 AM",
    dischargeReady: false,
  },
  {
    id: "ipd-102",
    ipdId: "IPD-2026-0895",
    uhid: "P-2026-9944",
    patientName: "Anita Roy",
    age: 58,
    gender: "Female",
    bedNumber: "WARD-3B-04",
    wardName: "Female Surgical Ward 3B",
    admissionDate: "2026-09-15",
    primaryDiagnosis: "Total Knee Arthroplasty (Right TKA)",
    attendingNurse: "Nurse Kavita Roy",
    vitals: { bp: "134/86", pulse: 80, spO2: 97, temp: "98.6 °F" },
    roundStatus: "COMPLETED",
    lastRoundNote: "Physiotherapy started. Surgical wound clean and dry. Pain controlled with IV analgesics.",
    lastRoundTime: "2026-09-16 11:15 AM",
    dischargeReady: true,
  },
  {
    id: "ipd-103",
    ipdId: "IPD-2026-0902",
    uhid: "P-2026-9978",
    patientName: "Rajesh Kulkarni",
    age: 65,
    gender: "Male",
    bedNumber: "DELUXE-402",
    wardName: "Private Deluxe Wing 4th Floor",
    admissionDate: "2026-09-16",
    primaryDiagnosis: "Community Acquired Pneumonia & Type 2 Diabetes",
    attendingNurse: "Nurse Sunita Deshmukh",
    vitals: { bp: "142/90", pulse: 92, spO2: 93, temp: "100.8 °F" },
    roundStatus: "CRITICAL",
    lastRoundNote: "High grade fever spike. Oxygen supplementation via nasal cannula at 3L/min. Repeat ABG requested.",
    lastRoundTime: "2026-09-16 08:00 AM",
    dischargeReady: false,
  },
];

export const useDoctorIpdStore = create<DoctorIpdStoreState>()(
  persist(
    (set) => ({
      inpatients: DEFAULT_INPATIENTS,

      addRoundNote: (id, note, dischargeReady) =>
        set((state) => ({
          inpatients: state.inpatients.map((pt) =>
            pt.id === id
              ? {
                  ...pt,
                  roundStatus: "COMPLETED",
                  lastRoundNote: note,
                  lastRoundTime: new Date().toLocaleString(),
                  dischargeReady: dischargeReady !== undefined ? dischargeReady : pt.dischargeReady,
                }
              : pt
          ),
        })),

      updateVitals: (id, vitals) =>
        set((state) => ({
          inpatients: state.inpatients.map((pt) => (pt.id === id ? { ...pt, vitals } : pt)),
        })),

      resetToDefaults: () => set({ inpatients: DEFAULT_INPATIENTS }),
    }),
    {
      name: "hms_doctor_ipd_store",
    }
  )
);
