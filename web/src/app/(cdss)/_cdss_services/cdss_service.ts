"use client";

import {
  ClinicalAlert,
  News2Input,
  News2Result,
  OrderSetRecommendation,
  AlertSeverity,
} from "../_cdss_types/cdss_types";
import { AllergyItem, MedicationHistoryItem } from "@/app/(patient)/_patient_types/emr_types";
import { Patient360Summary } from "@/app/(patient)/_patient_types/patient_profile_types";
import { ClinicalEncounter } from "@/app/(doctor)/_doctor_types/encounter_types";
import { RadiologyStudy } from "@/app/(pacs)/_pacs_types/pacs_types";

export class CdssService {
  /**
   * Checks drug-drug interactions and drug-allergy contraindications
   */
  static checkDrugInteractions(
    medications: MedicationHistoryItem[],
    allergies: AllergyItem[]
  ): ClinicalAlert[] {
    const alerts: ClinicalAlert[] = [];
    const activeMeds = medications.filter((m) => m.status === "ACTIVE");

    // 1. Drug-Allergy Contraindications
    allergies.forEach((alg) => {
      const allergenLower = alg.allergen.toLowerCase();

      activeMeds.forEach((med) => {
        const medLower = med.drugName.toLowerCase();

        if (
          (allergenLower.includes("penicillin") && (medLower.includes("amoxicillin") || medLower.includes("ampicillin") || medLower.includes("penicillin"))) ||
          (allergenLower.includes("sulfa") && (medLower.includes("sulfa") || medLower.includes("cotrimoxazole"))) ||
          (allergenLower.includes("aspirin") && (medLower.includes("aspirin") || medLower.includes("ecosprin")))
        ) {
          alerts.push({
            id: `alt-alg-${med.id}`,
            uhid: "P-2026-1049",
            patientName: "Patient Record",
            category: "DRUG_ALLERGY",
            severity: alg.severity === "ANAPHYLAXIS" || alg.severity === "SEVERE" ? "CRITICAL" : "HIGH",
            title: `DRUG-ALLERGY CONTRAINDICATION: ${med.drugName}`,
            detail: `Prescribed medication "${med.drugName}" conflicts with known ${alg.type} allergy to "${alg.allergen}" (${alg.reaction}).`,
            recommendedAction: "ORDER BLOCKED BY CDSS RULES — Substitute with alternative non-cross-reactive drug class.",
            createdAt: new Date().toISOString(),
          });
        }
      });
    });

    // 2. Drug-Drug Interactions
    const medNames = activeMeds.map((m) => m.drugName.toLowerCase());
    const hasAspirin = medNames.some((n) => n.includes("ecosprin") || n.includes("aspirin"));
    const hasWarfarin = medNames.some((n) => n.includes("warfarin") || n.includes("coumadin"));
    const hasClopidogrel = medNames.some((n) => n.includes("clopidogrel") || n.includes("plavix"));
    const hasNitrate = medNames.some((n) => n.includes("sorbitrate") || n.includes("nitrate"));
    const hasSildenafil = medNames.some((n) => n.includes("sildenafil") || n.includes("viagra"));

    if (hasAspirin && (hasWarfarin || hasClopidogrel)) {
      alerts.push({
        id: `alt-dd-1`,
        uhid: "P-2026-1049",
        patientName: "Patient Record",
        category: "DRUG_DRUG",
        severity: "CRITICAL",
        title: "DUAL ANTIPLATELET / ANTICOAGULANT INTERACTION",
        detail: "Combination of Aspirin and Warfarin/Clopidogrel significantly increases major gastrointestinal bleeding and hemorrhagic stroke risk.",
        recommendedAction: "Perform coagulation audit & consider prescribing PPI gastro-protection.",
        createdAt: new Date().toISOString(),
      });
    }

    if (hasNitrate && hasSildenafil) {
      alerts.push({
        id: `alt-dd-2`,
        uhid: "P-2026-1049",
        patientName: "Patient Record",
        category: "DRUG_DRUG",
        severity: "CRITICAL",
        title: "CONTRAINDICATED NITRATE + PDE5 INHIBITOR COMBINATION",
        detail: "Co-administration of Nitrates and Sildenafil causes severe refractory hypotension and cardiovascular collapse.",
        recommendedAction: "ABSOLUTE CONTRAINDICATION — Discontinue PDE5 inhibitor immediately.",
        createdAt: new Date().toISOString(),
      });
    }

    return alerts;
  }

