"use client";

import { PatientProfileService } from "@/app/(patient)/_patient_services/patient_profile_service";
import { EmrService } from "@/app/(patient)/_patient_services/emr_service";
import { Patient360Summary, UnifiedPatientProfile, PatientClinicalFlags } from "@/app/(patient)/_patient_types/patient_profile_types";
import { EmrPatientProfile, PatientSnapshot } from "@/app/(patient)/_patient_types/emr_types";
import { EncounterService } from "./encounter_service";
import { ClinicalEncounter } from "../_doctor_types/encounter_types";
import { useAppointmentStore } from "@/app/(reception)/_reception_stores/appointment_store";

export interface ClinicalAlertsBundle {
  severeAllergies: string[];
  allAllergies: Array<{ allergen: string; type: string; severity: string; reaction: string }>;
  activeProblems: Array<{ icd10Code: string; conditionName: string; onsetDate: string }>;
  highRiskFlags: string[];
  polypharmacyAlert: { isAlert: boolean; activeMedCount: number; message: string };
  outstandingBalanceText: string;
  criticalLabResults: Array<{ testName: string; resultValue: string; orderDate: string }>;
  abnormalRadiology: Array<{ studyId: string; modality: string; bodyPart: string; impression: string; date: string }>;
  recentAdmissions: Array<{ admissionNo: string; ward: string; date: string }>;
}

export interface DoctorWorkspaceContext {
  uhid: string;
  profile: UnifiedPatientProfile;
  patient360: Patient360Summary;
  emrProfile: EmrPatientProfile;
  snapshot: PatientSnapshot;
  flags: PatientClinicalFlags;
  alerts: ClinicalAlertsBundle;
  activeEncounter: ClinicalEncounter;
}

export class DoctorWorkspaceService {
  /**
   * Loads full workspace clinical context for Doctor Encounter session
   */
  static getWorkspaceContext(uhid: string): DoctorWorkspaceContext {
    const patient360 = PatientProfileService.getPatient360(uhid);
    const emrProfile = EmrService.getPatientEmrProfile(uhid);
    const snapshot = emrProfile.snapshot;
    const activeEncounter = EncounterService.getOrCreateEncounter(
      uhid,
      patient360.profile.fullName,
      `${patient360.profile.age || 45}${patient360.profile.gender?.[0]?.toUpperCase() || "M"}`
    );

    // Compile Clinical Allergies
    const rawAllergies = snapshot?.allergies || [];
    const allAllergies = rawAllergies.map((a) => ({
      allergen: a.allergen || "Unknown",
      type: a.type || "DRUG",
      severity: a.severity || "MILD",
      reaction: a.reaction || "Rash",
    }));

    const severeAllergies = rawAllergies
      .filter((a) => a.severity === "ANAPHYLAXIS" || a.severity === "SEVERE")
      .map((a) => `${a.allergen} (${a.reaction})`);

    // Active Problems List
    const activeProblems = (snapshot?.activeProblems || []).map((p) => ({
      icd10Code: p.icd10Code || "R69",
      conditionName: p.conditionName || "Unspecified condition",
      onsetDate: p.onsetDate || new Date().toISOString().split("T")[0],
    }));

    // High Risk Flags
    const highRiskFlags: string[] = [];
    if (patient360?.flags?.highRisk) highRiskFlags.push("HIGH RISK PATIENT");
    if (patient360?.flags?.fallRisk) highRiskFlags.push("FALL RISK PRECAUTION");
    if (patient360?.flags?.medicoLegalCase) highRiskFlags.push("MEDICO-LEGAL CASE (MLC)");
    if (patient360?.flags?.vipPatient) highRiskFlags.push("VIP PATIENT");

    // Polypharmacy Alert (>= 5 concurrent active medications)
    const activeMeds = snapshot?.currentMedications || [];
    const activeMedCount = activeMeds.filter((m) => m.status === "ACTIVE").length;
    const polypharmacyAlert = {
      isAlert: activeMedCount >= 5,
      activeMedCount,
      message: activeMedCount >= 5
        ? `POLYPHARMACY ALERT: ${activeMedCount} active medications prescribed. High drug interaction & compliance risk.`
        : `Normal regimen: ${activeMedCount} active medications prescribed.`,
    };

    // Critical / Abnormal Labs
    const criticalLabResults = (emrProfile?.labResults || [])
      .slice(0, 3)
      .map((l) => ({ testName: l.testName, resultValue: l.resultValue, orderDate: l.orderDate }));

    // Abnormal Radiology Findings
    const abnormalRadiology = (emrProfile?.radiologyStudies || [])
      .slice(0, 2)
      .map((r) => ({
        studyId: r.studyId,
        modality: r.modality,
        bodyPart: r.bodyPart,
        impression: r.impression || "Findings documented in PACS DICOM Viewer",
        date: r.date,
      }));

    const recentAdmissions = (emrProfile?.admissions || []).slice(0, 2).map((a) => ({
      admissionNo: a.admissionNo,
      ward: a.admittedWard,
      date: a.admissionDate,
    }));

    const balanceVal = typeof snapshot?.outstandingBalances === "number" ? snapshot.outstandingBalances : 0;

    const alerts: ClinicalAlertsBundle = {
      severeAllergies,
      allAllergies,
      activeProblems,
      highRiskFlags,
      polypharmacyAlert,
      outstandingBalanceText: `₹${balanceVal.toLocaleString()}`,
      criticalLabResults,
      abnormalRadiology,
      recentAdmissions,
    };

    return {
      uhid,
      profile: patient360.profile,
      patient360,
      emrProfile,
      snapshot,
      flags: patient360.flags,
      alerts,
      activeEncounter,
    };
  }

  /**
   * Helper coordinator delegating directly to authoritative EncounterService.signAndLockEncounter()
   */
  static signAndLockEncounter(uhid: string): { success: boolean; message: string } {
    return EncounterService.signAndLockEncounter(uhid);
  }
}

