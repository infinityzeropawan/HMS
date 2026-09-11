"use client";

import React from "react";
import { useParams } from "next/navigation";
import { MedicationAdminChecklist } from "../../_nurse_components/MarChecklist/MedicationAdminChecklist";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ArrowLeft, Pill } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function NurseMarPage() {
  const params = useParams();
  const ipdId = Array.isArray(params?.ipdId) ? params.ipdId[0] : params?.ipdId || "IPD-8801";

  return (
    <HmsAppShell title="Medication Administration Record" subtitle={`IPD admission ${ipdId}`}>
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <HmsButton href="/station" icon={<ArrowLeft className="w-4 h-4" />} variant="secondary">
            Back to Nurse Station
          </HmsButton>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-purple-600" /> MAR Checklist — {ipdId}
            </h1>
            <p className="text-sm text-slate-500">Patient: Sunil Verma &bull; Bed: ICU-01 &bull; Dr. Rajesh Sharma</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Medication Administration Record</h2>
          <MedicationAdminChecklist />
        </div>
      </div>
    </HmsAppShell>
  );
}
