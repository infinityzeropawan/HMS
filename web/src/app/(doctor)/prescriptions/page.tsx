"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { PrescriptionHistoryVault } from "../_doctor_components/Prescriptions/PrescriptionHistoryVault";
import { FileText } from "lucide-react";

export default function DoctorPrescriptionsPage() {
  return (
    <HmsAppShell title="e-Prescription History Vault">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" /> Doctor e-Prescription Vault & Signed History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search and view all digitally signed prescriptions written by you with letterhead print preview.
          </p>
        </div>

        <PrescriptionHistoryVault />
      </div>
    </HmsAppShell>
  );
}
