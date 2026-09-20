"use client";

import { useBedStore } from "../_admin_stores/admin_bed_store";
import { TariffService } from "./tariff_service";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import {
  HospitalBed,
  BedStatus,
  BedValidationResult,
} from "../_admin_types/bed_types";

export interface BedAllocationPatientInfo {
  patientId?: string;
  uhid: string;
  ipdNo: string;
  patientName: string;
  admissionDate?: string;
}

export class BedService {
  /**
   * Retrieves all hospital physical beds with daily rate dynamically resolved from Tariff Master.
   */
  public static getBeds(): HospitalBed[] {
    const rawBeds = useBedStore.getState().beds;
    return rawBeds.map((b) => ({
      ...b,
      dailyRate: TariffService.resolveBedRate(b.category),
    }));
  }

  /**
   * Retrieves a specific bed by ID or canonical bed number.
   */
  public static getBedById(idOrNumber: string): HospitalBed | undefined {
    const beds = this.getBeds();
    return beds.find(
      (b) =>
        b.id.toLowerCase() === idOrNumber.toLowerCase() ||
        b.bedNumber.toLowerCase() === idOrNumber.toLowerCase()
    );
  }

  /**
   * Registers a new physical hospital bed, resolves daily rate from Tariff Master,
   * updates store and emits audit log.
   */
  public static registerBed(
    bed: Omit<HospitalBed, "id" | "dailyRate">,
    actorName: string = "Hospital Admin",
    actorRole: string = "HOSPITAL_ADMIN"
  ): { success: boolean; message: string; bed?: HospitalBed } {
    const rate = TariffService.resolveBedRate(bed.category);
    const newId = `bed-${Math.floor(100 + Math.random() * 900)}`;
    const fullBed: HospitalBed = {
      ...bed,
      id: newId,
      dailyRate: rate,
    };

    useBedStore.getState().addBed(fullBed);

    PlatformAuditService.recordAuditEvent({
      actor: actorName,
      actorRole,
      action: `Registered new physical bed ${fullBed.bedNumber} in ${fullBed.wardName}`,
      category: "GOVERNANCE_EVENT",
      entity: `${fullBed.wardName} (${fullBed.bedNumber})`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({ bedId: newId, category: fullBed.category, dailyRate: rate }),
    });

    return {
      success: true,
      message: `Bed ${fullBed.bedNumber} registered successfully with tariff rate ₹${rate}/day.`,
      bed: fullBed,
    };
  }

  /**
   * Retrieves all available beds suitable for admission (VACANT or RESERVED).
   */
  public static getAvailableBeds(): HospitalBed[] {
    const beds = useBedStore.getState().beds;
    return beds.filter((b) => b.status === "VACANT" || b.status === "RESERVED");
  }

  /**
   * Retrieves beds in a specific ward.
   */
  public static getBedsForWard(wardIdOrName: string): HospitalBed[] {
    const beds = useBedStore.getState().beds;
    return beds.filter(
      (b) =>
        b.wardId.toLowerCase() === wardIdOrName.toLowerCase() ||
        b.wardName.toLowerCase().includes(wardIdOrName.toLowerCase())
    );
  }

  /**
   * Validates if a bed can be allocated to a patient.
   */
  public static validateBedAllocation(bedId: string): BedValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const bed = this.getBedById(bedId);
    if (!bed) {
      errors.push(`Bed record not found for ID: '${bedId}'.`);
      return { valid: false, errors, warnings };
    }

