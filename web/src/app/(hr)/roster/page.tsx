"use client";

import React from "react";
import { StaffShiftScheduler } from "../_hr_components/DutyRoster/StaffShiftScheduler";
import { Calendar } from "lucide-react";

export default function HrRosterPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" /> Staff Duty Roster & Shift Planning
          </h1>
          <p className="text-sm text-slate-500">Weekly Shift Allocations for Doctors, Nurses & Staff</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <StaffShiftScheduler />
      </div>
    </div>
  );
}
