"use client";

import React from "react";
import { Activity, ShieldCheck } from "lucide-react";
import { Progress, Tag } from "antd";

export interface WardOccupancyItem {
  wardName: string;
  totalBeds: number;
  occupied: number;
  rate: number;
}

export interface BedOccupancyGaugeProps {
  overallRate?: number;
  wards?: WardOccupancyItem[];
}

export const BedOccupancyGauge: React.FC<BedOccupancyGaugeProps> = ({
  overallRate = 78,
  wards = [
    { wardName: "ICU / Cardiac Care", totalBeds: 20, occupied: 18, rate: 90 },
    { wardName: "General Ward A", totalBeds: 40, occupied: 32, rate: 80 },
    { wardName: "Private Suites", totalBeds: 15, occupied: 9, rate: 60 },
    { wardName: "Emergency Triage", totalBeds: 10, occupied: 8, rate: 80 },
  ],
}) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" /> Real-Time Bed Occupancy Metrics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Ward-Wise Capacity & Inpatient Census Rates</p>
        </div>
        <Tag color={overallRate >= 85 ? "volcano" : "emerald"} className="font-bold text-xs">
          {overallRate}% Overall Census
        </Tag>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wards.map((w, idx) => (
          <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">{w.wardName}</span>
              <span className="font-mono text-slate-600 font-semibold">
                {w.occupied}/{w.totalBeds} Beds ({w.rate}%)
              </span>
            </div>
            <Progress
              percent={w.rate}
              status={w.rate >= 90 ? "exception" : w.rate >= 75 ? "active" : "normal"}
              size="small"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
