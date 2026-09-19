"use client";

import React from "react";
import { AlertTriangle, Package, ShieldAlert } from "lucide-react";
import { Progress, Tag } from "antd";

export interface InventoryRiskSummary {
  criticalLowCount: number;
  lowStockCount: number;
  nearExpiryCount: number;
  normalStockCount: number;
}

export interface InventoryRiskChartProps {
  summary?: InventoryRiskSummary;
}

export const InventoryRiskChart: React.FC<InventoryRiskChartProps> = ({
  summary = {
    criticalLowCount: 8,
    lowStockCount: 14,
    nearExpiryCount: 12,
    normalStockCount: 240,
  },
}) => {
  const total = summary.criticalLowCount + summary.lowStockCount + summary.nearExpiryCount + summary.normalStockCount;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" /> Inventory Stock Expiry & Risk Level Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">FEFO Expiry Warnings & Minimum Threshold Stock Alerts</p>
        </div>
        <Tag color="volcano" className="font-bold text-xs">
          {summary.criticalLowCount + summary.nearExpiryCount} Action Required
        </Tag>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
            <div className="text-3xs font-bold text-rose-700 uppercase">Critical Out-of-Stock Risk</div>
            <div className="text-xl font-black text-rose-900 mt-1">{summary.criticalLowCount} Batches</div>
            <p className="text-[10px] text-rose-600 mt-0.5">Below 10% reorder point</p>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
            <div className="text-3xs font-bold text-amber-700 uppercase">Near Expiry FEFO Alert</div>
            <div className="text-xl font-black text-amber-900 mt-1">{summary.nearExpiryCount} Batches</div>
            <p className="text-[10px] text-amber-600 mt-0.5">Expires within 60 days</p>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <div className="text-3xs font-bold text-emerald-700 uppercase">Sufficient Stock Level</div>
            <div className="text-xl font-black text-emerald-900 mt-1">{summary.normalStockCount} SKUs</div>
            <p className="text-[10px] text-emerald-600 mt-0.5">Optimal inventory levels</p>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
            <span>Overall Stock Risk Ratio</span>
            <span className="font-mono font-bold text-slate-900">
              {Math.round(((total - summary.normalStockCount) / total) * 100)}% Risk Ratio
            </span>
          </div>
          <Progress
            percent={Math.round((summary.normalStockCount / total) * 100)}
            strokeColor="#10b981"
            size="small"
          />
        </div>
      </div>
    </div>
  );
};
