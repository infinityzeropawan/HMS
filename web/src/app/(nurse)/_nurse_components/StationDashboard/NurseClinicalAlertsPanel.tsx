"use client";

import React, { useState } from "react";
import { Tag } from "antd";
import { ShieldAlert, AlertTriangle, Pill, Flame } from "lucide-react";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useNotificationStore } from "@/lib/notification_store/notification.store";
import { EmrService } from "@/app/(patient)/_patient_services/emr_service";
import { Patient360DrawerModal } from "../Patient360/Patient360DrawerModal";

export const NurseClinicalAlertsPanel: React.FC = () => {
  const admissions = useIpdStore((state) => state.admissions) || [];
  const notifications = useNotificationStore((state) => state.notifications) || [];

  const [selectedUhid, setSelectedUhid] = useState<string | null>(null);

  // Critical Patients
  const criticalPatients = admissions.filter(
    (a) => a?.roundStatus === "CRITICAL" || (a?.vitals && (a.vitals.spO2 || 98) < 94)
  );

  // High Risk / Fall Risk Patients
  const fallRiskPatients = admissions.filter(
    (a) =>
      (a?.age || 0) >= 60 ||
      (a?.primaryDiagnosis &&
        (a.primaryDiagnosis.toLowerCase().includes("post-op") ||
          a.primaryDiagnosis.toLowerCase().includes("arthroplasty") ||
          a.primaryDiagnosis.toLowerCase().includes("fracture") ||
          a.primaryDiagnosis.toLowerCase().includes("stroke")))
  );

  // Escalated Orders from Notification Store
  const escalatedAlerts = notifications.filter(
    (n) => n?.category === "ESCALATION" || n?.priority === "critical"
  );

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" /> Ward Clinical Alerts Command Center
        </h3>
        <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
          {criticalPatients.length + escalatedAlerts.length} Active Ward Alerts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Critical & Low SpO2 Alerts */}
        <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-rose-900 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Critical Vitals & Hypoxia ({criticalPatients.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {criticalPatients.length > 0 ? (
              criticalPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedUhid(p.uhid)}
                  className="p-2 rounded-lg bg-white border border-rose-200 cursor-pointer hover:border-rose-400 transition-all flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{p.patientName}</span>
                    <span className="block text-xs font-mono text-slate-500">
                      Bed {p.bedNumber} &bull; SpO2:{" "}
                      <strong className="text-rose-600">
                        {p.vitals?.spO2 !== undefined ? `${p.vitals.spO2}%` : "Pending Check"}
                      </strong>
                    </span>
                  </div>
                  <Tag color="error" className="text-xs font-bold font-mono">CRITICAL</Tag>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No critical vital alerts.</p>
            )}
          </div>
        </div>

        {/* Fall & Allergy Risk Alerts */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-amber-900 flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-600" /> Fall Risk & Allergy Watch ({fallRiskPatients.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {fallRiskPatients.slice(0, 3).map((p) => {
              const profile = EmrService.getPatientEmrProfile(p.uhid);
              const allergyText =
                profile.snapshot.allergies && profile.snapshot.allergies.length > 0
                  ? profile.snapshot.allergies.map((a: { allergen: string }) => a.allergen).join(", ")
                  : "NKDA";

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedUhid(p.uhid)}
                  className="p-2 rounded-lg bg-white border border-amber-200 cursor-pointer hover:border-amber-400 transition-all flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{p.patientName} ({p.age}Y)</span>
                    <span className="block text-xs font-mono text-slate-500">
                      Bed {p.bedNumber} &bull; Allergy: {allergyText}
                    </span>
                  </div>
                  <Tag color="warning" className="text-xs font-bold font-mono">FALL RISK</Tag>
                </div>
              );
            })}
          </div>
        </div>

        {/* Escalated STAT Doctor Orders */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-purple-900 flex items-center gap-1">
              <Pill className="w-4 h-4 text-purple-600" /> Escalated Doctor Orders ({escalatedAlerts.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {escalatedAlerts.length > 0 ? (
              escalatedAlerts.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelectedUhid(n.patientId || admissions[0]?.uhid)}
                  className="p-2 rounded-lg bg-white border border-purple-200 cursor-pointer hover:border-purple-400 transition-all text-xs"
                >
                  <div className="font-bold text-purple-950 truncate">{n.title}</div>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{n.body}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No escalated doctor alerts.</p>
            )}
          </div>
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
