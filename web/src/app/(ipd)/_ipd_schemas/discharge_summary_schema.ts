import { z } from "zod";

export const DischargeSummarySchema = z.object({
  ipdNo: z.string(),
  patientUhid: z.string(),
  patientName: z.string(),
  admissionDate: z.string(),
  dischargeDate: z.string(),
  admissionDiagnosis: z.string(),
  finalDiagnoses: z.array(z.string()).min(1, "Final diagnosis is required"),
  hospitalCourseSummary: z.string().min(10, "Hospital course summary required"),
  dischargeCondition: z.enum(["RECOVERED", "IMPROVED", "STABLE", "LAMA", "DECEASED"]),
  adviceOnDischarge: z.string(),
  followUpDate: z.string().optional(),
  signedAt: z.string().nullable(),
});

export type DischargeSummaryInput = z.infer<typeof DischargeSummarySchema>;
