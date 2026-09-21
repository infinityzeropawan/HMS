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
  primaryDiagnosis?: string;
  attendingNurse?: string;
  vitals?: {
    bp: string;
    pulse: number;
    spO2: number;
    temp: string;
  };
  roundStatus?: "DUE" | "COMPLETED" | "CRITICAL";
  lastRoundNote?: string;
  lastRoundTime?: string;
  dischargeReady?: boolean;
}

interface IpdStoreState {
  admissions: IpdAdmissionRecord[];
  addAdmission: (
    admission: Omit<IpdAdmissionRecord, "id" | "admissionNo" | "status">
  ) => IpdAdmissionRecord;

  updateAdmissionStatus: (admissionNoOrId: string, status: IpdAdmissionRecord["status"]) => void;
  transferPatientBed: (admissionNoOrId: string, newBedNumber: string, newWardName: string) => void;
  addRoundNote: (admissionNoOrId: string, note: string, dischargeReady?: boolean) => void;
  updateVitals: (admissionNoOrId: string, vitals: NonNullable<IpdAdmissionRecord["vitals"]>) => void;
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
    primaryDiagnosis: "Acute Anterolateral Myocardial Infarction (Post-PTCA)",
    attendingNurse: "Nurse Sunita Deshmukh",
    vitals: { bp: "128/82", pulse: 74, spO2: 98, temp: "98.4 °F" },
    roundStatus: "DUE",
    lastRoundNote: "Post-op Day 2. Chest pain subsided. Troponin levels trending down. Continue dual antiplatelet therapy.",
    lastRoundTime: "2026-09-16 09:30 AM",
    dischargeReady: false,
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
    primaryDiagnosis: "Total Knee Arthroplasty (Right TKA)",
    attendingNurse: "Nurse Kavita Roy",
    vitals: { bp: "134/86", pulse: 80, spO2: 97, temp: "98.6 °F" },
    roundStatus: "COMPLETED",
    lastRoundNote: "Physiotherapy started. Surgical wound clean and dry. Pain controlled with IV analgesics.",
    lastRoundTime: "2026-09-16 11:15 AM",
    dischargeReady: true,
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
    primaryDiagnosis: "Community Acquired Pneumonia & Type 2 Diabetes",
    attendingNurse: "Nurse Sunita Deshmukh",
    vitals: { bp: "142/90", pulse: 92, spO2: 93, temp: "100.8 °F" },
    roundStatus: "CRITICAL",
    lastRoundNote: "High grade fever spike. Oxygen supplementation via nasal cannula at 3L/min. Repeat ABG requested.",
    lastRoundTime: "2026-09-16 08:00 AM",
    dischargeReady: false,
  },
];

export const useIpdStore = create<IpdStoreState>()(
  persist(
    (set) => ({
      admissions: DEFAULT_ADMISSIONS,

      addAdmission: (admission) => {
        const newAdmission: IpdAdmissionRecord = {
          ...admission,
          id: `adm-${Date.now()}`,
          admissionNo: `IPD-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
          status: "ADMITTED",
          primaryDiagnosis: admission.primaryDiagnosis || "General Admission",
          attendingNurse: admission.attendingNurse || "Duty Nurse",
          vitals: admission.vitals || { bp: "120/80", pulse: 72, spO2: 98, temp: "98.6 °F" },
          roundStatus: "DUE",
          dischargeReady: false,
        };

        set((state) => ({ admissions: [newAdmission, ...state.admissions] }));
        return newAdmission;
      },


      updateAdmissionStatus: (admissionNoOrId, status) =>
        set((state) => ({
          admissions: state.admissions.map((a) =>
            a.admissionNo === admissionNoOrId || a.id === admissionNoOrId || a.uhid === admissionNoOrId
              ? { ...a, status, dischargeReady: status === "DISCHARGE_PENDING" ? true : a.dischargeReady }
              : a
          ),
        })),

      transferPatientBed: (admissionNoOrId, newBedNumber, newWardName) =>
        set((state) => ({
          admissions: state.admissions.map((a) =>
            a.admissionNo === admissionNoOrId || a.id === admissionNoOrId || a.uhid === admissionNoOrId
              ? { ...a, bedNumber: newBedNumber, admittedWard: newWardName }
              : a
          ),
        })),

      addRoundNote: (admissionNoOrId, note, dischargeReady) =>
        set((state) => ({
          admissions: state.admissions.map((a) => {
            if (a.admissionNo === admissionNoOrId || a.id === admissionNoOrId || a.uhid === admissionNoOrId) {
              const isReady = dischargeReady !== undefined ? dischargeReady : (a.dischargeReady || false);
              const newStatus: IpdAdmissionRecord["status"] = isReady ? "DISCHARGE_PENDING" : a.status;
              const nowStr = new Date().toLocaleString();

              // Sync EMR Timeline for patient in localStorage
              if (typeof window !== "undefined") {
                try {
                  const existingTimeline = JSON.parse(localStorage.getItem(`hms_emr_timeline_${a.uhid}`) || "[]");
                  existingTimeline.unshift({
                    id: `time-round-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    category: "ADT",
                    title: `Doctor Daily Ward Round Note (${a.admittedWard})`,
                    subtitle: `Note: ${note}${isReady ? " • Cleared for Discharge" : ""}`,
                    provider: a.attendingDoctor || "Dr. Rajesh Sharma",
                    status: isReady ? "DISCHARGE_PENDING" : "ADMITTED",
                  });
                  localStorage.setItem(`hms_emr_timeline_${a.uhid}`, JSON.stringify(existingTimeline));
                } catch {
                  /* ignore */
                }
              }

              return {
                ...a,
                status: newStatus,
                roundStatus: "COMPLETED" as const,
                lastRoundNote: note,
                lastRoundTime: nowStr,
                dischargeReady: isReady,
              };
            }
            return a;
          }),
        })),

      updateVitals: (admissionNoOrId, vitals) =>
        set((state) => ({
          admissions: state.admissions.map((a) =>
            a.admissionNo === admissionNoOrId || a.id === admissionNoOrId || a.uhid === admissionNoOrId
              ? { ...a, vitals }
              : a
          ),
        })),

      resetToDefaults: () => set({ admissions: DEFAULT_ADMISSIONS }),
    }),
    {
      name: "hms_ipd_admissions_store",
    }
  )
);