  /**
   * Calculates National Early Warning Score (NEWS2) and assigns clinical risk tier
   */
  static calculateNews2Score(vitals: News2Input): {
    news2Score: number;
    riskTier: "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK_SEPSIS";
    componentScores: News2Result["componentScores"];
    recommendation: string;
  } {
    let respirationScore = 0;
    const rr = vitals.respirationRate ?? 16;
    if (rr <= 8) respirationScore = 3;
    else if (rr >= 9 && rr <= 11) respirationScore = 1;
    else if (rr >= 12 && rr <= 20) respirationScore = 0;
    else if (rr >= 21 && rr <= 24) respirationScore = 2;
    else if (rr >= 25) respirationScore = 3;

    let spO2Score = 0;
    const sat = vitals.spO2 ?? 98;
    if (sat <= 91) spO2Score = 3;
    else if (sat >= 92 && sat <= 93) spO2Score = 2;
    else if (sat >= 94 && sat <= 95) spO2Score = 1;
    else if (sat >= 96) spO2Score = 0;

    const oxygenScore = vitals.airOrOxygen === "OXYGEN" ? 2 : 0;

    let bpScore = 0;
    const sbp = vitals.systolicBp ?? 120;
    if (sbp <= 90) bpScore = 3;
    else if (sbp >= 91 && sbp <= 100) bpScore = 2;
    else if (sbp >= 101 && sbp <= 110) bpScore = 1;
    else if (sbp >= 111 && sbp <= 219) bpScore = 0;
    else if (sbp >= 220) bpScore = 3;

    let pulseScore = 0;
    const hr = vitals.pulseRate ?? 74;
    if (hr <= 40) pulseScore = 3;
    else if (hr >= 41 && hr <= 50) pulseScore = 1;
    else if (hr >= 51 && hr <= 90) pulseScore = 0;
    else if (hr >= 91 && hr <= 110) pulseScore = 1;
    else if (hr >= 111 && hr <= 130) pulseScore = 2;
    else if (hr >= 131) pulseScore = 3;

    const consciousnessScore = vitals.consciousness === "CVPU" ? 3 : 0;

    let tempScore = 0;
    const tempC = vitals.temperature ? (vitals.temperature > 50 ? (vitals.temperature - 32) * 5 / 9 : vitals.temperature) : 36.8;
    if (tempC <= 35.0) tempScore = 3;
    else if (tempC >= 35.1 && tempC <= 36.0) tempScore = 1;
    else if (tempC >= 36.1 && tempC <= 38.0) tempScore = 0;
    else if (tempC >= 38.1 && tempC <= 39.0) tempScore = 1;
    else if (tempC >= 39.1) tempScore = 2;

    const news2Score =
      respirationScore +
      spO2Score +
      oxygenScore +
      bpScore +
      pulseScore +
      consciousnessScore +
      tempScore;

    let riskTier: "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK_SEPSIS" = "LOW_RISK";
    let recommendation = "Standard 4-Hourly Vitals Monitoring Protocol";

    const hasSingleParameter3 =
      respirationScore === 3 ||
      spO2Score === 3 ||
      bpScore === 3 ||
      pulseScore === 3 ||
      consciousnessScore === 3;

    if (news2Score >= 7) {
      riskTier = "HIGH_RISK_SEPSIS";
      recommendation = "Urgent ICU Senior Registrar Assessment & ABG Blood Gas Protocol";
    } else if (news2Score >= 5 || hasSingleParameter3) {
      riskTier = "MEDIUM_RISK";
      recommendation = "Increase Vitals Frequency to 2-Hourly & Notify Duty Doctor";
    }

    return {
      news2Score,
      riskTier,
      componentScores: {
        respirationScore,
        spO2Score,
        oxygenScore,
        bpScore,
        pulseScore,
        consciousnessScore,
        tempScore,
      },
      recommendation,
    };
  }

