"use client";

import { useStaffUserStore } from "../_admin_stores/admin_user_store";
import {
  StaffUser,
  StaffUserFilterParams,
  StaffUserStatus,
  UserDeleteSafetyResult,
  LicenseUsageSummary,
} from "../_admin_types/staff_user_types";
import { DepartmentService } from "./department_service";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import { useAdminRosterStore } from "../_admin_stores/admin_roster_store";
import { useHrStore } from "@/app/(hr)/_hr_stores/hr_store";
import { useAdminDepartmentStore } from "../_admin_stores/admin_department_store";

export class StaffUserService {
  private static LICENSED_SEAT_QUOTA = 50; // Licensed multi-tenant seat capacity

  /**
   * Retrieves all staff users matching optional filter parameters
   */
  public static getStaffUsers(params?: StaffUserFilterParams): StaffUser[] {
    const users = useStaffUserStore.getState().users;
    if (!params) return users;

    return users.filter((u) => {
      if (params.status && params.status !== "ALL" && u.status !== params.status) {
        return false;
      }
      if (params.departmentId && u.departmentId !== params.departmentId) {
        return false;
      }
      if (params.roleId && u.roleId !== params.roleId) {
        return false;
      }
      if (params.searchTerm) {
        const query = params.searchTerm.toLowerCase();
        const matchesName = u.fullName.toLowerCase().includes(query);
        const matchesStaffId = u.staffId.toLowerCase().includes(query);
        const matchesEmpId = u.employeeId.toLowerCase().includes(query);
        const matchesEmail = u.email.toLowerCase().includes(query);
        const matchesDept = u.departmentName.toLowerCase().includes(query);
        const matchesRole = u.roleName.toLowerCase().includes(query);
        if (!matchesName && !matchesStaffId && !matchesEmpId && !matchesEmail && !matchesDept && !matchesRole) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Retrieves a staff user by canonical system ID (e.g. "usr-101")
   */
  public static getStaffUserById(id: string): StaffUser | undefined {
    return useStaffUserStore.getState().users.find((u) => u.id === id);
  }

  /**
   * Retrieves a staff user by hospital staff ID (e.g. "DOC-101")
   */
  public static getStaffUserByStaffId(staffId: string): StaffUser | undefined {
    return useStaffUserStore.getState().users.find((u) => u.staffId.toLowerCase() === staffId.toLowerCase());
  }

  /**
   * Evaluates tenant licensing seat metrics (Licensed Seats, Active Users, Available Seats, Utilization %)
   */
  public static getLicenseUsage(): LicenseUsageSummary {
    const users = useStaffUserStore.getState().users;
    const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
    const licensedSeats = this.LICENSED_SEAT_QUOTA;
    const availableSeats = Math.max(0, licensedSeats - activeUsers);
    const utilizationPercent = Math.round((activeUsers / licensedSeats) * 100);

    let status: LicenseUsageSummary["status"] = "HEALTHY";
    if (utilizationPercent >= 100) status = "EXHAUSTED";
    else if (utilizationPercent >= 80) status = "WARNING";

    return {
      licensedSeats,
      activeUsers,
      availableSeats,
      utilizationPercent,
      status,
    };
  }

  /**
   * Creates a new staff user. Validates license seat quota before creation and emits audit log.
   */
  public static createStaffUser(
    userData: Omit<StaffUser, "id">,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): { success: boolean; user?: StaffUser; error?: string } {
    // 1. License Quota Enforcement
    const license = this.getLicenseUsage();
    if (userData.status === "ACTIVE" && license.availableSeats <= 0) {
      return {
        success: false,
        error: `License seat quota exhausted (${license.activeUsers}/${license.licensedSeats} active seats). Please upgrade subscription plan to add more active staff accounts.`,
      };
    }

    // 2. Department Linkage Resolution
    const dept = DepartmentService.getDepartmentById(userData.departmentId) || DepartmentService.resolveDepartment(userData.departmentId);
    const departmentId = dept ? dept.id : userData.departmentId || "dept-101";
    const departmentCode = dept ? dept.code : userData.departmentCode || "GEN-01";
    const departmentName = dept ? dept.name : userData.departmentName || "General OPD";

    const newId = `usr-${Date.now()}`;
    const newStaffUser: StaffUser = {
      ...userData,
      id: newId,
      staffId: userData.staffId || `STF-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: userData.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      departmentId,
      departmentCode,
      departmentName,
      joinedDate: userData.joinedDate || new Date().toISOString().split("T")[0],
      effectivePermissions: userData.effectivePermissions || ["opd:queue:read"],
    };

    useStaffUserStore.getState().addUser(newStaffUser);

    // 3. Dispatch Audit Event
    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `User Created: ${newStaffUser.fullName} (${newStaffUser.staffId})`,
      category: "GOVERNANCE_EVENT",
      entity: `${newStaffUser.fullName} [Staff ID: ${newStaffUser.staffId}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "User Created",
        timestamp: new Date().toISOString(),
        actor,
        targetUser: `${newStaffUser.fullName} (${newStaffUser.staffId})`,
        previousValue: null,
        newValue: {
          id: newStaffUser.id,
          staffId: newStaffUser.staffId,
          fullName: newStaffUser.fullName,
          roleName: newStaffUser.roleName,
          departmentName: newStaffUser.departmentName,
          status: newStaffUser.status,
        },
      }),
    });

    return { success: true, user: newStaffUser };
  }

  /**
   * Updates staff user parameters with audit event tracking
   */
  public static updateStaffUser(
    id: string,
    updates: Partial<StaffUser>,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): StaffUser {
    const existing = this.getStaffUserById(id);
    if (!existing) {
      throw new Error(`Staff user '${id}' not found.`);
    }

    const previousValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};
    const changedFields: string[] = [];

    Object.keys(updates).forEach((key) => {
      const prevVal = existing[key as keyof StaffUser];
      const newVal = updates[key as keyof StaffUser];
      if (JSON.stringify(prevVal) !== JSON.stringify(newVal)) {
        changedFields.push(key);
        previousValues[key] = prevVal;
        newValues[key] = newVal;
      }
    });

    useStaffUserStore.getState().updateUser(id, updates);
    const updatedUser = { ...existing, ...updates };

    if (changedFields.length > 0) {
      PlatformAuditService.recordAuditEvent({
        actor,
        actorRole: "HOSPITAL_ADMIN",
        action: `User Updated: ${updatedUser.fullName} (${updatedUser.staffId})`,
        category: "GOVERNANCE_EVENT",
        entity: `${updatedUser.fullName} [Staff ID: ${updatedUser.staffId}]`,
        ipAddress: "192.168.1.105",
        riskLevel: "INFO",
        details: JSON.stringify({
          event: "User Updated",
          timestamp: new Date().toISOString(),
          actor,
          targetUser: `${updatedUser.fullName} (${updatedUser.staffId})`,
          changedFields,
          previousValue: previousValues,
          newValue: newValues,
        }),
      });
    }

    return updatedUser;
  }

  /**
   * Lifecycle status transition (e.g. ACTIVE, SUSPENDED, DISABLED, TERMINATED) with seat quota check
   */
  public static updateUserStatus(
    id: string,
    newStatus: StaffUserStatus,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): { success: boolean; user?: StaffUser; error?: string } {
    const existing = this.getStaffUserById(id);
    if (!existing) return { success: false, error: "User not found." };

    // Check seat quota if activating a currently inactive account
    if (existing.status !== "ACTIVE" && newStatus === "ACTIVE") {
      const license = this.getLicenseUsage();
      if (license.availableSeats <= 0) {
        return {
          success: false,
          error: `Cannot activate user. License seat quota exhausted (${license.activeUsers}/${license.licensedSeats} active seats).`,
        };
      }
    }

    const prevStatus = existing.status;
    useStaffUserStore.getState().updateUserStatus(id, newStatus);
    const updatedUser = { ...existing, status: newStatus };

    const eventName = newStatus === "ACTIVE" ? "User Enabled" : newStatus === "DISABLED" ? "User Disabled" : "User Status Changed";

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `${eventName}: ${updatedUser.fullName} (${prevStatus} -> ${newStatus})`,
      category: "GOVERNANCE_EVENT",
      entity: `${updatedUser.fullName} [Staff ID: ${updatedUser.staffId}]`,
      ipAddress: "192.168.1.105",
      riskLevel: newStatus === "DISABLED" || newStatus === "TERMINATED" ? "WARNING" : "INFO",
      details: JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        actor,
        targetUser: `${updatedUser.fullName} (${updatedUser.staffId})`,
        previousValue: { status: prevStatus },
        newValue: { status: newStatus },
      }),
    });

    return { success: true, user: updatedUser };
  }

  /**
   * Bulk lifecycle status transition for multiple staff users
   */
  public static bulkUpdateUserStatus(
    userIds: string[],
    newStatus: StaffUserStatus,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): { updatedCount: number; errors: string[] } {
    let updatedCount = 0;
    const errors: string[] = [];

    for (const id of userIds) {
      const res = this.updateUserStatus(id, newStatus, actor);
      if (res.success) {
        updatedCount++;
      } else if (res.error) {
        errors.push(res.error);
      }
    }

    if (updatedCount > 0) {
      PlatformAuditService.recordAuditEvent({
        actor,
        actorRole: "HOSPITAL_ADMIN",
        action: `Bulk User Status Update: ${updatedCount} user(s) -> ${newStatus}`,
        category: "GOVERNANCE_EVENT",
        entity: `${updatedCount} Hospital Staff Accounts`,
        ipAddress: "192.168.1.105",
        riskLevel: newStatus === "DISABLED" || newStatus === "SUSPENDED" ? "WARNING" : "INFO",
        details: JSON.stringify({
          event: "Bulk User Status Update",
          timestamp: new Date().toISOString(),
          actor,
          targetCount: updatedCount,
          newStatus,
          userIds,
        }),
      });
    }

    return { updatedCount, errors };
  }

  /**
   * Reassigns RBAC role and permission claims with audit event
   */
  public static reassignRole(
    id: string,
    roleId: string,
    roleName: string,
    effectivePermissions: string[],
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): StaffUser {
    const existing = this.getStaffUserById(id);
    if (!existing) throw new Error("User not found.");

    const prevRole = { roleId: existing.roleId, roleName: existing.roleName };
    const newRole = { roleId, roleName };

    useStaffUserStore.getState().updateUser(id, {
      roleId,
      roleName,
      effectivePermissions,
    });

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Role Changed: ${existing.fullName} (${existing.roleName} -> ${roleName})`,
      category: "GOVERNANCE_EVENT",
      entity: `${existing.fullName} [Staff ID: ${existing.staffId}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Role Changed",
        timestamp: new Date().toISOString(),
        actor,
        targetUser: `${existing.fullName} (${existing.staffId})`,
        previousValue: prevRole,
        newValue: newRole,
      }),
    });

    return { ...existing, roleId, roleName, effectivePermissions };
  }

  /**
   * Reassigns department linkage with audit event
   */
  public static reassignDepartment(
    id: string,
    departmentId: string,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): StaffUser {
    const existing = this.getStaffUserById(id);
    if (!existing) throw new Error("User not found.");

    const dept = DepartmentService.getDepartmentById(departmentId) || DepartmentService.resolveDepartment(departmentId);
    if (!dept) throw new Error(`Department '${departmentId}' not found.`);

    const prevDept = { departmentId: existing.departmentId, departmentName: existing.departmentName };
    const newDept = { departmentId: dept.id, departmentCode: dept.code, departmentName: dept.name };

    useStaffUserStore.getState().updateUser(id, newDept);

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Department Changed: ${existing.fullName} (${existing.departmentName} -> ${dept.name})`,
      category: "GOVERNANCE_EVENT",
      entity: `${existing.fullName} [Staff ID: ${existing.staffId}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Department Changed",
        timestamp: new Date().toISOString(),
        actor,
        targetUser: `${existing.fullName} (${existing.staffId})`,
        previousValue: prevDept,
        newValue: newDept,
      }),
    });

    return { ...existing, ...newDept };
  }

  /**
   * Resets staff user password and logs audit event
   */
  public static resetUserPassword(
    id: string,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): { temporaryPassword: string } {
    const existing = this.getStaffUserById(id);
    if (!existing) throw new Error("User not found.");

    const temporaryPassword = `TempPass-${Math.floor(1000 + Math.random() * 9000)}!`;

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Password Reset Issued for ${existing.fullName} (${existing.staffId})`,
      category: "GOVERNANCE_EVENT",
      entity: `${existing.fullName} [Staff ID: ${existing.staffId}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "WARNING",
      details: JSON.stringify({
        event: "Password Reset",
        timestamp: new Date().toISOString(),
        actor,
        targetUser: `${existing.fullName} (${existing.staffId})`,
        previousValue: { passwordState: "ENCRYPTED" },
        newValue: { passwordState: "TEMPORARY_RESET_ISSUED" },
      }),
    });

    return { temporaryPassword };
  }

  /**
   * Checks if a staff user can be safely disabled/deleted without leaving orphaned references in Roster, Attendance, or HOD assignments
   */
  public static checkDeleteOrDisableSafety(id: string): UserDeleteSafetyResult {
    const user = this.getStaffUserById(id);
    if (!user) return { canDeleteOrDisable: true, activeReferences: [] };

    const activeReferences: Array<{ module: string; count: number; description: string }> = [];

    // 1. Check Shift Roster assignments using canonical userId and staffId
    const rosters = useAdminRosterStore
      .getState()
      .rosters.filter(
        (r) =>
          r.userId === user.id ||
          r.staffId === user.staffId ||
          r.staffId === user.employeeId ||
          r.staffName.toLowerCase().includes(user.fullName.toLowerCase())
      );
    if (rosters.length > 0) {
      activeReferences.push({
        module: "Staff Shift Roster",
        count: rosters.length,
        description: `${rosters.length} active shift schedule(s) assigned to ${user.fullName}`,
      });
    }

    // 2. Check HR Attendance Logs
    const attendance = useHrStore
      .getState()
      .attendanceLogs.filter((a) => a.staffId.toLowerCase() === user.staffId.toLowerCase() || a.staffName.toLowerCase().includes(user.fullName.toLowerCase()));
    if (attendance.length > 0) {
      activeReferences.push({
        module: "HR & Attendance Logs",
        count: attendance.length,
        description: `${attendance.length} attendance log record(s) for ${user.fullName}`,
      });
    }

    // 3. Check Department HOD assignments
    const hodDepts = useAdminDepartmentStore
      .getState()
      .departments.filter((d) => d.hodUserId === user.id || d.headOfDepartment.toLowerCase().includes(user.fullName.toLowerCase()));
    if (hodDepts.length > 0) {
      activeReferences.push({
        module: "Department Master HOD Linkage",
        count: hodDepts.length,
        description: `${user.fullName} is assigned as Head of Department for: ${hodDepts.map((d) => d.name).join(", ")}`,
      });
    }

    const canDeleteOrDisable = activeReferences.length === 0;
    const blockedReason = canDeleteOrDisable
      ? undefined
      : `Cannot disable/delete staff user '${user.fullName}' due to active cross-module dependencies in ${activeReferences.map((r) => r.module).join(", ")}. Reassign shift rosters and HOD duties before disabling.`;

    return {
      canDeleteOrDisable,
      blockedReason,
      activeReferences,
    };
  }

  /**
   * Validates cross-module user identifier integrity
   */
  public static validateUserReferences(): { valid: boolean; orphanedReferences: Array<{ module: string; reference: string; issue: string }> } {
    const users = useStaffUserStore.getState().users;
    const userIds = new Set(users.map((u) => u.id));
    const staffIds = new Set(users.map((u) => u.staffId.toLowerCase()));

    const orphanedReferences: Array<{ module: string; reference: string; issue: string }> = [];

    // Check Roster staff
    const rosters = useAdminRosterStore.getState().rosters;
    rosters.forEach((r) => {
      const found = users.some((u) => u.fullName.toLowerCase().includes(r.staffName.toLowerCase()) || r.staffName.toLowerCase().includes(u.fullName.toLowerCase()));
      if (!found) {
        orphanedReferences.push({
          module: "Staff Shift Roster",
          reference: r.staffName,
          issue: `Roster record '${r.id}' references unmapped staff '${r.staffName}'`,
        });
      }
    });

    return {
      valid: orphanedReferences.length === 0,
      orphanedReferences,
    };
  }

  /**
   * Resets staff user data to system default profile
   */
  public static resetToDefaults(): void {
    useStaffUserStore.getState().resetToDefaults();
    PlatformAuditService.recordAuditEvent({
      actor: "Dr. Rajesh Sharma (Hospital Admin)",
      actorRole: "HOSPITAL_ADMIN",
      action: "Reset Staff User Database to System Defaults",
      category: "GOVERNANCE_EVENT",
      entity: "Hospital Staff User Registry",
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({ event: "Staff User Registry Reset" }),
    });
  }
}
