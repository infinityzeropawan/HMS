"use client";

import React from "react";
import { DoctorCommissionCalculator } from "../_hr_components/DoctorPayouts/DoctorCommissionCalculator";
import { DollarSign } from "lucide-react";

export default function HrPayoutsPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-teal-600" /> Doctor Commission & Payout Calculator
          </h1>
          <p className="text-sm text-slate-500">Monthly OPD Consultations & Surgery Share Disbursal</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <DoctorCommissionCalculator />
      </div>
    </div>
  );
}
