"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { StaffRosterManager } from "../_admin_components/Roster/StaffRosterManager";
import { Calendar } from "lucide-react";

export default function RosterPage() {
  return (
    <HmsAppShell title="Doctor & Staff Shift Roster">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" /> Doctor & Staff Shift Roster Schedule
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Assign morning, evening, night, and 24x7 emergency standby duty shifts for doctors, nurses, pharmacists, and lab staff.
          </p>
        </div>

        <StaffRosterManager />
      </div>
    </HmsAppShell>
  );
}
