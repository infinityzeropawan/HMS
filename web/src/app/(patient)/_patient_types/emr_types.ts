"use client";

import { ClinicalEncounter, PrescriptionItem } from "@/app/(doctor)/_doctor_types/encounter_types";
import { RadiologyStudy } from "@/app/(pacs)/_pacs_types/pacs_types";
import { IpdAdmissionRecord } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { InvoiceRecord } from "@/app/(billing)/_billing_stores/billing_store";
import { HospitalAppointment } from "@/app/(reception)/_reception_types/appointment_types";
import { SurgeryRecord } from "@/app/(ot)/_ot_stores/ot_store";

export interface PatientDemographics {
  uhid: string;
  fullName: string;
  gender: string;
  dob: string;
  age?: number;
  phone: string;
  email?: string;
  aadhaarNumber?: string;
  address: string;
  emergencyContact: string;
  bloodGroup?: string;
  abhaId?: string;
  registeredAt?: string;
}

export type ProblemStatus = "ACTIVE" | "RESOLVED";

export interface ProblemItem {
  id: string;
  icd10Code: string;
  conditionName: string;
  status: ProblemStatus;
  onsetDate: string;
  resolvedDate?: string;
  diagnosedBy: string;
}

export type AllergyType = "DRUG" | "FOOD" | "LATEX" | "ENVIRONMENTAL";
export type AllergySeverity = "MILD" | "MODERATE" | "SEVERE" | "ANAPHYLAXIS";

export interface AllergyItem {
  id: string;
  allergen: string;
  type: AllergyType;
  severity: AllergySeverity;
  reaction: string;
  onsetDate: string;
}

export interface MedicationHistoryItem {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  prescribedDate: string;
  prescribedBy: string;
  status: "ACTIVE" | "DISCONTINUED" | "COMPLETED";
}

export interface PatientSnapshot {
  demographics: PatientDemographics;
  bloodGroup: string;
  activeProblems: ProblemItem[];
  resolvedProblems: ProblemItem[];
  allergies: AllergyItem[];
  currentMedications: MedicationHistoryItem[];
  lastEncounter?: ClinicalEncounter;
  lastAdmission?: IpdAdmissionRecord;
  recentLabs: Array<{
    id: string;
    orderNo: string;
    testName: string;
    resultValue: string;
    orderDate: string;
    status: string;
  }>;
  outstandingBalances: number;
  allergyAlerts: string[];
  medicationAlerts: string[];
  followUpAlerts: string[];
}

export type EmrCategory =
  | "ENCOUNTER"
  | "PRESCRIPTION"
  | "LAB"
  | "RADIOLOGY"
  | "ADT"
  | "BILLING"
  | "APPOINTMENT"
  | "SURGERY";

export interface EmrTimelineEvent {
  id: string;
  timestamp: string;
  category: EmrCategory;
  title: string;
  subtitle: string;
  provider: string;
  status: string;
  details?: Record<string, unknown>;
  documentUrl?: string;
}

export interface EmrMedicalRecordDocument {
  id: string;
  date: string;
  category: "e-Prescription" | "Lab Report" | "Radiology DICOM" | "Discharge Summary" | "GST Invoice" | "Operative Note";
  title: string;
  provider: string;
  docType: "eRx" | "Lab" | "Rad" | "Discharge" | "Bill" | "Operative";
  details?: string;
}

export interface EmrPatientProfile {
  demographics: PatientDemographics;
  appointments: HospitalAppointment[];
  encounters: ClinicalEncounter[];
  prescriptions: PrescriptionItem[];
  labResults: Array<{
    id: string;
    orderNo: string;
    patientName: string;
    uhid: string;
    testName: string;
    category: string;
    resultValue: string;
    normalRange: string;
    orderDate: string;
    status: string;
  }>;
  radiologyStudies: RadiologyStudy[];
  admissions: IpdAdmissionRecord[];
  invoices: InvoiceRecord[];
  surgeries?: SurgeryRecord[];
  documents: EmrMedicalRecordDocument[];
  timeline: EmrTimelineEvent[];
  snapshot: PatientSnapshot;
}
