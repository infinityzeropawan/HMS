"use client";

import { useRosterStore } from "../_admin_stores/admin_roster_store";
import { useStaffUserStore } from "../_admin_stores/admin_user_store";
import { useHrStore } from "../../(hr)/_hr_stores/hr_store";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import {
  StaffShiftRoster,
  RosterValidationResult,
} from "../_admin_types/roster_types";

export class RosterService {
  /**
   * Retrieves all roster shifts.
   */
  static getShifts(): StaffShiftRoster[] {
    return useRosterStore.getState().rosters;
  }

  /**
   * Retrieves shifts assigned to a specific user.
   */
  static getShiftsForUser(userIdOrStaffId: string): StaffShiftRoster[] {
    const rosters = useRosterStore.getState().rosters;
    return rosters.filter(
      (r) => r.userId === userIdOrStaffId || r.staffId === userIdOrStaffId
    );
  }

  /**
   * Retrieves shifts assigned to a specific department.
   */
  static getShiftsForDepartment(departmentId: string): StaffShiftRoster[] {
    const rosters = useRosterStore.getState().rosters;
    return rosters.filter((r) => r.departmentId === departmentId);
  }

  /**
   * Retrieves shifts for a specific date (YYYY-MM-DD).
   */
  static getShiftsForDate(dateStr: string): StaffShiftRoster[] {
    const rosters = useRosterStore.getState().rosters;
    return rosters.filter((r) => r.dutyDate === dateStr);
  }

  /**
   * Validates a staff member before assigning a shift.
   * Checks active status, suspension/termination, approved leave, and shift overlaps.
   */
  static validateShiftAssignment(
    payload: Omit<StaffShiftRoster, "id">,
    existingShiftId?: string
  ): RosterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Mandatory canonical linkage check
    if (!payload.userId || !payload.staffId) {
      errors.push("Missing canonical userId or staffId. Shift assignment must be linked to a valid user.");
    }

    if (!payload.departmentId || !payload.departmentCode) {
      errors.push("Missing canonical departmentId or departmentCode. Department linkage is required.");
    }

    // 2. Fetch staff user from Single Source of Truth
    const staffUser = useStaffUserStore
      .getState()
      .users.find((u) => u.id === payload.userId || u.employeeId === payload.staffId);

    if (!staffUser) {
      errors.push(`Staff user record not found for userId: ${payload.userId || payload.staffId}`);
    } else {
      // 3. User Lifecycle Status Validation
      if (staffUser.status === "TERMINATED") {
        errors.push(`Cannot assign shift. Staff member ${staffUser.fullName} is TERMINATED.`);
      } else if (staffUser.status === "SUSPENDED") {
        errors.push(`Cannot assign shift. Staff member ${staffUser.fullName} is currently SUSPENDED.`);
      } else if (staffUser.status === "DISABLED") {
        errors.push(`Cannot assign shift. Staff member ${staffUser.fullName} account is DISABLED.`);
      } else if (staffUser.status === "LOCKED") {
        errors.push(`Cannot assign shift. Staff member ${staffUser.fullName} account is LOCKED.`);
      } else if (staffUser.status === "INVITED") {
        warnings.push(`Staff member ${staffUser.fullName} has status INVITED and has not completed onboard activation.`);
      }

      // 4. On-Leave Validation
      const attendanceLogs = useHrStore.getState().attendanceLogs;
      const userOnLeaveInHr = attendanceLogs.some(
        (a) => (a.staffId === payload.staffId || a.staffName === payload.staffName) && a.status === "ON_LEAVE"
      );

      if (userOnLeaveInHr || payload.status === "ON_LEAVE") {
        errors.push(`Cannot assign active shift. Staff member ${staffUser.fullName} is marked ON_LEAVE.`);
      }
    }

    // 5. Shift Overlap Check
    const existingRosters = useRosterStore.getState().rosters;
    const sameDateShifts = existingRosters.filter(
      (r) =>
        r.id !== existingShiftId &&
        (r.userId === payload.userId || r.staffId === payload.staffId) &&
        r.dutyDate === payload.dutyDate
    );

