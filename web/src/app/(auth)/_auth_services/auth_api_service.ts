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
      doctor: { password: "doctor123", userId: "DOC-101", username: "Dr. Rajesh Sharma", role: "DOCTOR" as const },
      reception: { password: "rec123", userId: "REC-201", username: "Ananya Iyer", role: "RECEPTIONIST" as const },
      nurse: { password: "nurse123", userId: "NUR-301", username: "Priya Nair", role: "NURSE" as const },
      billing: { password: "bill123", userId: "BIL-401", username: "Rohan Mehta", role: "BILLER" as const },
      admin: { password: "admin123", userId: "ADM-001", username: "System Administrator", role: "ADMIN" as const },
      hospitaladmin: { password: "hospital123", userId: "HAD-001", username: "Hospital Administrator", role: "HOSPITAL_ADMIN" as const },
      superadmin: { password: "super123", userId: "SA-001", username: "Platform SuperAdmin", role: "SUPER_ADMIN" as const },
    };
    const account = demoAccounts[input.username.toLowerCase() as keyof typeof demoAccounts];

    if (account && input.password === account.password) {
      const rawData = {
        success: true,
        mfaRequired: false,
        token: `jwt-mock-${account.role.toLowerCase()}-token`,
        user: {
          userId: account.userId,
          username: account.username,
          role: account.role,
          tenantId: input.tenantId,
          hospitalName: "Apollo Super Speciality Hospital",
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
    return {
      userId: "DOC-101",
      username: "Dr. Rajesh Sharma",
      role: "DOCTOR",
      tenantId: input.mfaSessionToken ? "TENANT-001" : "TENANT-DEFAULT",
      hospitalName: "Apollo Super Speciality Hospital",
      token: "jwt-mock-verified-token",
    };
  },
};
