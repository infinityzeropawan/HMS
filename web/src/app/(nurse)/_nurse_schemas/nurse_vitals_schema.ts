import { z } from "zod";

export const NurseVitalsSchema = z.object({
  patientIpdId: z.string(),
  systolicBp: z.number().min(50).max(250),
  diastolicBp: z.number().min(30).max(150),
  pulseRate: z.number().min(30).max(220),
  spo2Percent: z.number().min(50).max(100),
  temperatureF: z.number().min(90).max(110),
  gcsScore: z.number().min(3).max(15).optional(),
  recordedAt: z.string(),
});

export type NurseVitalsInput = z.infer<typeof NurseVitalsSchema>;

export const MarCheckItemSchema = z.object({
  doseId: z.string(),
  medicationName: z.string(),
  dosage: z.string(),
  scheduledTime: z.string(),
  administeredAt: z.string().nullable(),
  status: z.enum(["SCHEDULED", "GIVEN", "MISSED", "REFUSED"]),
  nurseNotes: z.string().optional(),
});

export type MarCheckItem = z.infer<typeof MarCheckItemSchema>;
