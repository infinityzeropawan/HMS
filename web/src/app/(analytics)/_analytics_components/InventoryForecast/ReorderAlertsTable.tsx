"use client";

import React, { useState } from "react";
import { Table, Tag, message } from "antd";
import { ShoppingCart } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ReportFilterBar } from "@/common_components/ReportFilterBar/ReportFilterBar";
import { InventoryRiskChart } from "../Charts/InventoryRiskChart";
import { ExportColumn } from "@/lib/export_service/export_service";

export const ReorderAlertsTable: React.FC = () => {
  const [stockItems] = useState([
    { key: "1", code: "DRUG-001", name: "Tab Sorbitrate 5mg", currStock: 12, minReorder: 50, expiryForecast: "2026-10-31", status: "LOW_STOCK" },
    { key: "2", code: "DRUG-045", name: "Inj Pantocid 40mg IV", currStock: 8, minReorder: 40, expiryForecast: "2026-11-15", status: "CRITICAL_LOW" },
    { key: "3", code: "DRUG-089", name: "Cap Amoxicillin 500mg", currStock: 140, minReorder: 50, expiryForecast: "2026-09-30", status: "NEAR_EXPIRY" },
  ]);

  const exportColumns: ExportColumn[] = [
    { label: "Item Code", key: "code" },
    { label: "Medication / Supply Name", key: "name" },
    { label: "Current Stock", key: "currStock" },
    { label: "Min Reorder Threshold", key: "minReorder" },
    { label: "Nearest Expiry", key: "expiryForecast" },
    { label: "Alert Status", key: "status" },
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

  return (
    <div className="space-y-6">
      {/* Standard Filter Bar with Export */}
      <ReportFilterBar
        reportTitle="Pharmacy Inventory Expiry & Reorder Forecast"
        exportFilename="pharmacy_inventory_expiry_report"
        columns={exportColumns}
        data={stockItems}
      />

      <InventoryRiskChart />

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-800">Priority FEFO Reorder Action List</h3>
        <div className="w-full overflow-x-auto">
          <Table columns={columns} dataSource={stockItems} pagination={false} scroll={{ x: "max-content" }} />
        </div>
      </div>
    </div>
  );
};
