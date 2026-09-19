"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RbacAuditEntry, RbacEventType, RbacAuditFilterParams } from "../_super_admin_types/rbac_audit_types";

interface RbacAuditStoreState {
  logs: RbacAuditEntry[];

  // Immutable append-only action
  logEvent: (
    entry: Omit<RbacAuditEntry, "eventId" | "timestamp" | "hashSignature">
  ) => RbacAuditEntry;

  // Query & Export methods
  getFilteredLogs: (params?: RbacAuditFilterParams) => RbacAuditEntry[];
  exportToCSV: (tenantId?: string) => string;
  exportToJSON: (tenantId?: string) => string;
}

// Generate simple hash signature for immutable verification simulation
function generateHashSignature(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "0x" + Math.abs(hash).toString(16).padStart(8, "0") + "a9f4c2b1";
}

const INITIAL_RBAC_AUDIT_LOGS: RbacAuditEntry[] = [
  {
    eventId: "RBAC-AUD-9901",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    actor: "SuperAdmin Pawan",
    actorRole: "SUPER_ADMIN",
    targetRoleId: "CUST-TNT-9014-CARDIO-SPEC",
    targetRoleName: "Apollo Senior Cardiologist",
    eventType: "ROLE_CREATED",
    previousValue: "None (New Custom Role)",
    newValue: {
      name: "Apollo Senior Cardiologist",
      category: "Clinical",
      parentTemplateId: "TMPL-SR-DOC",
      permissionsCount: 13,
      scopeType: "Department Scoped",
    },
    timestamp: "2026-09-17 11:20:15 AM",
    reason: "Onboarding new Cardiology department head and attending surgical team.",
    hashSignature: "0x7f4b12a9a9f4c2b1",
  },
  {
    eventId: "RBAC-AUD-9902",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    actor: "Dr. K. Prathap C. Reddy",
    actorRole: "HOSPITAL_ADMIN",
    targetRoleId: "CUST-TNT-9014-CARDIO-SPEC",
    targetRoleName: "Apollo Senior Cardiologist",
    eventType: "PERMISSION_ADDED",
    previousValue: ["opd:queue:read", "opd:encounter:read", "opd:encounter:write"],
    newValue: ["opd:queue:read", "opd:encounter:read", "opd:encounter:write", "abdm:gateway:push"],
    timestamp: "2026-09-17 02:45:00 PM",
    reason: "Granted ABDM Health Record Gateway Push claim for digital health record compliance.",
    hashSignature: "0x3e11a87da9f4c2b1",
  },
  {
    eventId: "RBAC-AUD-9903",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    actor: "SuperAdmin Pawan",
    actorRole: "SUPER_ADMIN",
    targetUser: "dr.saravanan@apollo.hms.com",
    targetRoleId: "CUST-TNT-9014-CARDIO-SPEC",
    targetRoleName: "Apollo Senior Cardiologist",
    eventType: "USER_ROLE_ASSIGNED",
    previousValue: "Role: Doctor (TMPL-DOC)",
    newValue: "Role: Apollo Senior Cardiologist (CUST-TNT-9014-CARDIO-SPEC)",
    timestamp: "2026-09-17 04:10:30 PM",
    reason: "Promoted Dr. Saravanan to Senior Attending Cardiologist with cath lab access.",
    hashSignature: "0x98124efaa9f4c2b1",
  },
  {
    eventId: "RBAC-AUD-9904",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    actor: "Apollo Security Auditor",
    actorRole: "COMPLIANCE_OFFICER",
    targetRoleId: "CUST-TNT-9014-CARDIO-SPEC",
    targetRoleName: "Apollo Senior Cardiologist",
    eventType: "SCOPE_CHANGED",
    previousValue: { scopeType: "Tenant Wide", requiresOnDutyRoster: false },
    newValue: { scopeType: "Department Scoped", allowedDepartments: ["Cardiology", "CCU"], requiresOnDutyRoster: true },
    timestamp: "2026-09-18 09:15:22 AM",
    reason: "Enforced NABH compliance department boundary and shift roster requirement.",
    hashSignature: "0x550114bca9f4c2b1",
  },
  {
    eventId: "RBAC-AUD-9905",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    actor: "System License Manager",
    actorRole: "SYSTEM",
    targetRoleId: "CUST-TNT-9014-CARDIO-SPEC",
    targetRoleName: "Apollo Senior Cardiologist",
    eventType: "FEATURE_PERMISSION_CHANGED",
    previousValue: "Feature: Telemedicine (FEAT-CLIN-06) Enabled",
    newValue: "Feature: Telemedicine (FEAT-CLIN-06) Disabled / Optional Add-on",
    timestamp: "2026-09-18 10:00:00 AM",
    reason: "Telemedicine add-on expired for tenant TNT-9014. Related permission claim opd:telehealth:consult masked.",
    hashSignature: "0xaa441901a9f4c2b1",
  },
];

