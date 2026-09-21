"use client";

import { useIpdStore, IpdAdmissionRecord } from "@/app/(ipd)/_ipd_stores/ipd_store";

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

export function mapIpdToDoctorRecord(rec: IpdAdmissionRecord): DoctorInpatientRecord {
  return {
    id: rec.id,
    ipdId: rec.admissionNo,
    uhid: rec.uhid,
    patientName: rec.patientName,
    age: rec.age,
    gender: rec.gender,
    bedNumber: rec.bedNumber,
    wardName: rec.admittedWard,
    admissionDate: rec.admissionDate,
    primaryDiagnosis: rec.primaryDiagnosis || "General Admission",
    attendingNurse: rec.attendingNurse || "Duty Nurse",
    vitals: rec.vitals || { bp: "120/80", pulse: 72, spO2: 98, temp: "98.6 °F" },
    roundStatus: rec.roundStatus || "DUE",
    lastRoundNote: rec.lastRoundNote,
    lastRoundTime: rec.lastRoundTime,
    dischargeReady: rec.dischargeReady || rec.status === "DISCHARGE_PENDING",
  };
}

export function useDoctorIpdStore() {
  const store = useIpdStore();
  return {
    inpatients: store.admissions.map(mapIpdToDoctorRecord),
    addRoundNote: store.addRoundNote,
    updateVitals: store.updateVitals,
    resetToDefaults: store.resetToDefaults,
  };
}

useDoctorIpdStore.getState = () => {
  const state = useIpdStore.getState();
  return {
    inpatients: state.admissions.map(mapIpdToDoctorRecord),
    addRoundNote: state.addRoundNote,
    updateVitals: state.updateVitals,
    resetToDefaults: state.resetToDefaults,
  };
};
