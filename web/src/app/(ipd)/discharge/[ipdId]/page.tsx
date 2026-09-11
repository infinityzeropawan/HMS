"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AbdmDischargeSummaryForm } from "../../_ipd_components/DischargeSummary/AbdmDischargeSummaryForm";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function IpdDischargePage() {
  const params = useParams();
  const ipdId = Array.isArray(params?.ipdId) ? params.ipdId[0] : params?.ipdId || "IPD-8801";

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto mb-6 flex items-center gap-4">
        <Link href="/wards">
          <HmsButton icon={<ArrowLeft className="w-4 h-4" />} variant="secondary">
            Back to Inpatient Wards
          </HmsButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ABDM M3 Discharge Summary</h1>
          <p className="text-sm text-slate-500">Record #{ipdId} &bull; Clinical Summary & Discharge Advice</p>
        </div>
      </div>

      <AbdmDischargeSummaryForm ipdNo={ipdId} />
    </div>
  );
}
