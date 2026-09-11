"use client";

import React from "react";
import { LabResultForm } from "../_lab_components/ResultEntry/LabResultForm";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function LabOrdersPage() {
  return (
    <HmsAppShell title="Laboratory Orders & Results Desk">
      <div className="max-w-7xl mx-auto">
        <LabResultForm />
      </div>
    </HmsAppShell>
  );
}
