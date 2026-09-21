"use client";

import { useTariffStore } from "../_admin_stores/admin_tariff_store";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import {
  HospitalTariff,
  TariffCategory,
  TariffValidationResult,
  PackageComponentItem,
} from "../_admin_types/tariff_types";

const AUTHORIZED_ROLES = ["HOSPITAL_ADMIN", "SUPER_ADMIN", "FINANCE"];

export class TariffService {
  /**
   * Retrieves all registered hospital tariffs from store.
   */
  public static getTariffs(): HospitalTariff[] {
    return useTariffStore.getState().tariffs;
  }

  /**
   * Retrieves all currently active tariffs.
   */
  public static getActiveTariffs(): HospitalTariff[] {
    return useTariffStore.getState().tariffs.filter((t) => t.status === "ACTIVE");
  }

  /**
   * Retrieves a tariff by canonical ID, service code, or billing code.
   */
  public static getTariffByCode(code: string): HospitalTariff | undefined {
    const search = code.trim().toLowerCase();
    return useTariffStore.getState().tariffs.find(
      (t) =>
        t.id.toLowerCase() === search ||
        t.serviceCode.toLowerCase() === search ||
        t.billingCode.toLowerCase() === search
    );
  }

  /**
   * Retrieves tariffs filtered by category.
   */
  public static getTariffsByCategory(category: TariffCategory): HospitalTariff[] {
    return useTariffStore.getState().tariffs.filter((t) => t.category === category);
  }

  /**
   * Dynamic Bed Integration: Resolves bed daily rate dynamically from Tariff Master.
   * Eliminates pricing duplication between BedStore and Tariff Master.
   */
  public static resolveBedRate(bedCategory: string): number {
    const categoryUpper = bedCategory.toUpperCase();
    let targetCode = "SRV-BED-GEN";

    if (categoryUpper.includes("ICU") || categoryUpper.includes("NICU") || categoryUpper.includes("PICU")) {
      targetCode = "SRV-BED-ICU";
    } else if (categoryUpper.includes("SEMI")) {
      targetCode = "SRV-BED-SEMI";
    } else if (categoryUpper.includes("PRIVATE") || categoryUpper.includes("DELUXE")) {
      targetCode = "SRV-BED-DLX";
    }

    const tariff = this.getTariffByCode(targetCode);
    if (tariff && tariff.status === "ACTIVE") {
      return tariff.baseRate;
    }

    // Secondary search by category
    const bedTariffs = this.getTariffsByCategory("BED_CHARGES");
    const activeBedTariff = bedTariffs.find((t) => t.status === "ACTIVE");
    return activeBedTariff ? activeBedTariff.baseRate : 1500;
  }

  /**
   * Dynamic Billing Integration: Resolves line item description, HSN/SAC code, base rate, and GST %.
   */
  public static resolveLineItemPrice(serviceOrBillingCode: string): {
    tariffId: string;
    serviceCode: string;
    billingCode: string;
    serviceName: string;
    category: TariffCategory;
    hsnSacCode: string;
    baseRate: number;
    gstRate: number;
    departmentId: string;
    departmentCode: string;
    departmentName: string;
  } {
    const tariff = this.getTariffByCode(serviceOrBillingCode);
    if (tariff) {
      return {
        tariffId: tariff.id,
        serviceCode: tariff.serviceCode,
        billingCode: tariff.billingCode,
        serviceName: tariff.serviceName,
        category: tariff.category,
        hsnSacCode: tariff.hsnSacCode,
        baseRate: tariff.baseRate,
        gstRate: tariff.gstRate,
        departmentId: tariff.departmentId,
        departmentCode: tariff.departmentCode,
        departmentName: tariff.departmentName,
      };
    }

    // Fallback if code is custom/unlisted
    return {
      tariffId: "trf-fallback",
      serviceCode: "SRV-CUSTOM",
      billingCode: "BILL-GEN-01",
      serviceName: serviceOrBillingCode || "Hospital Medical Service",
      category: "PROCEDURE",
      hsnSacCode: "999312",
      baseRate: 500,
      gstRate: 0,
      departmentId: "dept-101",
      departmentCode: "CARD-01",
      departmentName: "General Medical Services",
    };
  }

