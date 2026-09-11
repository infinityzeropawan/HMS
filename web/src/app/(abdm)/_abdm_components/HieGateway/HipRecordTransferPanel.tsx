"use client";

import React from "react";
import { Table, Tag, message } from "antd";
import { Share2, CheckCircle2 } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const HipRecordTransferPanel: React.FC = () => {
  const transfers = [
    { key: "1", consentId: "CNS-8801", abhaId: "91-8899-2201-4455", type: "DiagnosticReport", hip: "Apollo Hospital Mumbai", status: "TRANSFERRED", time: "15:30:12" },
    { key: "2", consentId: "CNS-8804", abhaId: "91-3344-5566-7788", type: "DischargeSummary", hip: "Fortis Healthcare Delhi", status: "TRANSFERRED", time: "14:20:05" },
    { key: "3", consentId: "CNS-8809", abhaId: "91-1122-3344-5566", type: "Prescription", hip: "City Diagnostics Clinic", status: "REQUESTED", time: "16:10:00" },
  ];

  const handlePushRecord = (consentId: string) => {
    message.success(`FHIR Bundle payload pushed to ABDM Health Gateway for Consent ${consentId}`);
  };

  const columns = [
    { title: "Consent Artifact", dataIndex: "consentId", key: "consentId" },
    { title: "Patient ABHA ID", dataIndex: "abhaId", key: "abhaId" },
    { title: "FHIR Bundle Type", dataIndex: "type", key: "type", render: (t: string) => <Tag color="purple">{t}</Tag> },
    { title: "HIP Provider", dataIndex: "hip", key: "hip" },
    {
      title: "Gateway Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={s === "TRANSFERRED" ? "emerald" : "orange"}>{s}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: { consentId: string; status: string }) =>
        record.status === "REQUESTED" ? (
          <HmsButton size="sm" type="primary" variant="emerald" icon={<Share2 className="w-3.5 h-3.5" />} onClick={() => handlePushRecord(record.consentId)}>
            Push FHIR Bundle
          </HmsButton>
        ) : (
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pushed to Gateway
          </span>
        ),
    },
  ];

  return <Table columns={columns} dataSource={transfers} pagination={false} />;
};
