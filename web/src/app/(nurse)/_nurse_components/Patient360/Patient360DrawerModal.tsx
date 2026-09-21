"use client";

import React from "react";
import { Drawer, Tag, Divider, Badge } from "antd";
import { User, Activity, Heart, ShieldAlert, Pill, FileText, Clock, Stethoscope, Bed, AlertTriangle, Scissors } from "lucide-react";
import { EmrService } from "@/app/(patient)/_patient_services/emr_service";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useOtStore } from "@/app/(ot)/_ot_stores/ot_store";

interface Patient360DrawerModalProps {
  open: boolean;
  onClose: () => void;
  uhid?: string;
  ipdId?: string;
}

export const Patient360DrawerModal: React.FC<Patient360DrawerModalProps> = ({
  open,
  onClose,
  uhid,
  ipdId,
}) => {
  const admissions = useIpdStore((state) => state.admissions);
  const surgeries = useOtStore((state) => state.surgeries);

  const activeAdmission = admissions.find(
    (a) => (ipdId && (a.admissionNo === ipdId || a.id === ipdId)) || (uhid && a.uhid === uhid)
  );

  const targetUhid = uhid || activeAdmission?.uhid || "P-2026-1049";
  const profile = EmrService.getPatientEmrProfile(targetUhid);
  const demographics = profile.demographics;

  const patientSurgeries = surgeries.filter((s) => s.uhid === targetUhid || (ipdId && s.ipdId === ipdId));

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">{demographics.fullName}</h3>
              <p className="text-3xs text-slate-400 font-mono">
                UHID: {demographics.uhid} &bull; Age/Sex: {demographics.age || 45}Y / {demographics.gender}
              </p>
            </div>
          </div>
          {activeAdmission && (
            <Tag color="teal" className="font-bold font-mono">
              Bed {activeAdmission.bedNumber} ({activeAdmission.admissionNo})
            </Tag>
          )}
        </div>
      }
      width={640}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Inpatient Admission Summary Header */}
        {activeAdmission && (
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-3xs font-bold text-teal-800 uppercase tracking-wider">Active Inpatient Stay</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{activeAdmission.primaryDiagnosis || "Inpatient Care"}</h4>
              </div>
              <Tag color={activeAdmission.roundStatus === "CRITICAL" ? "rose" : "emerald"}>
                {activeAdmission.roundStatus || "ADMITTED"}
              </Tag>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-mono pt-1 border-t border-teal-200/60">
              <div>Ward: <strong>{activeAdmission.admittedWard}</strong></div>
              <div>Doctor: <strong>{activeAdmission.attendingDoctor}</strong></div>
              <div>Nurse: <strong>{activeAdmission.attendingNurse || "Duty Nurse"}</strong></div>
              <div>Admitted: <strong>{activeAdmission.admissionDate}</strong></div>
            </div>

            {activeAdmission.lastRoundNote && (
              <div className="mt-2 pt-2 border-t border-teal-200 text-xs text-teal-950 font-mono bg-white/75 p-2 rounded-lg">
                <span className="font-bold text-teal-800 block">Latest Inpatient Round / Post-Op Note:</span>
                {activeAdmission.lastRoundNote}
              </div>
            )}
          </div>
        )}

        {/* OT & Surgical Procedures */}
        <div>
          <h4 className="font-bold text-slate-800 text-xs uppercase mb-2 flex items-center gap-1.5">
            <Scissors className="w-4 h-4 text-purple-600" /> Surgical Suite & OT History
          </h4>
          {patientSurgeries.length > 0 ? (
            <div className="space-y-2">
              {patientSurgeries.map((surg) => (
                <div key={surg.id} className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-purple-900">{surg.procedureName}</span>
                    <Tag color={surg.status === "COMPLETED" ? "emerald" : surg.status === "IN_PROGRESS" ? "gold" : "purple"}>
                      {surg.status}
                    </Tag>
                  </div>
                  <div className="flex justify-between text-3xs text-slate-600 font-mono">
                    <span>Suite: {surg.otRoom} ({surg.surgeryCode})</span>
                    <span>PAC: {surg.pacClearance}</span>
                  </div>
                  <div className="text-3xs text-slate-600">
                    Surgeon: <strong>{surg.surgeonName}</strong> | Anaesthetist: {surg.anaesthetistName}
                  </div>
                  {surg.procedureNotes && (
                    <div className="text-3xs text-slate-700 bg-white/80 p-1.5 rounded border border-purple-100">
                      <strong>Notes:</strong> {surg.procedureNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No surgical procedures logged for this admission.</p>
          )}
        </div>

        <Divider className="my-2" />

        {/* Live Vitals Header */}
        {activeAdmission?.vitals && (
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase mb-2 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" /> Current Bedside Vitals
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-3xs text-slate-400 block uppercase">Blood Pressure</span>
                <span className="font-mono text-xs font-bold text-slate-900">{activeAdmission.vitals.bp}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-3xs text-slate-400 block uppercase">Pulse Rate</span>
                <span className="font-mono text-xs font-bold text-slate-900">{activeAdmission.vitals.pulse} BPM</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-3xs text-slate-400 block uppercase">SpO2 Oxygen</span>
                <span className={`font-mono text-xs font-bold ${activeAdmission.vitals.spO2 < 94 ? "text-rose-600" : "text-emerald-700"}`}>
                  {activeAdmission.vitals.spO2}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-3xs text-slate-400 block uppercase">Temperature</span>
                <span className="font-mono text-xs font-bold text-slate-900">{activeAdmission.vitals.temp}</span>
              </div>
            </div>
          </div>
        )}

        <Divider className="my-2" />

        {/* Allergies & Clinical Alerts */}
        <div>
          <h4 className="font-bold text-slate-800 text-xs uppercase mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Allergies & Clinical Risk Flags
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.snapshot.allergies && profile.snapshot.allergies.length > 0 ? (
              profile.snapshot.allergies.map((alg, i) => (
                <Tag color="error" key={i} className="font-semibold">
                  ⚠️ {alg.allergen} ({alg.severity} {alg.reaction})
                </Tag>
              ))
            ) : (
              <Tag color="green">No Known Drug Allergies (NKDA)</Tag>
            )}
            <Tag color="orange">Fall Risk: Moderate</Tag>
            <Tag color="purple">Strict I/O Monitoring</Tag>
          </div>
        </div>

        <Divider className="my-2" />

        {/* Longitudinal EMR Timeline */}
        <div>
          <h4 className="font-bold text-slate-800 text-xs uppercase mb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" /> Unified Longitudinal EMR Timeline
          </h4>
          <div className="space-y-3 pl-2 border-l-2 border-slate-200">
            {profile.timeline.slice(0, 8).map((evt) => (
              <div key={evt.id} className="relative pl-4 text-xs space-y-0.5">
                <div className="absolute -left-[17px] top-0.5 w-2.5 h-2.5 rounded-full bg-teal-600 border-2 border-white" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{evt.title}</span>
                  <span className="font-mono text-3xs text-slate-400">{evt.timestamp}</span>
                </div>
                <p className="text-slate-600">{evt.subtitle}</p>
                <p className="text-3xs font-mono text-slate-400">Provider: {evt.provider}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