    if (bed.status === "OCCUPIED") {
      errors.push(
        `Double Allocation Guard: Bed ${bed.bedNumber} is already OCCUPIED by ${bed.currentPatientName || "another patient"} (${bed.currentIpdNo || "IPD"}).`
      );
    } else if (bed.status === "CLEANING") {
      errors.push(
        `Sanitation Guard: Bed ${bed.bedNumber} is currently under CLEANING and awaiting housekeeping clearance.`
      );
    } else if (bed.status === "MAINTENANCE") {
      errors.push(
        `Maintenance Guard: Bed ${bed.bedNumber} is currently under MAINTENANCE and cannot be assigned.`
      );
    } else if (bed.status === "BLOCKED") {
      errors.push(
        `Blocked Guard: Bed ${bed.bedNumber} is currently BLOCKED by administration.`
      );
    } else if (bed.status === "RESERVED") {
      warnings.push(
        `Bed ${bed.bedNumber} is currently RESERVED. Completing allocation will claim the reserved seat.`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Allocates a bed to an admitted inpatient and records audit log.
   */
  public static allocateBed(
    bedId: string,
    patientInfo: BedAllocationPatientInfo,
    actor = "Admissions Desk Officer"
  ): HospitalBed {
    const validation = this.validateBedAllocation(bedId);
    if (!validation.valid) {
      throw new Error(`Bed Allocation Failed: ${validation.errors.join("; ")}`);
    }

    const bed = this.getBedById(bedId)!;
    const admissionDate = patientInfo.admissionDate || new Date().toISOString().split("T")[0];

    const updates: Partial<HospitalBed> = {
      status: "OCCUPIED",
      currentPatientId: patientInfo.patientId || `usr-${Date.now()}`,
      currentUhid: patientInfo.uhid,
      currentIpdNo: patientInfo.ipdNo,
      currentPatientName: patientInfo.patientName,
      admissionDate,
    };

    useBedStore.getState().updateBed(bed.id, updates);
    const updatedBed = this.getBedById(bed.id)!;

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Bed Allocated: ${bed.bedNumber} to ${patientInfo.patientName}`,
      category: "GOVERNANCE_EVENT",
      entity: `${bed.bedNumber} [${bed.wardName}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Bed Allocated",
        timestamp: new Date().toISOString(),
        actor,
        bedId: bed.id,
        bedNumber: bed.bedNumber,
        wardId: bed.wardId,
        wardName: bed.wardName,
        departmentId: bed.departmentId,
        targetUser: patientInfo.patientName,
        uhid: patientInfo.uhid,
        ipdNo: patientInfo.ipdNo,
        dailyRate: bed.dailyRate,
        newValue: updatedBed,
      }),
    });

