"use client";

/**
 * Reception (front-desk) clinical triage types.
 * The reception desk is the hospital entry point: it registers the patient, capturers
 * triage vitals and records the OPD vs IPD disposition decision.
 */

/** Triage priority assigned at the reception desk (ESI-style, 4 levels). */
export type TriagePriority = "P1_CRITICAL" | "P2_EMERGENT" | "P3_URGENT" | "P4_STANDARD";

export const TRIAGE_PRIORITY_LABELS: Record<TriagePriority, string> = {
  P1_CRITICAL: "P1 · Red — Immediate (resuscitation)",
  P2_EMERGENT: "P2 · Orange — Emergent (≤ 10 min)",
  P3_URGENT: "P3 · Yellow — Urgent (≤ 30 min)",
  P4_STANDARD: "P4 · Green — Standard OPD queue",
};

export const TRIAGE_PRIORITY_COLORS: Record<TriagePriority, string> = {
  P1_CRITICAL: "red",
  P2_EMERGENT: "volcano",
  P3_URGENT: "gold",
  P4_STANDARD: "green",
};

/** The OPD vs IPD decision taken after triage. */
export type CareDisposition =
  | "PENDING"
  | "OPD"
  | "IPD_ADVISED"
  | "IPD_ADMITTED"
  | "EMERGENCY"
  | "REFERRED";

export const DISPOSITION_LABELS: Record<CareDisposition, string> = {
  PENDING: "Decision Pending",
  OPD: "OPD — Outpatient care",
  IPD_ADVISED: "IPD Advised — admission pending",
  IPD_ADMITTED: "IPD — Admitted as inpatient",
  EMERGENCY: "Emergency — Casualty / resuscitation",
  REFERRED: "Referred to another facility",
};

export const DISPOSITION_COLORS: Record<CareDisposition, string> = {
  PENDING: "default",
  OPD: "blue",
  IPD_ADVISED: "orange",
  IPD_ADMITTED: "purple",
  EMERGENCY: "red",
  REFERRED: "magenta",
};

/** Vitals captured by the reception / triage nurse. */
export interface ReceptionVitals {
  systolicBp?: number;
  diastolicBp?: number;
  pulseRate?: number;
  temperatureF?: number;
  weightKg?: number;
  spo2?: number;
}

/** A single front-desk encounter. One visit per patient per day is the normal case. */
export interface ReceptionVisit {
  id: string;
  uhid: string;
  patientName: string;
  ageGender: string;
  phone: string;
  visitDate: string; // YYYY-MM-DD
  registeredAt: string; // ISO timestamp
  triagePriority: TriagePriority;
  vitals: ReceptionVitals;
  disposition: CareDisposition;
  dispositionNote?: string;
  dispositionAt?: string;
  decidedBy?: string;
  appointmentId?: string;
  tokenNo?: string;
  /** Populated when the visit was converted into an inpatient admission. */
  ipdAdmissionNo?: string;
  ipdBedNumber?: string;
  ipdWard?: string;
}
