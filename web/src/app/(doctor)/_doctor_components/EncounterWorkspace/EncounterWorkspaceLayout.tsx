"use client";

import React from "react";
import { SoapPane } from "./Panes/SoapPane";
import { DiagnosisPane } from "./Panes/DiagnosisPane";
import { PrescriptionPane } from "./Panes/PrescriptionPane";
import { Activity, ArrowLeft } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface EncounterWorkspaceLayoutProps {
  patientUhid: string;
}

export const EncounterWorkspaceLayout: React.FC<EncounterWorkspaceLayoutProps> = ({
  patientUhid,
}) => {
  return (
    <div className="flex flex-col min-h-screen lg:h-screen bg-slate-100">
      {/* Top Patient Info Header Bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <HmsButton href="/queue" icon={<ArrowLeft className="w-4 h-4" />} variant="secondary" size="sm">
            Queue
          </HmsButton>
          <div className="flex items-center gap-2 border-l border-slate-700 pl-3 sm:pl-4">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-sm">
              SV
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Sunil Verma &bull; 45M</h2>
              <p className="text-xs text-slate-400">UHID: {patientUhid} | OPD Clinic 3</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>BP: <strong>130/85</strong> mmHg</span>
          </div>
          <div className="bg-slate-800 px-2.5 py-1 rounded-md">Temp: <strong>98.6°F</strong></div>
          <div className="bg-slate-800 px-2.5 py-1 rounded-md">Pulse: <strong>74 BPM</strong></div>
          <div className="bg-slate-800 px-2.5 py-1 rounded-md">Weight: <strong>72 kg</strong></div>
        </div>
      </header>

      {/* 3-Pane Responsive Grid */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto lg:overflow-hidden">
        <SoapPane />
        <DiagnosisPane />
        <PrescriptionPane />
      </main>
    </div>
  );
};
