import { AuditCategory } from "../_super_admin_types/tenant_management";

export type ExtendedAuditCategory =
  | AuditCategory
  | "TENANT_ONBOARDING"
  | "SUBSCRIPTION_CHANGE"
  | "FACILITY_TOGGLE"
  | "FEATURE_FLAG"
  | "RBAC_ROLES";

export interface PlatformAuditEvent {
  key: string;
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  category: ExtendedAuditCategory;
  entity: string;
  ipAddress: string;
  riskLevel: "INFO" | "WARNING" | "CRITICAL";
  details: string;
}

const INITIAL_PLATFORM_AUDIT_LOGS: PlatformAuditEvent[] = [
  {
    key: "aud-001",
    id: "AUD-8801",
    timestamp: "2026-09-17 10:45:12 AM",
    actor: "Pawan SuperAdmin",
    actorRole: "SUPER_ADMIN",
    action: "Updated tenant subscription tier to ENTERPRISE",
    category: "SUBSCRIPTION_LIFECYCLE",
    entity: "Apollo Super Speciality Hospital (TNT-9014)",
    ipAddress: "103.44.120.14",
    riskLevel: "INFO",
    details: '{"previousPlan": "PRO", "newPlan": "ENTERPRISE", "seats": 500, "updatedBy": "superadmin_01"}',
  },
  {
    key: "aud-002",
    id: "AUD-8802",
    timestamp: "2026-09-17 09:30:44 AM",
    actor: "System Auto-Provisioner",
    actorRole: "SYSTEM",
    action: "Onboarded new hospital tenant & provisioned database schema",
    category: "TENANT_ONBOARDING",
    entity: "Fortis Care Heart Institute (TNT-8821)",
    ipAddress: "10.0.4.12",
    riskLevel: "INFO",
    details: '{"subdomain": "fortis", "dbInstance": "db-prod-fortis-02", "status": "PROVISIONED"}',
  },
  {
    key: "aud-003",
    id: "AUD-8803",
    timestamp: "2026-09-16 04:15:20 PM",
    actor: "Dr. Rajesh Sharma",
    actorRole: "HOSPITAL_ADMIN",
    action: "Activated Emergency Break-Glass Access for ICU Patient P-9082",
    category: "BREAK_GLASS_ACCESS",
    entity: "Apollo Super Speciality Hospital (TNT-9014)",
    ipAddress: "103.44.120.45",
    riskLevel: "CRITICAL",
    details: '{"reason": "Acute cardiac failure emergency in ICU Ward 4", "approvedBy": "EMERGENCY_OVERRIDE_KEY"}',
  },
  {
    key: "aud-004",
    id: "AUD-8804",
    timestamp: "2026-09-16 02:22:10 PM",
    actor: "Pawan SuperAdmin",
    actorRole: "SUPER_ADMIN",
    action: "Modified Role Permissions for Custom Role 'Head Nurse'",
    category: "ROLE_PERMISSION_CHANGE",
    entity: "Global Master / Multi-Tenant",
    ipAddress: "103.44.120.14",
    riskLevel: "WARNING",
    details: '{"roleId": "ROLE-HN-01", "addedPermissions": ["pharmacy:dispense", "vitals:override"]}',
  },
  {
    key: "aud-005",
    id: "AUD-8805",
    timestamp: "2026-09-16 11:10:00 AM",
    actor: "Patient Portal API",
    actorRole: "PATIENT",
    action: "Revoked ABDM Data Sharing Consent (CNS-7702)",
    category: "CONSENT_EVENT",
    entity: "Apollo Super Speciality Hospital (TNT-9014)",
    ipAddress: "49.207.18.99",
    riskLevel: "WARNING",
    details: '{"consentId": "CNS-7702", "revocationReason": "Patient requested complete opt-out from research"}',
  },
  {
    key: "aud-006",
    id: "AUD-8806",
    timestamp: "2026-09-15 05:40:18 PM",
    actor: "DPDP Officer",
    actorRole: "COMPLIANCE_OFFICER",
    action: "Completed Data Export Request DPO-9002 for Principal P-4412",
    category: "DPDP_REQUEST",
    entity: "Fortis Care Heart Institute (TNT-8821)",
    ipAddress: "103.44.120.88",
    riskLevel: "INFO",
    details: '{"requestId": "DPO-9002", "exportFormat": "ENCRYPTED_ZIP", "recordsExported": 142}',
  },
  {
    key: "aud-007",
    id: "AUD-8807",
    timestamp: "2026-09-15 03:00:00 PM",
    actor: "Retention Engine",
    actorRole: "SYSTEM",
    action: "Updated Retention Policy RET-LAB-01 (Laboratory Reports)",
    category: "RETENTION_POLICY_CHANGE",
    entity: "Global Master",
    ipAddress: "127.0.0.1",
    riskLevel: "INFO",
    details: '{"policyId": "RET-LAB-01", "newRetentionYears": 7, "archiveStrategy": "COLD_S3"}',
  },
  {
    key: "aud-008",
    id: "AUD-8808",
    timestamp: "2026-09-14 09:12:05 AM",
    actor: "SuperAdmin Pawan",
    actorRole: "SUPER_ADMIN",
    action: "Updated White-Label Branding Domain & Custom CSS",
    category: "WHITE_LABEL_CHANGE",
    entity: "Manipal Specialty Hospital (TNT-4401)",
    ipAddress: "103.44.120.14",
    riskLevel: "INFO",
    details: '{"subdomain": "manipal.hms-cloud.com", "customFavicon": "updated", "supportEmail": "help@manipal.org"}',
  },
  {
    key: "aud-009",
    id: "AUD-8809",
    timestamp: "2026-09-13 01:50:33 PM",
    actor: "SuperAdmin Pawan",
    actorRole: "SUPER_ADMIN",
    action: "Issued Telemedicine Add-on License for Tenant",
    category: "FEATURE_LICENSE_EVENT",
    entity: "Apollo Super Speciality Hospital (TNT-9014)",
    ipAddress: "103.44.120.14",
    riskLevel: "INFO",
    details: '{"featureKey": "telemedicine", "source": "Add-on", "expiry": "2027-09-13"}',
  },
  {
    key: "aud-010",
    id: "AUD-8810",
    timestamp: "2026-09-12 11:00:00 AM",
    actor: "Compliance Auditor",
    actorRole: "COMPLIANCE_OFFICER",
    action: "Ran Full NABH / ABDM Governance Audit Sweep",
    category: "GOVERNANCE_EVENT",
    entity: "All Active Tenants",
    ipAddress: "103.44.120.14",
    riskLevel: "INFO",
    details: '{"score": 94.2, "status": "HEALTHY", "violationsFound": 0}',
  },
  {
    key: "aud-011",
    id: "AUD-8811",
    timestamp: "2026-09-18 08:00:00 AM",
    actor: "Pawan SuperAdmin",
    actorRole: "SUPER_ADMIN",
    action: "Enabled CDSS AI Feature for Narayana Health City",
    category: "FEATURE_LICENSE_EVENT",
    entity: "Narayana Health City (TNT-4412)",
    ipAddress: "103.44.120.14",
    riskLevel: "INFO",
    details: '{"featureKey": "cdss_ai", "source": "Included By Plan", "tenantPlan": "ENTERPRISE"}',
  },
  {
    key: "aud-012",
    id: "AUD-8812",
    timestamp: "2026-09-18 07:30:00 AM",
    actor: "System Compliance Engine",
    actorRole: "SYSTEM",
    action: "Compliance Score Re-evaluated for Manipal Hospital Whitefield",
    category: "COMPLIANCE_EVENT",
    entity: "Manipal Hospital Whitefield (TNT-3105)",
    ipAddress: "127.0.0.1",
    riskLevel: "WARNING",
    details: '{"previousScore": 92.1, "newScore": 84.2, "reason": "NABH renewal pending verification"}',
  },
  {
    key: "aud-013",
    id: "AUD-8813",
    timestamp: "2026-09-17 06:00:00 PM",
    actor: "Pawan SuperAdmin",
    actorRole: "SUPER_ADMIN",
    action: "Updated Logo and Primary Brand Color for Max Super Speciality",
    category: "BRANDING_CHANGE",
    entity: "Max Super Speciality Hospital (TNT-2088)",
    ipAddress: "103.44.120.14",
    riskLevel: "INFO",
    details: '{"logoUpdated": true, "primaryColor": "#dc2626", "secondaryColor": "#b91c1c"}',
  },
  {
    key: "aud-014",
    id: "AUD-8814",
    timestamp: "2026-09-17 04:10:00 PM",
    actor: "System Auto-Provisioner",
    actorRole: "SYSTEM",
    action: "Provisioned Fortis Heart & Vascular Institute on Enterprise Plan",
    category: "TENANT_ONBOARDING",
    entity: "Fortis Heart & Vascular Institute (TNT-1042)",
    ipAddress: "10.0.4.12",
    riskLevel: "INFO",
    details: '{"subdomain": "fortis-gurugram", "dbInstance": "db-prod-fortis-01", "plan": "ENTERPRISE", "status": "PROVISIONED"}',
  },
  {
    key: "aud-015",
    id: "AUD-8815",
    timestamp: "2026-09-16 09:30:00 AM",
    actor: "Dr. Ananya Roy (ICU Attending)",
    actorRole: "HOSPITAL_ADMIN",
    action: "Emergency Break-Glass Access: Septic Shock Patient MAR Override",
    category: "BREAK_GLASS_ACCESS",
    entity: "Max Super Speciality Hospital (TNT-2088)",
    ipAddress: "49.207.44.12",
    riskLevel: "CRITICAL",
    details: '{"patientId": "PAT-77401", "reason": "Septic Shock ICU Ward 4", "accessedRecords": ["MAR Log", "Renal Tests"]}',
  },
  {
    key: "aud-016",
    id: "AUD-8816",
    timestamp: "2026-09-15 02:00:00 PM",
    actor: "DPDP Compliance Officer",
    actorRole: "COMPLIANCE_OFFICER",
    action: "Processed Data Correction Request for Principal at Narayana Health",
    category: "DPDP_REQUEST",
    entity: "Narayana Health City (TNT-4412)",
    ipAddress: "103.44.120.88",
    riskLevel: "INFO",
    details: '{"requestId": "DPDP-REQ-4404", "requestType": "RIGHT_TO_CORRECTION", "status": "FULFILLED"}',
  },
  {
    key: "aud-017",
    id: "AUD-8817",
    timestamp: "2026-09-14 11:00:00 AM",
    actor: "Pawan SuperAdmin",
    actorRole: "SUPER_ADMIN",
    action: "Configured White-Label Product Name and Subdomain for Fortis",
    category: "WHITE_LABEL_CHANGE",
    entity: "Fortis Heart & Vascular Institute (TNT-1042)",
    ipAddress: "103.44.120.14",
    riskLevel: "INFO",
    details: '{"subdomain": "fortis-gurugram.hms-cloud.com", "productName": "Fortis CarePath EMR"}',
  },
];

