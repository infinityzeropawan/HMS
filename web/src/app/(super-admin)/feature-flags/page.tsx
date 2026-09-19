"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HospitalFacilityControlManager } from "../_super_admin_components/FacilityControl/HospitalFacilityControlManager";

export default function FeatureFlagsPage() {
  return (
    <HmsAppShell title="Super Admin Platform Console">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <HospitalFacilityControlManager />
      </div>
    </HmsAppShell>
  );
}
