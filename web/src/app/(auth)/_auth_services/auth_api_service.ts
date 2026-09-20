import { AuthLoginInput, AuthMfaInput } from "../_auth_schemas/auth_login_schema";
import { UserSession } from "../_auth_stores/auth_user_store";
import { z } from "zod";

const AuthApiResponseSchema = z.object({
  success: z.boolean(),
  mfaRequired: z.boolean().optional(),
  mfaSessionToken: z.string().optional(),
  token: z.string().optional(),
  user: z
    .object({
      userId: z.string(),
      username: z.string(),
      role: z.enum(["RECEPTIONIST", "RECEPTION", "DOCTOR", "PHARMACIST", "PHARMACY", "LAB_TECH", "LAB", "BILLER", "BILLING", "NURSE", "ADMIN", "HOSPITAL_ADMIN", "SUPER_ADMIN"]),
      tenantId: z.string(),
      hospitalName: z.string(),
    })
    .optional(),
});

const VALID_DEMO_TENANT_IDS = new Set([
  "TENANT-001",
  "TENANT-002",
  "TENANT-003",
  "TNT-9014",
  "TNT-5611",
  "TNT-1042",
  "TNT-2088",
  "TNT-3105",
  "TNT-4412",
]);

export const authApiService = {
  async login(input: AuthLoginInput) {
    // Mocking API call for Phase 1 preview
    await new Promise((resolve) => setTimeout(resolve, 800));

    const demoAccounts = {
      doctor: { password: "doctor123", userId: "DOC-101", username: "Dr. Rajesh Sharma", role: "DOCTOR" as const },
      reception: { password: "rec123", userId: "REC-201", username: "Ananya Iyer", role: "RECEPTIONIST" as const },
      nurse: { password: "nurse123", userId: "NUR-301", username: "Priya Nair", role: "NURSE" as const },
      billing: { password: "bill123", userId: "BIL-401", username: "Rohan Mehta", role: "BILLER" as const },
      admin: { password: "admin123", userId: "ADM-001", username: "System Administrator", role: "ADMIN" as const },
      hospitaladmin: { password: "hospital123", userId: "HAD-001", username: "Hospital Administrator", role: "HOSPITAL_ADMIN" as const },
      superadmin: { password: "super123", userId: "SA-001", username: "Platform SuperAdmin", role: "SUPER_ADMIN" as const },
    };

    const usernameLower = input.username.toLowerCase();
    const account = demoAccounts[usernameLower as keyof typeof demoAccounts];

    if (account && input.password === account.password) {
      // Validate session tenant for hospital-scoped roles
      const isSuperAdmin = account.role === "SUPER_ADMIN";
      const submittedTenantId = (input.tenantId || "").trim().toUpperCase();

      if (!isSuperAdmin) {
        if (!submittedTenantId || !VALID_DEMO_TENANT_IDS.has(submittedTenantId)) {
          throw new Error(`Invalid Hospital / Tenant ID "${input.tenantId}". Please enter a valid registered Tenant ID (e.g., TENANT-001, TNT-9014).`);
        }
      }

      const assignedTenantId = isSuperAdmin
        ? (submittedTenantId || "PLATFORM-SUPER-ADMIN")
        : submittedTenantId;

      const rawData = {
        success: true,
        mfaRequired: false,
        token: `jwt-mock-${account.role.toLowerCase()}-token`,
        user: {
          userId: account.userId,
          username: account.username,
          role: account.role,
          tenantId: assignedTenantId,
          hospitalName: isSuperAdmin ? "Platform SuperAdmin Governance Console" : "Apollo Super Speciality Hospital",
        },
      };
      return AuthApiResponseSchema.parse(rawData);
    }

    if (usernameLower === "mfauser") {
      const submittedTenantId = (input.tenantId || "").trim().toUpperCase();
      if (!submittedTenantId || !VALID_DEMO_TENANT_IDS.has(submittedTenantId)) {
        throw new Error(`Invalid Hospital / Tenant ID "${input.tenantId}". Please enter a valid registered Tenant ID (e.g., TENANT-001, TNT-9014).`);
      }
      const rawData = {
        success: true,
        mfaRequired: true,
        mfaSessionToken: `session-mfa-doctor-789:${submittedTenantId}`,
      };
      return AuthApiResponseSchema.parse(rawData);
    }

    throw new Error("Invalid demo credentials. Open Demo Accounts to choose a valid account.");
  },

  async verifyMfa(input: AuthMfaInput): Promise<UserSession> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Explicitly prevent unauthenticated privilege escalation via MFA to SUPER_ADMIN
    const token = input.mfaSessionToken || "";
    const isNurseToken = token.includes("nurse");
    const parts = token.split(":");
    const tenantId = parts[1] || (token ? "TENANT-001" : "TENANT-DEFAULT");

    return {
      userId: isNurseToken ? "NUR-301" : "DOC-101",
      username: isNurseToken ? "Priya Nair" : "Dr. Rajesh Sharma",
      role: isNurseToken ? "NURSE" : "DOCTOR",
      tenantId: tenantId,
      hospitalName: "Apollo Super Speciality Hospital",
      token: "jwt-mock-verified-token",
    };
  },
};

