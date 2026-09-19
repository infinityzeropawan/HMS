"use client";

export type StandardShiftType = "MORNING" | "EVENING" | "NIGHT" | "ON_CALL" | "CUSTOM";

export type StaffRoleCategory =
  | "DOCTOR"
  | "NURSE"
  | "LAB_TECH"
  | "PHARMACIST"
  | "RECEPTIONIST"
  | "ADMINISTRATIVE"
  | "ALLIED_HEALTH"
  | "FINANCE";

export type ShiftDutyStatus = "ON_DUTY" | "OFF_DUTY" | "ON_LEAVE" | "EMERGENCY_CALL";

export type ShiftApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";

export interface StaffShiftRoster {
  id: string;
  userId: string;
  staffId: string;
  staffName: string;
  role: StaffRoleCategory;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  department: string;
  shift: StandardShiftType;
  shiftHours: string;
  assignedWardOrRoom: string;
  dutyDate: string; // YYYY-MM-DD
  status: ShiftDutyStatus;
  approvalStatus: ShiftApprovalStatus;
  contactNumber: string;
  rejectionReason?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RosterValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ShiftSwapRequest {
  id: string;
  requesterShiftId: string;
  requesterUserId: string;
  targetShiftId: string;
  targetUserId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
}
