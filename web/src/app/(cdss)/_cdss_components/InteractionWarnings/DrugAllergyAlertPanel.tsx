"use client";

import React from "react";
import { Table, Tag, Alert } from "antd";
import { ShieldAlert } from "lucide-react";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";

export const DrugAllergyAlertPanel: React.FC = () => {
  const alerts = [
    { key: "1", patient: "Sunil Verma (P-2026-1049)", type: "DRUG_DRUG", severity: "HIGH", detail: "Aspirin + Warfarin: Increased risk of major gastrointestinal hemorrhage", action: "Physician Review Required" },
    { key: "2", patient: "Anjali Gupta (P-2026-1052)", type: "DRUG_ALLERGY", severity: "CRITICAL", detail: "Penicillin V + Known Penicillin Anaphylaxis Allergy", action: "Order Blocked by CDSS Rules" },
  ];

  const columns = [
    { title: "Patient UHID", dataIndex: "patient", key: "patient" },
    { title: "Alert Category", dataIndex: "type", key: "type", render: (t: string) => <Tag color="purple">{t}</Tag> },
    { title: "Severity Level", dataIndex: "severity", key: "severity", render: (s: string) => <Tag color={s === "CRITICAL" ? "rose" : "orange"}>{s}</Tag> },
    { title: "Clinical Warning Detail", dataIndex: "detail", key: "detail" },
    { title: "CDSS Rule Action", dataIndex: "action", key: "action" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Alert
          message="Real-Time CDSS Clinical Warning Engine Active"
          description="Monitors drug-drug, drug-allergy, and drug-lab contraindications automatically."
          type="warning"
          showIcon
          icon={<ShieldAlert className="w-4 h-4 text-amber-600" />}
          className="flex-1 mr-4 text-xs"
        />
        <HmsAiGeneratedBadge label="CDSS Rules Engine" />
      </div>

      <Table columns={columns} dataSource={alerts} pagination={false} />
    </div>
  );
};
