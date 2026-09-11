import { z } from "zod";

export const PrescriptionItemSchema = z.object({
  drugId: z.string(),
  drugName: z.string().min(1, "Drug name is required"),
  dosage: z.string().min(1, "Dosage is required (e.g. 500mg)"),
  frequency: z.enum(["1-0-1", "1-0-0", "0-0-1", "1-1-1", "QID", "PRN"]),
  durationDays: z.number().min(1).max(180),
  instructions: z.string().optional(),
});

export type PrescriptionItem = z.infer<typeof PrescriptionItemSchema>;

export const EncounterSchema = z.object({
  encounterId: z.string(),
  patientUhid: z.string(),
  chiefComplaints: z.string().min(3, "Chief complaints required"),
  subjectiveNotes: z.string(),
  objectiveNotes: z.string(),
  assessmentNotes: z.string(),
  planNotes: z.string(),
  icd10Diagnoses: z.array(z.string()).min(1, "At least 1 ICD-10 diagnosis required"),
  prescriptions: z.array(PrescriptionItemSchema),
  signedAt: z.string().nullable(),
  isAiSuggested: z.boolean(),
});

export type EncounterInput = z.infer<typeof EncounterSchema>;
