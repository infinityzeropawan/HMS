"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { NurseFluidBalanceChart } from "../_nurse_components/FluidChart/NurseFluidBalanceChart";
import { Droplet } from "lucide-react";

export default function NurseFluidChartPage() {
  return (
    <HmsAppShell title="Inpatient Fluid Balance Chart">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Droplet className="w-6 h-6 text-teal-600" /> Inpatient 24-Hour Fluid Intake & Output (I/O) Chart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log IV fluids, oral intake, tube feeds vs urine output and wound drain output with net balance calculation.
          </p>
        </div>

        <NurseFluidBalanceChart />
      </div>
    </HmsAppShell>
  );
}
