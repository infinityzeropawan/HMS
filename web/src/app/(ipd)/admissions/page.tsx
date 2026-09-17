"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { IpdAdmissionDesk } from "../_ipd_components/Admissions/IpdAdmissionDesk";
import { BedDouble } from "lucide-react";

export default function IpdAdmissionsPage() {
  return (
    <HmsAppShell title="Inpatient Admission Desk">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-teal-600" /> Inpatient Admission Desk & Bed Placement
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register new inpatient admissions, assign ward beds, record initial advance deposits, and verify TPA cashless approvals.
          </p>
        </div>

        <IpdAdmissionDesk />
      </div>
    </HmsAppShell>
  );
}