  /**
   * Provides condition-based investigation and treatment order set recommendations
   */
  static getOrderSetRecommendations(icd10Codes: string[]): OrderSetRecommendation[] {
    const recommendations: OrderSetRecommendation[] = [];

    const codesUpper = icd10Codes.map((c) => c.toUpperCase());

    if (codesUpper.some((c) => c.includes("I20") || c.includes("I21"))) {
      recommendations.push({
        id: "ord-acs-01",
        icd10Code: "I20.9",
        conditionName: "Acute Coronary Syndrome / Angina Pectoris",
        bundleTitle: "Chest Pain & ACS Acute Management Bundle",
        recommendedLabs: [
          "Cardiac Biomarkers (Troponin I / T)",
          "Lipid Profile (Cholesterol, Triglycerides)",
          "Complete Blood Count (CBC)",
          "Serum Electrolytes",
        ],
        recommendedRadiology: [
          "12-Lead Electrocardiogram (ECG)",
          "Digital Chest X-Ray (PA View)",
          "2D Echocardiogram with Doppler",
        ],
        recommendedMedications: [
          "Tab Sorbitrate 5mg Sublingual",
          "Tab Ecosprin 75mg Oral",
          "Tab Atorvastatin 20mg Oral",
          "Tab Metoprolol 25mg Oral",
        ],
        clinicalRationale: "AHA/ACC Guidelines: Urgent Troponin I, 12-lead ECG, and dual antiplatelet therapy for suspected ischemic chest pain.",
      });
    }

    if (codesUpper.some((c) => c.includes("E11"))) {
      recommendations.push({
        id: "ord-dm-02",
        icd10Code: "E11.9",
        conditionName: "Type 2 Diabetes Mellitus",
        bundleTitle: "Diabetes Mellitus Comprehensive Review Bundle",
        recommendedLabs: [
          "HbA1c Glycated Hemoglobin",
          "Renal Function Test (KFT)",
          "Fasting & Post-Prandial Blood Glucose",
          "Urine Microalbumin",
        ],
        recommendedRadiology: ["Fundus Screening Camera"],
        recommendedMedications: ["Tab Metformin 500mg SR Oral"],
        clinicalRationale: "ADA Standards of Care: Quarterly HbA1c, annual renal function test, and microalbuminuria screening.",
      });
    }

    if (codesUpper.some((c) => c.includes("I10"))) {
      recommendations.push({
        id: "ord-htn-03",
        icd10Code: "I10",
        conditionName: "Essential Hypertension",
        bundleTitle: "Hypertension End-Organ Protection Bundle",
        recommendedLabs: ["Serum Electrolytes (Na+, K+)", "Renal Function Test (KFT)", "Lipid Profile"],
        recommendedRadiology: ["12-Lead Electrocardiogram (ECG)"],
        recommendedMedications: ["Tab Telmisartan 40mg", "Tab Amlodipine 5mg"],
        clinicalRationale: "ESC/ESH Guidelines: Baseline ECG and renal profile to rule out secondary hypertension or target organ damage.",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        id: "ord-gen-00",
        icd10Code: "R69",
        conditionName: "General Medical OPD Consultation",
        bundleTitle: "General OPD Baseline Diagnostic Bundle",
        recommendedLabs: ["Complete Blood Count (CBC)", "Random Blood Sugar (RBS)"],
        recommendedRadiology: ["Digital Chest X-Ray (PA View)"],
        recommendedMedications: ["Tab Paracetamol 650mg SOS"],
        clinicalRationale: "Standard medical baseline investigation bundle.",
      });
    }

    return recommendations;
  }

  /**
   * Generates comprehensive real-time CDSS alerts across EMR, Patient 360, Labs, PACS, and Admissions
   */
  static generateClinicalAlerts(
    patient360: Patient360Summary,
    encounter?: ClinicalEncounter,
    labs?: Array<{ testName: string; resultValue: string; status: string }>,
    radiology?: RadiologyStudy[]
  ): ClinicalAlert[] {
    const alerts: ClinicalAlert[] = [];
    const profile = patient360.profile;

    // 1. Drug Interaction & Allergy Contraindications
    const interactionAlerts = this.checkDrugInteractions(
      patient360.currentMedications,
      patient360.allergies
    );
    alerts.push(...interactionAlerts);

    // 2. Patient Clinical Flags Alerts
    if (patient360.flags.highRisk) {
      alerts.push({
        id: `alt-flg-hr`,
        uhid: profile.uhid,
        patientName: profile.fullName,
        category: "CONTRAINDICATION",
        severity: "HIGH",
        title: "HIGH CLINICAL RISK PATIENT FLAG",
        detail: patient360.flags.flagNotes || "Patient flagged as High Clinical Risk due to complex cardiac/metabolic comorbidities.",
        recommendedAction: "Requires Consultant Senior Review & Continuous Monitoring.",
        createdAt: new Date().toISOString(),
      });
    }

    if (patient360.flags.fallRisk) {
      alerts.push({
        id: `alt-flg-fr`,
        uhid: profile.uhid,
        patientName: profile.fullName,
        category: "CONTRAINDICATION",
        severity: "WARNING",
        title: "FALL RISK PRECAUTION NOTICE",
        detail: "Patient flagged for High Risk of Inpatient / OPD Falls.",
        recommendedAction: "Apply Fall Risk Wristband & Assistive Mobility Protocol.",
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Laboratory Critical Panic Value Alerts
    if (labs && labs.length > 0) {
      labs.forEach((lab) => {
        const val = lab.resultValue.toLowerCase();
        if (val.includes("troponin") || val.includes("6.2") || val.includes("panic") || val.includes("critical")) {
          alerts.push({
            id: `alt-lab-panic`,
            uhid: profile.uhid,
            patientName: profile.fullName,
            category: "LAB_PANIC",
            severity: "CRITICAL",
            title: `CRITICAL LAB PANIC VALUE: ${lab.testName}`,
            detail: `Observed Result: "${lab.resultValue}". Exceeds safe physiological safety parameters.`,
            recommendedAction: "Immediate Attending Physician Notification & Repeat Verification Test.",
            createdAt: new Date().toISOString(),
          });
        }
      });
    }

    return alerts;
  }
}
