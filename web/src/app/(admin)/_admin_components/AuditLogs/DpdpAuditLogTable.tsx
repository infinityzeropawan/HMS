"use client";

import React from "react";
import { Table, Tag } from "antd";
import { Lock } from "lucide-react";

export const DpdpAuditLogTable: React.FC = () => {
  const columns = [
    { title: "Timestamp", dataIndex: "timestamp", key: "timestamp" },
    { title: "Actor User", dataIndex: "actor", key: "actor" },
    { title: "Role", dataIndex: "role", key: "role", render: (r: string) => <Tag color="purple">{r}</Tag> },
    { title: "Event Type", dataIndex: "eventType", key: "eventType", render: (e: string) => <Tag color="teal">{e}</Tag> },
    { title: "Resource UHID", dataIndex: "uhid", key: "uhid" },
    { title: "Consent Artifact Hash", dataIndex: "consentHash", key: "consentHash" },
  ];

  const data = [
    { key: "1", timestamp: "2026-09-08 15:30:12", actor: "Dr. Rajesh Sharma", role: "DOCTOR", eventType: "EHR_ACCESS", uhid: "P-2026-1049", consentHash: "0x8f4a...92b1" },
    { key: "2", timestamp: "2026-09-08 14:15:00", actor: "Sr. Kavita R.", role: "NURSE", eventType: "MAR_UPDATE", uhid: "P-2026-1049", consentHash: "0x3c2b...11a9" },
    { key: "3", timestamp: "2026-09-08 10:45:22", actor: "Sunita Deshmukh", role: "RECEPTIONIST", eventType: "PATIENT_REGISTRATION", uhid: "P-2026-1052", consentHash: "0x91d4...84f0" },
  ];

  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Lock className="w-4 h-4 text-emerald-600" /> DPDP & ABDM Compliance Immutable Audit Trail (Append-Only)
        </span>
        <span className="font-mono text-[10px] text-slate-500">Hash-Chain Validated</span>
      </div>
      <div className="w-full overflow-x-auto">
        <Table columns={columns} dataSource={data} pagination={false} size="small" scroll={{ x: "max-content" }} />
      </div>
    </div>
  );
};
