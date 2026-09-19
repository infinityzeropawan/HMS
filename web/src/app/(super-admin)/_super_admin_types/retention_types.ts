export type RetentionRecordType =
  | "Audit Logs"
  | "Clinical Records"
  | "Consent Records"
  | "Billing Records"
  | "Laboratory Reports"
  | "Imaging Reports";

export type ArchiveStatus =
  | "Active Storage"
  | "Archived Cold Storage"
  | "Pending Archival";

export type PurgeEligibility =
  | "Not Eligible (Retained)"
  | "Eligible for Legal Archival"
  | "Statutory Override Locked";

export type RetentionComplianceStatus = "Healthy" | "Warning" | "Critical";

export interface RetentionPolicy {
  policyId: string; // e.g. RET-POL-01
  recordType: RetentionRecordType;
  tenantId: string; // e.g. TNT-9014
  tenantName: string;
  retentionPeriodYears: number; // e.g. 10, 7, 5
  archiveStatus: ArchiveStatus;
  purgeEligibility: PurgeEligibility;
  complianceStatus: RetentionComplianceStatus;
  statutoryMandate: string; // e.g. "MCI / NMC Guidelines 2002 & NABH 5th Ed"
  currentStorageGB: number;
  maxAllocatedGB: number;
  approachingThreshold: boolean; // True if >85% capacity or near archive date
  warningMessage?: string;
  autoArchiveSchedule: string;
  lastArchivedDate: string;
  isLegalHoldLocked: boolean; // True if legal hold is enabled
}

export interface RetentionMetrics {
  totalManagedStorageGB: number;
  activePoliciesCount: number;
  approachingThresholdCount: number;
  statutoryComplianceRate: number; // e.g. 99.1%
}

export interface RetentionFilterParams {
  searchTerm?: string;
  tenantId?: string;
  recordType?: RetentionRecordType | "ALL";
  complianceStatus?: RetentionComplianceStatus | "ALL";
}
