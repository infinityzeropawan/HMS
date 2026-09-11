"use client";

import React from "react";
import { Table, Tag, message } from "antd";
import { ShoppingCart } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const ReorderAlertsTable: React.FC = () => {
  const stockItems = [
    { key: "1", code: "DRUG-001", name: "Tab Sorbitrate 5mg", currStock: 12, minReorder: 50, expiryForecast: "2026-10-31", status: "LOW_STOCK" },
    { key: "2", code: "DRUG-045", name: "Inj Pantocid 40mg IV", currStock: 8, minReorder: 40, expiryForecast: "2026-11-15", status: "CRITICAL_LOW" },
    { key: "3", code: "DRUG-089", name: "Cap Amoxicillin 500mg", currStock: 140, minReorder: 50, expiryForecast: "2026-09-30", status: "NEAR_EXPIRY" },
  ];

  const columns = [
    { title: "Item Code", dataIndex: "code", key: "code" },
    { title: "Medication / Supply Name", dataIndex: "name", key: "name" },
    { title: "Current Stock", dataIndex: "currStock", key: "currStock" },
    { title: "Min Threshold", dataIndex: "minReorder", key: "minReorder" },
    { title: "Nearest Expiry", dataIndex: "expiryForecast", key: "expiryForecast" },
    {
      title: "Alert Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={s === "CRITICAL_LOW" ? "rose" : s === "LOW_STOCK" ? "orange" : "volcano"}>{s}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: { name: string }) => (
        <HmsButton
          size="sm"
          type="primary"
          variant="emerald"
          icon={<ShoppingCart className="w-3.5 h-3.5" />}
          onClick={() => message.success(`Purchase Order generated for ${record.name}`)}
        >
          Auto Purchase Order
        </HmsButton>
      ),
    },
  ];

  return <Table columns={columns} dataSource={stockItems} pagination={false} />;
};
