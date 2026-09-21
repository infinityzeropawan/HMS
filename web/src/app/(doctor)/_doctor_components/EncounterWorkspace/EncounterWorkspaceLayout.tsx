"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SoapPane } from "./Panes/SoapPane";
import { DiagnosisPane } from "./Panes/DiagnosisPane";
import { PrescriptionPane } from "./Panes/PrescriptionPane";
import { DiagnosticsOrderPane } from "./Panes/DiagnosticsOrderPane";
import { DoctorClinicalAlertsPanel } from "./DoctorClinicalAlertsPanel";
import { FollowUpModal } from "./FollowUpModal";
import { Activity, ArrowLeft, Calendar, ShieldAlert } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { EncounterService } from "../../_doctor_services/encounter_service";
import { useEncounterStore } from "../../_doctor_stores/encounter_store";
import { PatientProfileService } from "@/app/(patient)/_patient_services/patient_profile_service";
import { PatientRegistryService } from "@/app/(reception)/_reception_services/patient_registry_service";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";

interface EncounterWorkspaceLayoutProps {
  patientUhid: string;
}

export function EncounterWorkspaceLayout({
  patientUhid = "P-2026-1049",
}: EncounterWorkspaceLayoutProps) {
  const profile = PatientProfileService.getPatientProfile(patientUhid);
  const patientName = profile.fullName || "Sunil Verma";
  const ageGender = `${profile.age || 45} / ${profile.gender === "MALE" ? "M" : "F"}`;

  const [activePane, setActivePane] = useState<"NOTES" | "DIAGNOSTICS">("NOTES");
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);

  const vitals = useMemo(() => {
    const p = PatientRegistryService.findByUhid(profile.uhid);
    if (p?.systolicBp && p?.diastolicBp) {
      return {
        bp: `${p.systolicBp}/${p.diastolicBp}`,
        temp: p.temperatureF ? `${p.temperatureF}°F` : "98.6°F",
        pulse: p.pulseRate ? `${p.pulseRate} BPM` : "74 BPM",
      };
    }
    const ipd = useIpdStore.getState().admissions.find((a) => a.uhid === profile.uhid);
    if (ipd?.vitals) {
      return {
        bp: ipd.vitals.bp,
        temp: ipd.vitals.temp,
        pulse: `${ipd.vitals.pulse} BPM`,
      };
    }
    return { bp: "120/80", temp: "98.6°F", pulse: "72 BPM" };
  }, [profile.uhid]);

  useEffect(() => {
    useEncounterStore.getState().setActiveEncounter(profile.uhid);
    EncounterService.getOrCreateEncounter(profile.uhid, patientName, ageGender);
  }, [profile.uhid, patientName, ageGender]);

  return (
    <HmsAppShell title={`Clinical Encounter — ${patientName} (${profile.uhid})`}>
      <div className="flex flex-col min-h-screen bg-slate-100 -m-4 sm:-m-6">
        {/* Header Bar */}
        <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-md">
          <div className="flex items-center gap-3 sm:gap-4">
            <HmsButton href="/doctor/queue" icon={<ArrowLeft className="w-4 h-4" />} variant="secondary" size="sm">
              Queue
            </HmsButton>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">{patientName}</h1>
                <span className="bg-teal-500/20 text-teal-300 font-mono text-xs px-2 py-0.5 rounded border border-teal-500/30">
                  {profile.uhid}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {ageGender} | Blood: <strong className="text-rose-400">{profile.bloodGroup || "O+"}</strong> | Vitals: BP {vitals.bp}, Pulse {vitals.pulse}, Temp {vitals.temp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DoctorClinicalAlertsPanel uhid={profile.uhid} />
            <HmsButton size="sm" variant="secondary" icon={<Calendar className="w-4 h-4" />} onClick={() => setFollowUpModalOpen(true)}>
              Schedule Revisit
            </HmsButton>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex gap-2">
          <button
            onClick={() => setActivePane("NOTES")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activePane === "NOTES" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            SOAP Notes & Rx
          </button>
          <button
            onClick={() => setActivePane("DIAGNOSTICS")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activePane === "DIAGNOSTICS" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Orders & Diagnostics
          </button>
        </div>

        {/* Panes */}
        <div className="p-4 sm:p-6 flex-1">
          {activePane === "NOTES" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SoapPane />
              <DiagnosisPane patientUhid={profile.uhid} />
              <PrescriptionPane patientUhid={profile.uhid} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DiagnosticsOrderPane patientUhid={profile.uhid} />
              <PrescriptionPane patientUhid={profile.uhid} />
            </div>
          )}
        </div>

        {/* Follow-up Revisit Modal */}
        <FollowUpModal
          patientUhid={profile.uhid}
          patientName={patientName}
          open={followUpModalOpen}
          onClose={() => setFollowUpModalOpen(false)}
        />
      </div>
    </HmsAppShell>
  );
}
