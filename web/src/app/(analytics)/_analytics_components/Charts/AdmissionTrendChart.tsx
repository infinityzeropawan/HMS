"use client";

import React from "react";
import { UserPlus, UserCheck, TrendingUp } from "lucide-react";

export interface MonthlyAdmissionData {
  month: string;
  admissions: number;
  discharges: number;
}

export interface AdmissionTrendChartProps {
  data?: MonthlyAdmissionData[];
}

export const AdmissionTrendChart: React.FC<AdmissionTrendChartProps> = ({
  data = [
    { month: "Apr", admissions: 142, discharges: 130 },
    { month: "May", admissions: 168, discharges: 155 },
    { month: "Jun", admissions: 185, discharges: 172 },
    { month: "Jul", admissions: 210, discharges: 198 },
    { month: "Aug", admissions: 235, discharges: 220 },
    { month: "Sep", admissions: 260, discharges: 245 },
  ],
}) => {
  const maxVal = Math.max(...data.map((d) => Math.max(d.admissions, d.discharges)), 1);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" /> Patient Admission vs Discharge Trends
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly Inpatient Admissions & Discharge Flow</p>
        </div>
        <div className="flex items-center gap-3 text-3xs font-semibold text-slate-600">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Admissions</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Discharges</span>
        </div>
      </div>

      <div className="pt-4 flex items-end justify-between gap-3 h-52 border-b border-slate-100 pb-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono z-10 pointer-events-none whitespace-nowrap shadow-lg">
              Adm: {item.admissions} | Dis: {item.discharges}
            </div>

            <div className="w-full flex items-end justify-center gap-1 h-full max-w-[56px]">
              <div
                style={{ height: `${(item.admissions / maxVal) * 100}%` }}
                className="w-1/2 bg-indigo-600 rounded-t transition-all duration-300"
              ></div>
              <div
                style={{ height: `${(item.discharges / maxVal) * 100}%` }}
                className="w-1/2 bg-emerald-500 rounded-t transition-all duration-300"
              ></div>
            </div>

            <span className="text-xs font-bold text-slate-700">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
