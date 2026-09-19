"use client";

import React from "react";
import { Users, ShieldCheck, Clock } from "lucide-react";
import { Progress, Tag } from "antd";

export interface AttendanceMetrics {
  totalStaff: number;
  present: number;
  onDutyRoster: number;
  onLeave: number;
  compliancePercent: number;
}

export interface AttendanceTrendChartProps {
  metrics?: AttendanceMetrics;
}

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({
  metrics = {
    totalStaff: 124,
    present: 112,
    onDutyRoster: 118,
    onLeave: 6,
    compliancePercent: 94.9,
  },
}) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" /> Staff Attendance & Roster Compliance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Shift Attendance vs Scheduled Duty Roster</p>
        </div>
        <Tag color="purple" className="font-bold text-xs">
          {metrics.compliancePercent}% Attendance
        </Tag>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">Present On Duty</span>
          <span className="font-mono font-bold text-slate-900">
            {metrics.present} / {metrics.onDutyRoster} Staff
          </span>
        </div>
        <Progress percent={metrics.compliancePercent} strokeColor="#9333ea" size="small" />

        <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs border-t border-slate-100">
          <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
            <div className="text-3xs text-purple-700 uppercase font-semibold">Total Roster</div>
            <div className="font-bold text-purple-900 text-base mt-0.5">{metrics.totalStaff}</div>
          </div>
          <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
            <div className="text-3xs text-emerald-700 uppercase font-semibold">Clocked In</div>
            <div className="font-bold text-emerald-900 text-base mt-0.5">{metrics.present}</div>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
            <div className="text-3xs text-amber-700 uppercase font-semibold">Approved Leave</div>
            <div className="font-bold text-amber-900 text-base mt-0.5">{metrics.onLeave}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
