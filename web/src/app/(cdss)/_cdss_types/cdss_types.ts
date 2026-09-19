"use client";

export type AlertSeverity = "INFO" | "WARNING" | "HIGH" | "CRITICAL";
export type AlertCategory = "DRUG_DRUG" | "DRUG_ALLERGY" | "SEPSIS_NEWS2" | "LAB_PANIC" | "CONTRAINDICATION" | "FOLLOW_UP";

export interface DrugInteractionRule {
  id: string;
  drugA: string;
  drugB: string;
  severity: AlertSeverity;
  warningDetail: string;
  recommendedAction: string;
}

export interface AllergyCrossReactivityRule {
  id: string;
  allergenKeyword: string;
  contraindicatedDrugCategory: string;
  severity: AlertSeverity;
  warningDetail: string;
  recommendedAction: string;
}

export interface ClinicalAlert {
  id: string;
  uhid: string;
  patientName: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  detail: string;
  recommendedAction: string;
  createdAt: string;
  isAcknowledged?: boolean;
}

export interface News2Input {
  respirationRate?: number; // bpm (normal 12-20)
  spO2?: number; // % (normal >= 96)
  airOrOxygen?: "AIR" | "OXYGEN"; // AIR or OXYGEN
  systolicBp?: number; // mmHg (normal 111-219)
  pulseRate?: number; // bpm (normal 51-90)
  consciousness?: "ALERT" | "CVPU"; // Alert vs Confusion/Voice/Pain/Unresponsive
  temperature?: number; // °C (normal 36.1 - 38.0)
}

export type News2RiskTier = "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK_SEPSIS";

export interface News2Result {
  id: string;
  uhid: string;
  patientName: string;
  bedLocation?: string;
  news2Score: number;
  riskTier: News2RiskTier;
  componentScores: {
    respirationScore: number;
    spO2Score: number;
    oxygenScore: number;
    bpScore: number;
    pulseScore: number;
    consciousnessScore: number;
    tempScore: number;
  };
  recommendation: string;
  calculatedAt: string;
}

export interface OrderSetRecommendation {
  id: string;
  icd10Code: string;
  conditionName: string;
  bundleTitle: string;
  recommendedLabs: string[];
  recommendedRadiology: string[];
  recommendedMedications: string[];
  clinicalRationale: string;
}

export interface CdssOverrideLog {
  id: string;
  alertId: string;
  uhid: string;
  doctorName: string;
  overrideReason: string;
  timestamp: string;
}
