"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CareDisposition, ReceptionVitals, ReceptionVisit, TriagePriority } from "../_reception_types/visit_types";

export interface ReceptionVisitStoreState {
  visits: ReceptionVisit[];
  createVisit: (visit: Omit<ReceptionVisit, "id" | "registeredAt" | "disposition"> & {
    disposition?: CareDisposition;
  }) => ReceptionVisit;
  updateTriage: (visitId: string, triagePriority: TriagePriority, vitals: ReceptionVitals) => void;
  recordDisposition: (
    visitId: string,
    disposition: CareDisposition,
    note: string,
    decidedBy: string
  ) => boolean;
  linkAdmission: (visitId: string, ipd: { admissionNo: string; bedNumber: string; ward: string }) => boolean;
  linkAppointment: (visitId: string, appointmentId: string, tokenNo: string) => void;
  findVisitForPatient: (uhid: string, visitDate: string) => ReceptionVisit | undefined;
  resetToDefaults: () => void;
}

export const useReceptionVisitStore = create<ReceptionVisitStoreState>()(
  persist(
    (set, get) => ({
      visits: [],

      createVisit: (visit) => {
        const newVisit: ReceptionVisit = {
          ...visit,
          id: `visit-${Date.now()}`,
          registeredAt: new Date().toISOString(),
          disposition: visit.disposition || "PENDING",
        };
        set((state) => ({ visits: [newVisit, ...state.visits] }));
        return newVisit;
      },

      updateTriage: (visitId, triagePriority, vitals) =>
        set((state) => ({
          visits: state.visits.map((v) => (v.id === visitId ? { ...v, triagePriority, vitals } : v)),
        })),

      recordDisposition: (visitId, disposition, note, decidedBy) => {
        const target = get().visits.find((v) => v.id === visitId);
        if (!target) return false;

        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  disposition,
                  dispositionNote: note,
                  dispositionAt: new Date().toISOString(),
                  decidedBy,
                }
              : v
          ),
        }));
        return true;
      },

      linkAdmission: (visitId, ipd) => {
        const target = get().visits.find((v) => v.id === visitId);
        if (!target) return false;

        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  disposition: "IPD_ADMITTED",
                  dispositionAt: new Date().toISOString(),
                  ipdAdmissionNo: ipd.admissionNo,
                  ipdBedNumber: ipd.bedNumber,
                  ipdWard: ipd.ward,
                }
              : v
          ),
        }));
        return true;
      },

      linkAppointment: (visitId, appointmentId, tokenNo) =>
        set((state) => ({
          visits: state.visits.map((v) => (v.id === visitId ? { ...v, appointmentId, tokenNo } : v)),
        })),

      findVisitForPatient: (uhid, visitDate) =>
        get().visits.find((v) => v.uhid === uhid && v.visitDate === visitDate),

      resetToDefaults: () => set({ visits: [] }),
    }),
    {
      name: "hms_reception_visits_store",
    }
  )
);
