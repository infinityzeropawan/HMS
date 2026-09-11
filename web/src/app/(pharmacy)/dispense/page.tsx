"use client";

import React from "react";
import { PharmacyDispenseTable } from "../_pharmacy_components/DispenseQueue/PharmacyDispenseTable";
import { Pill } from "lucide-react";

export default function PharmacyDispensePage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-purple-600" /> Pharmacy Dispensing Counter
          </h1>
          <p className="text-sm text-slate-500">First-Expiry, First-Out (FEFO) Medication Dispense Queue</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Pending e-Prescriptions</h2>
        <PharmacyDispenseTable />
      </div>
    </div>
  );
}
