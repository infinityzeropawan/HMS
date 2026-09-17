"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { InpatientRoundsWorkspace } from "../_doctor_components/InpatientRounds/InpatientRoundsWorkspace";
import { BedDouble } from "lucide-react";

export default function DoctorInpatientPage() {
  return (
    <HmsAppShell title="Inpatient Ward Rounds">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-teal-600" /> Inpatient Ward Rounds & SOAP Progress Notes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review admitted IPD patients, record daily SOAP notes, track vitals, and approve discharge readiness.
          </p>
        </div>

        <InpatientRoundsWorkspace />
      </div>
    </HmsAppShell>
  );
}
