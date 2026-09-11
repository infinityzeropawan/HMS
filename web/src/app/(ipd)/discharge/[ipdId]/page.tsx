"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AbdmDischargeSummaryForm } from "../../_ipd_components/DischargeSummary/AbdmDischargeSummaryForm";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ArrowLeft } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function IpdDischargePage() {
  const params = useParams();
  const ipdId = Array.isArray(params?.ipdId) ? params.ipdId[0] : params?.ipdId || "IPD-8801";

  return (
    <HmsAppShell title="ABDM M3 Discharge Summary" subtitle={`Clinical summary and discharge advice for ${ipdId}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <HmsButton href="/wards" icon={<ArrowLeft className="w-4 h-4" />} variant="secondary">
            Back to Inpatient Wards
          </HmsButton>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">ABDM M3 Discharge Summary</h1>
            <p className="text-sm text-slate-500">Record #{ipdId} &bull; Clinical Summary & Discharge Advice</p>
          </div>
        </div>

        <AbdmDischargeSummaryForm ipdNo={ipdId} />
      </div>
    </HmsAppShell>
  );
}
