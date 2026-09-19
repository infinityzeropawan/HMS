import {
  RetentionPolicy,
  RetentionFilterParams,
  RetentionMetrics,
  RetentionRecordType,
  RetentionComplianceStatus,
} from "../_super_admin_types/retention_types";

const INITIAL_RETENTION_POLICIES: RetentionPolicy[] = [
  {
    policyId: "RET-POL-01",
    recordType: "Clinical Records",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    retentionPeriodYears: 10,
    archiveStatus: "Active Storage",
    purgeEligibility: "Statutory Override Locked",
    complianceStatus: "Healthy",
    statutoryMandate: "NMC / MCI Guidelines 2002 Sec 1.3 & NABH 5th Edition Standard",
    currentStorageGB: 480,
    maxAllocatedGB: 1000,
    approachingThreshold: false,
    autoArchiveSchedule: "Daily at 02:00 AM UTC",
    lastArchivedDate: "2026-09-18",
    isLegalHoldLocked: true,
  },
  {
    policyId: "RET-POL-02",
    recordType: "Audit Logs",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    retentionPeriodYears: 10,
    archiveStatus: "Active Storage",
    purgeEligibility: "Not Eligible (Retained)",
    complianceStatus: "Healthy",
    statutoryMandate: "India DPDP Act 2023 Sec 12 & Cert-In Cyber Incident Directives",
    currentStorageGB: 88,
    maxAllocatedGB: 100,
    approachingThreshold: true,
    warningMessage: "Storage volume at 88% capacity limit. Impending automated cold storage archival scheduled.",
    autoArchiveSchedule: "Real-time Hash-Chained Write with Weekly Archive",
    lastArchivedDate: "2026-09-17",
    isLegalHoldLocked: true,
  },
  {
    policyId: "RET-POL-03",
    recordType: "Consent Records",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    retentionPeriodYears: 10,
    archiveStatus: "Active Storage",
    purgeEligibility: "Not Eligible (Retained)",
    complianceStatus: "Healthy",
    statutoryMandate: "India DPDP Act 2023 Sec 12 & ABDM Milestone M2 Telemetry",
    currentStorageGB: 42,
    maxAllocatedGB: 200,
    approachingThreshold: false,
    autoArchiveSchedule: "Daily at 03:00 AM UTC",
    lastArchivedDate: "2026-09-18",
    isLegalHoldLocked: false,
  },
  {
    policyId: "RET-POL-04",
    recordType: "Billing Records",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    retentionPeriodYears: 7,
    archiveStatus: "Archived Cold Storage",
    purgeEligibility: "Eligible for Legal Archival",
    complianceStatus: "Healthy",
    statutoryMandate: "Indian GST Act 2017 Sec 36 & Companies Act 2013",
    currentStorageGB: 195,
    maxAllocatedGB: 200,
    approachingThreshold: true,
    warningMessage: "FY19 Billing invoices approaching 7-year statutory archival threshold.",
    autoArchiveSchedule: "Weekly on Sunday at 04:00 AM UTC",
    lastArchivedDate: "2026-09-15",
    isLegalHoldLocked: false,
  },
  {
    policyId: "RET-POL-05",
    recordType: "Laboratory Reports",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    retentionPeriodYears: 5,
    archiveStatus: "Active Storage",
    purgeEligibility: "Not Eligible (Retained)",
    complianceStatus: "Healthy",
    statutoryMandate: "NABL ISO 15189 Quality & Competence Standards",
    currentStorageGB: 210,
    maxAllocatedGB: 500,
    approachingThreshold: false,
    autoArchiveSchedule: "Monthly on 1st at 01:00 AM UTC",
    lastArchivedDate: "2026-09-01",
    isLegalHoldLocked: false,
  },
  {
    policyId: "RET-POL-06",
    recordType: "Imaging Reports",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    retentionPeriodYears: 5,
    archiveStatus: "Pending Archival",
    purgeEligibility: "Eligible for Legal Archival",
    complianceStatus: "Warning",
    statutoryMandate: "Atomic Energy Regulatory Board (AERB) Safety Rules",
    currentStorageGB: 890,
    maxAllocatedGB: 1000,
    approachingThreshold: true,
    warningMessage: "DICOM PACS repository at 89% capacity. Batch cold storage migration recommended.",
    autoArchiveSchedule: "Monthly on 1st at 05:00 AM UTC",
    lastArchivedDate: "2026-08-01",
    isLegalHoldLocked: false,
  },
];

