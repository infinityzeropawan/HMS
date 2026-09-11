"use client";

import React from "react";
import { SoapPane } from "./Panes/SoapPane";
import { DiagnosisPane } from "./Panes/DiagnosisPane";
import { PrescriptionPane } from "./Panes/PrescriptionPane";
import { Activity, ArrowLeft } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import Link from "next/link";

interface EncounterWorkspaceLayoutProps {
  patientUhid: string;
}

export const EncounterWorkspaceLayout: React.FC<EncounterWorkspaceLayoutProps> = ({
  patientUhid,
}) => {
  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* Top Patient Info Header Bar */}
      <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/queue">
            <HmsButton icon={<ArrowLeft className="w-4 h-4" />} variant="secondary" size="sm">
              Queue
            </HmsButton>
          </Link>
          <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-sm">
              SV
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Sunil Verma &bull; 45M</h2>
              <p className="text-xs text-slate-400">UHID: {patientUhid} | OPD Clinic 3</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>BP: <strong>130/85</strong> mmHg</span>
          </div>
          <div>Temp: <strong>98.6°F</strong></div>
          <div>Pulse: <strong>74 BPM</strong></div>
          <div>Weight: <strong>72 kg</strong></div>
        </div>
      </header>

      {/* 3-Pane Responsive Grid */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        <SoapPane />
        <DiagnosisPane />
        <PrescriptionPane />
      </main>
    </div>
  );
};
