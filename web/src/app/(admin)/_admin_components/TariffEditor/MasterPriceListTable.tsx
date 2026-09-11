"use client";

import React from "react";
import { Table, Tag } from "antd";
import { Edit3 } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const MasterPriceListTable: React.FC = () => {
  const columns = [
    { title: "Service Code", dataIndex: "code", key: "code" },
    { title: "Service Name", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "category", key: "category", render: (c: string) => <Tag color="blue">{c}</Tag> },
    { title: "HSN/SAC", dataIndex: "hsn", key: "hsn" },
    {
      title: "Base Rate (₹)",
      dataIndex: "rate",
      key: "rate",
      render: (rate: number) => `₹${rate.toFixed(2)}`,
    },
    { title: "GST Rate (%)", dataIndex: "gst", key: "gst", render: (g: number) => `${g}%` },
    {
      title: "Action",
      key: "action",
      render: () => (
        <HmsButton size="sm" variant="secondary" icon={<Edit3 className="w-3.5 h-3.5" />}>
          Edit Price
        </HmsButton>
      ),
    },
  ];

  const data = [
    { key: "1", code: "SRV-001", name: "OPD Senior Consultant Fee", category: "CONSULTATION", hsn: "999312", rate: 800, gst: 18 },
    { key: "2", code: "SRV-002", name: "12-Lead ECG Test", category: "DIAGNOSTICS", hsn: "999313", rate: 450, gst: 18 },
    { key: "3", code: "SRV-003", name: "ICU Bed Daily Charges", category: "ROOM_TARIFF", hsn: "999311", rate: 7500, gst: 0 },
    { key: "4", code: "SRV-004", name: "Complete Blood Count (CBC)", category: "LABORATORY", hsn: "999313", rate: 350, gst: 18 },
  ];

  return <Table columns={columns} dataSource={data} pagination={false} />;
};
