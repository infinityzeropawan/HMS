"use client";

import React from "react";
import { Tabs } from "antd";
import { DrugAllergyAlertPanel } from "../_cdss_components/InteractionWarnings/DrugAllergyAlertPanel";
import { EarlyWarningScorePanel } from "../_cdss_components/ClinicalScoring/EarlyWarningScorePanel";
import { ShieldAlert, Activity, Pill } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function CdssAlertsPage() {
  const items = [
    {
      key: "interactions",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Pill className="w-4 h-4 text-teal-600" /> Drug-Allergy & Interaction Warnings
        </span>
      ),
      children: <DrugAllergyAlertPanel />,
    },
    {
      key: "ews",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Activity className="w-4 h-4 text-teal-600" /> NEWS2 Sepsis Early Warning Scores
        </span>
      ),
      children: <EarlyWarningScorePanel />,
    },
  ];

  return (
    <HmsAppShell title="Clinical Decision Support (CDSS)">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-teal-600" /> Clinical Decision Support System (CDSS)
            </h1>
            <p className="text-sm text-slate-500 mt-1">Automated Patient Safety Rules Engine & Deterioration Risk Scoring</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <Tabs defaultActiveKey="interactions" items={items} />
        </div>
      </div>
    </HmsAppShell>
  );
}
