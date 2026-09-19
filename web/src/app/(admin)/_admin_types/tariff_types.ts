"use client";

export type TariffCategory =
  | "CONSULTATION"
  | "PROCEDURE"
  | "BED_CHARGES"
  | "NURSING_CHARGES"
  | "LABORATORY"
  | "RADIOLOGY"
  | "PHARMACY"
  | "EMERGENCY"
  | "OPERATION_THEATRE"
  | "PACKAGE"
  | "INSURANCE_PACKAGE";

export type TariffStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface PriceHistoryEntry {
  id: string;
  oldPrice: number;
  newPrice: number;
  oldGstRate: number;
  newGstRate: number;
  modifiedBy: string; // Actor e.g. "Dr. Rajesh Sharma (Admin)"
  modifiedRole: string; // Role e.g. "HOSPITAL_ADMIN"
  modifiedDate: string; // ISO Timestamp
  reason?: string;
}

export interface PackageComponentItem {
  serviceCode: string;
  serviceName: string;
  baseRate: number;
  quantity: number;
}

export interface HospitalTariff {
  id: string; // canonical tariffId e.g. "trf-101"
  serviceCode: string; // canonical serviceCode e.g. "SRV-CONS-OPD"
  billingCode: string; // canonical billingCode e.g. "BILL-101"
  serviceName: string; // Display Service Name
  category: TariffCategory;
  hsnSacCode: string; // HSN / SAC GST Code e.g. "999312"
  baseRate: number; // Base rate in INR
  gstRate: number; // GST tax percentage (0, 5, 12, 18, 28)
  departmentId: string; // canonical departmentId e.g. "dept-101"
  departmentCode: string; // canonical departmentCode e.g. "CARD-01"
  departmentName: string; // Display department name
  status: TariffStatus;
  history: PriceHistoryEntry[];
  packageItems?: PackageComponentItem[]; // For PACKAGE & INSURANCE_PACKAGE categories
  effectiveDate: string; // YYYY-MM-DD
  updatedAt?: string;
}

export interface TariffValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
