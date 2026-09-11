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
      role: z.enum(["RECEPTIONIST", "DOCTOR", "PHARMACIST", "LAB_TECH", "BILLER", "ADMIN"]),
      tenantId: z.string(),
      hospitalName: z.string(),
    })
    .optional(),
});

export const authApiService = {
  async login(input: AuthLoginInput) {
    // Mocking API call for Phase 1 preview
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (input.username === "doctor" && input.password === "doctor123") {
      const rawData = {
        success: true,
        mfaRequired: false,
        token: "jwt-mock-doctor-token",
        user: {
          userId: "DOC-101",
          username: "Dr. Rajesh Sharma",
          role: "DOCTOR" as const,
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

    const rawData = {
      success: true,
      mfaRequired: false,
      token: "jwt-mock-staff-token",
      user: {
        userId: "STF-202",
        username: input.username,
        role: "RECEPTIONIST" as const,
        tenantId: input.tenantId,
        hospitalName: "Apollo Super Speciality Hospital",
      },
    };
    return AuthApiResponseSchema.parse(rawData);
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
