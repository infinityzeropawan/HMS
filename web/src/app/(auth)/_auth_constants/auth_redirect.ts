import type { UserRole } from "../_auth_stores/auth_user_store";

const roleHomePaths: Record<UserRole, string> = {
  DOCTOR: "/doctor/queue",
  NURSE: "/station",
  RECEPTION: "/dashboard",
  RECEPTIONIST: "/dashboard",
  BILLING: "/invoices",
  BILLER: "/invoices",
  PHARMACY: "/dispense",
  PHARMACIST: "/dispense",
  LAB: "/orders",
  LAB_TECH: "/orders",
  ADMIN: "/users",
  HOSPITAL_ADMIN: "/users",
  SUPER_ADMIN: "/tenants",
};

const superAdminPathPrefixes = [
  "/tenants",
  "/subscription-plans",
  "/feature-flags",
  "/role-templates",
  "/compliance-governance",
  "/global-masters",
  "/platform-audit",
  "/support-tickets",
];

export function getRoleHomePath(role: UserRole): string {
  return roleHomePaths[role];
}

export function getPostLoginPath(role: UserRole, requestedPath?: string | null): string {
  if (!requestedPath || !requestedPath.startsWith("/")) {
    return getRoleHomePath(role);
  }

  // Only preserve a deep link when it belongs to the authenticated role's
  // protected surface. This prevents the login redirect parameter from becoming
  // an open redirect or crossing role boundaries.
  if (
    role === "SUPER_ADMIN" &&
    superAdminPathPrefixes.some((prefix) => requestedPath === prefix || requestedPath.startsWith(`${prefix}/`))
  ) {
    return requestedPath;
  }

  return getRoleHomePath(role);
}
