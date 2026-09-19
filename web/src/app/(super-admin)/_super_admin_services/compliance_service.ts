import {
  ComplianceSummaryKPIs,
  ConsentRegistryItem,
  DpdpRecord,
  DataRetentionPolicy,
  GovernancePolicyItem,
  ComplianceReportItem,
  BreakGlassLog,
} from "../_super_admin_types/compliance_types";

export class ComplianceService {
  public static getComplianceKPIs(tenantId: string): ComplianceSummaryKPIs {
    if (tenantId === "TNT-3105") {
      return {
        complianceScore: 84.2,
        complianceScoreStatus: "Warning",
        consentCoverage: 88.5,
        consentCoverageStatus: "Warning",
        auditCoverage: 95.0,
        auditCoverageStatus: "Healthy",
        dpdpStatus: "Warning",
        dpdpStatusMessage: "2 pending Data Principal erasure requests awaiting DPO sign-off",
        policyReviewStatus: "Warning",
        policyReviewStatusMessage: "Clinical Data Protection policy due for annual review",
      };
    }

    if (tenantId === "TNT-2088") {
      return {
        complianceScore: 92.8,
        complianceScoreStatus: "Healthy",
        consentCoverage: 96.1,
        consentCoverageStatus: "Healthy",
        auditCoverage: 99.4,
        auditCoverageStatus: "Healthy",
        dpdpStatus: "Healthy",
        dpdpStatusMessage: "All DPDP Data Principal rights requests fulfilled within 72 hrs SLA",
        policyReviewStatus: "Healthy",
        policyReviewStatusMessage: "All 12 governance policies up to date",
      };
    }

    // Default for TNT-9014 (Apollo) and Enterprise tenants
    return {
      complianceScore: 98.6,
      complianceScoreStatus: "Healthy",
      consentCoverage: 99.4,
      consentCoverageStatus: "Healthy",
      auditCoverage: 100.0,
      auditCoverageStatus: "Healthy",
      dpdpStatus: "Healthy",
      dpdpStatusMessage: "Zero pending DPDP violations. Hash-chained audit ledger active.",
      policyReviewStatus: "Healthy",
      policyReviewStatusMessage: "Fully compliant with NABH 5th Ed & DPDP Act 2023",
    };
  }

  public static getConsentRegistry(tenantId: string): ConsentRegistryItem[] {
    return [
      {
        consentId: "ABHA-CNS-8801",
        patientName: "Rajesh Kumar",
        abhaId: "91-4412-8901-2211@pbhx",
        purpose: "OPD Consultation & Diagnostic EHR Sharing",
        grantedAt: "2026-09-10 10:30 AM",
        expiresAt: "2027-09-10 10:30 AM",
        status: "ACTIVE",
        hipName: "Apollo Super Speciality Hospital",
      },
      {
        consentId: "ABHA-CNS-8802",
        patientName: "Priya Sharma",
        abhaId: "91-1042-3312-9900@pbhx",
        purpose: "Telemedicine Video Consultation Artifacts",
        grantedAt: "2026-09-12 02:15 PM",
        expiresAt: "2026-10-12 02:15 PM",
        status: "ACTIVE",
        hipName: "Apollo Telehealth Node",
      },
      {
        consentId: "ABHA-CNS-8803",
        patientName: "Amitabh Verma",
        abhaId: "91-9014-5544-1122@pbhx",
        purpose: "Pathology Lab Report Patient Portal Release",
        grantedAt: "2026-08-01 09:00 AM",
        expiresAt: "2026-09-01 09:00 AM",
        status: "EXPIRED",
        hipName: "Apollo Pathology Central Lab",
      },
      {
        consentId: "ABHA-CNS-8804",
        patientName: "Sunita Patel",
        abhaId: "91-3310-7788-4433@pbhx",
        purpose: "Third-Party TPA Insurance Pre-Auth Package",
        grantedAt: "2026-09-15 11:45 AM",
        expiresAt: "2026-09-20 11:45 AM",
        status: "REVOKED",
        hipName: "Apollo Billing & TPA Desk",
      },
    ];
  }

  public static getDpdpRecords(tenantId: string): DpdpRecord[] {
    return [
      {
        requestId: "DPDP-REQ-4401",
        dataPrincipalName: "Vikram Malhotra",
        requestType: "RIGHT_TO_INFORMATION",
        receivedDate: "2026-09-14",
        dueDate: "2026-09-21",
        status: "FULFILLED",
        assignedDpo: "Adv. Meenakshi Sundaram (DPO)",
      },
      {
        requestId: "DPDP-REQ-4402",
        dataPrincipalName: "Ananya Deshmukh",
        requestType: "RIGHT_TO_ERASURE",
        receivedDate: "2026-09-16",
        dueDate: "2026-09-23",
        status: "IN_PROGRESS",
        assignedDpo: "Adv. Meenakshi Sundaram (DPO)",
      },
      {
        requestId: "DPDP-REQ-4403",
        dataPrincipalName: "Suresh Iyer",
        requestType: "CONSENT_WITHDRAWAL",
        receivedDate: "2026-09-17",
        dueDate: "2026-09-24",
        status: "PENDING_VERIFICATION",
        assignedDpo: "Adv. Meenakshi Sundaram (DPO)",
      },
    ];
  }

