"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ClinicalAlert,
  News2Input,
  News2Result,
  OrderSetRecommendation,
  CdssOverrideLog,
} from "../_cdss_types/cdss_types";
import { CdssService } from "../_cdss_services/cdss_service";

const SEED_NEWS2: Record<string, News2Result[]> = {
  "P-2026-1049": [
    {
      id: "news-101",
      uhid: "P-2026-1049",
      patientName: "Sunil Verma",
      bedLocation: "ICU-01",
      news2Score: 7,
      riskTier: "HIGH_RISK_SEPSIS",
      componentScores: {
        respirationScore: 2,
        spO2Score: 2,
        oxygenScore: 2,
        bpScore: 1,
        pulseScore: 0,
        consciousnessScore: 0,
        tempScore: 0,
      },
      recommendation: "Urgent ICU Senior Registrar Assessment & ABG Blood Gas Protocol",
      calculatedAt: "2026-09-17T10:30:00Z",
    },
  ],
  "P-2026-1052": [
    {
      id: "news-102",
      uhid: "P-2026-1052",
      patientName: "Anjali Gupta",
      bedLocation: "GW-101",
      news2Score: 2,
      riskTier: "LOW_RISK",
      componentScores: {
        respirationScore: 0,
        spO2Score: 0,
        oxygenScore: 0,
        bpScore: 0,
        pulseScore: 1,
        consciousnessScore: 0,
        tempScore: 1,
      },
      recommendation: "Standard 4-Hourly Vitals Monitoring Protocol",
      calculatedAt: "2026-09-17T09:00:00Z",
    },
  ],
  "P-2026-1058": [
    {
      id: "news-103",
      uhid: "P-2026-1058",
      patientName: "Ramesh Kumar",
      bedLocation: "GW-102",
      news2Score: 4,
      riskTier: "MEDIUM_RISK",
      componentScores: {
        respirationScore: 1,
        spO2Score: 1,
        oxygenScore: 0,
        bpScore: 1,
        pulseScore: 1,
        consciousnessScore: 0,
        tempScore: 0,
      },
      recommendation: "Increase Vitals Frequency to 2-Hourly & Notify Duty Doctor",
      calculatedAt: "2026-09-17T11:15:00Z",
    },
  ],
};

interface CdssStoreState {
  activeAlertsByUhid: Record<string, ClinicalAlert[]>;
  news2ScoresByUhid: Record<string, News2Result[]>;
  overrideLogs: CdssOverrideLog[];

  getAlerts: (uhid?: string) => ClinicalAlert[];
  addAlert: (alert: Omit<ClinicalAlert, "id" | "createdAt">) => void;
  getNews2Scores: (uhid?: string) => News2Result[];
  calculateAndStoreNews2: (
    uhid: string,
    patientName: string,
    bedLocation: string,
    vitals: News2Input
  ) => News2Result;
  logOverride: (log: Omit<CdssOverrideLog, "id" | "timestamp">) => void;
  resetToDefaults: () => void;
}

export const useCdssStore = create<CdssStoreState>()(
  persist(
    (set, get) => ({
      activeAlertsByUhid: {},
      news2ScoresByUhid: SEED_NEWS2,
      overrideLogs: [],

      getAlerts: (uhid) => {
        const state = get();
        if (uhid) return state.activeAlertsByUhid[uhid] || [];
        return Object.values(state.activeAlertsByUhid).flat();
      },

      addAlert: (alertData) => {
        const newAlert: ClinicalAlert = {
          ...alertData,
          id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const current = state.activeAlertsByUhid[alertData.uhid] || [];
          return {
            activeAlertsByUhid: {
              ...state.activeAlertsByUhid,
              [alertData.uhid]: [newAlert, ...current],
            },
          };
        });
      },

      getNews2Scores: (uhid) => {
        const state = get();
        if (uhid) return state.news2ScoresByUhid[uhid] || [];
        return Object.values(state.news2ScoresByUhid).flat();
      },

      calculateAndStoreNews2: (uhid, patientName, bedLocation, vitals) => {
        const calculated = CdssService.calculateNews2Score(vitals);
        const result: News2Result = {
          id: `news-${Date.now()}`,
          uhid,
          patientName,
          bedLocation,
          ...calculated,
          calculatedAt: new Date().toISOString(),
        };

        set((state) => {
          const current = state.news2ScoresByUhid[uhid] || [];
          return {
            news2ScoresByUhid: {
              ...state.news2ScoresByUhid,
              [uhid]: [result, ...current],
            },
          };
        });

        return result;
      },

      logOverride: (logData) => {
        const newLog: CdssOverrideLog = {
          ...logData,
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          overrideLogs: [newLog, ...state.overrideLogs],
        }));
      },

      resetToDefaults: () =>
        set({
          activeAlertsByUhid: {},
          news2ScoresByUhid: SEED_NEWS2,
          overrideLogs: [],
        }),
    }),
    {
      name: "hms_cdss_store_v1",
    }
  )
);
