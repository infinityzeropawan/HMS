export type RbacEventType =
  | "ROLE_CREATED"
  | "ROLE_UPDATED"
  | "ROLE_DELETED"
  | "PERMISSION_ADDED"
  | "PERMISSION_REMOVED"
  | "USER_ROLE_ASSIGNED"
  | "USER_ROLE_REMOVED"
  | "SCOPE_CHANGED"
  | "FEATURE_PERMISSION_CHANGED";

export interface RbacAuditEntry {
  eventId: string; // e.g. RBAC-AUD-9901
  tenantId: string; // e.g. TNT-9014
  tenantName: string;
  actor: string; // e.g. "SuperAdmin Pawan" or "Dr. K. Prathap C. Reddy"
  actorRole: string; // e.g. "SUPER_ADMIN" or "HOSPITAL_ADMIN"
  targetUser?: string; // Target user email/ID if user-specific assignment
  targetRoleId?: string; // Target role ID e.g. CUST-TNT-9014-CARDIO
  targetRoleName?: string; // Target role name e.g. Apollo Senior Cardiologist
  eventType: RbacEventType;
  previousValue: unknown;
  newValue: unknown;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  reason: string; // Audit justification note
  hashSignature: string; // Cryptographic hash for immutability validation
}

export interface RbacAuditFilterParams {
  searchTerm?: string;
  tenantId?: string;
  eventType?: RbacEventType | "ALL";
  actor?: string;
  startDate?: string;
  endDate?: string;
}
