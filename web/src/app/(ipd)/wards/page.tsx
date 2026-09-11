"use client";

import React from "react";
import { IpdPatientCardGrid } from "../_ipd_components/WardCare/IpdPatientCardGrid";
import { Bed } from "lucide-react";

export default function IpdWardsPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bed className="w-6 h-6 text-teal-600" /> IPD Inpatient Wards & Rounding Roster
          </h1>
          <p className="text-sm text-slate-500">Admitted Patients, Ward Stay & Daily Round Notes</p>
        </div>
      </div>

      <IpdPatientCardGrid />
    </div>
  );
}
