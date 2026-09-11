import { z } from "zod";

export const PatientRegSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dob: z.string().min(1, "Date of Birth is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be a valid 10-digit number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  aadhaarNumber: z
    .string()
    .regex(/^XXXX-XXXX-\d{4}$/, "Aadhaar must be formatted as XXXX-XXXX-1234"),
  address: z.string().min(5, "Address is required"),
  emergencyContact: z.string().min(10, "Emergency contact phone is required"),
  // Vitals
  systolicBp: z.number().min(50).max(250).optional(),
  diastolicBp: z.number().min(30).max(150).optional(),
  pulseRate: z.number().min(30).max(220).optional(),
  temperatureF: z.number().min(90).max(110).optional(),
  weightKg: z.number().min(1).max(300).optional(),
  // Insurance
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
});

export type PatientRegInput = z.infer<typeof PatientRegSchema>;
