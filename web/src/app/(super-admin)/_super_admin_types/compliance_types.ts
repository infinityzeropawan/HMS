export type ComplianceHealthStatus = "Healthy" | "Warning" | "Critical";

export interface ComplianceSummaryKPIs {
  complianceScore: number; // e.g. 98.4 %
  complianceScoreStatus: ComplianceHealthStatus;
  consentCoverage: number; // e.g. 99.2 %
  consentCoverageStatus: ComplianceHealthStatus;
  auditCoverage: number; // e.g. 100.0 %
  auditCoverageStatus: ComplianceHealthStatus;
  dpdpStatus: ComplianceHealthStatus;
  dpdpStatusMessage: string;
  policyReviewStatus: ComplianceHealthStatus;
  policyReviewStatusMessage: string;
}

export interface ConsentRegistryItem {
  consentId: string; // e.g. ABHA-CNS-8801
  patientName: string;
  abhaId: string;
  purpose: string; // e.g. "Teleconsultation Record Sharing", "Pathology Lab Access"
  grantedAt: string;
  expiresAt: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  hipName: string; // Health Information Provider
}

export interface DpdpRecord {
  requestId: string; // e.g. DPDP-REQ-4401
  dataPrincipalName: string; // Patient / Staff name
  requestType: "RIGHT_TO_INFORMATION" | "RIGHT_TO_ERASURE" | "RIGHT_TO_CORRECTION" | "CONSENT_WITHDRAWAL";
  receivedDate: string;
  dueDate: string;
  status: "PENDING_VERIFICATION" | "IN_PROGRESS" | "FULFILLED" | "REJECTED";
  assignedDpo: string; // Data Protection Officer name
}

export interface DataRetentionPolicy {
  id: string;
  dataCategory: string; // e.g. "Clinical Encounter Records", "Billing & Invoices", "DICOM Medical Images", "System Audit Logs"
  retentionPeriodYears: number;
  statutoryMandate: string; // e.g. "MCI / NMC Guidelines 2002", "GST Act 2017", "NABH 5th Ed Standard"
  autoArchiveSchedule: string; // e.g. "Daily at 02:00 AM UTC"
  currentStorageGB: number;
  status: ComplianceHealthStatus;
}

export interface GovernancePolicyItem {
  policyId: string; // e.g. POL-CLN-01
  title: string;
  category: "Clinical Governance" | "Data Privacy & DPDP" | "Information Security" | "Patient Rights";
  version: string;
  lastReviewedDate: string;
  nextReviewDate: string;
  policyOwner: string;
  status: ComplianceHealthStatus;
}

export interface ComplianceReportItem {
  reportId: string; // e.g. RPT-NABH-2026-Q3
  title: string;
  standard: "NABH 5th Edition" | "NABL ISO 15189" | "ABDM M1-M3" | "DPDP Act 2023";
  generatedDate: string;
  score: number;
  status: ComplianceHealthStatus;
  downloadUrl: string;
}

export interface BreakGlassLog {
  eventId: string; // e.g. BG-LOG-9012
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  patientId: string;
  emergencyReason: string;
  accessedRecords: string[];
  timestamp: string;
  reviewStatus: "PENDING_AUDIT" | "APPROVED" | "FLAGGED_FOR_REVIEW";
  auditorComments?: string;
}
