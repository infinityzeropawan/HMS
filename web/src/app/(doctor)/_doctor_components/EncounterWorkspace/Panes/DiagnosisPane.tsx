"use client";

import React, { useState } from "react";
import { Select, Tag } from "antd";
import { Activity } from "lucide-react";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";

export const DiagnosisPane: React.FC = () => {
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([
    "I20.9 - Angina pectoris, unspecified",
  ]);

  const icd10Options = [
    { value: "I20.9 - Angina pectoris, unspecified", label: "I20.9 - Angina pectoris, unspecified" },
    { value: "I10 - Essential (primary) hypertension", label: "I10 - Essential (primary) hypertension" },
    { value: "E11.9 - Type 2 diabetes mellitus without complications", label: "E11.9 - Type 2 diabetes mellitus without complications" },
    { value: "J45.909 - Unspecified asthma, uncomplicated", label: "J45.909 - Unspecified asthma, uncomplicated" },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" /> ICD-10 Coding & Diagnosis
        </h3>
        <HmsAiGeneratedBadge label="AI ICD-10 Matcher" />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Search & Add ICD-10 Codes</label>
        <Select
          mode="multiple"
          className="w-full"
          placeholder="Search ICD-10 Code or Disease Name..."
          value={selectedDiagnoses}
          onChange={(vals) => setSelectedDiagnoses(vals)}
          options={icd10Options}
          size="large"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Confirmed Diagnoses</label>
        <div className="space-y-2">
          {selectedDiagnoses.map((diag) => (
            <div
              key={diag}
              className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-sm text-teal-900 font-medium"
            >
              <span>{diag}</span>
              <Tag color="teal">PRIMARY</Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
