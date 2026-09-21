"use client";

import React from "react";
import { Table, Tag, Card } from "antd";
import { BarChart3, ArrowLeft, TrendingUp, AlertTriangle, DollarSign, Package } from "lucide-react";
import Link from "next/link";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { usePharmacyStore, DrugStockItem } from "../_pharmacy_stores/pharmacy_store";

export default function PharmacyReportsPage() {
  const { inventory } = usePharmacyStore();

  const totalStockValue = inventory.reduce((acc, item) => acc + item.stockQuantity * item.unitPrice, 0);
  const lowStockCount = inventory.filter((item) => item.status === "LOW_STOCK").length;

  const columns = [
    {
      title: "Drug Item Name",
      dataIndex: "name",
      key: "name",
      render: (val: string) => <span className="font-bold text-slate-900">{val}</span>,
    },
    {
      title: "Batch & Expiry",
      key: "batch",
      render: (_: unknown, record: DrugStockItem) => (
        <span className="font-mono text-xs text-purple-700">
          {record.batchNumber} ({record.expiryDate})
        </span>
      ),
    },
    {
      title: "Stock Qty",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (qty: number) => <span className="font-bold font-mono">{qty}</span>,
    },
    {
      title: "Unit Rate",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (prc: number) => <span className="font-mono text-slate-700">₹{prc}</span>,
    },
    {
      title: "Inventory Holding Value",
      key: "val",
      render: (_: unknown, record: DrugStockItem) => (
        <span className="font-bold text-emerald-700 font-mono">₹{record.stockQuantity * record.unitPrice}</span>
      ),
    },
    {
      title: "Stock Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "IN_STOCK" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
  ];

  return (
    <HmsAppShell title="Pharmacy Analytics & MIS Reports" subtitle="Inventory holding valuation & stock metrics">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/pharmacy" className="text-slate-500 hover:text-slate-700 text-xs flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Pharmacy
              </Link>
            </div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-1">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              Pharmacy Valuation & Analytics Reports
            </h1>
            <p className="text-xs text-slate-500">Inventory holding value, stock aging, and reorder metrics.</p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Holding Stock Valuation</p>
              <p className="text-xl font-bold text-emerald-700 font-mono">₹{totalStockValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Inventory SKUs</p>
              <p className="text-xl font-bold text-slate-900">{inventory.length} Drug SKUs</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Low Stock Reorders Required</p>
              <p className="text-xl font-bold text-amber-600">{lowStockCount} Items</p>
            </div>
          </div>
        </div>

        {/* Inventory Valuation Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto p-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Real-time Stock Valuation Breakdown</h3>
          <Table columns={columns} dataSource={inventory} rowKey="id" pagination={{ pageSize: 8 }} />
        </div>
      </div>
    </HmsAppShell>
  );
}
