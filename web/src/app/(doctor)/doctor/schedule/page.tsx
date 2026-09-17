"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { DoctorScheduleView } from "../../_doctor_components/Schedule/DoctorScheduleView";
import { Calendar } from "lucide-react";

export default function DoctorSchedulePage() {
  return (
    <HmsAppShell title="Doctor Clinic Schedule">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" /> Doctor Weekly OPD Clinic Schedule & Roster
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View your weekly OPD consultation hours, assigned clinic room, OT surgical schedule, and block emergency times.
          </p>
        </div>

        <DoctorScheduleView />
      </div>
    </HmsAppShell>
  );
}
