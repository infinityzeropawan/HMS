"use client";

import React from "react";
import { Table, Tag, message } from "antd";
import { CheckCircle2 } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const InterHospitalTransferTable: React.FC = () => {
  const transfers = [
    { key: "1", transferId: "TRF-8801", type: "PATIENT_TRANSFER", originBranch: "Apollo Mumbai (Main)", targetBranch: "Apollo Thane Branch", item: "Sunil Verma (P-2026-1049)", status: "IN_TRANSIT" },
    { key: "2", transferId: "TRF-8805", type: "PHARMACY_STOCK", originBranch: "Central Warehouse", targetBranch: "Apollo Mumbai (Main)", item: "Tab Sorbitrate 5mg (1,000 Units)", status: "COMPLETED" },
  ];

  const columns = [
    { title: "Transfer ID", dataIndex: "transferId", key: "transferId" },
    { title: "Transfer Category", dataIndex: "type", key: "type", render: (t: string) => <Tag color="purple">{t}</Tag> },
    { title: "Source Branch", dataIndex: "originBranch", key: "originBranch" },
    { title: "Destination Branch", dataIndex: "targetBranch", key: "targetBranch" },
    { title: "Item / Patient Record", dataIndex: "item", key: "item" },
    { title: "Status", dataIndex: "status", key: "status", render: (s: string) => <Tag color={s === "COMPLETED" ? "emerald" : "orange"}>{s}</Tag> },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: { transferId: string; status: string }) =>
        record.status === "IN_TRANSIT" ? (
          <HmsButton
            size="sm"
            type="primary"
            variant="emerald"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            onClick={() => message.success(`Inter-branch transfer ${record.transferId} acknowledged.`)}
          >
            Acknowledge Receipt
          </HmsButton>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Completed</span>
        ),
    },
  ];

  return <Table columns={columns} dataSource={transfers} pagination={false} />;
};
