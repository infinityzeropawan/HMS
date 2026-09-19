import { ConsentArtifact, ConsentFilterParams, ConsentType, ConsentStatus } from "../_super_admin_types/consent_types";
import { GovernanceEventBus } from "./governance_event_bus";

const INITIAL_CONSENT_ARTIFACTS: ConsentArtifact[] = [
  {
    consentId: "CNS-2026-8801",
    patientId: "PAT-90142",
    patientName: "Rajesh Kumar",
    abhaAddress: "91-4412-8901-2211@pbhx",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    consentType: "ABDM Consent",
    version: "v2.1",
    status: "Active",
    signedDate: "2026-09-10 10:30:15 AM",
    expiryDate: "2027-09-10 10:30:15 AM",
    purpose: "OPD Consultation & Diagnostic EHR Sharing across ABDM Network",
    allowedHIPs: ["Apollo Super Speciality Hospital", "Apollo Central Lab"],
    allowedHIUs: ["Fortis Heart Institute", "Apollo Telehealth Node"],
    digitalSignature: "0x8f4c219a1029b9e01a88",
    timelineEvents: [
      { eventId: "EVT-101", event: "Consent Initialized via ABDM Gateway", timestamp: "2026-09-10 10:28:00 AM", actor: "ABDM Gateway M2" },
      { eventId: "EVT-102", event: "Aadhaar OTP Verified by Patient", timestamp: "2026-09-10 10:29:45 AM", actor: "Rajesh Kumar" },
      { eventId: "EVT-103", event: "Consent Artifact Signed & Cryptographically Encrypted", timestamp: "2026-09-10 10:30:15 AM", actor: "Apollo HSM Signer" },
    ],
  },
  {
    consentId: "CNS-2026-8802",
    patientId: "PAT-10425",
    patientName: "Priya Sharma",
    abhaAddress: "91-1042-3312-9900@pbhx",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    consentType: "Telemedicine Consent",
    version: "v1.4",
    status: "Active",
    signedDate: "2026-09-12 02:15:00 PM",
    expiryDate: "2026-10-12 02:15:00 PM",
    purpose: "Telemedicine Video Consultation Recording & Remote Prescription Sharing",
    allowedHIPs: ["Apollo Telehealth Node"],
    allowedHIUs: ["Dr. Saravanan (Senior Cardiologist)"],
    digitalSignature: "0x3310aefc90124b81029c",
    timelineEvents: [
      { eventId: "EVT-201", event: "Telehealth Session Terms Presented", timestamp: "2026-09-12 02:14:00 PM", actor: "Telehealth Kiosk" },
      { eventId: "EVT-202", event: "Digital Signature Captured", timestamp: "2026-09-12 02:15:00 PM", actor: "Priya Sharma" },
    ],
  },
  {
    consentId: "CNS-2026-8803",
    patientId: "PAT-33109",
    patientName: "Amitabh Verma",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    consentType: "Treatment Consent",
    version: "v3.0",
    status: "Expired",
    signedDate: "2026-08-01 09:00:00 AM",
    expiryDate: "2026-09-01 09:00:00 AM",
    purpose: "Inpatient General Surgery Procedure & Anesthesia Clearance Consent",
    allowedHIPs: ["Apollo OT Suite 4", "Anesthesia Care Team"],
    allowedHIUs: ["Chief Operating Surgeon"],
    digitalSignature: "0x770119bca881023910c2",
    timelineEvents: [
      { eventId: "EVT-301", event: "Pre-Op Surgical Risk Consent Signed", timestamp: "2026-08-01 09:00:00 AM", actor: "Amitabh Verma" },
      { eventId: "EVT-302", event: "Consent Reached 30-Day Expiry Limit", timestamp: "2026-09-01 09:00:00 AM", actor: "System Lifecycle Daemon" },
    ],
  },
  {
    consentId: "CNS-2026-8804",
    patientId: "PAT-44102",
    patientName: "Sunita Patel",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    consentType: "Data Sharing Consent",
    version: "v1.0",
    status: "Revoked",
    signedDate: "2026-09-05 11:45:00 AM",
    expiryDate: "2027-09-05 11:45:00 AM",
    revocationDate: "2026-09-15 04:30:00 PM",
    revokedBy: "Sunita Patel (Patient Request)",
    revocationReason: "TPA Insurance Pre-Auth Claim Settled. Revoking ongoing data access.",
    purpose: "Third-Party TPA Insurance Claim Pre-Auth Electronic Document Sharing",
    allowedHIPs: ["Apollo Billing & TPA Desk"],
    allowedHIUs: ["Star Health Insurance TPA Gateway"],
    digitalSignature: "0x11223344556677889900",
    timelineEvents: [
      { eventId: "EVT-401", event: "TPA Insurance Sharing Consent Signed", timestamp: "2026-09-05 11:45:00 AM", actor: "Sunita Patel" },
      { eventId: "EVT-402", event: "Consent Explicitly Revoked by Patient", timestamp: "2026-09-15 04:30:00 PM", actor: "Sunita Patel" },
    ],
  },
  {
    consentId: "CNS-2026-8805",
    patientId: "PAT-99104",
    patientName: "Kavitha Raman",
    abhaAddress: "91-3105-8812-4400@pbhx",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    consentType: "Research Consent",
    version: "v2.0",
    status: "Pending",
    signedDate: "2026-09-18 10:00:00 AM",
    expiryDate: "2028-09-18 10:00:00 AM",
    purpose: "Anonymized Genomic Research & Clinical Trial Telemetry Data Sharing",
    allowedHIPs: ["Apollo Clinical Research Wing"],
    allowedHIUs: ["Genomic Research Biobank"],
    digitalSignature: "0x440011aebc012948192a",
    timelineEvents: [
      { eventId: "EVT-501", event: "Research Trial Information Sheet Presented", timestamp: "2026-09-18 10:00:00 AM", actor: "Clinical Research Coordinator" },
      { eventId: "EVT-502", event: "Pending Patient Dual-Factor OTP Verification", timestamp: "2026-09-18 10:01:00 AM", actor: "System Daemon" },
    ],
  },
];

