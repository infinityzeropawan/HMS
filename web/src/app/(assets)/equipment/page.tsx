"use client";

import React from "react";
import { EquipmentCalibrationTable } from "../_assets_components/EquipmentMaintenance/EquipmentCalibrationTable";
import { Wrench } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function AssetsEquipmentPage() {
  return (
    <HmsAppShell title="Biomedical Asset Maintenance">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-teal-600" /> Biomedical Engineering & Equipment Maintenance
            </h1>
            <p className="text-sm text-slate-500 mt-1">Asset Calibration Schedules & Breakdown Work Orders</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <EquipmentCalibrationTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
