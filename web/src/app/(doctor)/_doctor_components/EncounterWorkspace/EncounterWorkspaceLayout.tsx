"use client";

import React, { useState, useEffect } from "react";
import { SoapPane } from "./Panes/SoapPane";
import { DiagnosisPane } from "./Panes/DiagnosisPane";
import { PrescriptionPane } from "./Panes/PrescriptionPane";
import { DiagnosticsOrderPane } from "./Panes/DiagnosticsOrderPane";
import { DoctorClinicalAlertsPanel } from "./DoctorClinicalAlertsPanel";
import { FollowUpModal } from "./FollowUpModal";
import { Activity, ArrowLeft, Calendar, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { EncounterService } from "../../_doctor_services/encounter_service";
import { PatientContextProvider, usePatientContext } from "@/app/(patient)/_patient_context/PatientContext";
import { Tag } from "antd";

interface EncounterWorkspaceLayoutProps {
  patientUhid: string;
}

const InnerWorkspaceLayout: React.FC<{ patientUhid: string }> = ({ patientUhid }) => {
  const { profile, patient360, flags } = usePatientContext();

  const [activePane, setActivePane] = useState<"NOTES" | "DIAGNOSTICS">("NOTES");
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(true);

  const patientName = profile.fullName || "Sunil Verma";
  const ageGender = `${profile.age || 45}${profile.gender?.[0]?.toUpperCase() || "M"}`;
  const initials = patientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SV";

  useEffect(() => {
    EncounterService.getOrCreateEncounter(profile.uhid, patientName, ageGender);
  }, [profile.uhid, patientName, ageGender]);

  return (
    <div className="flex flex-col min-h-screen lg:h-screen bg-slate-100">
      {/* Top Patient Info Header Bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <HmsButton href="/doctor/queue" icon={<ArrowLeft className="w-4 h-4" />} variant="secondary" size="sm">
            Queue
          </HmsButton>
          <div className="flex items-center gap-2 border-l border-slate-700 pl-3 sm:pl-4">
            <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-sm">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">{patientName} &bull; {ageGender}</h2>
                <Tag color="cyan" className="text-[10px] py-0 px-1.5">{profile.mrn}</Tag>
                {flags.highRisk && <Tag color="error" className="text-[10px] py-0 px-1.5 font-bold">HIGH RISK</Tag>}
                {flags.allergyAlert && <Tag color="warning" className="text-[10px] py-0 px-1.5 font-bold">ALLERGY ALERT</Tag>}
              </div>
              <p className="text-xs text-slate-400">
                UHID: <span className="font-mono font-semibold text-teal-300">{profile.uhid}</span> | OPD Clinic 3
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>BP: <strong>130/85</strong> mmHg</span>
          </div>
          <div className="bg-slate-800 px-2.5 py-1 rounded-md">Temp: <strong>98.6°F</strong></div>
          <div className="bg-slate-800 px-2.5 py-1 rounded-md">Pulse: <strong>74 BPM</strong></div>
          <div className="bg-slate-800 px-2.5 py-1 rounded-md">Blood: <strong>{profile.bloodGroup?.replace("_", " ") || "O+"}</strong></div>

          <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
            <button
              onClick={() => setShowAlertsPanel((prev) => !prev)}
              className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                showAlertsPanel ? "bg-rose-900/60 text-rose-200 border border-rose-700" : "bg-slate-800 text-slate-300"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Clinical Alerts</span>
              {showAlertsPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={() => setActivePane(activePane === "NOTES" ? "DIAGNOSTICS" : "NOTES")}
              className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                activePane === "DIAGNOSTICS" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {activePane === "NOTES" ? "Order Lab/Rad Scans" : "View Clinical Notes"}
            </button>

            <HmsButton
              variant="emerald"
              size="sm"
              icon={<Calendar className="w-3.5 h-3.5" />}
              onClick={() => setFollowUpModalOpen(true)}
            >
              Follow-up
            </HmsButton>
          </div>
        </div>
      </header>

      {/* Main Responsive Grid Layout */}
      <main className="flex-1 p-4 overflow-y-auto lg:overflow-hidden space-y-4">
        {/* Collapsible Clinical Alerts Panel */}
        {showAlertsPanel && (
          <div className="shrink-0">
            <DoctorClinicalAlertsPanel uhid={profile.uhid} />
          </div>
        )}

        {/* Panes */}
        {activePane === "NOTES" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-1rem)]">
            <SoapPane />
            <DiagnosisPane patientUhid={profile.uhid} />
            <PrescriptionPane patientUhid={profile.uhid} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-1rem)]">
            <DiagnosticsOrderPane patientUhid={profile.uhid} />
            <PrescriptionPane patientUhid={profile.uhid} />
          </div>
        )}
      </main>

      {/* Follow-up Revisit Modal */}
      <FollowUpModal
        patientUhid={profile.uhid}
        patientName={patientName}
        open={followUpModalOpen}
        onClose={() => setFollowUpModalOpen(false)}
      />
    </div>
  );
};

export const EncounterWorkspaceLayout: React.FC<EncounterWorkspaceLayoutProps> = ({ patientUhid }) => {
  return (
    <PatientContextProvider initialUhid={patientUhid}>
      <InnerWorkspaceLayout patientUhid={patientUhid} />
    </PatientContextProvider>
  );
};
