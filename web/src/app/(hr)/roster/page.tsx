"use client";

import React from "react";
import { StaffShiftScheduler } from "../_hr_components/DutyRoster/StaffShiftScheduler";
import { Calendar } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function HrRosterPage() {
  return (
    <HmsAppShell title="Staff Duty Roster & Shifts">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-teal-600" /> Staff Duty Roster & Shift Planning
            </h1>
            <p className="text-sm text-slate-500 mt-1">Weekly Shift Allocations for Doctors, Nurses & Staff</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <StaffShiftScheduler />
        </div>
      </div>
    </HmsAppShell>
  );
}
