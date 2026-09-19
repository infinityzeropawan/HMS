export type PermissionCategory =
  | "Clinical OPD"
  | "Inpatient Care (IPD)"
  | "Operation Theatre (OT)"
  | "Pharmacy & Dispensing"
  | "Pathology & Diagnostics"
  | "Billing & Financials"
  | "Integrations & ABDM"
  | "System Administration";

export interface PermissionClaim {
  id: string; // e.g. "opd:encounter:write"
  name: string;
  description: string;
  category: PermissionCategory;
  requiredFeatureId?: string; // e.g. "FEAT-CLIN-OPD"
}

export type RoleScopeType =
  | "Tenant Wide"
  | "Branch Network"
  | "Department Scoped"
  | "Ward Scoped"
  | "Care Team Assigned Only";

export interface RoleScopeRule {
  scopeType: RoleScopeType;
  allowedDepartments: string[]; // e.g. ["Cardiology", "ICU"] or ["ALL"]
  requiresOnDutyRoster: boolean; // Must be checked-in on shift roster
  allowEmergencyBreakGlass: boolean; // Allows emergency clinical override
}

export interface RoleDefinition {
  id: string; // e.g. "TMPL-DOC", "CUST-TNT-9014-SR-DOC"
  name: string;
  description: string;
  category: "Clinical" | "Nursing" | "Front Desk" | "Billing" | "Diagnostics" | "Pharmacy" | "Governance";
  isGlobalTemplate: boolean;
  parentTemplateId: string | null;
  tenantId: string; // "GLOBAL" for templates, or Tenant ID e.g. "TNT-9014"
  permissions: string[]; // Array of permission claim IDs
  scopeRules: RoleScopeRule;
  status: "Active" | "Disabled";
  updatedAt: string;
  updatedBy: string;
}
