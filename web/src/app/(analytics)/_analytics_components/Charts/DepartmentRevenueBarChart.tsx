"use client";

import React from "react";
import { Building2, PieChart } from "lucide-react";
import { Progress, Tag } from "antd";

export interface DeptRevenueItem {
  department: string;
  code: string;
  revenue: number; // in ₹
  percentage: number;
}

export interface DepartmentRevenueBarChartProps {
  data?: DeptRevenueItem[];
}

export const DepartmentRevenueBarChart: React.FC<DepartmentRevenueBarChartProps> = ({
  data = [
    { department: "Cardiology & Cath Lab", code: "CARD-01", revenue: 1450000, percentage: 42 },
    { department: "Orthopedics & OT", code: "ORTH-01", revenue: 980000, percentage: 28 },
    { department: "General Medicine & OPD", code: "GEN-01", revenue: 620000, percentage: 18 },
    { department: "Pathology & Radiology", code: "DIAG-01", revenue: 420000, percentage: 12 },
  ],
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
        <p className="font-semibold text-sm">No Departmental Revenue Data</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-600" /> Revenue By Department Distribution
        </h3>
        <span className="text-xs text-slate-500 font-mono">Financial Target Share</span>
      </div>

      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.department}</span>
                <span className="text-3xs font-mono text-slate-500">({item.code})</span>
              </span>
              <span className="font-bold text-slate-900 font-mono">
                ₹{item.revenue.toLocaleString("en-IN")} ({item.percentage}%)
              </span>
            </div>
            <Progress
              percent={item.percentage}
              strokeColor={idx === 0 ? "#0d9488" : idx === 1 ? "#6366f1" : idx === 2 ? "#f59e0b" : "#8b5cf6"}
              showInfo={false}
              size="small"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
