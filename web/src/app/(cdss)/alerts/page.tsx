"use client";

import React from "react";
import { Tabs } from "antd";
import { DrugAllergyAlertPanel } from "../_cdss_components/InteractionWarnings/DrugAllergyAlertPanel";
import { EarlyWarningScorePanel } from "../_cdss_components/ClinicalScoring/EarlyWarningScorePanel";
import { ShieldAlert, Activity, Pill } from "lucide-react";

export default function CdssAlertsPage() {
  const items = [
    {
      key: "interactions",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Pill className="w-4 h-4" /> Drug-Allergy & Interaction Warnings
        </span>
      ),
      children: <DrugAllergyAlertPanel />,
    },
    {
      key: "ews",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Activity className="w-4 h-4" /> NEWS2 Sepsis Early Warning Scores
        </span>
      ),
      children: <EarlyWarningScorePanel />,
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-teal-600" /> Clinical Decision Support System (CDSS)
          </h1>
          <p className="text-sm text-slate-500">Automated Patient Safety Rules Engine & Deterioration Risk Scoring</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <Tabs defaultActiveKey="interactions" items={items} />
      </div>
    </div>
  );
}
