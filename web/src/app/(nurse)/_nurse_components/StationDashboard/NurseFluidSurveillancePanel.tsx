"use client";

import React, { useEffect, useState } from "react";
import { Tag } from "antd";
import { Droplet, Scale, ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { Patient360DrawerModal } from "../Patient360/Patient360DrawerModal";

interface LocalFluidEntry {
  id: string;
  patientName: string;
  bedNumber: string;
  intakeIvMl: number;
  intakeOralMl: number;
  outputUrineMl: number;
  outputDrainMl: number;
}

export const NurseFluidSurveillancePanel: React.FC = () => {
  const admissions = useIpdStore((state) => state.admissions);
  const [selectedUhid, setSelectedUhid] = useState<string | null>(null);
  const [fluidSummaries, setFluidSummaries] = useState<
    Array<{
      id: string;
      uhid: string;
      patientName: string;
      bedNumber: string;
      intake: number;
      output: number;
      net: number;
      status: "POSITIVE" | "NEGATIVE" | "CRITICAL_POSITIVE";
      notes: string;
    }>
  >([]);

  useEffect(() => {
    let logs: LocalFluidEntry[] = [];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hms_nurse_fluid_logs");
        if (saved) {
          logs = JSON.parse(saved);
        }
      } catch {
        /* ignore */
      }
    }

    if (logs.length > 0) {
      // Group by bed/patient
      const map = new Map<string, { intake: number; output: number; patientName: string; bedNumber: string }>();
      logs.forEach((l) => {
        const key = l.bedNumber || l.patientName;
        const cur = map.get(key) || { intake: 0, output: 0, patientName: l.patientName, bedNumber: l.bedNumber };
        cur.intake += (l.intakeIvMl || 0) + (l.intakeOralMl || 0);
        cur.output += (l.outputUrineMl || 0) + (l.outputDrainMl || 0);
        map.set(key, cur);
      });

      const summaries = Array.from(map.entries()).map(([key, val], idx) => {
        const matchingAdm = admissions.find((a) => a.bedNumber === val.bedNumber || a.patientName === val.patientName);
        const net = val.intake - val.output;
        const status = net > 750 ? "CRITICAL_POSITIVE" : net >= 0 ? "POSITIVE" : "NEGATIVE";
        return {
          id: `fl-sum-${idx}`,
          uhid: matchingAdm?.uhid || "P-2026-9912",
          patientName: val.patientName,
          bedNumber: val.bedNumber,
          intake: val.intake,
          output: val.output,
          net,
          status: status as "POSITIVE" | "NEGATIVE" | "CRITICAL_POSITIVE",
          notes: status === "CRITICAL_POSITIVE" ? "Fluid overload watch" : "Shift balance recorded",
        };
      });

      setFluidSummaries(summaries);
    } else {
      // Default baseline from admissions
      setFluidSummaries([
        {
          id: "fl1",
          uhid: admissions[0]?.uhid || "P-2026-9912",
          patientName: admissions[0]?.patientName || "Sunil Verma",
          bedNumber: admissions[0]?.bedNumber || "ICU-BED-01",
          intake: 1150,
          output: 450,
          net: 700,
          status: "POSITIVE",
          notes: "Post-op fluid resuscitation ongoing.",
        },
        {
          id: "fl2",
          uhid: admissions[2]?.uhid || "P-2026-9978",
          patientName: admissions[2]?.patientName || "Rajesh Kulkarni",
          bedNumber: admissions[2]?.bedNumber || "DELUXE-402",
          intake: 1100,
          output: 300,
          net: 800,
          status: "CRITICAL_POSITIVE",
          notes: "Fluid overload risk — Nephrology review requested.",
        },
        {
          id: "fl3",
          uhid: admissions[1]?.uhid || "P-2026-9944",
          patientName: admissions[1]?.patientName || "Anita Roy",
          bedNumber: admissions[1]?.bedNumber || "WARD-3B-04",
          intake: 800,
          output: 950,
          net: -150,
          status: "NEGATIVE",
          notes: "Diuretic therapy effective.",
        },
      ]);
    }
  }, [admissions]);

  const positiveCount = fluidSummaries.filter((f) => f.net > 0).length;
  const negativeCount = fluidSummaries.filter((f) => f.net < 0).length;
  const criticalCount = fluidSummaries.filter((f) => f.status === "CRITICAL_POSITIVE").length;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Droplet className="w-5 h-5 text-teal-600" /> Fluid Balance Surveillance & Hydration Desk
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">24-Hour Cumulative Intake/Output balance monitoring and oliguria/fluid overload warnings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
          <span className="text-xs font-bold text-blue-800 uppercase">Positive Net Balance</span>
          <h4 className="text-xl font-bold text-blue-900 mt-0.5">{positiveCount} Patients (+mL)</h4>
        </div>
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
          <span className="text-xs font-bold text-purple-800 uppercase">Negative Net Balance</span>
          <h4 className="text-xl font-bold text-purple-900 mt-0.5">{negativeCount} Patients (-mL)</h4>
        </div>
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
          <span className="text-xs font-bold text-rose-800 uppercase">Critical Fluid Overload</span>
          <h4 className="text-xl font-bold text-rose-900 mt-0.5">{criticalCount} Patients Alert</h4>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase">Current Inpatient Fluid Summary</h4>
        <div className="space-y-2">
          {fluidSummaries.map((fl) => (
            <div
              key={fl.id}
              onClick={() => setSelectedUhid(fl.uhid)}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:border-teal-400 transition-all flex justify-between items-center text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span className="font-mono text-xs bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">{fl.bedNumber}</span>
                  {fl.patientName}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  In: {fl.intake} mL | Out: {fl.output} mL &bull; Notes: {fl.notes}
                </p>
              </div>
              <div className="text-right">
                <span className={`font-mono text-xs font-black block ${fl.net >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                  {fl.net >= 0 ? `+${fl.net}` : fl.net} mL
                </span>
                {fl.status === "CRITICAL_POSITIVE" && (
                  <Tag color="error" className="text-xs font-bold font-mono mt-0.5">REVIEW REQUIRED</Tag>
                )}
              </div>
            </div>
          ))}
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