let auditLogsStore: PlatformAuditEvent[] = [...INITIAL_PLATFORM_AUDIT_LOGS];
const listeners: (() => void)[] = [];

export class PlatformAuditService {
  public static getAuditLogs(): PlatformAuditEvent[] {
    return [...auditLogsStore];
  }

  public static recordAuditEvent(event: Omit<PlatformAuditEvent, "key" | "id" | "timestamp"> & { timestamp?: string }): PlatformAuditEvent {
    const newId = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLog: PlatformAuditEvent = {
      key: newId,
      id: newId,
      timestamp: event.timestamp || new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: event.actor,
      actorRole: event.actorRole,
      action: event.action,
      category: event.category,
      entity: event.entity,
      ipAddress: event.ipAddress || "127.0.0.1",
      riskLevel: event.riskLevel || "INFO",
      details: typeof event.details === "string" ? event.details : JSON.stringify(event.details),
    };

    auditLogsStore = [newLog, ...auditLogsStore];
    listeners.forEach((l) => l());
    return newLog;
  }

  public static subscribe(listener: () => void): () => void {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }

  public static getStatistics() {
    const total = auditLogsStore.length;
    const critical = auditLogsStore.filter((l) => l.riskLevel === "CRITICAL").length;
    const warning = auditLogsStore.filter((l) => l.riskLevel === "WARNING").length;
    const info = auditLogsStore.filter((l) => l.riskLevel === "INFO").length;

    const categoryBreakdown: Record<string, number> = {};
    auditLogsStore.forEach((l) => {
      categoryBreakdown[l.category] = (categoryBreakdown[l.category] || 0) + 1;
    });

    return { total, critical, warning, info, categoryBreakdown };
  }

