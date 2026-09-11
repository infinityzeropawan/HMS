"use client";

import React from "react";
import { SurgerySchedulerTable } from "../_ot_components/OtSchedule/SurgerySchedulerTable";
import { Scissors } from "lucide-react";

export default function OtSchedulePage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-6 h-6 text-teal-600" /> Operation Theatre & Surgery Console
          </h1>
          <p className="text-sm text-slate-500">Surgical Slot Scheduling & Pre-Anesthesia Assessment</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Today&apos;s OT Schedule</h2>
        <SurgerySchedulerTable />
      </div>
    </div>
  );
}
