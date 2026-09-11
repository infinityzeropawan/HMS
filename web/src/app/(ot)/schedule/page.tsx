"use client";

import React from "react";
import { SurgerySchedulerTable } from "../_ot_components/OtSchedule/SurgerySchedulerTable";
import { Stethoscope } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function OtSchedulePage() {
  return (
    <HmsAppShell title="Operation Theatre Console">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-teal-600" /> Operation Theatre & Surgery Console
            </h1>
            <p className="text-sm text-slate-500 mt-1">Surgical Slot Scheduling & Pre-Anesthesia Assessment</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Today&apos;s OT Schedule</h2>
          <SurgerySchedulerTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