    if (sameDateShifts.length > 0) {
      const duplicateShift = sameDateShifts.find((r) => r.shift === payload.shift);
      if (duplicateShift) {
        errors.push(
          `Shift Overlap Conflict: ${payload.staffName} is already assigned to a ${payload.shift} shift on ${payload.dutyDate}.`
        );
      } else {
        warnings.push(
          `Multiple Shifts Warning: ${payload.staffName} already has a ${sameDateShifts[0].shift} shift scheduled on ${payload.dutyDate}.`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Assigns a new shift roster and dispatches audit events.
   */
  static assignShift(
    payload: Omit<StaffShiftRoster, "id">,
    actor = "Hospital Admin / HR Manager"
  ): StaffShiftRoster {
    const validation = this.validateShiftAssignment(payload);

    if (!validation.valid) {
      throw new Error(`Shift Assignment Validation Failed: ${validation.errors.join("; ")}`);
    }

    const shiftWithStatus: Omit<StaffShiftRoster, "id"> = {
      ...payload,
      department: payload.departmentName,
      approvalStatus: payload.approvalStatus || "APPROVED",
      createdAt: new Date().toISOString(),
      createdBy: actor,
    };

    useRosterStore.getState().addShift(shiftWithStatus);

    const createdShift = useRosterStore
      .getState()
      .rosters.find(
        (r) =>
          (r.userId === payload.userId || r.staffId === payload.staffId) &&
          r.dutyDate === payload.dutyDate &&
          r.shift === payload.shift
      ) || {
      ...shiftWithStatus,
      id: `rost-${Date.now()}`,
    };

    // Audit Logging
    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Shift Assigned: ${payload.staffName} (${payload.shift})`,
      category: "GOVERNANCE_EVENT",
      entity: `${payload.staffName} [${payload.staffId}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Shift Assigned",
        timestamp: new Date().toISOString(),
        actor,
        targetUser: payload.staffName,
        userId: payload.userId,
        staffId: payload.staffId,
        departmentId: payload.departmentId,
        departmentCode: payload.departmentCode,
        shift: payload.shift,
        dutyDate: payload.dutyDate,
        assignedWardOrRoom: payload.assignedWardOrRoom,
        newValue: createdShift,
      }),
    });

    return createdShift;
  }