  public static searchAuditLogs(params: {
    searchTerm?: string;
    tenantId?: string;
    actor?: string;
    category?: ExtendedAuditCategory | "ALL";
    startDate?: string;
    endDate?: string;
  }): PlatformAuditEvent[] {
    return auditLogsStore.filter((log) => {
      if (params.category && params.category !== "ALL" && log.category !== params.category) {
        return false;
      }
      if (params.tenantId && !log.entity.includes(params.tenantId)) {
        return false;
      }
      if (params.actor && !log.actor.toLowerCase().includes(params.actor.toLowerCase())) {
        return false;
      }
      if (params.searchTerm) {
        const term = params.searchTerm.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(term);
        const matchesEntity = log.entity.toLowerCase().includes(term);
        const matchesActor = log.actor.toLowerCase().includes(term);
        const matchesDetails = log.details.toLowerCase().includes(term);
        const matchesId = log.id.toLowerCase().includes(term);
        if (!matchesAction && !matchesEntity && !matchesActor && !matchesDetails && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }

  public static exportAuditLogsCSV(logs: PlatformAuditEvent[] = auditLogsStore): string {
    const headers = ["Audit ID", "Timestamp", "Actor", "Role", "Action", "Category", "Target Entity", "IP Address", "Risk Level", "Details"];
    const rows = logs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.actor}"`,
      `"${l.actorRole}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      l.category,
      `"${l.entity.replace(/"/g, '""')}"`,
      l.ipAddress,
      l.riskLevel,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
}
