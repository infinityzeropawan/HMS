"use client";

export type BedCategory =
  | "GENERAL"
  | "SEMI_PRIVATE"
  | "PRIVATE"
  | "DELUXE"
  | "ICU"
  | "NICU"
  | "PICU"
  | "EMERGENCY"
  | "ISOLATION";

export type BedStatus =
  | "VACANT"
  | "RESERVED"
  | "OCCUPIED"
  | "CLEANING"
  | "MAINTENANCE"
  | "BLOCKED";

export interface HospitalWard {
  id: string; // wardId e.g. "ward-101"
  name: string; // wardName e.g. "Intensive Care Unit (ICU)"
  code: string; // e.g. "ICU-WING"
  departmentId: string; // e.g. "dept-103"
  departmentCode: string; // e.g. "ICU-CCU"
  floor: string; // e.g. "1st Floor, Block C"
  totalBeds: number;
}

export interface HospitalBed {
  id: string; // canonical bedId e.g. "bed-101"
  bedNumber: string; // canonical bedNumber e.g. "ICU-BED-01"
  roomId: string; // canonical roomId e.g. "rm-101"
  roomNumber: string; // roomNumber e.g. "ICU Room A"
  wardId: string; // canonical wardId e.g. "ward-101"
  wardName: string; // wardName e.g. "Intensive Care Unit"
  departmentId: string; // canonical departmentId e.g. "dept-103"
  departmentCode: string; // departmentCode e.g. "ICU-CCU"
  departmentName: string; // departmentName
  floor: string; // e.g. "1st Floor"
  category: BedCategory;
  status: BedStatus;
  dailyRate: number; // Daily room tariff rate in INR
  billingCode: string; // e.g. "SRV-BED-ICU-01"
  currentPatientId?: string;
  currentUhid?: string;
  currentIpdNo?: string;
  currentPatientName?: string;
  admissionDate?: string;
  notes?: string;
  updatedAt?: string;
}

export interface BedValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
