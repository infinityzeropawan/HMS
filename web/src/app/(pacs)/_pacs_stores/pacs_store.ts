"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RadiologyStudy, RadiologyReportFormValues, StudyStatus } from "../_pacs_types/pacs_types";

export type { RadiologyStudy, RadiologyReportFormValues, StudyStatus };

interface PacsStoreState {
  studies: RadiologyStudy[];
  addStudy: (study: Omit<RadiologyStudy, "key">) => RadiologyStudy;
  updateStudyStatus: (studyId: string, status: StudyStatus) => void;
  finalizeReport: (studyId: string, report: RadiologyReportFormValues) => void;
  getStudyById: (studyId: string) => RadiologyStudy | undefined;
  resetToDefaults: () => void;
}

const INITIAL_STUDIES: RadiologyStudy[] = [
  {
    key: "1",
    studyId: "STD-9901",
    patientName: "Sunil Verma",
    uhid: "P-2026-1049",
    modality: "CR",
    bodyPart: "Chest PA View",
    referringDoctor: "Dr. Rajesh Sharma",
    radiologist: "Dr. Vikram Seth (MD Rad)",
    priority: "EMERGENCY",
    status: "UNREAD",
    date: "2026-09-17 10:15 AM",
    imagesCount: 2,
    price: 450,
  },
  {
    key: "2",
    studyId: "STD-9902",
    patientName: "Anjali Gupta",
    uhid: "P-2026-1052",
    modality: "CT",
    bodyPart: "HRCT Thorax (Low Dose)",
    referringDoctor: "Dr. Priya Nair",
    radiologist: "Dr. Vikram Seth (MD Rad)",
    priority: "HIGH",
    status: "UNREAD",
    date: "2026-09-17 09:45 AM",
    imagesCount: 140,
    price: 3500,
  },
  {
    key: "3",
    studyId: "STD-9903",
    patientName: "Ramesh Kumar",
    uhid: "P-2026-1058",
    modality: "MRI",
    bodyPart: "Lumbar Spine Contrast",
    referringDoctor: "Dr. Rajesh Sharma",
    radiologist: "Dr. Sunita Rao (MD Rad)",
    priority: "ROUTINE",
    status: "REPORTED",
    date: "2026-09-16 04:30 PM",
    imagesCount: 320,
    technique: "MRI Lumbar Spine with sagittal and axial T1/T2 weighted sequences.",
    findings: "Mild L4-L5 disc bulge causing minimal neural foraminal narrowing. No cord compression.",
    impression: "Mild degenerative disc disease at L4-L5.",
    signedAt: "2026-09-16 05:00 PM",
    price: 6500,
  },
  {
    key: "4",
    studyId: "STD-9904",
    patientName: "Priya Sharma",
    uhid: "P-2026-1062",
    modality: "US",
    bodyPart: "Whole Abdomen & Pelvis",
    referringDoctor: "Dr. Ananya Roy",
    radiologist: "Dr. Sunita Rao (MD Rad)",
    priority: "ROUTINE",
    status: "REPORTED",
    date: "2026-09-16 02:15 PM",
    imagesCount: 18,
    technique: "Real-time B-mode abdominal ultrasound.",
    findings: "Liver, gallbladder, pancreas, spleen, and both kidneys appear normal in size and echotexture.",
    impression: "Normal ultrasound scan of abdomen and pelvis.",
    signedAt: "2026-09-16 02:45 PM",
    price: 1200,
  },
];

export const usePacsStore = create<PacsStoreState>()(
  persist(
    (set, get) => ({
      studies: INITIAL_STUDIES,

      addStudy: (studyInput) => {
        const newStudy: RadiologyStudy = {
          ...studyInput,
          key: `key-${Date.now()}-${Math.random()}`,
        };

        set((state) => ({
          studies: [newStudy, ...state.studies],
        }));

        return newStudy;
      },

      updateStudyStatus: (studyId, status) => {
        set((state) => ({
          studies: state.studies.map((s) => (s.studyId === studyId ? { ...s, status } : s)),
        }));
      },

      finalizeReport: (studyId, report) => {
        const signedTimestamp = new Date().toLocaleString();
        set((state) => ({
          studies: state.studies.map((s) =>
            s.studyId === studyId
              ? {
                  ...s,
                  status: "REPORTED",
                  radiologist: report.radiologist,
                  technique: report.technique,
                  findings: report.findings,
                  impression: report.impression,
                  signedAt: signedTimestamp,
                }
              : s
          ),
        }));
      },

      getStudyById: (studyId) => {
        return get().studies.find((s) => s.studyId === studyId);
      },

      resetToDefaults: () => set({ studies: INITIAL_STUDIES }),
    }),
    {
      name: "hms_pacs_store_v1",
    }
  )
);