  /**
   * Creates a new tariff entry with role permission check and audit event logging.
   */
  public static createTariff(
    data: Omit<HospitalTariff, "id" | "history" | "updatedAt">,
    actorName: string,
    actorRole: string
  ): { success: boolean; message: string; tariffId?: string } {
    if (!AUTHORIZED_ROLES.includes(actorRole.toUpperCase())) {
      return {
        success: false,
        message: `Unauthorized role [${actorRole}]. Tariff creation requires HOSPITAL_ADMIN, SUPER_ADMIN, or FINANCE permission.`,
      };
    }

    if (!data.serviceCode || !data.billingCode || !data.serviceName) {
      return {
        success: false,
        message: "Validation failed: serviceCode, billingCode, and serviceName are strictly required.",
      };
    }

    const existing = this.getTariffByCode(data.serviceCode);
    if (existing) {
      return {
        success: false,
        message: `Service code [${data.serviceCode}] already exists in Tariff Master.`,
      };
    }

    useTariffStore.getState().addTariff(data);
    const createdTariff = this.getTariffByCode(data.serviceCode);

    // Audit Log
    PlatformAuditService.recordAuditEvent({
      actor: actorName,
      actorRole: actorRole,
      action: "Tariff Created",
      category: "GOVERNANCE_EVENT",
      entity: `Tariff: ${data.serviceCode} - ${data.serviceName}`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: `Created new tariff rate ₹${data.baseRate} (GST ${data.gstRate}%) for department [${data.departmentCode}]`,
    });

    return {
      success: true,
      message: `Tariff ${data.serviceCode} successfully registered.`,
      tariffId: createdTariff?.id,
    };
  }

  /**
   * Updates base price and/or GST rate for a tariff with role permissions, history tracking, and audit logging.
   */
  public static updateTariffPrice(
    tariffId: string,
    newPrice: number,
    newGstRate: number,
    actorName: string,
    actorRole: string,
    reason?: string
  ): { success: boolean; message: string } {
    if (!AUTHORIZED_ROLES.includes(actorRole.toUpperCase())) {
      return {
        success: false,
        message: `Unauthorized role [${actorRole}]. Price modification requires HOSPITAL_ADMIN, SUPER_ADMIN, or FINANCE permission.`,
      };
    }

    const tariff = useTariffStore.getState().tariffs.find((t) => t.id === tariffId);
    if (!tariff) {
      return { success: false, message: `Tariff ID [${tariffId}] not found.` };
    }

    const oldPrice = tariff.baseRate;
    const oldGst = tariff.gstRate;

    useTariffStore.getState().updateTariffPrice(
      tariffId,
      newPrice,
      newGstRate,
      actorName,
      actorRole,
      reason
    );

    // Audit Event: GST Changed vs Tariff Updated
    const actionType = oldGst !== newGstRate ? "GST Changed" : "Tariff Updated";
    PlatformAuditService.recordAuditEvent({
      actor: actorName,
      actorRole: actorRole,
      action: actionType,
      category: "GOVERNANCE_EVENT",
      entity: `Tariff: ${tariff.serviceCode} - ${tariff.serviceName}`,
      ipAddress: "192.168.1.105",
      riskLevel: "CRITICAL",
      details: `Price updated from ₹${oldPrice} (GST ${oldGst}%) to ₹${newPrice} (GST ${newGstRate}%). Reason: ${reason || "Not specified"}`,
    });

    return {
      success: true,
      message: `Tariff rate for ${tariff.serviceCode} updated successfully.`,
    };
  }

  /**
   * Toggles active/inactive status of a tariff with role permission check and audit event logging.
   */
  public static toggleTariffStatus(
    tariffId: string,
    actorName: string,
    actorRole: string
  ): { success: boolean; message: string } {
    if (!AUTHORIZED_ROLES.includes(actorRole.toUpperCase())) {
      return {
        success: false,
        message: `Unauthorized role [${actorRole}]. Tariff status toggle requires administrative permission.`,
      };
    }

    const tariff = useTariffStore.getState().tariffs.find((t) => t.id === tariffId);
    if (!tariff) {
      return { success: false, message: `Tariff ID [${tariffId}] not found.` };
    }

    const newStatus = tariff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    useTariffStore.getState().toggleTariffStatus(tariffId);

    PlatformAuditService.recordAuditEvent({
      actor: actorName,
      actorRole: actorRole,
      action: newStatus === "ACTIVE" ? "Tariff Activated" : "Tariff Deactivated",
      category: "GOVERNANCE_EVENT",
      entity: `Tariff: ${tariff.serviceCode} - ${tariff.serviceName}`,
      ipAddress: "192.168.1.105",
      riskLevel: "WARNING",
      details: `Tariff status set to ${newStatus}`,
    });

    return {
      success: true,
      message: `Tariff ${tariff.serviceCode} is now ${newStatus}.`,
    };
  }

