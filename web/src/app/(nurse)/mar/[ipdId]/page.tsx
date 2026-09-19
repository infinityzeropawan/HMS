"use client";

import React from "react";
import { useParams } from "next/navigation";
import { MedicationAdminChecklist } from "../../_nurse_components/MarChecklist/MedicationAdminChecklist";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ArrowLeft, Pill } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";

export default function NurseMarPage() {
  const params = useParams();
  const ipdId = Array.isArray(params?.ipdId) ? params.ipdId[0] : params?.ipdId || "IPD-2026-0881";

  const admissions = useIpdStore((state) => state.admissions);
  const activeAdmission = admissions.find(
    (a) => a.admissionNo.toLowerCase() === ipdId.toLowerCase() || a.id.toLowerCase() === ipdId.toLowerCase()
  ) || admissions[0];

  const patientName = activeAdmission?.patientName || "Inpatient";
  const bedNumber = activeAdmission?.bedNumber || "Unassigned Bed";
  const attendingDoctor = activeAdmission?.attendingDoctor || "On-Call Medical Officer";
  const displayIpdId = activeAdmission?.admissionNo || ipdId;

  return (
    <HmsAppShell title="Medication Administration Record" subtitle={`IPD admission ${displayIpdId}`}>
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <HmsButton href="/station" icon={<ArrowLeft className="w-4 h-4" />} variant="secondary">
            Back to Nurse Station
          </HmsButton>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-purple-600" /> MAR Checklist — {displayIpdId}
            </h1>
            <p className="text-sm text-slate-500">
              Patient: <strong className="text-slate-800">{patientName}</strong> &bull; Bed: <strong className="text-slate-800">{bedNumber}</strong> &bull; {attendingDoctor}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Medication Administration Record Checklist</h2>
          <MedicationAdminChecklist ipdId={displayIpdId} uhid={activeAdmission?.uhid} />
        </div>
      </div>
    </HmsAppShell>
  );
}

