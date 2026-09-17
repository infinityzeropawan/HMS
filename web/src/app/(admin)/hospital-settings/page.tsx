"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HospitalSettingsWorkspace } from "../_admin_components/HospitalSettings/HospitalSettingsWorkspace";
import { SlidersHorizontal } from "lucide-react";

export default function HospitalSettingsPage() {
  return (
    <HmsAppShell title="Hospital Settings & Clinical Policies">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-teal-600" /> Hospital Master Settings & Clinical Rules
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage hospital registration details, branding logos, OPD slot durations, GST rates, and ABDM health stack credentials.
          </p>
        </div>

        <HospitalSettingsWorkspace />
      </div>
    </HmsAppShell>
  );
}
