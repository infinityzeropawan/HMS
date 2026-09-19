"use client";

export type DepartmentType = "OPD" | "IPD" | "ICU" | "EMERGENCY" | "DIAGNOSTIC" | "SUPPORT";

export type DepartmentStatus = "PLANNED" | "ACTIVE" | "UNDER_MAINTENANCE" | "SUSPENDED" | "CLOSED";

export interface BedCapacityModel {
  approvedBeds: number;
  operationalBeds: number;
  reservedBeds: number;
  occupiedBeds: number;
}

export interface StaffCapacityModel {
  approvedStaffCount: number;
  activeStaffCount: number;
  vacantStaffCount: number;
}

export interface HospitalDepartment {
  id: string; // Canonical Department ID e.g. "dept-101"
  code: string; // Canonical Department Code e.g. "CARD-01"
  name: string; // Display Name e.g. "Cardiology & Cardiac Sciences"
  type: DepartmentType; // Category
  status: DepartmentStatus; // Lifecycle Status
  headOfDepartment: string; // Backward compatible string e.g. "Dr. Rajesh Sharma"
  hodUserId?: string; // Linked HOD Staff User ID e.g. "DOC-101"
  hodDisplayName?: string; // Linked HOD Full Name & Title
  parentDepartmentId?: string; // Optional Parent Department ID e.g. "dept-100" (Medicine)
  parentDepartmentName?: string; // Optional Parent Department Display Name
  location: string; // Wing / Floor e.g. "Block A, 2nd Floor"
  phoneExtension: string; // Intercom Extension e.g. "4012"
  description: string; // Scope & clinical notes
  allocatedBeds: number; // Backward compatible bed total
  activeStaffCount: number; // Backward compatible staff count
  bedCapacity: BedCapacityModel; // Detailed bed capacity breakdown
  staffCapacity: StaffCapacityModel; // Detailed staff capacity breakdown
  createdDate?: string; // YYYY-MM-DD
  updatedDate?: string; // YYYY-MM-DD
}

export interface DepartmentFilterParams {
  searchTerm?: string;
  type?: DepartmentType | "ALL";
  status?: DepartmentStatus | "ALL";
  parentDepartmentId?: string;
}

export interface DeleteSafetyResult {
  canDelete: boolean;
  blockedReason?: string;
  activeReferences: Array<{
    module: string;
    count: number;
    description: string;
  }>;
}

export interface CrossModuleValidationResult {
  valid: boolean;
  totalReferences: number;
  orphanedReferences: Array<{
    module: string;
    reference: string;
    issue: string;
  }>;
}
