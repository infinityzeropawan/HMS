import { z } from "zod";

export const AbdmGatewayTransferSchema = z.object({
  consentId: z.string(),
  patientAbhaId: z.string(),
  hipId: z.string(),
  hiuId: z.string(),
  fhirResourceType: z.enum(["DiagnosticReport", "Prescription", "DischargeSummary", "ImmunizationRecord"]),
  transferStatus: z.enum(["REQUESTED", "TRANSFERRED", "FAILED", "REVOKED"]),
  transferredAt: z.string(),
});

export type AbdmGatewayTransferInput = z.infer<typeof AbdmGatewayTransferSchema>;
