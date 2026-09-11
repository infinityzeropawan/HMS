"use client";

import React from "react";
import { Tabs } from "antd";
import { PatientReportViewer } from "../_patient_components/HealthRecords/PatientReportViewer";
import { AbhaConsentManager } from "../_patient_components/AbhaLinkage/AbhaConsentManager";
import { UserCheck, FileText, ShieldCheck } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";

export default function PatientPortalPage() {
  const user = useAuthUserStore((s) => s.user);
  const patientName = user?.username || "Sunil Verma";

  const items = [
    {
      key: "records",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <FileText className="w-4 h-4 text-teal-600" /> My Health Records & e-Prescriptions
        </span>
      ),
      children: <PatientReportViewer />,
    },
    {
      key: "abha",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-600" /> ABHA Linkage & Data Consents
        </span>
      ),
      children: <AbhaConsentManager />,
    },
  ];

  return (
    <HmsAppShell title="Patient Self-Service Portal">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-teal-600" /> Patient Self-Service Portal
            </h1>
            <p className="text-sm text-slate-500 mt-1">Welcome, {patientName} &bull; UHID: P-2026-1049</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <Tabs defaultActiveKey="records" items={items} />
        </div>
      </div>
    </HmsAppShell>
  );
}
