"use client";

import React from "react";
import { PharmacyDispenseTable } from "../_pharmacy_components/DispenseQueue/PharmacyDispenseTable";
import { Pill } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function PharmacyDispensePage() {
  return (
    <HmsAppShell title="Pharmacy Dispensing Console">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-purple-600" /> Pharmacy Dispensing Counter
            </h1>
            <p className="text-sm text-slate-500 mt-1">First-Expiry, First-Out (FEFO) Medication Dispense Queue</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pending e-Prescriptions</h2>
          <PharmacyDispenseTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
