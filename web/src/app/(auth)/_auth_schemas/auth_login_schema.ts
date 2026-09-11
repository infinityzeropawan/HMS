import { z } from "zod";

export const AuthLoginSchema = z.object({
  username: z.string().min(3, "Username or Email must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  tenantId: z.string().min(1, "Hospital / Tenant ID is required"),
});

export type AuthLoginInput = z.infer<typeof AuthLoginSchema>;

export const AuthMfaSchema = z.object({
  otpCode: z.string().length(6, "MFA OTP Code must be exactly 6 digits"),
  mfaSessionToken: z.string().min(1, "MFA session token is missing"),
});

export type AuthMfaInput = z.infer<typeof AuthMfaSchema>;
