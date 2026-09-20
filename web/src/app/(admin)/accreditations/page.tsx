"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { AccreditationComplianceManager } from "../_admin_components/Accreditations/AccreditationComplianceManager";
import { Award } from "lucide-react";

export default function AccreditationsPage() {
  return (
    <HmsAppShell title="Accreditations & Quality Compliance">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-teal-600" /> NABH, NABL & Quality Compliance Matrix
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track National Accreditation Board for Hospitals (NABH), NABL lab compliance, ISO certificates, and fire safety NOCs.
          </p>
        </div>

        <AccreditationComplianceManager />
      </div>
    </HmsAppShell>
  );
}