export const useRbacAuditStore = create<RbacAuditStoreState>()(
  persist(
    (set, get) => ({
      logs: INITIAL_RBAC_AUDIT_LOGS,

      logEvent: (entryData) => {
        const nextIdNumber = get().logs.length + 9901 + 1;
        const eventId = `RBAC-AUD-${nextIdNumber}`;
        const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);

        const payloadString = JSON.stringify({
          eventId,
          tenantId: entryData.tenantId,
          eventType: entryData.eventType,
          actor: entryData.actor,
          timestamp,
          newValue: entryData.newValue,
        });

        const hashSignature = generateHashSignature(payloadString);

        const newEntry: RbacAuditEntry = {
          ...entryData,
          eventId,
          timestamp,
          hashSignature,
        };

        set((state) => ({
          logs: [newEntry, ...state.logs],
        }));

        return newEntry;
      },

      getFilteredLogs: (params) => {
        const logs = get().logs;
        if (!params) return logs;

        return logs.filter((log) => {
          if (params.tenantId && params.tenantId !== "ALL" && log.tenantId !== params.tenantId) {
            return false;
          }
          if (params.eventType && params.eventType !== "ALL" && log.eventType !== params.eventType) {
            return false;
          }
          if (params.actor && !log.actor.toLowerCase().includes(params.actor.toLowerCase())) {
            return false;
          }
          if (params.searchTerm) {
            const term = params.searchTerm.toLowerCase();
            const matchesId = log.eventId.toLowerCase().includes(term);
            const matchesActor = log.actor.toLowerCase().includes(term);
            const matchesTargetRole = (log.targetRoleName || "").toLowerCase().includes(term);
            const matchesReason = log.reason.toLowerCase().includes(term);
            if (!matchesId && !matchesActor && !matchesTargetRole && !matchesReason) {
              return false;
            }
          }
          return true;
        });
      },

      exportToCSV: (tenantId) => {
        const logs = tenantId && tenantId !== "ALL"
          ? get().logs.filter((l) => l.tenantId === tenantId)
          : get().logs;

        const headers = [
          "Event ID",
          "Timestamp",
          "Tenant ID",
          "Tenant Name",
          "Actor",
          "Actor Role",
          "Event Type",
          "Target Role",
          "Target User",
          "Reason",
          "Hash Signature",
        ];

        const rows = logs.map((l) => [
          l.eventId,
          `"${l.timestamp}"`,
          l.tenantId,
          `"${l.tenantName}"`,
          `"${l.actor}"`,
          l.actorRole,
          l.eventType,
          `"${l.targetRoleName || l.targetRoleId || "N/A"}"`,
          `"${l.targetUser || "N/A"}"`,
          `"${l.reason.replace(/"/g, '""')}"`,
          l.hashSignature,
        ]);

        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      },

      exportToJSON: (tenantId) => {
        const logs = tenantId && tenantId !== "ALL"
          ? get().logs.filter((l) => l.tenantId === tenantId)
          : get().logs;
        return JSON.stringify(logs, null, 2);
      },
    }),
    {
      name: "hms_rbac_audit_ledger",
    }
  )
);
