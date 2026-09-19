"use client";

import React, { useState } from "react";
import { Tag } from "antd";
import { HeartPulse, Activity, Flame, ShieldAlert, AlertTriangle } from "lucide-react";
import { useNurseVitalsStore } from "../../_nurse_stores/nurse_vitals_store";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { Patient360DrawerModal } from "../Patient360/Patient360DrawerModal";

export const NurseVitalsSurveillancePanel: React.FC = () => {
  const vitalsLogs = useNurseVitalsStore((state) => state.vitalsLogs);
  const admissions = useIpdStore((state) => state.admissions);
  const [selectedUhid, setSelectedUhid] = useState<string | null>(null);

  const abnormalBp = vitalsLogs.filter((v) => v.bpSystolic >= 140 || v.bpSystolic <= 90);
  const lowSpo2 = vitalsLogs.filter((v) => v.spO2Percent < 94);
  const highTemp = vitalsLogs.filter((v) => v.temperatureFahrenheit >= 100.4);
  const tachycardia = vitalsLogs.filter((v) => v.pulseRate > 100);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-600" /> Inpatient Vitals Surveillance & Warning Desk
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time alert monitoring for hypertension, hypoxia, fever spikes, and tachycardia.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
          <span className="text-3xs font-bold text-rose-800 uppercase">Abnormal BP (&ge;140)</span>
          <h4 className="text-xl font-bold text-rose-900 mt-0.5">{abnormalBp.length} Patients</h4>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
          <span className="text-3xs font-bold text-amber-800 uppercase">Hypoxia (&lt;94%)</span>
          <h4 className="text-xl font-bold text-amber-900 mt-0.5">{lowSpo2.length} Patients</h4>
        </div>
        <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-center">
          <span className="text-3xs font-bold text-orange-800 uppercase">Fever Spike (&ge;100.4°F)</span>
          <h4 className="text-xl font-bold text-orange-900 mt-0.5">{highTemp.length} Patients</h4>
        </div>
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
          <span className="text-3xs font-bold text-purple-800 uppercase">Tachycardia (&gt;100 BPM)</span>
          <h4 className="text-xl font-bold text-purple-900 mt-0.5">{tachycardia.length} Patients</h4>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase">Active Vitals Warning Stream</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {vitalsLogs.slice(0, 4).map((v) => {
            const isHighBp = v.bpSystolic >= 140;
            const isLowSpo2 = v.spO2Percent < 94;
            const isFever = v.temperatureFahrenheit >= 100.4;
            const hasWarning = isHighBp || isLowSpo2 || isFever;

            return (
              <div
                key={v.id}
                onClick={() => setSelectedUhid(v.uhid)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex justify-between items-center ${
                  hasWarning ? "bg-rose-50/60 border-rose-200 hover:border-rose-400" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="font-mono text-3xs bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">{v.bedNumber}</span>
                    {v.patientName}
                  </div>
                  <p className="text-3xs font-mono text-slate-500 mt-1">
                    BP: <strong className={isHighBp ? "text-rose-600" : ""}>{v.bpSystolic}/{v.bpDiastolic}</strong> &bull; SpO2: <strong className={isLowSpo2 ? "text-rose-600" : "text-emerald-700"}>{v.spO2Percent}%</strong> &bull; Temp: <strong>{v.temperatureFahrenheit}°F</strong>
                  </p>
                </div>
                {hasWarning ? (
                  <Tag color="error" className="text-3xs font-bold font-mono">WARNING</Tag>
                ) : (
                  <Tag color="success" className="text-3xs font-bold font-mono">NORMAL</Tag>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedUhid && (
        <Patient360DrawerModal
          open={!!selectedUhid}
          onClose={() => setSelectedUhid(null)}
          uhid={selectedUhid}
        />
      )}
    </div>
  );
};
