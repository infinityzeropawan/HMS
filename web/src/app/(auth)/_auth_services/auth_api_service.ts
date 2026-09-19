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

export const authApiService = {
  async login(input: AuthLoginInput) {
    // Mocking API call for Phase 1 preview
    await new Promise((resolve) => setTimeout(resolve, 800));

    const demoAccounts = {
      doctor: { password: "doctor123", userId: "DOC-101", username: "Dr. Rajesh Sharma", role: "DOCTOR" as const, tenantId: "TNT-9014" },
      reception: { password: "rec123", userId: "REC-201", username: "Ananya Iyer", role: "RECEPTIONIST" as const, tenantId: "TNT-9014" },
      nurse: { password: "nurse123", userId: "NUR-301", username: "Priya Nair", role: "NURSE" as const, tenantId: "TNT-9014" },
      billing: { password: "bill123", userId: "BIL-401", username: "Rohan Mehta", role: "BILLER" as const, tenantId: "TNT-9014" },
      admin: { password: "admin123", userId: "ADM-001", username: "System Administrator", role: "ADMIN" as const, tenantId: "TNT-9014" },
      hospitaladmin: { password: "hospital123", userId: "HAD-001", username: "Hospital Administrator", role: "HOSPITAL_ADMIN" as const, tenantId: "TNT-9014" },
      superadmin: { password: "super123", userId: "SA-001", username: "Platform SuperAdmin", role: "SUPER_ADMIN" as const, tenantId: "PLATFORM" },
    };
    const account = demoAccounts[input.username.toLowerCase() as keyof typeof demoAccounts];

    if (account && input.password === account.password) {
      const normalizedTenantId = input.tenantId.trim().toUpperCase();

      if (account.role === "SUPER_ADMIN") {
        if (normalizedTenantId !== "PLATFORM") {
          throw new Error("Super Admin sign-in requires the PLATFORM tenant scope.");
        }
      } else if (normalizedTenantId !== account.tenantId) {
        throw new Error(`This demo account is scoped to tenant '${account.tenantId}'.`);
      }

      const rawData = {
        success: true,
        mfaRequired: false,
        token: `jwt-mock-${account.role.toLowerCase()}-token`,
        user: {
          userId: account.userId,
          username: account.username,
          role: account.role,
          tenantId: account.tenantId,
          hospitalName: account.role === "SUPER_ADMIN" ? "HMS Platform Console" : "Apollo Super Speciality Hospital",
        },
      };
      return AuthApiResponseSchema.parse(rawData);
    }

    if (input.username === "mfauser") {
      const rawData = {
        success: true,
        mfaRequired: true,
        mfaSessionToken: "session-mfa-xyz-789",
      };
      return AuthApiResponseSchema.parse(rawData);
    }

    throw new Error("Invalid demo credentials. Open Demo Accounts to choose a valid account.");
  },

  async verifyMfa(input: AuthMfaInput): Promise<UserSession> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (input.mfaSessionToken !== "session-mfa-xyz-789") {
      throw new Error("MFA session is invalid or has expired. Please sign in again.");
    }

    return {
      userId: "DOC-101",
      username: "Dr. Rajesh Sharma",
      role: "DOCTOR",
      tenantId: "TNT-9014",
      hospitalName: "Apollo Super Speciality Hospital",
      token: "jwt-mock-verified-token",
    };
  },
};
