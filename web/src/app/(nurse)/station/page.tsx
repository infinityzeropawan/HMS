"use client";

import React from "react";
import { Activity, Bed, ShieldAlert, Pill, ClipboardList, HeartPulse, Droplet } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { NurseStationLiveCensus } from "../_nurse_components/StationDashboard/NurseStationLiveCensus";
import { NurseClinicalAlertsPanel } from "../_nurse_components/StationDashboard/NurseClinicalAlertsPanel";
import { NurseMedicationCommandCenter } from "../_nurse_components/StationDashboard/NurseMedicationCommandCenter";
import { NurseDoctorOrdersWorklist } from "../_nurse_components/Worklist/NurseDoctorOrdersWorklist";
import { NurseVitalsSurveillancePanel } from "../_nurse_components/StationDashboard/NurseVitalsSurveillancePanel";
import { VitalsFlowsheetTable } from "../_nurse_components/StationDashboard/VitalsFlowsheetTable";
import { NurseFluidSurveillancePanel } from "../_nurse_components/StationDashboard/NurseFluidSurveillancePanel";
import { NurseHandoverCenterPanel } from "../_nurse_components/StationDashboard/NurseHandoverCenterPanel";
import { NurseBedOperationsPanel } from "../_nurse_components/StationDashboard/NurseBedOperationsPanel";
import { NurseBedMatrixGrid } from "../_nurse_components/StationDashboard/NurseBedMatrixGrid";

export default function NurseStationPage() {
  return (
    <HmsAppShell title="Nursing Station Operational Command Console">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Console Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-teal-600" /> Ward Operational Command Desk
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Authoritative Operational Surveillance & Monitoring Console &bull; Duty Station: ICU & General Wards
            </p>
          </div>
        </div>

        {/* SECTION 1: Live Ward Census */}
        <NurseStationLiveCensus />

        {/* SECTION 2: Clinical Alerts Command Center */}
        <NurseClinicalAlertsPanel />

        {/* SECTION 3: Medication Command Center */}
        <NurseMedicationCommandCenter />

        {/* SECTION 4: Doctor Orders Command Center */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" /> Doctor Clinical Orders Execution Engine
          </h2>
          <NurseDoctorOrdersWorklist />
        </div>

        {/* SECTION 5: Vitals Surveillance */}
        <NurseVitalsSurveillancePanel />

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Live Vitals Flowsheet & Telemetry Console
          </h2>
          <VitalsFlowsheetTable />
        </div>

        {/* SECTION 6: Fluid Balance Surveillance */}
        <NurseFluidSurveillancePanel />

        {/* SECTION 7: Shift Handover Center */}
        <NurseHandoverCenterPanel />

        {/* SECTION 8: Bed Operations */}
        <NurseBedOperationsPanel />

        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Bed className="w-4 h-4 text-teal-600" /> Ward Bed Occupancy Matrix
          </h2>
          <NurseBedMatrixGrid />
        </div>
      </div>
    </HmsAppShell>
  );
}
