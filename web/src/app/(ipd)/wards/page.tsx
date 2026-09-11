"use client";

import React from "react";
import { IpdPatientCardGrid } from "../_ipd_components/WardCare/IpdPatientCardGrid";
import { Bed } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function IpdWardsPage() {
  return (
    <HmsAppShell title="IPD Inpatient Wards Console">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bed className="w-6 h-6 text-teal-600" /> IPD Inpatient Wards & Rounding Roster
            </h1>
            <p className="text-sm text-slate-500 mt-1">Admitted Patients, Ward Stay & Daily Round Notes</p>
          </div>
        </div>

        <IpdPatientCardGrid />
      </div>
    </HmsAppShell>
  );
}
