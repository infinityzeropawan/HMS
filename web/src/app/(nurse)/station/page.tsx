"use client";

import React from "react";
import { NurseBedMatrixGrid } from "../_nurse_components/StationDashboard/NurseBedMatrixGrid";
import { VitalsFlowsheetTable } from "../_nurse_components/StationDashboard/VitalsFlowsheetTable";
import { Activity, Bed, ShieldAlert } from "lucide-react";

export default function NurseStationPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" /> Nursing Station Console
          </h1>
          <p className="text-sm text-slate-500">ICU & Inpatient Ward Monitoring Desk &bull; Shift: Morning</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Bed className="w-4 h-4 text-teal-600" /> Ward Bed Occupancy Matrix
        </h2>
        <NurseBedMatrixGrid />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" /> ICU Bed 01 — Live Vitals Flowsheet (Sunil Verma)
        </h2>
        <VitalsFlowsheetTable />
      </div>
    </div>
  );
}