  public static getDataRetentionPolicies(tenantId: string): DataRetentionPolicy[] {
    return [
      {
        id: "RET-01",
        dataCategory: "Clinical OPD & IPD Encounter Records",
        retentionPeriodYears: 10,
        statutoryMandate: "MCI / NMC Guidelines 2002 & NABH 5th Ed",
        autoArchiveSchedule: "Daily at 02:00 AM UTC",
        currentStorageGB: 340,
        status: "Healthy",
      },
      {
        id: "RET-02",
        dataCategory: "Hospital Financial Invoices & Tax Receipts",
        retentionPeriodYears: 7,
        statutoryMandate: "Indian GST Act 2017 & Companies Act 2013",
        autoArchiveSchedule: "Weekly on Sunday at 03:00 AM UTC",
        currentStorageGB: 120,
        status: "Healthy",
      },
      {
        id: "RET-03",
        dataCategory: "PACS DICOM Radiology Images & Scans",
        retentionPeriodYears: 5,
        statutoryMandate: "AERB & Radiation Protection Rules",
        autoArchiveSchedule: "Monthly on 1st at 04:00 AM UTC",
        currentStorageGB: 850,
        status: "Healthy",
      },
      {
        id: "RET-04",
        dataCategory: "Audit Logs & DPDP Consent Ledgers",
        retentionPeriodYears: 10,
        statutoryMandate: "DPDP Act 2023 & Cert-In Guidelines",
        autoArchiveSchedule: "Real-time Hash-Chained Write",
        currentStorageGB: 45,
        status: "Healthy",
      },
    ];
  }

  public static getGovernancePolicies(tenantId: string): GovernancePolicyItem[] {
    return [
      {
        policyId: "POL-CLN-01",
        title: "Clinical Emergency Break-Glass Privilege Protocol",
        category: "Clinical Governance",
        version: "v3.2",
        lastReviewedDate: "2026-08-15",
        nextReviewDate: "2027-08-15",
        policyOwner: "Chief Medical Officer (CMO)",
        status: "Healthy",
      },
      {
        policyId: "POL-DPDP-02",
        title: "India DPDP Act 2023 Data Principal Rights & Erasure Workflow",
        category: "Data Privacy & DPDP",
        version: "v2.0",
        lastReviewedDate: "2026-09-01",
        nextReviewDate: "2027-09-01",
        policyOwner: "Data Protection Officer (DPO)",
        status: "Healthy",
      },
      {
        policyId: "POL-SEC-03",
        title: "Multi-Tenant RBAC Scope Boundaries & Shift Roster Guardrails",
        category: "Information Security",
        version: "v4.1",
        lastReviewedDate: "2026-07-10",
        nextReviewDate: "2027-07-10",
        policyOwner: "Chief Information Security Officer (CISO)",
        status: "Healthy",
      },
    ];
  }

  public static getComplianceReports(tenantId: string): ComplianceReportItem[] {
    return [
      {
        reportId: "RPT-NABH-2026-Q3",
        title: "NABH 5th Edition Full Accreditation Audit Package",
        standard: "NABH 5th Edition",
        generatedDate: "2026-09-01",
        score: 99.2,
        status: "Healthy",
        downloadUrl: "#",
      },
      {
        reportId: "RPT-DPDP-2026-09",
        title: "DPDP Act 2023 Monthly Compliance Audit Ledger",
        standard: "DPDP Act 2023",
        generatedDate: "2026-09-15",
        score: 98.4,
        status: "Healthy",
        downloadUrl: "#",
      },
      {
        reportId: "RPT-ABDM-2026-M3",
        title: "ABDM Milestone M1, M2 & M3 Integration Readiness Audit",
        standard: "ABDM M1-M3",
        generatedDate: "2026-09-10",
        score: 100.0,
        status: "Healthy",
        downloadUrl: "#",
      },
    ];
  }

  public static getBreakGlassLogs(tenantId: string): BreakGlassLog[] {
    return [
      {
        eventId: "BG-LOG-9012",
        doctorName: "Dr. Saravanan (Senior Cardiologist)",
        doctorSpecialty: "Cardiology",
        patientName: "Kavitha Raman",
        patientId: "PAT-88102",
        emergencyReason: "Acute Myocardial Infarction in Emergency Room. Patient unconscious without family consent.",
        accessedRecords: ["Past Cardiac History", "ECG Telemetry", "Allergy Chart", "Blood Group"],
        timestamp: "2026-09-18 01:22:10 AM",
        reviewStatus: "APPROVED",
        auditorComments: "Verified ER admission record. Valid clinical break-glass override.",
      },
      {
        eventId: "BG-LOG-9013",
        doctorName: "Dr. Ananya Roy (ICU Attending)",
        doctorSpecialty: "Critical Care",
        patientName: "Mohan Lal",
        patientId: "PAT-77401",
        emergencyReason: "Septic Shock in ICU Ward 4. Immediate medication history override.",
        accessedRecords: ["MAR Medication Log", "Renal Function Tests", "IV Antibiotic Chart"],
        timestamp: "2026-09-18 06:45:30 AM",
        reviewStatus: "PENDING_AUDIT",
      },
    ];
  }
}
