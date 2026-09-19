"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ClinicalEncounter,
  PrescriptionItem,
  LabOrderInput,
  RadiologyOrderInput,
  FollowUpInput,
} from "../_doctor_types/encounter_types";

interface EncounterStoreState {
  encounters: Record<string, ClinicalEncounter>;
  activeEncounterUhid: string | null;
  setActiveEncounter: (uhid: string) => void;
  getEncounter: (uhid: string) => ClinicalEncounter | null;
  saveDraft: (uhid: string, updates: Partial<ClinicalEncounter>) => void;
  addPrescription: (uhid: string, item: PrescriptionItem) => void;
  removePrescription: (uhid: string, drugId: string) => void;
  addLabOrder: (uhid: string, order: LabOrderInput) => void;
  addRadiologyOrder: (uhid: string, order: RadiologyOrderInput) => void;
  setFollowUp: (uhid: string, followUp: FollowUpInput) => void;
  signEncounter: (uhid: string) => ClinicalEncounter | null;
}

const createBlankEncounter = (uhid: string): ClinicalEncounter => {
  const ts = new Date().toISOString();
  return {
    id: `enc-${Date.now()}`,
    encounterId: `ENC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    uhid,
    patientName: "Sunil Verma",
    ageGender: "45 / M",
    doctorId: "DOC-101",
    doctorName: "Dr. Rajesh Sharma",
    departmentName: "Cardiology",
    chiefComplaints: "",
    subjectiveNotes: "",
    objectiveNotes: "",
    assessmentNotes: "",
    planNotes: "",
    icd10Diagnoses: ["I20.9 - Angina pectoris, unspecified"],
    prescriptions: [
      { drugId: "DRUG-001", drugName: "Tab Sorbitrate 5mg", dosage: "5mg", frequency: "1-0-1", durationDays: 5, instructions: "Sublingual after meals" },
      { drugId: "DRUG-002", drugName: "Tab Ecosprin 75mg", dosage: "75mg", frequency: "0-0-1", durationDays: 30, instructions: "At bedtime with water" },
    ],
    labOrders: [],
    radiologyOrders: [],
    followUp: null,
    status: "DRAFT",
    signedAt: null,
    createdAt: ts,
    updatedAt: ts,
  };
};

export const useEncounterStore = create<EncounterStoreState>()(
  persist(
    (set, get) => ({
      encounters: {},
      activeEncounterUhid: null,

      setActiveEncounter: (uhid) => set({ activeEncounterUhid: uhid }),

      getEncounter: (uhid) => {
        const existing = get().encounters[uhid];
        if (existing) return existing;
        return null;
      },

      saveDraft: (uhid, updates) =>
        set((state) => {
          const current = state.encounters[uhid] || createBlankEncounter(uhid);
          const updated: ClinicalEncounter = {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return {
            encounters: {
              ...state.encounters,
              [uhid]: updated,
            },
          };
        }),

      addPrescription: (uhid, item) =>
        set((state) => {
          const current = state.encounters[uhid] || createBlankEncounter(uhid);
          const updated: ClinicalEncounter = {
            ...current,
            prescriptions: [...current.prescriptions, item],
            updatedAt: new Date().toISOString(),
          };
          return { encounters: { ...state.encounters, [uhid]: updated } };
        }),

      removePrescription: (uhid, drugId) =>
        set((state) => {
          const current = state.encounters[uhid];
          if (!current || current.status === "SIGNED") return state;
          const updated: ClinicalEncounter = {
            ...current,
            prescriptions: current.prescriptions.filter((p) => p.drugId !== drugId),
            updatedAt: new Date().toISOString(),
          };
          return { encounters: { ...state.encounters, [uhid]: updated } };
        }),

      addLabOrder: (uhid, order) =>
        set((state) => {
          const current = state.encounters[uhid] || createBlankEncounter(uhid);
          const updated: ClinicalEncounter = {
            ...current,
            labOrders: [...current.labOrders, order],
            updatedAt: new Date().toISOString(),
          };
          return { encounters: { ...state.encounters, [uhid]: updated } };
        }),

      addRadiologyOrder: (uhid, order) =>
        set((state) => {
          const current = state.encounters[uhid] || createBlankEncounter(uhid);
          const updated: ClinicalEncounter = {
            ...current,
            radiologyOrders: [...current.radiologyOrders, order],
            updatedAt: new Date().toISOString(),
          };
          return { encounters: { ...state.encounters, [uhid]: updated } };
        }),

      setFollowUp: (uhid, followUp) =>
        set((state) => {
          const current = state.encounters[uhid] || createBlankEncounter(uhid);
          const updated: ClinicalEncounter = {
            ...current,
            followUp,
            updatedAt: new Date().toISOString(),
          };
          return { encounters: { ...state.encounters, [uhid]: updated } };
        }),

      signEncounter: (uhid) => {
        const state = get();
        const current = state.encounters[uhid] || createBlankEncounter(uhid);
        const signedAt = new Date().toISOString();
        const signed: ClinicalEncounter = {
          ...current,
          status: "SIGNED",
          signedAt,
          updatedAt: signedAt,
        };
        set({
          encounters: {
            ...state.encounters,
            [uhid]: signed,
          },
        });
        return signed;
      },
    }),
    {
      name: "hms_clinical_encounters_store",
    }
  )
);
