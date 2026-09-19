export type ConsentType =
  | "Treatment Consent"
  | "ABDM Consent"
  | "Telemedicine Consent"
  | "Data Sharing Consent"
  | "Research Consent";

export type ConsentStatus = "Active" | "Expired" | "Revoked" | "Pending";

export interface ConsentTimelineEvent {
  eventId: string;
  event: string; // e.g. "Consent Initialized", "ABHA Gateway OTP Verified", "Signed by Patient", "Revoked by Patient"
  timestamp: string;
  actor: string;
  notes?: string;
}

export interface ConsentArtifact {
  consentId: string; // e.g. CNS-2026-8801
  patientId: string; // e.g. PAT-90142
  patientName: string;
  abhaAddress?: string; // e.g. 91-4412-8901-2211@pbhx
  tenantId: string; // e.g. TNT-9014
  tenantName: string;
  consentType: ConsentType;
  version: string; // e.g. v1.2
  status: ConsentStatus;
  signedDate: string; // YYYY-MM-DD HH:mm:ss
  expiryDate: string; // YYYY-MM-DD HH:mm:ss
  revocationDate?: string; // YYYY-MM-DD HH:mm:ss if revoked
  revokedBy?: string;
  revocationReason?: string;
  purpose: string; // Purpose of access
  allowedHIPs: string[]; // Health Information Providers
  allowedHIUs: string[]; // Health Information Users
  timelineEvents: ConsentTimelineEvent[];
  digitalSignature: string; // SHA-256 PKI hash artifact
}

export interface ConsentFilterParams {
  searchTerm?: string;
  tenantId?: string;
  consentType?: ConsentType | "ALL";
  status?: ConsentStatus | "ALL";
}
