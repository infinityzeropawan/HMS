"use client";

import { useAdminDepartmentStore } from "../_admin_stores/admin_department_store";
import {
  HospitalDepartment,
  DepartmentFilterParams,
  DepartmentStatus,
  DeleteSafetyResult,
  CrossModuleValidationResult,
} from "../_admin_types/department_types";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import { useAdminRosterStore } from "../_admin_stores/admin_roster_store";
import { useHrStore } from "@/app/(hr)/_hr_stores/hr_store";

export class DepartmentService {
  /**
   * Retrieves all departments with optional search and filter parameters
   */
  public static getDepartments(params?: DepartmentFilterParams): HospitalDepartment[] {
    const departments = useAdminDepartmentStore.getState().departments;
    if (!params) return departments;

    return departments.filter((d) => {
      if (params.type && params.type !== "ALL" && d.type !== params.type) {
        return false;
      }
      if (params.status && params.status !== "ALL" && d.status !== params.status) {
        return false;
      }
      if (params.parentDepartmentId && d.parentDepartmentId !== params.parentDepartmentId) {
        return false;
      }
      if (params.searchTerm) {
        const query = params.searchTerm.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(query);
        const matchesCode = d.code.toLowerCase().includes(query);
        const matchesHod = d.headOfDepartment.toLowerCase().includes(query) || (d.hodDisplayName && d.hodDisplayName.toLowerCase().includes(query));
        const matchesLoc = d.location.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesHod && !matchesLoc) return false;
      }
      return true;
    });
  }

  /**
   * Retrieves a department by canonical ID
   */
  public static getDepartmentById(id: string): HospitalDepartment | undefined {
    return useAdminDepartmentStore.getState().departments.find((d) => d.id === id);
  }

  /**
   * Retrieves a department by canonical Code
   */
  public static getDepartmentByCode(code: string): HospitalDepartment | undefined {
    return useAdminDepartmentStore.getState().departments.find((d) => d.code.toLowerCase() === code.toLowerCase());
  }

  /**
   * Canonical Resolver: Attempts resolution by ID first, then Code, then exact Name match, then fuzzy Name match.
   * Ensures consuming modules (Roster, HR, User Management, Reception, Billing) resolve canonical records safely.
   */
  public static resolveDepartment(identifier: string): HospitalDepartment | undefined {
    if (!identifier) return undefined;

    const departments = useAdminDepartmentStore.getState().departments;

    // 1. Direct ID match
    const byId = departments.find((d) => d.id === identifier);
    if (byId) return byId;

    // 2. Direct Code match
    const byCode = departments.find((d) => d.code.toLowerCase() === identifier.toLowerCase());
    if (byCode) return byCode;

    // 3. Exact Name match
    const byExactName = departments.find((d) => d.name.toLowerCase() === identifier.toLowerCase());
    if (byExactName) return byExactName;

    // 4. Partial / Fuzzy Name match (e.g., "Cardiology" matching "Cardiology & Cardiac Sciences")
    const byFuzzyName = departments.find(
      (d) =>
        d.name.toLowerCase().includes(identifier.toLowerCase()) ||
        identifier.toLowerCase().includes(d.name.toLowerCase())
    );
    if (byFuzzyName) return byFuzzyName;

    return undefined;
  }

  /**
   * Creates a new department and records an audit event in PlatformAuditService
   */
  public static createDepartment(
    deptData: Omit<HospitalDepartment, "id">,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): HospitalDepartment {
    const store = useAdminDepartmentStore.getState();
    const newId = `dept-${Date.now()}`;

    const newDepartment: HospitalDepartment = {
      ...deptData,
      id: newId,
      code: deptData.code || `DEPT-${Math.floor(100 + Math.random() * 900)}`,
      status: deptData.status || "ACTIVE",
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
      bedCapacity: deptData.bedCapacity || {
        approvedBeds: deptData.allocatedBeds || 10,
        operationalBeds: deptData.allocatedBeds || 10,
        reservedBeds: 2,
        occupiedBeds: Math.floor((deptData.allocatedBeds || 10) * 0.7),
      },
      staffCapacity: deptData.staffCapacity || {
        approvedStaffCount: (deptData.activeStaffCount || 5) + 3,
        activeStaffCount: deptData.activeStaffCount || 5,
        vacantStaffCount: 3,
      },
    };

    store.addDepartment(newDepartment);

    // Dispatch Immutable Audit Event
    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Department Created: ${newDepartment.name} (${newDepartment.code})`,
      category: "GOVERNANCE_EVENT",
      entity: `${newDepartment.name} [ID: ${newDepartment.id}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Department Created",
        departmentId: newDepartment.id,
        departmentCode: newDepartment.code,
        name: newDepartment.name,
        type: newDepartment.type,
        status: newDepartment.status,
        headOfDepartment: newDepartment.headOfDepartment,
        hodUserId: newDepartment.hodUserId,
        parentDepartmentId: newDepartment.parentDepartmentId,
        capacity: {
          bedCapacity: newDepartment.bedCapacity,
          staffCapacity: newDepartment.staffCapacity,
        },
      }),
    });

    return newDepartment;
  }

  /**
   * Updates an existing department and records an audit event in PlatformAuditService
   */
  public static updateDepartment(
    id: string,
    updates: Partial<HospitalDepartment>,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): HospitalDepartment {
    const store = useAdminDepartmentStore.getState();
    const existing = store.departments.find((d) => d.id === id);

    if (!existing) {
      throw new Error(`Department with ID '${id}' not found.`);
    }

    const previousValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};
    const changedFields: string[] = [];

    Object.keys(updates).forEach((key) => {
      const prevVal = existing[key as keyof HospitalDepartment];
      const newVal = updates[key as keyof HospitalDepartment];
      if (JSON.stringify(prevVal) !== JSON.stringify(newVal)) {
        changedFields.push(key);
        previousValues[key] = prevVal;
        newValues[key] = newVal;
      }
    });

    const updatedDept: HospitalDepartment = {
      ...existing,
      ...updates,
      updatedDate: new Date().toISOString().split("T")[0],
    };

    store.updateDepartment(id, updates);

    // Audit Integration
    if (changedFields.length > 0) {
      const isStatusChange = changedFields.includes("status");
      const isHodChange = changedFields.includes("headOfDepartment") || changedFields.includes("hodUserId");

      let actionText = `Updated Department ${updatedDept.name} (${updatedDept.code})`;
      if (isStatusChange) {
        actionText = `Department Status Changed: ${updatedDept.name} -> ${updatedDept.status}`;
      } else if (isHodChange) {
        actionText = `Department HOD Changed: ${updatedDept.name} -> ${updatedDept.headOfDepartment}`;
      }

      PlatformAuditService.recordAuditEvent({
        actor,
        actorRole: "HOSPITAL_ADMIN",
        action: actionText,
        category: "GOVERNANCE_EVENT",
        entity: `${updatedDept.name} [ID: ${updatedDept.id}]`,
        ipAddress: "192.168.1.105",
        riskLevel: isStatusChange && (updatedDept.status === "CLOSED" || updatedDept.status === "SUSPENDED") ? "WARNING" : "INFO",
        details: JSON.stringify({
          event: isStatusChange
            ? updatedDept.status === "ACTIVE" ? "Department Activated" : "Department Deactivated"
            : isHodChange ? "Department HOD Changed" : "Department Updated",
          departmentId: id,
          departmentCode: updatedDept.code,
          changedFields,
          previousValues,
          newValues,
        }),
      });
    }

    return updatedDept;
  }

  /**
   * Updates department status with dedicated audit event
   */
  public static updateStatus(
    id: string,
    newStatus: DepartmentStatus,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): HospitalDepartment {
    return this.updateDepartment(id, { status: newStatus }, actor);
  }

  /**
   * Updates HOD assignment with dedicated audit event
   */
  public static updateHod(
    id: string,
    hodUserId: string,
    hodDisplayName: string,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): HospitalDepartment {
    return this.updateDepartment(
      id,
      {
        hodUserId,
        hodDisplayName,
        headOfDepartment: hodDisplayName,
      },
      actor
    );
  }

  /**
   * Checks if an outgoing HOD can be replaced safely without leaving unassigned HOD duties in Roster/HR.
   */
  public static checkHODReplacementSafety(departmentId: string): { safe: boolean; activeDutyCount: number; warning?: string } {
    const dept = this.getDepartmentById(departmentId);
    if (!dept || !dept.hodUserId) return { safe: true, activeDutyCount: 0 };

    const activeRosters = useAdminRosterStore
      .getState()
      .rosters.filter((r) => r.userId === dept.hodUserId && r.status === "ON_DUTY");

    if (activeRosters.length > 0) {
      return {
        safe: true,
        activeDutyCount: activeRosters.length,
        warning: `Outgoing HOD ${dept.headOfDepartment} currently has ${activeRosters.length} active shift(s) ON_DUTY. Reassign shifts after updating HOD.`,
      };
    }

    return { safe: true, activeDutyCount: 0 };
  }

  /**
   * Checks if a department can safely be deleted or if active cross-module references block deletion
   */
  public static checkDeleteSafety(id: string): DeleteSafetyResult {
    const dept = this.getDepartmentById(id);
    if (!dept) {
      return { canDelete: true, activeReferences: [] };
    }

    const activeReferences: Array<{ module: string; count: number; description: string }> = [];

    // 1. Check Shift Roster references
    const rosterShifts = useAdminRosterStore
      .getState()
      .rosters.filter((r) => r.department.toLowerCase().includes(dept.name.toLowerCase()) || r.department.toLowerCase().includes(dept.code.toLowerCase()));
    if (rosterShifts.length > 0) {
      activeReferences.push({
        module: "Staff Shift Roster",
        count: rosterShifts.length,
        description: `${rosterShifts.length} active shift schedule(s) assigned to ${dept.name}`,
      });
    }

    // 2. Check HR Attendance Logs
    const attendanceLogs = useHrStore
      .getState()
      .attendanceLogs.filter((a) => a.department.toLowerCase().includes(dept.name.toLowerCase()) || a.department.toLowerCase().includes(dept.code.toLowerCase()));
    if (attendanceLogs.length > 0) {
      activeReferences.push({
        module: "HR & Attendance Logs",
        count: attendanceLogs.length,
        description: `${attendanceLogs.length} attendance record(s) linked to ${dept.name}`,
      });
    }

    // 3. Check Sub-Department references
    const subDepartments = useAdminDepartmentStore
      .getState()
      .departments.filter((d) => d.parentDepartmentId === id);
    if (subDepartments.length > 0) {
      activeReferences.push({
        module: "Sub-Department Hierarchy",
        count: subDepartments.length,
        description: `${subDepartments.length} sub-department(s) configured under ${dept.name}`,
      });
    }

    const canDelete = activeReferences.length === 0;
    const blockedReason = canDelete
      ? undefined
      : `Cannot delete department '${dept.name}' because it has active dependencies in ${activeReferences.map((r) => r.module).join(", ")}. Deactivate or Suspend the department instead.`;

    return {
      canDelete,
      blockedReason,
      activeReferences,
    };
  }

  /**
   * Deletes a department safely. If referenced by external modules, deletion is blocked and a warning is returned.
   */
  public static deleteDepartment(
    id: string,
    actor: string = "Dr. Rajesh Sharma (Hospital Admin)"
  ): { success: boolean; error?: string } {
    const safetyCheck = this.checkDeleteSafety(id);
    if (!safetyCheck.canDelete) {
      return {
        success: false,
        error: safetyCheck.blockedReason,
      };
    }

    const dept = this.getDepartmentById(id);
    if (!dept) {
      return { success: false, error: "Department not found." };
    }

    useAdminDepartmentStore.getState().deleteDepartment(id);

    // Audit Logging
    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Deleted Department ${dept.name} (${dept.code})`,
      category: "GOVERNANCE_EVENT",
      entity: `${dept.name} [ID: ${id}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "WARNING",
      details: JSON.stringify({
        event: "Department Deleted",
        departmentId: id,
        departmentCode: dept.code,
        name: dept.name,
      }),
    });

    return { success: true };
  }

  /**
   * Validates cross-module department link integrity across the codebase
   */
  public static validateCrossModuleReferences(): CrossModuleValidationResult {
    const departments = useAdminDepartmentStore.getState().departments;
    const deptIdentifiers = new Set<string>();
    departments.forEach((d) => {
      deptIdentifiers.add(d.id);
      deptIdentifiers.add(d.code.toLowerCase());
      deptIdentifiers.add(d.name.toLowerCase());
    });

    const orphanedReferences: Array<{ module: string; reference: string; issue: string }> = [];
    let totalReferences = 0;

    // Check Rosters
    const rosters = useAdminRosterStore.getState().rosters;
    rosters.forEach((r) => {
      totalReferences++;
      if (!this.resolveDepartment(r.department)) {
        orphanedReferences.push({
          module: "Staff Shift Roster",
          reference: r.department,
          issue: `Roster for '${r.staffName}' references unmapped department '${r.department}'`,
        });
      }
    });

    // Check HR Attendance Logs
    const attendance = useHrStore.getState().attendanceLogs;
    attendance.forEach((a) => {
      totalReferences++;
      if (!this.resolveDepartment(a.department)) {
        orphanedReferences.push({
          module: "HR & Attendance Logs",
          reference: a.department,
          issue: `Attendance log for '${a.staffName}' references unmapped department '${a.department}'`,
        });
      }
    });

    return {
      valid: orphanedReferences.length === 0,
      totalReferences,
      orphanedReferences,
    };
  }

  /**
   * Resets department master data to default profile
   */
  public static resetToDefaults(): void {
    useAdminDepartmentStore.getState().resetToDefaults();
    PlatformAuditService.recordAuditEvent({
      actor: "Dr. Rajesh Sharma (Hospital Admin)",
      actorRole: "HOSPITAL_ADMIN",
      action: "Reset Department Master Data to System Defaults",
      category: "GOVERNANCE_EVENT",
      entity: "Hospital Department Master Catalog",
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({ event: "Department Master Reset" }),
    });
  }
}
