"use client";

import React from "react";
import { DoctorCommissionCalculator } from "../_hr_components/DoctorPayouts/DoctorCommissionCalculator";
import { DollarSign } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function HrPayoutsPage() {
  return (
    <HmsAppShell title="Doctor Payouts & Commission">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-teal-600" /> Doctor Commission & Payout Calculator
            </h1>
            <p className="text-sm text-slate-500 mt-1">Monthly OPD Consultations & Surgery Share Disbursal</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <DoctorCommissionCalculator />
        </div>
      </div>
    </HmsAppShell>
  );
}
