"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HospitalDepartmentManager } from "../_admin_components/Departments/HospitalDepartmentManager";
import { Building2 } from "lucide-react";

export default function DepartmentsPage() {
  return (
    <HmsAppShell title="Department & Specialization Master">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" /> Hospital Department & Specialization Master
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure clinical OPD specializations, inpatient wards, ICUs, emergency triage, diagnostic labs, and support units.
          </p>
        </div>

        <HospitalDepartmentManager />
      </div>
    </HmsAppShell>
  );
}