const currentRetentionStore: RetentionPolicy[] = [...INITIAL_RETENTION_POLICIES];

export class RetentionService {
  public static getPolicies(params?: RetentionFilterParams): RetentionPolicy[] {
    if (!params) return currentRetentionStore;

    return currentRetentionStore.filter((p) => {
      if (params.tenantId && params.tenantId !== "ALL" && p.tenantId !== params.tenantId) {
        return false;
      }
      if (params.recordType && params.recordType !== "ALL" && p.recordType !== params.recordType) {
        return false;
      }
      if (params.complianceStatus && params.complianceStatus !== "ALL" && p.complianceStatus !== params.complianceStatus) {
        return false;
      }
      if (params.searchTerm) {
        const term = params.searchTerm.toLowerCase();
        const matchesId = p.policyId.toLowerCase().includes(term);
        const matchesType = p.recordType.toLowerCase().includes(term);
        const matchesMandate = p.statutoryMandate.toLowerCase().includes(term);
        if (!matchesId && !matchesType && !matchesMandate) {
          return false;
        }
      }
      return true;
    });
  }

  public static getMetrics(tenantId?: string): RetentionMetrics {
    const policies = this.getPolicies({ tenantId });
    const activePoliciesCount = policies.length;
    let totalManagedStorageGB = 0;
    let approachingThresholdCount = 0;

    policies.forEach((p) => {
      totalManagedStorageGB += p.currentStorageGB;
      if (p.approachingThreshold) {
        approachingThresholdCount++;
      }
    });

    const statutoryComplianceRate = 99.4; // Mock score

    return {
      totalManagedStorageGB,
      activePoliciesCount,
      approachingThresholdCount,
      statutoryComplianceRate,
    };
  }

  public static getRetentionMetrics(tenantId?: string): RetentionMetrics {
    return this.getMetrics(tenantId);
  }

  public static toggleLegalHold(policyId: string, locked: boolean): RetentionPolicy {
    const index = currentRetentionStore.findIndex((p) => p.policyId === policyId);
    if (index === -1) {
      throw new Error(`Policy ${policyId} not found`);
    }

    const updated: RetentionPolicy = {
      ...currentRetentionStore[index],
      isLegalHoldLocked: locked,
      purgeEligibility: locked ? "Statutory Override Locked" : "Not Eligible (Retained)",
    };

    currentRetentionStore[index] = updated;
    return updated;
  }

  public static triggerColdArchival(policyId: string): RetentionPolicy {
    const index = currentRetentionStore.findIndex((p) => p.policyId === policyId);
    if (index === -1) {
      throw new Error(`Policy ${policyId} not found`);
    }

    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 10);

    const updated: RetentionPolicy = {
      ...currentRetentionStore[index],
      archiveStatus: "Archived Cold Storage",
      lastArchivedDate: timestamp,
      approachingThreshold: false,
      warningMessage: undefined,
    };

    currentRetentionStore[index] = updated;
    return updated;
  }

  public static exportCSV(tenantId?: string): string {
    const policies = this.getPolicies({ tenantId });
    const headers = [
      "Policy ID",
      "Record Type",
      "Tenant ID",
      "Tenant Name",
      "Retention Period (Years)",
      "Archive Status",
      "Purge Eligibility",
      "Compliance Status",
      "Storage Used (GB)",
      "Max Storage (GB)",
      "Statutory Mandate",
      "Legal Hold Locked",
      "Last Archived Date",
    ];

    const rows = policies.map((p) => [
      p.policyId,
      `"${p.recordType}"`,
      p.tenantId,
      `"${p.tenantName}"`,
      p.retentionPeriodYears,
      `"${p.archiveStatus}"`,
      `"${p.purgeEligibility}"`,
      p.complianceStatus,
      p.currentStorageGB,
      p.maxAllocatedGB,
      `"${p.statutoryMandate}"`,
      p.isLegalHoldLocked ? "YES" : "NO",
      p.lastArchivedDate,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  public static exportJSON(tenantId?: string): string {
    const policies = this.getPolicies({ tenantId });
    return JSON.stringify(policies, null, 2);
  }
}
