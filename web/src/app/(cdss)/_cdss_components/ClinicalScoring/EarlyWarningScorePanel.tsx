"use client";

import React from "react";
import { Table, Tag } from "antd";
import { Activity } from "lucide-react";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";

export const EarlyWarningScorePanel: React.FC = () => {
  const ewsData = [
    { key: "1", bed: "ICU-01", patient: "Sunil Verma", news2Score: 7, risk: "HIGH_RISK_SEPSIS", recommendation: "Urgent ICU Senior Registrar Assessment & ABG Blood Gas" },
    { key: "2", bed: "GW-101", patient: "Anjali Gupta", news2Score: 2, risk: "LOW_RISK", recommendation: "Standard 4-Hourly Vitals Monitoring" },
    { key: "3", bed: "GW-102", patient: "Ramesh Kumar", news2Score: 4, risk: "MEDIUM_RISK", recommendation: "Increase Vitals Frequency to 2-Hourly" },
  ];

  const columns = [
    { title: "Bed Location", dataIndex: "bed", key: "bed" },
    { title: "Patient Name", dataIndex: "patient", key: "patient" },
    {
      title: "NEWS2 Score",
      dataIndex: "news2Score",
      key: "news2Score",
      render: (score: number) => (
        <span className={`font-bold text-sm ${score >= 7 ? "text-rose-600" : score >= 4 ? "text-amber-600" : "text-emerald-600"}`}>
          Score {score}
        </span>
      ),
    },
    {
      title: "Clinical Risk Tier",
      dataIndex: "risk",
      key: "risk",
      render: (r: string) => <Tag color={r.includes("HIGH") ? "rose" : r.includes("MEDIUM") ? "orange" : "emerald"}>{r}</Tag>,
    },
    { title: "CDSS Recommended Protocol", dataIndex: "recommendation", key: "recommendation" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" /> National Early Warning Score (NEWS2) Monitor
        </h4>
        <HmsAiGeneratedBadge label="AI Deterioration Predictor" />
      </div>

      <Table columns={columns} dataSource={ewsData} pagination={false} />
    </div>
  );
};
