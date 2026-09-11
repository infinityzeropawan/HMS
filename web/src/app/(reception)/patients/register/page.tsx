"use client";

import React from "react";
import { PatientRegWizard } from "../../_reception_components/PatientRegistration/PatientRegWizard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PatientRegistrationPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto mb-6 flex items-center gap-4">
        <Link href="/dashboard">
          <HmsButton icon={<ArrowLeft className="w-4 h-4" />} variant="secondary">
            Back to Reception Desk
          </HmsButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Registration Wizard</h1>
          <p className="text-sm text-slate-500">Demographics, Triage Vitals & Insurance Setup</p>
        </div>
      </div>

      <PatientRegWizard />
    </div>
  );
}
