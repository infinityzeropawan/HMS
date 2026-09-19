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

export function getRoleHomePath(role: UserRole): string {
  return roleHomePaths[role];
}
