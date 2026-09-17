"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { NurseVitalsEntryConsole } from "../_nurse_components/Vitals/NurseVitalsEntryConsole";
import { HeartPulse } from "lucide-react";

export default function NurseVitalsPage() {
  return (
    <HmsAppShell title="Patient Vitals Entry & Safety Charting">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-teal-600" /> Patient Vitals Entry & Safety Charting Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Record bedside patient vitals (BP, Pulse, SpO2, Temp, Respiration) with automatic warning flags for abnormal values.
          </p>
        </div>

        <NurseVitalsEntryConsole />
      </div>
    </HmsAppShell>
  );
}
