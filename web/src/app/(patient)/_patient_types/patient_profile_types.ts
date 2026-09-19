"use client";

import { ProblemItem, AllergyItem, MedicationHistoryItem } from "./emr_types";
import { ClinicalEncounter } from "@/app/(doctor)/_doctor_types/encounter_types";
import { RadiologyStudy } from "@/app/(pacs)/_pacs_types/pacs_types";
import { IpdAdmissionRecord } from "@/app/(ipd)/_ipd_stores/ipd_store";

export type PatientStatus = "ACTIVE" | "INACTIVE" | "DECEASED";

export interface PatientInsuranceDetails {
  providerName: string;
  policyNumber: string;
  tpaId?: string;
  validTill?: string;
  sumInsured?: number;
}

export type RelationshipType =
  | "SPOUSE"
  | "PARENT"
  | "CHILD"
  | "SIBLING"
  | "GUARDIAN"
  | "NEXT_OF_KIN";

export interface PatientRelationship {
  id: string;
  relativeName: string;
  relationshipType: RelationshipType;
  phone: string;
  address?: string;
  isEmergencyContact?: boolean;
}

export interface PatientClinicalFlags {
  highRisk: boolean;
  fallRisk: boolean;
  allergyAlert: boolean;
  vipPatient: boolean;
  medicoLegalCase: boolean; // MLC
  flagNotes?: string;
}

export type PatientDocumentCategory =
  | "CONSENT"
  | "DISCHARGE_SUMMARY"
  | "LAB_REPORT"
  | "RADIOLOGY_REPORT"
  | "INSURANCE_DOCUMENT";

export interface PatientDocumentItem {
  id: string;
  category: PatientDocumentCategory;
  title: string;
  uploadedAt: string;
  provider: string;
  fileUrl?: string;
  notes?: string;
}

export interface UnifiedPatientProfile {
  uhid: string;
  mrn: string;
  abhaId?: string;
  fullName: string;
  gender: string;
  dob: string;
  age?: number;
  bloodGroup?: string;
  phone: string;
  email?: string;
  address: string;
  emergencyContact: string;
  insuranceDetails?: PatientInsuranceDetails;
  registeredAt: string;
  status: PatientStatus;
  relationships: PatientRelationship[];
  flags: PatientClinicalFlags;
  documents: PatientDocumentItem[];
}

export interface Patient360Summary {
  profile: UnifiedPatientProfile;
  totalOpdVisits: number;
  totalIpdAdmissions: number;
  activeProblems: ProblemItem[];
  allergies: AllergyItem[];
  currentMedications: MedicationHistoryItem[];
  outstandingBalance: number;
  lastEncounter?: ClinicalEncounter;
  lastAdmission?: IpdAdmissionRecord;
  lastLab?: {
    id: string;
    orderNo: string;
    testName: string;
    resultValue: string;
    orderDate: string;
    status: string;
  };
  lastRadiologyStudy?: RadiologyStudy;
  flags: PatientClinicalFlags;
  relationships: PatientRelationship[];
  documents: PatientDocumentItem[];
}
