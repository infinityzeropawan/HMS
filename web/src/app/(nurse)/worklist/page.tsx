"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { NurseDoctorOrdersWorklist } from "../_nurse_components/Worklist/NurseDoctorOrdersWorklist";
import { ClipboardList } from "lucide-react";

export default function NurseWorklistPage() {
  return (
    <HmsAppShell title="Doctor Orders & Nursing Worklist">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-teal-600" /> Doctor Clinical Orders & Nursing Worklist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized nursing task list for doctor STAT orders, IV drip adjustments, dressing changes, and specimen collections.
          </p>
        </div>

        <NurseDoctorOrdersWorklist />
      </div>
    </HmsAppShell>
  );
}
