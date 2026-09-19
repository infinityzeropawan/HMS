"use client";

export type ModalityType = "CR" | "CT" | "MRI" | "US" | "MG" | "ECG";
export type OrderPriority = "EMERGENCY" | "HIGH" | "ROUTINE" | "STAT" | "URGENT";
export type StudyStatus = "UNREAD" | "REPORTED" | "ARCHIVED" | "ORDERED" | "IN_PROGRESS";

export interface RadiologyStudy {
  key: string;
  studyId: string;
  patientName: string;
  uhid: string;
  ipdId?: string;
  bedNumber?: string;
  modality: ModalityType;
  bodyPart: string;
  referringDoctor: string;
  radiologist: string;
  priority: OrderPriority;
  status: StudyStatus;
  date: string;
  imagesCount: number;
  clinicalNotes?: string;
  technique?: string;
  findings?: string;
  impression?: string;
  signedAt?: string;
  price?: number;
  invoiceNumber?: string;
}

export interface RadiologyReportFormValues {
  radiologist: string;
  technique: string;
  findings: string;
  impression: string;
}