  /**
   * Updates package component items for package tariffs with audit logging.
   */
  public static updatePackageComponents(
    tariffId: string,
    packageItems: PackageComponentItem[],
    actorName: string,
    actorRole: string
  ): { success: boolean; message: string } {
    if (!AUTHORIZED_ROLES.includes(actorRole.toUpperCase())) {
      return {
        success: false,
        message: `Unauthorized role [${actorRole}]. Package component updates require administrative permission.`,
      };
    }

    const tariff = useTariffStore.getState().tariffs.find((t) => t.id === tariffId);
    if (!tariff) {
      return { success: false, message: `Tariff ID [${tariffId}] not found.` };
    }

    // Re-calculate package base price from sum of components
    const packageTotalRate = packageItems.reduce((acc, item) => acc + item.baseRate * item.quantity, 0);

    useTariffStore.getState().updateTariff(tariffId, {
      packageItems,
      baseRate: packageTotalRate > 0 ? packageTotalRate : tariff.baseRate,
    });

    PlatformAuditService.recordAuditEvent({
      actor: actorName,
      actorRole: actorRole,
      action: "Package Updated",
      category: "GOVERNANCE_EVENT",
      entity: `Tariff Package: ${tariff.serviceCode} - ${tariff.serviceName}`,
      ipAddress: "192.168.1.105",
      riskLevel: "WARNING",
      details: `Updated package component items (${packageItems.length} items included). New bundled rate: ₹${packageTotalRate > 0 ? packageTotalRate : tariff.baseRate}`,
    });

    return {
      success: true,
      message: `Package components for ${tariff.serviceCode} updated successfully.`,
    };
  }

  /**
   * Tariff Integrity Validation Report
   */
  public static validateTariffIntegrity(): TariffValidationResult {
    const tariffs = this.getTariffs();
    const errors: string[] = [];
    const warnings: string[] = [];

    const serviceCodeMap = new Map<string, number>();
    tariffs.forEach((t) => {
      const count = serviceCodeMap.get(t.serviceCode) || 0;
      serviceCodeMap.set(t.serviceCode, count + 1);

      if (!t.serviceCode || !t.billingCode) {
        errors.push(`Tariff ${t.id} is missing canonical serviceCode or billingCode.`);
      }

      if (!t.departmentId || !t.departmentCode) {
        errors.push(`Tariff ${t.serviceCode} is missing canonical departmentId or departmentCode.`);
      }

      if (t.baseRate < 0) {
        errors.push(`Tariff ${t.serviceCode} has invalid negative base rate: ₹${t.baseRate}`);
      }

      if (!t.hsnSacCode) {
        warnings.push(`Tariff ${t.serviceCode} does not have an assigned HSN/SAC code.`);
      }

      if (![0, 5, 12, 18, 28].includes(t.gstRate)) {
        warnings.push(`Tariff ${t.serviceCode} has non-standard GST rate (${t.gstRate}%).`);
      }
    });

    serviceCodeMap.forEach((count, code) => {
      if (count > 1) {
        errors.push(`Duplicate canonical serviceCode detected: [${code}] appears ${count} times.`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generates a CSV string representation of all hospital tariffs for download.
   */
  public static exportTariffsToCsv(): string {
    const tariffs = this.getTariffs();
    const headers = ["Service Code", "Billing Code", "Service Name", "Category", "Department", "Base Rate (INR)", "GST Rate (%)", "HSN/SAC", "Status"];
    const rows = tariffs.map((t) => [
      `"${t.serviceCode}"`,
      `"${t.billingCode}"`,
      `"${t.serviceName.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.departmentName}"`,
      t.baseRate,
      t.gstRate,
      `"${t.hsnSacCode || ""}"`,
      `"${t.status}"`,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  /**
   * Bulk updates GST rate across a specific tariff category.
   */
  public static bulkAdjustGstRate(
    category: TariffCategory,
    newGstRate: number,
    actorName: string,
    actorRole: string
  ): { updatedCount: number } {
    const categoryTariffs = this.getTariffsByCategory(category);
    let updatedCount = 0;
    categoryTariffs.forEach((t) => {
      this.updateTariffPrice(t.id, t.baseRate, newGstRate, actorName, actorRole, `Bulk GST rate adjustment to ${newGstRate}% for ${category}`);
      updatedCount++;
    });
    return { updatedCount };
  }
}
