"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EmrCategory,
  ProblemItem,
  AllergyItem,
  MedicationHistoryItem,
  AllergySeverity,
} from "../_patient_types/emr_types";

const INITIAL_PROBLEMS: Record<string, ProblemItem[]> = {
  "P-2026-1049": [
    {
      id: "prob-101",
      icd10Code: "I20.9",
      conditionName: "Angina Pectoris (Unspecified)",
      status: "ACTIVE",
      onsetDate: "2026-08-15",
      diagnosedBy: "Dr. Rajesh Sharma (Cardiology)",
    },
    {
      id: "prob-102",
      icd10Code: "E11.9",
      conditionName: "Type 2 Diabetes Mellitus without complications",
      status: "ACTIVE",
      onsetDate: "2024-03-10",
      diagnosedBy: "Dr. Anita Desai (Endocrinology)",
    },
    {
      id: "prob-103",
      icd10Code: "I10",
      conditionName: "Essential (primary) Hypertension",
      status: "ACTIVE",
      onsetDate: "2023-11-04",
      diagnosedBy: "Dr. Rajesh Sharma (Cardiology)",
    },
    {
      id: "prob-104",
      icd10Code: "J06.9",
      conditionName: "Acute Upper Respiratory Tract Infection",
      status: "RESOLVED",
      onsetDate: "2025-11-01",
      resolvedDate: "2025-11-12",
      diagnosedBy: "Dr. Priya Nair (Internal Medicine)",
    },
  ],
};

const INITIAL_ALLERGIES: Record<string, AllergyItem[]> = {
  "P-2026-1049": [
    {
      id: "alg-01",
      allergen: "Penicillin G & Derivatives",
      type: "DRUG",
      severity: "ANAPHYLAXIS",
      reaction: "Severe Bronchospasm, Acute Urticaria & Hypotension",
      onsetDate: "2021-04-12",
    },
    {
      id: "alg-02",
      allergen: "Latex Gloves & Surgical Rubber",
      type: "LATEX",
      severity: "MODERATE",
      reaction: "Contact Dermatitis & Erythema",
      onsetDate: "2023-01-20",
    },
    {
      id: "alg-03",
      allergen: "Peanuts & Tree Nuts",
      type: "FOOD",
      severity: "MODERATE",
      reaction: "Facial Angioedema & Lip Swelling",
      onsetDate: "2018-09-05",
    },
    {
      id: "alg-04",
      allergen: "House Dust Mites & Grass Pollen",
      type: "ENVIRONMENTAL",
      severity: "MILD",
      reaction: "Seasonal Allergic Rhinitis & Lacrimation",
      onsetDate: "2019-03-15",
    },
  ],
};

const INITIAL_MEDICATIONS: Record<string, MedicationHistoryItem[]> = {
  "P-2026-1049": [
    {
      id: "med-1",
      drugName: "Tab Sorbitrate 5mg",
      dosage: "5mg Sublingual",
      frequency: "Stat & SOS",
      durationDays: 14,
      prescribedDate: "2026-09-17",
      prescribedBy: "Dr. Rajesh Sharma (Cardiology)",
      status: "ACTIVE",
    },
    {
      id: "med-2",
      drugName: "Tab Ecosprin 75mg",
      dosage: "75mg Oral",
      frequency: "1-0-0 (After Breakfast)",
      durationDays: 90,
      prescribedDate: "2026-09-14",
      prescribedBy: "Dr. Rajesh Sharma (Cardiology)",
      status: "ACTIVE",
    },
    {
      id: "med-3",
      drugName: "Tab Atorvastatin 20mg",
      dosage: "20mg Oral",
      frequency: "0-0-1 (Night at Bedtime)",
      durationDays: 90,
      prescribedDate: "2026-09-14",
      prescribedBy: "Dr. Rajesh Sharma (Cardiology)",
      status: "ACTIVE",
    },
    {
      id: "med-4",
      drugName: "Tab Metformin 500mg SR",
      dosage: "500mg Oral",
      frequency: "1-0-1 (With Meals)",
      durationDays: 180,
      prescribedDate: "2026-06-10",
      prescribedBy: "Dr. Anita Desai (Endocrinology)",
      status: "ACTIVE",
    },
    {
      id: "med-5",
      drugName: "Tab Telmisartan 40mg",
      dosage: "40mg Oral",
      frequency: "1-0-0 (Morning)",
      durationDays: 90,
      prescribedDate: "2026-07-01",
      prescribedBy: "Dr. Rajesh Sharma (Cardiology)",
      status: "ACTIVE",
    },
    {
      id: "med-6",
      drugName: "Cap Amoxicillin 500mg",
      dosage: "500mg Oral",
      frequency: "1-1-1",
      durationDays: 5,
      prescribedDate: "2025-11-01",
      prescribedBy: "Dr. Priya Nair (Internal Medicine)",
      status: "COMPLETED",
    },
  ],
};