const currentConsentStore: ConsentArtifact[] = [...INITIAL_CONSENT_ARTIFACTS];

export class ConsentRegistryService {
  public static getConsents(params?: ConsentFilterParams): ConsentArtifact[] {
    if (!params) return currentConsentStore;

    return currentConsentStore.filter((c) => {
      if (params.tenantId && params.tenantId !== "ALL" && c.tenantId !== params.tenantId) {
        return false;
      }
      if (params.consentType && params.consentType !== "ALL" && c.consentType !== params.consentType) {
        return false;
      }
      if (params.status && params.status !== "ALL" && c.status !== params.status) {
        return false;
      }
      if (params.searchTerm) {
        const term = params.searchTerm.toLowerCase();
        const matchesId = c.consentId.toLowerCase().includes(term);
        const matchesPatientId = c.patientId.toLowerCase().includes(term);
        const matchesPatientName = c.patientName.toLowerCase().includes(term);
        const matchesPurpose = c.purpose.toLowerCase().includes(term);
        if (!matchesId && !matchesPatientId && !matchesPatientName && !matchesPurpose) {
          return false;
        }
      }
      return true;
    });
  }

  public static revokeConsent(consentId: string, reason: string, revokedBy: string): ConsentArtifact {
    const index = currentConsentStore.findIndex((c) => c.consentId === consentId);
    if (index === -1) {
      throw new Error(`Consent ${consentId} not found`);
    }

    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);

    const updated: ConsentArtifact = {
      ...currentConsentStore[index],
      status: "Revoked",
      revocationDate: timestamp,
      revocationReason: reason,
      revokedBy,
      timelineEvents: [
        ...currentConsentStore[index].timelineEvents,
        {
          eventId: `EVT-${Date.now().toString().slice(-4)}`,
          event: "Consent Explicitly Revoked",
          timestamp,
          actor: revokedBy,
        },
      ],
    };

    currentConsentStore[index] = updated;

    GovernanceEventBus.emit({
      eventType: "CONSENT_REVOKED",
      tenantId: updated.tenantId,
      tenantName: updated.tenantId === "TNT-9014" ? "Apollo Super Speciality Hospital" : updated.tenantId,
      actor: revokedBy,
      actorRole: "PATIENT / COMPLIANCE_OFFICER",
      action: `Revoked Consent ${updated.consentId} (${updated.consentType})`,
      details: { consentId: updated.consentId, patientId: updated.patientId, reason },
      riskLevel: "WARNING",
    });

    return updated;
  }

  public static exportCSV(tenantId?: string): string {
    const items = this.getConsents({ tenantId });
    const headers = [
      "Consent ID",
      "Patient ID",
      "Patient Name",
      "ABHA Address",
      "Tenant ID",
      "Consent Type",
      "Version",
      "Status",
      "Signed Date",
      "Expiry Date",
      "Revocation Date",
      "Revocation Reason",
      "Digital Signature",
    ];

    const rows = items.map((c) => [
      c.consentId,
      c.patientId,
      `"${c.patientName}"`,
      `"${c.abhaAddress || "N/A"}"`,
      c.tenantId,
      `"${c.consentType}"`,
      c.version,
      c.status,
      `"${c.signedDate}"`,
      `"${c.expiryDate}"`,
      `"${c.revocationDate || "N/A"}"`,
      `"${(c.revocationReason || "").replace(/"/g, '""')}"`,
      c.digitalSignature,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  public static exportJSON(tenantId?: string): string {
    const items = this.getConsents({ tenantId });
    return JSON.stringify(items, null, 2);
  }
}
