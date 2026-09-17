"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SpecimenRecord {
  id: string;
  sampleBarcode: string;
  patientName: string;
  uhid: string;
  testName: string;
  containerType: "EDTA_PURPLE" | "SERUM_RED" | "URINE_CONTAINER" | "CITRATE_BLUE";
  collectionTime: string;
  collectedBy: string;
  status: "PENDING_COLLECTION" | "COLLECTED_DISPATCHED" | "ANALYZER_RUNNING" | "REJECTED";
}

interface LabStoreState {
  specimens: SpecimenRecord[];
  updateSpecimenStatus: (id: string, status: SpecimenRecord["status"]) => void;
  addSpecimen: (specimen: Omit<SpecimenRecord, "id" | "sampleBarcode">) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SPECIMENS: SpecimenRecord[] = [
  {
    id: "spec-1",
    sampleBarcode: "BC-2026-9901",
    patientName: "Sunil Verma",
    uhid: "P-2026-9912",
    testName: "Complete Blood Count (CBC) & ESR",
    containerType: "EDTA_PURPLE",
    collectionTime: "2026-09-16 08:30 AM",
    collectedBy: "Phlebotomist Anand Kumar",
    status: "ANALYZER_RUNNING",
  },
  {
    id: "spec-2",
    sampleBarcode: "BC-2026-9908",
    patientName: "Rajesh Kulkarni",
    uhid: "P-2026-9978",
    testName: "Renal Function Test (Serum Electrolytes & Creatinine)",
    containerType: "SERUM_RED",
    collectionTime: "2026-09-16 09:15 AM",
    collectedBy: "Phlebotomist Anand Kumar",
    status: "COLLECTED_DISPATCHED",
  },
  {
    id: "spec-3",
    sampleBarcode: "BC-2026-9914",
    patientName: "Anita Roy",
    uhid: "P-2026-9944",
    testName: "Urine Routine & Microscopic",
    containerType: "URINE_CONTAINER",
    collectionTime: "2026-09-16 10:00 AM",
    collectedBy: "Nurse Kavita Roy",
    status: "PENDING_COLLECTION",
  },
];

export const useLabStore = create<LabStoreState>()(
  persist(
    (set) => ({
      specimens: DEFAULT_SPECIMENS,

      updateSpecimenStatus: (id, status) =>
        set((state) => ({
          specimens: state.specimens.map((s) => (s.id === id ? { ...s, status } : s)),
        })),

      addSpecimen: (specimen) =>
        set((state) => ({
          specimens: [
            {
              ...specimen,
              id: `spec-${Date.now()}`,
              sampleBarcode: `BC-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
            },
            ...state.specimens,
          ],
        })),

      resetToDefaults: () => set({ specimens: DEFAULT_SPECIMENS }),
    }),
    {
      name: "hms_lab_specimens_store",
    }
  )
);
