"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NurseVitalsRecord {
  id: string;
  ipdId: string;
  uhid: string;
  patientName: string;
  bedNumber: string;
  bpSystolic: number;
  bpDiastolic: number;
  pulseRate: number;
  spO2Percent: number;
  temperatureFahrenheit: number;
  respirationRate: number;
  painScore: number; // 0 - 10
  recordedAt: string;
  recordedBy: string;
  isAbnormal: boolean;
  abnormalWarning?: string;
}

interface NurseVitalsStoreState {
  vitalsLogs: NurseVitalsRecord[];
  addVitalsRecord: (record: Omit<NurseVitalsRecord, "id" | "isAbnormal">) => void;
  resetToDefaults: () => void;
}

const DEFAULT_VITALS: NurseVitalsRecord[] = [
  {
    id: "vit-1",
    ipdId: "IPD-2026-0881",
    uhid: "P-2026-9912",
    patientName: "Sunil Verma",
    bedNumber: "ICU-BED-01",
    bpSystolic: 128,
    bpDiastolic: 82,
    pulseRate: 74,
    spO2Percent: 98,
    temperatureFahrenheit: 98.4,
    respirationRate: 16,
    painScore: 2,
    recordedAt: "2026-09-16 10:00 AM",
    recordedBy: "Nurse Sunita Deshmukh",
    isAbnormal: false,
  },
  {
    id: "vit-2",
    ipdId: "IPD-2026-0902",
    uhid: "P-2026-9978",
    patientName: "Rajesh Kulkarni",
    bedNumber: "DELUXE-402",
    bpSystolic: 148,
    bpDiastolic: 94,
    pulseRate: 98,
    spO2Percent: 91,
    temperatureFahrenheit: 101.2,
    respirationRate: 22,
    painScore: 6,
    recordedAt: "2026-09-16 09:30 AM",
    recordedBy: "Nurse Kavita Roy",
    isAbnormal: true,
    abnormalWarning: "High BP (148/94), Low SpO2 (91%), High Fever (101.2°F)",
  },
  {
    id: "vit-3",
    ipdId: "IPD-2026-0895",
    uhid: "P-2026-9944",
    patientName: "Anita Roy",
    bedNumber: "WARD-3B-04",
    bpSystolic: 132,
    bpDiastolic: 84,
    pulseRate: 78,
    spO2Percent: 97,
    temperatureFahrenheit: 98.6,
    respirationRate: 18,
    painScore: 3,
    recordedAt: "2026-09-16 08:00 AM",
    recordedBy: "Nurse Sunita Deshmukh",
    isAbnormal: false,
  },
];

export const useNurseVitalsStore = create<NurseVitalsStoreState>()(
  persist(
    (set) => ({
      vitalsLogs: DEFAULT_VITALS,

      addVitalsRecord: (record) => {
        const isAbnormal =
          record.spO2Percent < 95 ||
          record.bpSystolic > 140 ||
          record.temperatureFahrenheit > 100.4 ||
          record.pulseRate > 100;

        let warning = "";
        if (record.spO2Percent < 95) warning += `Low SpO2 (${record.spO2Percent}%) `;
        if (record.bpSystolic > 140) warning += `High BP (${record.bpSystolic}/${record.bpDiastolic}) `;
        if (record.temperatureFahrenheit > 100.4) warning += `Fever (${record.temperatureFahrenheit}°F)`;

        set((state) => ({
          vitalsLogs: [
            {
              ...record,
              id: `vit-${Date.now()}`,
              isAbnormal,
              abnormalWarning: isAbnormal ? warning.trim() : undefined,
            },
            ...state.vitalsLogs,
          ],
        }));
      },

      resetToDefaults: () => set({ vitalsLogs: DEFAULT_VITALS }),
    }),
    {
      name: "hms_nurse_vitals_store",
    }
  )
);
