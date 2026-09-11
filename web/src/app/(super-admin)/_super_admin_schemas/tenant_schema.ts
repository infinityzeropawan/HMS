import { z } from "zod";

export const TenantOnboardingSchema = z.object({
  hospitalName: z.string().min(3, "Hospital Name must be at least 3 characters"),
  subdomain: z.string().regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase alphanumeric"),
  adminEmail: z.string().email("Valid admin email is required"),
  gstin: z.string().min(15, "Valid 15-character GSTIN required"),
  licenseTier: z.enum(["BASIC", "ENTERPRISE", "SUPER_SPECIALTY"]),
  maxUserSeats: z.number().min(5).max(1000),
  isMultiBranch: z.boolean(),
});

export type TenantOnboardingInput = z.infer<typeof TenantOnboardingSchema>;
