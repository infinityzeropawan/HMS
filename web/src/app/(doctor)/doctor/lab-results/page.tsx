"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { LabResultsReviewInbox } from "../../_doctor_components/LabResults/LabResultsReviewInbox";
import { Microscope } from "lucide-react";

export default function DoctorLabResultsPage() {
  return (
    <HmsAppShell title="Diagnostic & Lab Results Review Inbox">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Microscope className="w-6 h-6 text-teal-600" /> Diagnostic & Lab Results Review Inbox
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review pathology test reports, critical panic alert values, radiology DICOM findings, and sign off lab reports.
          </p>
        </div>

        <LabResultsReviewInbox />
      </div>
    </HmsAppShell>
  );
}
