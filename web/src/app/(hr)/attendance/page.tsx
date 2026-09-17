"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { StaffAttendanceTable } from "../_hr_components/Attendance/StaffAttendanceTable";
import { Fingerprint } from "lucide-react";

export default function HrAttendancePage() {
  return (
    <HmsAppShell title="Biometric Attendance & Shift Log">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-teal-600" /> Staff Biometric Attendance & Shift Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor biometric clock-in timestamps, duty hours, late arrival flags, and attendance records.
          </p>
        </div>

        <StaffAttendanceTable />
      </div>
    </HmsAppShell>
  );
}