interface EmrStoreState {
  activeUhid: string;
  selectedCategory: EmrCategory | "ALL";
  problemsByUhid: Record<string, ProblemItem[]>;
  allergiesByUhid: Record<string, AllergyItem[]>;
  medicationsByUhid: Record<string, MedicationHistoryItem[]>;

  setActiveUhid: (uhid: string) => void;
  setSelectedCategory: (category: EmrCategory | "ALL") => void;

  // Problem List actions
  getProblems: (uhid: string) => ProblemItem[];
  addProblem: (uhid: string, problem: Omit<ProblemItem, "id">) => void;
  editProblem: (uhid: string, problemId: string, updates: Partial<ProblemItem>) => void;
  archiveProblem: (uhid: string, problemId: string) => void;

  // Allergy Registry actions
  getAllergies: (uhid: string) => AllergyItem[];
  addAllergy: (uhid: string, allergy: Omit<AllergyItem, "id">) => { success: boolean; error?: string };
  editAllergy: (uhid: string, allergyId: string, updates: Partial<AllergyItem>) => { success: boolean; error?: string };
  archiveAllergy: (uhid: string, allergyId: string) => void;

  // Medication Reconciliation actions
  getMedications: (uhid: string) => MedicationHistoryItem[];
  addMedication: (uhid: string, med: Omit<MedicationHistoryItem, "id">) => void;
  updateMedicationStatus: (
    uhid: string,
    medId: string,
    status: "ACTIVE" | "COMPLETED" | "DISCONTINUED"
  ) => void;

  // Clinical Alert Generator
  generateClinicalAlerts: (uhid: string) => {
    allergyAlerts: string[];
    medicationAlerts: string[];
    followUpAlerts: string[];
  };

  resetToDefaults: () => void;
}

const VALID_SEVERITIES: AllergySeverity[] = ["MILD", "MODERATE", "SEVERE", "ANAPHYLAXIS"];

