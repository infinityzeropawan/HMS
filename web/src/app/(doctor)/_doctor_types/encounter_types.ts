"use client";

export type EncounterStatus = "DRAFT" | "SIGNED" | "COMPLETED";

export interface PrescriptionItem {
  drugId: string;
  drugName: string;
  dosage: string;
  frequency: "1-0-1" | "1-0-0" | "0-0-1" | "1-1-1" | "1-1-0" | "0-1-1" | "SOS" | "BD" | "TDS" | "QID" | "PRN";
  durationDays: number;
  instructions?: string;
}

export interface LabOrderInput {
  testId: string;
  testName: string;
  category: "PATHOLOGY" | "MICROBIOLOGY" | "BIOCHEMISTRY" | "HEMATOLOGY";
  urgency: "ROUTINE" | "URGENT" | "STAT";
  clinicalNotes?: string;
}

export interface RadiologyOrderInput {
  orderId: string;
  modality: "XRAY" | "MRI" | "CT" | "ULTRASOUND" | "ECG";
  studyName: string;
  bodyPart: string;
  urgency: "ROUTINE" | "URGENT" | "STAT";
  clinicalNotes?: string;
}

export interface FollowUpInput {
  revisitDays: number;
  revisitDate: string;
  instructions: string;
}

export interface ClinicalEncounter {
  id: string;
  encounterId: string;
  uhid: string;
  patientName: string;
  ageGender: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  chiefComplaints: string;
  subjectiveNotes: string;
  objectiveNotes: string;
  assessmentNotes: string;
  planNotes: string;
  icd10Diagnoses: string[];
  prescriptions: PrescriptionItem[];
  labOrders: LabOrderInput[];
  radiologyOrders: RadiologyOrderInput[];
  followUp: FollowUpInput | null;
  status: EncounterStatus;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
