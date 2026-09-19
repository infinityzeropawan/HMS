"use client";

import React from "react";
import { TrendingUp, DollarSign, Inbox } from "lucide-react";

export interface MonthlyRevenueData {
  month: string;
  opd: number;
  ipd: number;
  lab: number;
  pharmacy: number;
  total: number;
}

export interface RevenueTrendChartProps {
  data?: MonthlyRevenueData[];
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data = [
    { month: "Apr", opd: 4.2, ipd: 8.5, lab: 2.1, pharmacy: 3.4, total: 18.2 },
    { month: "May", opd: 4.8, ipd: 9.2, lab: 2.5, pharmacy: 3.9, total: 20.4 },
    { month: "Jun", opd: 5.1, ipd: 11.0, lab: 3.0, pharmacy: 4.2, total: 23.3 },
    { month: "Jul", opd: 5.5, ipd: 12.8, lab: 3.4, pharmacy: 4.8, total: 26.5 },
    { month: "Aug", opd: 6.2, ipd: 14.5, lab: 4.1, pharmacy: 5.5, total: 30.3 },
    { month: "Sep", opd: 7.0, ipd: 16.2, lab: 4.8, pharmacy: 6.1, total: 34.1 },
  ],
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
        <Inbox className="w-10 h-10 mx-auto text-slate-300" />
        <p className="font-semibold text-sm">No Revenue Trend Data Available</p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" /> Revenue Growth Trends (₹ Lakhs)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly OPD, IPD, Diagnostics, & Pharmacy Revenue Streams</p>
        </div>
        <div className="flex items-center gap-3 text-3xs font-semibold text-slate-600">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> IPD</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> OPD</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Lab/Pharma</span>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="pt-4 flex items-end justify-between gap-2 sm:gap-4 h-56 border-b border-slate-100 pb-2">
        {data.map((item, i) => {
          const heightPercent = Math.round((item.total / maxTotal) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono z-10 pointer-events-none whitespace-nowrap shadow-lg">
                ₹{item.total}L (IPD: ₹{item.ipd}L | OPD: ₹{item.opd}L)
              </div>

              {/* Stacked Visual Bar */}
              <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-300 hover:brightness-95" style={{ height: `${heightPercent}%` }}>
                <div style={{ height: `${(item.ipd / item.total) * 100}%` }} className="bg-teal-500 w-full"></div>
                <div style={{ height: `${(item.opd / item.total) * 100}%` }} className="bg-indigo-500 w-full"></div>
                <div style={{ height: `${((item.lab + item.pharmacy) / item.total) * 100}%` }} className="bg-amber-500 w-full"></div>
              </div>

              <span className="text-xs font-bold text-slate-700">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
