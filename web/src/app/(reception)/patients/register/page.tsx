"use client";

import React from "react";
import { PatientRegWizard } from "../../_reception_components/PatientRegistration/PatientRegWizard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ArrowLeft } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function PatientRegistrationPage() {
  return (
    <HmsAppShell title="Patient Registration Wizard">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <HmsButton href="/dashboard" icon={<ArrowLeft className="w-4 h-4" />} variant="secondary">
            Back to Reception
          </HmsButton>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Patient Registration Wizard</h1>
            <p className="text-sm text-slate-500">Demographics, Triage Vitals & Insurance Setup</p>
          </div>
        </div>

        <PatientRegWizard />
      </div>
    </HmsAppShell>
  );
}
