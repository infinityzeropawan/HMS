"use client";

import React from "react";
import { HospitalBedConfigTable } from "@/app/(admin)/_admin_components/BedConfig/HospitalBedConfigTable";
import { BedDouble } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function BedsPage() {
  return (
    <HmsAppShell title="Bed & Ward Configuration">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BedDouble className="w-6 h-6 text-teal-600" /> Bed & Ward Configuration
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage the hospital physical bed layout — wards, bed numbers, types, status, and daily charges.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <HospitalBedConfigTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