export const useEmrStore = create<EmrStoreState>()(
  persist(
    (set, get) => ({
      activeUhid: "P-2026-1049",
      selectedCategory: "ALL",
      problemsByUhid: INITIAL_PROBLEMS,
      allergiesByUhid: INITIAL_ALLERGIES,
      medicationsByUhid: INITIAL_MEDICATIONS,

      setActiveUhid: (uhid) => set({ activeUhid: uhid }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

      // Problem List
      getProblems: (uhid) => {
        const state = get();
        return state.problemsByUhid[uhid] || INITIAL_PROBLEMS["P-2026-1049"] || [];
      },

      addProblem: (uhid, problem) => {
        set((state) => {
          const current = state.problemsByUhid[uhid] || INITIAL_PROBLEMS["P-2026-1049"] || [];
          const newProblem: ProblemItem = {
            ...problem,
            id: `prob-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          };
          return {
            problemsByUhid: {
              ...state.problemsByUhid,
              [uhid]: [newProblem, ...current],
            },
          };
        });
      },

      editProblem: (uhid, problemId, updates) => {
        set((state) => {
          const current = state.problemsByUhid[uhid] || [];
          const updated = current.map((p) => (p.id === problemId ? { ...p, ...updates } : p));
          return {
            problemsByUhid: {
              ...state.problemsByUhid,
              [uhid]: updated,
            },
          };
        });
      },

      archiveProblem: (uhid, problemId) => {
        set((state) => {
          const current = state.problemsByUhid[uhid] || [];
          const updated = current.map((p) =>
            p.id === problemId
              ? {
                  ...p,
                  status: "RESOLVED" as const,
                  resolvedDate: new Date().toISOString().split("T")[0],
                }
              : p
          );
          return {
            problemsByUhid: {
              ...state.problemsByUhid,
              [uhid]: updated,
            },
          };
        });
      },

      // Allergy Registry
      getAllergies: (uhid) => {
        const state = get();
        return state.allergiesByUhid[uhid] || INITIAL_ALLERGIES["P-2026-1049"] || [];
      },

      addAllergy: (uhid, allergy) => {
        // 1. Severity Validation
        if (!VALID_SEVERITIES.includes(allergy.severity)) {
          return {
            success: false,
            error: `Invalid allergy severity "${allergy.severity}". Must be one of: MILD, MODERATE, SEVERE, ANAPHYLAXIS.`,
          };
        }

        const state = get();
        const current = state.allergiesByUhid[uhid] || INITIAL_ALLERGIES["P-2026-1049"] || [];

        // 2. Prevent Duplicate Active Allergies
        const isDuplicate = current.some(
          (a) => a.allergen.trim().toLowerCase() === allergy.allergen.trim().toLowerCase()
        );
        if (isDuplicate) {
          return {
            success: false,
            error: `Allergy to "${allergy.allergen}" is already registered for patient UHID ${uhid}.`,
          };
        }

        const newAllergy: AllergyItem = {
          ...allergy,
          id: `alg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        };

        set((state) => ({
          allergiesByUhid: {
            ...state.allergiesByUhid,
            [uhid]: [newAllergy, ...(state.allergiesByUhid[uhid] || current)],
          },
        }));

        return { success: true };
      },

      editAllergy: (uhid, allergyId, updates) => {
        if (updates.severity && !VALID_SEVERITIES.includes(updates.severity)) {
          return {
            success: false,
            error: `Invalid allergy severity "${updates.severity}".`,
          };
        }

        set((state) => {
          const current = state.allergiesByUhid[uhid] || [];
          const updated = current.map((a) => (a.id === allergyId ? { ...a, ...updates } : a));
          return {
            allergiesByUhid: {
              ...state.allergiesByUhid,
              [uhid]: updated,
            },
          };
        });

        return { success: true };
      },

      archiveAllergy: (uhid, allergyId) => {
        set((state) => {
          const current = state.allergiesByUhid[uhid] || [];
          const filtered = current.filter((a) => a.id !== allergyId);
          return {
            allergiesByUhid: {
              ...state.allergiesByUhid,
              [uhid]: filtered,
            },
          };
        });
      },

      // Medication Reconciliation
      getMedications: (uhid) => {
        const state = get();
        return state.medicationsByUhid[uhid] || INITIAL_MEDICATIONS["P-2026-1049"] || [];
      },

      addMedication: (uhid, med) => {
        set((state) => {
          const current = state.medicationsByUhid[uhid] || INITIAL_MEDICATIONS["P-2026-1049"] || [];
          const newMed: MedicationHistoryItem = {
            ...med,
            id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          };
          return {
            medicationsByUhid: {
              ...state.medicationsByUhid,
              [uhid]: [newMed, ...current],
            },
          };
        });
      },

      updateMedicationStatus: (uhid, medId, status) => {
        set((state) => {
          const current = state.medicationsByUhid[uhid] || [];
          const updated = current.map((m) => (m.id === medId ? { ...m, status } : m));
          return {
            medicationsByUhid: {
              ...state.medicationsByUhid,
              [uhid]: updated,
            },
          };
        });
      },

      // Clinical Alert Generator
      generateClinicalAlerts: (uhid) => {
        const allergies = get().getAllergies(uhid);
        const medications = get().getMedications(uhid);
        const problems = get().getProblems(uhid);

        const allergyAlerts: string[] = [];
        const medicationAlerts: string[] = [];
        const followUpAlerts: string[] = [];

        // 1. Allergy Alerts
        allergies.forEach((alg) => {
          if (alg.severity === "ANAPHYLAXIS" || alg.severity === "SEVERE") {
            allergyAlerts.push(
              `HIGH RISK: Anaphylactic / Severe ${alg.type} allergy to "${alg.allergen}" (${alg.reaction})`
            );
          } else if (alg.severity === "MODERATE") {
            allergyAlerts.push(`MODERATE RISK: ${alg.type} allergy to "${alg.allergen}"`);
          }
        });

        // 2. Medication / Polypharmacy Alerts
        const activeMeds = medications.filter((m) => m.status === "ACTIVE");
        if (activeMeds.length >= 5) {
          medicationAlerts.push(
            `POLYPHARMACY RISK: Patient has ${activeMeds.length} active prescribed medications. Perform drug interaction audit.`
          );
        }

        // Check for specific drug interactions if present
        const hasNitrate = activeMeds.some((m) => m.drugName.toLowerCase().includes("sorbitrate") || m.drugName.toLowerCase().includes("nitrate"));
        const hasAspirin = activeMeds.some((m) => m.drugName.toLowerCase().includes("ecosprin") || m.drugName.toLowerCase().includes("aspirin"));
        if (hasNitrate && hasAspirin) {
          medicationAlerts.push("DUAL ANTIPLATELET / VASODILATOR NOTICE: Monitor blood pressure and bleeding parameters.");
        }

        // 3. Follow-up Alerts
        const activeProblems = problems.filter((p) => p.status === "ACTIVE");
        activeProblems.forEach((p) => {
          if (p.icd10Code.startsWith("I20") || p.icd10Code.startsWith("I10")) {
            followUpAlerts.push(`CARDIOLOGY FOLLOW-UP: Ongoing management for ${p.conditionName} required within 14 days.`);
          }
          if (p.icd10Code.startsWith("E11")) {
            followUpAlerts.push(`DIABETES CONTROL: Periodic HbA1c screening recommended for ${p.conditionName}.`);
          }
        });

        return {
          allergyAlerts,
          medicationAlerts,
          followUpAlerts,
        };
      },

      resetToDefaults: () =>
        set({
          activeUhid: "P-2026-1049",
          selectedCategory: "ALL",
          problemsByUhid: INITIAL_PROBLEMS,
          allergiesByUhid: INITIAL_ALLERGIES,
          medicationsByUhid: INITIAL_MEDICATIONS,
        }),
    }),
    {
      name: "hms_emr_store_v2",
    }
  )
);