    return updatedBed;
  }

  /**
   * Releases an occupied bed upon discharge and transitions status to CLEANING.
   */
  public static releaseBed(
    bedId: string,
    reason = "Discharge",
    actor = "Ward Sister In-Charge"
  ): HospitalBed {
    const bed = this.getBedById(bedId);
    if (!bed) {
      throw new Error(`Bed record not found for ID: '${bedId}'.`);
    }

    const previousPatient = bed.currentPatientName || "Patient";
    const previousIpdNo = bed.currentIpdNo || "N/A";

    useBedStore.getState().setBedStatus(bed.id, "CLEANING", `Released via ${reason}. Housekeeping pending.`);
    const updatedBed = this.getBedById(bed.id)!;

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Bed Released: ${bed.bedNumber} (${reason})`,
      category: "GOVERNANCE_EVENT",
      entity: `${bed.bedNumber} [${bed.wardName}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Bed Released",
        timestamp: new Date().toISOString(),
        actor,
        bedId: bed.id,
        bedNumber: bed.bedNumber,
        wardName: bed.wardName,
        previousPatient,
        previousIpdNo,
        reason,
        newValue: { status: "CLEANING" },
      }),
    });

    return updatedBed;
  }

  /**
   * Completes housekeeping sanitation for a bed and transitions status to VACANT.
   */
  public static completeCleaning(bedId: string, actor = "Housekeeping Supervisor"): HospitalBed {
    const bed = this.getBedById(bedId);
    if (!bed) {
      throw new Error(`Bed record not found for ID: '${bedId}'.`);
    }

    useBedStore.getState().setBedStatus(bed.id, "VACANT", "Sanitization & UV sterilization complete");
    const updatedBed = this.getBedById(bed.id)!;

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Bed Cleaning Completed: ${bed.bedNumber}`,
      category: "COMPLIANCE_EVENT",
      entity: `${bed.bedNumber} [${bed.wardName}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Bed Cleaning Completed",
        timestamp: new Date().toISOString(),
        actor,
        bedId: bed.id,
        bedNumber: bed.bedNumber,
        status: "VACANT",
      }),
    });

    return updatedBed;
  }

  /**
   * Transfers a patient from one bed to another.
   */
  public static transferBed(
    fromBedId: string,
    toBedId: string,
    patientInfo: BedAllocationPatientInfo,
    actor = "Nurse Station / Ward Transfer"
  ): { fromBed: HospitalBed; toBed: HospitalBed } {
    const fromBed = this.getBedById(fromBedId);
    if (!fromBed) {
      throw new Error(`Source bed not found: '${fromBedId}'`);
    }

    const validation = this.validateBedAllocation(toBedId);
    if (!validation.valid) {
      throw new Error(`Bed Transfer Failed: ${validation.errors.join("; ")}`);
    }

    // Release source bed to CLEANING
    useBedStore.getState().setBedStatus(fromBed.id, "CLEANING", `Patient transferred to ${toBedId}`);

    // Allocate target bed to OCCUPIED
    const toBed = this.allocateBed(toBedId, patientInfo, actor);
    const updatedFromBed = this.getBedById(fromBed.id)!;

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Bed Transferred: ${fromBed.bedNumber} -> ${toBed.bedNumber}`,
      category: "GOVERNANCE_EVENT",
      entity: `${patientInfo.patientName} [${patientInfo.ipdNo}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Bed Transferred",
        timestamp: new Date().toISOString(),
        actor,
        fromBedId: fromBed.id,
        fromBedNumber: fromBed.bedNumber,
        toBedId: toBed.id,
        toBedNumber: toBed.bedNumber,
        patientName: patientInfo.patientName,
        ipdNo: patientInfo.ipdNo,
      }),
    });

    return { fromBed: updatedFromBed, toBed };
  }

  /**
   * Reserves a vacant bed for an incoming admission or emergency transfer.
   */
  public static reserveBed(
    bedId: string,
    patientInfo: { patientName: string; uhid: string },
    actor = "Emergency Admission Desk"
  ): HospitalBed {
    const bed = this.getBedById(bedId);
    if (!bed) throw new Error("Bed not found");
    if (bed.status !== "VACANT") {
      throw new Error(`Cannot reserve bed ${bed.bedNumber}. Current status is ${bed.status}.`);
    }

    useBedStore.getState().updateBed(bed.id, {
      status: "RESERVED",
      currentPatientName: patientInfo.patientName,
      currentUhid: patientInfo.uhid,
    });

    const updated = this.getBedById(bed.id)!;

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Bed Reserved: ${bed.bedNumber} for ${patientInfo.patientName}`,
      category: "GOVERNANCE_EVENT",
      entity: `${bed.bedNumber} [${bed.wardName}]`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        event: "Bed Reserved",
        timestamp: new Date().toISOString(),
        actor,
        bedId: bed.id,
        bedNumber: bed.bedNumber,
        targetUser: patientInfo.patientName,
      }),
    });

    return updated;
  }

  /**
   * Sets maintenance or blocked status for a bed.
   */
  public static setMaintenanceStatus(
    bedId: string,
    status: "MAINTENANCE" | "BLOCKED" | "VACANT",
    notes?: string,
    actor = "Biomedical / Hospital Admin"
  ): HospitalBed {
    const bed = this.getBedById(bedId);
    if (!bed) throw new Error("Bed not found");

    useBedStore.getState().setBedStatus(bed.id, status, notes);
    const updated = this.getBedById(bed.id)!;

    PlatformAuditService.recordAuditEvent({
      actor,
      actorRole: "HOSPITAL_ADMIN",
      action: `Bed Status Changed: ${bed.bedNumber} -> ${status}`,
      category: "GOVERNANCE_EVENT",
      entity: `${bed.bedNumber} [${bed.wardName}]`,
      ipAddress: "192.168.1.105",
      riskLevel: status === "MAINTENANCE" || status === "BLOCKED" ? "WARNING" : "INFO",
      details: JSON.stringify({
        event: `Bed Status ${status}`,
        timestamp: new Date().toISOString(),
        actor,
        bedId: bed.id,
        bedNumber: bed.bedNumber,
        previousStatus: bed.status,
        newStatus: status,
        notes,
      }),
    });

    return updated;
  }
}
