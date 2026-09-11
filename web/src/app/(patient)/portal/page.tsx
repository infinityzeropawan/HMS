"use client";

import React from "react";
import { Tabs } from "antd";
import { PatientReportViewer } from "../_patient_components/HealthRecords/PatientReportViewer";
import { AbhaConsentManager } from "../_patient_components/AbhaLinkage/AbhaConsentManager";
import { UserCheck, FileText, ShieldCheck } from "lucide-react";

export default function PatientPortalPage() {
  const items = [
    {
      key: "records",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <FileText className="w-4 h-4" /> My Health Records & e-Prescriptions
        </span>
      ),
      children: <PatientReportViewer />,
    },
    {
      key: "abha",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4" /> ABHA Linkage & Data Consents
        </span>
      ),
      children: <AbhaConsentManager />,
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-teal-600" /> Patient Self-Service Portal
            </h1>
            <p className="text-sm text-slate-500">Welcome, Sunil Verma &bull; UHID: P-2026-1049</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <Tabs defaultActiveKey="records" items={items} />
        </div>
      </div>
    </div>
  );
}
