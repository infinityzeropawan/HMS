"use client";

export type StaffUserStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "LOCKED" | "DISABLED" | "TERMINATED";

export type StaffRoleCategory =
  | "DOCTOR"
  | "NURSE"
  | "RECEPTIONIST"
  | "PHARMACIST"
  | "LAB_TECH"
  | "BILLER"
  | "ADMIN"
  | "SUPER_ADMIN";

export interface StaffUser {
  id: string; // Canonical System User ID e.g. "usr-101"
  staffId: string; // Hospital Staff ID e.g. "DOC-101" / "EMP-8801"
  employeeId: string; // Employee Payroll ID e.g. "EMP-9014-101"
  fullName: string;
  email: string;
  phone: string;
  roleCategory: StaffRoleCategory;
  roleId: string; // Canonical RBAC Role ID e.g. "TMPL-SR-DOC", "CUST-TNT-9014-CARDIO-SPEC"
  roleTemplateId?: string; // Origin Role Template ID e.g. "TMPL-SR-DOC"
  roleName: string; // Display Role Name e.g. "Apollo Senior Cardiologist"
  departmentId: string; // Canonical Department ID e.g. "dept-101"
  departmentCode: string; // Canonical Department Code e.g. "CARD-01"
  departmentName: string; // Display Department Name e.g. "Cardiology & Cardiac Sciences"
  status: StaffUserStatus;
  joinedDate: string; // YYYY-MM-DD
  lastLogin?: string;
  licenseNumber?: string; // Medical Council / Pharmacy Reg No
  effectivePermissions: string[]; // Permission claim IDs granted via role
}

export interface StaffUserFilterParams {
  searchTerm?: string;
  departmentId?: string;
  roleId?: string;
  status?: StaffUserStatus | "ALL";
}

export interface UserDeleteSafetyResult {
  canDeleteOrDisable: boolean;
  blockedReason?: string;
  activeReferences: Array<{
    module: string;
    count: number;
    description: string;
  }>;
}

export interface LicenseUsageSummary {
  licensedSeats: number;
  activeUsers: number;
  availableSeats: number;
  utilizationPercent: number;
  status: "HEALTHY" | "WARNING" | "EXHAUSTED";
}
