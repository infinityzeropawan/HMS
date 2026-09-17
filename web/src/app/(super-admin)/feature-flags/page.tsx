"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HospitalFacilityControlManager } from "../_super_admin_components/FacilityControl/HospitalFacilityControlManager";
import { Shield } from "lucide-react";

export default function FeatureFlagsPage() {
  return (
    <HmsAppShell title="Super Admin Platform Console">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-600" /> Hospital Facility & Service Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Open or close individual departments, clinical services, integrations, and feature flags per hospital tenant.
          </p>
        </div>

        <HospitalFacilityControlManager />
      </div>
    </HmsAppShell>
  );
}