  /**
   * Modifies an existing shift assignment and records audit details.
   */
  static modifyShift(
    shiftId: string,
    updates: Partial<StaffShiftRoster>,
    actor = "Hospital Admin / HR Manager"
  ): StaffShiftRoster {
    const existing = useRosterStore.getState().rosters.find((r) => r.id === shiftId);
    if (!existing) {
      throw new Error(`Roster shift not found with ID: ${shiftId}`);
    }

    const mergedPayload: Omit<StaffShiftRoster, "id"> = {
      ...existing,
      ...updates,
    };

    const validation = this.validateShiftAssignment(mergedPayload, shiftId);
    if (!validation.valid) {
      throw new Error(`Shift Modification Validation Failed: ${validation.errors.join("; ")}`);
    }

    useRosterStore.getState().updateShift(shiftId, updates);
    const updated = useRosterStore.getState().rosters.find((r) => r.id === shiftId)!;

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Shift Modified: #${shiftId} for ${existing.staffName}`,
      category: "GOVERNANCE_EVENT",
      entity: `${existing.staffName} [${existing.staffId}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Shift Modified",
        timestamp: new Date().toISOString(),
        actor,
        targetUser: existing.staffName,
        userId: existing.userId,
        staffId: existing.staffId,
        previousValue: existing,
        newValue: updated,
      }),
    });

    return updated;
  }

  /**
   * Cancels a scheduled shift and emits audit log.
   */
  static cancelShift(
    shiftId: string,
    reason: string,
    actor = "Hospital Admin / HR Manager"
  ): void {
    const existing = useRosterStore.getState().rosters.find((r) => r.id === shiftId);
    if (!existing) return;

    useRosterStore.getState().deleteShift(shiftId);

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Shift Cancelled: #${shiftId} for ${existing.staffName}`,
      category: "GOVERNANCE_EVENT",
      entity: `${existing.staffName} [${existing.staffId}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "WARNING",
      details: JSON.stringify({
        event: "Shift Cancelled",
        timestamp: new Date().toISOString(),
        actor,
        targetUser: existing.staffName,
        userId: existing.userId,
        staffId: existing.staffId,
        reason,
        previousValue: existing,
      }),
    });
  }

  /**
   * Approves a pending shift assignment.
   */
  static approveShift(shiftId: string, actor = "Department HOD / HR Manager"): void {
    const existing = useRosterStore.getState().rosters.find((r) => r.id === shiftId);
    if (!existing) return;

    useRosterStore.getState().updateShift(shiftId, { approvalStatus: "APPROVED" });

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Shift Approved: #${shiftId} for ${existing.staffName}`,
      category: "GOVERNANCE_EVENT",
      entity: `${existing.staffName} [${existing.staffId}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Shift Approved",
        timestamp: new Date().toISOString(),
        actor,
        targetUser: existing.staffName,
        previousValue: { approvalStatus: existing.approvalStatus },
        newValue: { approvalStatus: "APPROVED" },
      }),
    });
  }

  /**
   * Rejects a pending shift assignment with reason.
   */
  static rejectShift(shiftId: string, reason: string, actor = "Department HOD / HR Manager"): void {
    const existing = useRosterStore.getState().rosters.find((r) => r.id === shiftId);
    if (!existing) return;

    useRosterStore.getState().updateShift(shiftId, {
      approvalStatus: "REJECTED",
      rejectionReason: reason,
      status: "OFF_DUTY",
    });

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Shift Rejected: #${shiftId} for ${existing.staffName}`,
      category: "GOVERNANCE_EVENT",
      entity: `${existing.staffName} [${existing.staffId}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "WARNING",
      details: JSON.stringify({
        event: "Shift Rejected",
        timestamp: new Date().toISOString(),
        actor,
        targetUser: existing.staffName,
        reason,
        previousValue: { approvalStatus: existing.approvalStatus },
        newValue: { approvalStatus: "REJECTED", rejectionReason: reason },
      }),
    });
  }

  /**
   * Swaps shifts between two staff members.
   */
  static swapShift(
    shiftId1: string,
    shiftId2: string,
    actor = "HR Manager / Staff Request"
  ): { shift1: StaffShiftRoster; shift2: StaffShiftRoster } {
    const rosters = useRosterStore.getState().rosters;
    const s1 = rosters.find((r) => r.id === shiftId1);
    const s2 = rosters.find((r) => r.id === shiftId2);

    if (!s1 || !s2) {
      throw new Error("One or both shifts for swap were not found.");
    }

    const u1Updates = {
      userId: s2.userId,
      staffId: s2.staffId,
      staffName: s2.staffName,
      role: s2.role,
      departmentId: s2.departmentId,
      departmentCode: s2.departmentCode,
      departmentName: s2.departmentName,
      department: s2.departmentName,
      contactNumber: s2.contactNumber,
    };

    const u2Updates = {
      userId: s1.userId,
      staffId: s1.staffId,
      staffName: s1.staffName,
      role: s1.role,
      departmentId: s1.departmentId,
      departmentCode: s1.departmentCode,
      departmentName: s1.departmentName,
      department: s1.departmentName,
      contactNumber: s1.contactNumber,
    };

    useRosterStore.getState().updateShift(shiftId1, u1Updates);
    useRosterStore.getState().updateShift(shiftId2, u2Updates);

    const updated1 = useRosterStore.getState().rosters.find((r) => r.id === shiftId1)!;
    const updated2 = useRosterStore.getState().rosters.find((r) => r.id === shiftId2)!;

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Shift Swapped: #${shiftId1} <-> #${shiftId2}`,
      category: "GOVERNANCE_EVENT",
      entity: `${s1.staffName} & ${s2.staffName}`,
      ipAddress: "192.168.1.105",
      riskLevel: "WARNING",
      details: JSON.stringify({
        event: "Shift Swapped",
        timestamp: new Date().toISOString(),
        actor,
        shiftId1,
        shiftId2,
        staff1Previous: s1.staffName,
        staff2Previous: s2.staffName,
        targetUser: `${s1.staffName} & ${s2.staffName}`,
      }),
    });

    return { shift1: updated1, shift2: updated2 };
  }

  /**
   * Integrates attendance biometric clock-in punch with scheduled roster shifts.
   */
  static recordAttendancePunch(
    staffId: string,
    clockInTimeStr: string,
    biometricId: string,
    actor = "Biometric Gate Scanner"
  ): void {
    const todayStr = new Date().toISOString().split("T")[0];
    const rosters = useRosterStore.getState().rosters;

    // Find active scheduled shift for staffId today
    const scheduledShift = rosters.find(
      (r) => (r.staffId === staffId || r.userId === staffId) && r.dutyDate === todayStr
    );

    const staffUser = useStaffUserStore
      .getState()
      .users.find((u) => u.employeeId === staffId || u.id === staffId);

    const staffName = staffUser ? staffUser.fullName : scheduledShift ? scheduledShift.staffName : "Unknown Staff";
    const departmentName = staffUser
      ? staffUser.departmentName
      : scheduledShift
      ? scheduledShift.departmentName
      : "General Hospital";
    const departmentId = staffUser ? staffUser.departmentId : scheduledShift?.departmentId;
    const departmentCode = staffUser ? staffUser.departmentCode : scheduledShift?.departmentCode;
    const role = staffUser ? staffUser.roleName : scheduledShift ? scheduledShift.role : "Staff Member";

    let status: "PRESENT" | "LATE" | "ON_LEAVE" | "ABSENT" = "PRESENT";
    if (scheduledShift && scheduledShift.shiftHours) {
      const startTime = scheduledShift.shiftHours.split("-")[0]?.trim();
      if (startTime && clockInTimeStr > startTime) {
        status = "LATE";
      }
    }

    useHrStore.getState().addClockIn({
      staffId,
      staffName,
      department: departmentName,
      departmentId,
      departmentCode,
      role,
      clockInTime: clockInTimeStr,
      status,
      biometricId,
    });

    if (scheduledShift) {
      useRosterStore.getState().updateShiftStatus(scheduledShift.id, "ON_DUTY");
    }

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "SYSTEM",
      action: `Biometric Punch Recorded: ${staffName} (${status})`,
      category: "COMPLIANCE_EVENT",
      entity: `${staffName} [${staffId}]`,
      ipAddress: "127.0.0.1",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Biometric Punch Recorded",
        timestamp: new Date().toISOString(),
        actor,
        staffId,
        targetUser: staffName,
        clockInTime: clockInTimeStr,
        biometricId,
        status,
        scheduledShiftId: scheduledShift?.id,
      }),
    });
  }
}
