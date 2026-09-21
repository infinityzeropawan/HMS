"use client";

import React, { useEffect, useState } from "react";
import { Tag } from "antd";
import { ClipboardList, ShieldCheck, UserCheck, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { Patient360DrawerModal } from "../Patient360/Patient360DrawerModal";

interface SavedHandover {
  id: string;
  outgoingNurse: string;
  incomingNurse: string;
  shift: string;
  ward: string;
  criticalNotes: string;
  createdAt: string;
}

export const NurseHandoverCenterPanel: React.FC = () => {
  const admissions = useIpdStore((state) => state.admissions);
  const [selectedUhid, setSelectedUhid] = useState<string | null>(null);
  const [handoverSummaries, setHandoverSummaries] = useState<
    Array<{
      id: string;
      shift: string;
      ward: string;
      outgoing: string;
      incoming: string;
      status: "ACCEPTED" | "PENDING_REVIEW";
      notes: string;
      uhid: string;
      patientName: string;
      bedNumber: string;
    }>
  >([]);

  useEffect(() => {
    let savedList: SavedHandover[] = [];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hms_nurse_handovers");
        if (saved) {
          savedList = JSON.parse(saved);
        }
      } catch {
        /* ignore */
      }
    }

    if (savedList.length > 0) {
      const mapped = savedList.map((ho, idx) => {
        const matchingAdm = admissions[idx % admissions.length];
        return {
          id: ho.id,
          shift: ho.shift,
          ward: ho.ward,
          outgoing: ho.outgoingNurse,
          incoming: ho.incomingNurse,
          status: "ACCEPTED" as const,
          notes: ho.criticalNotes,
          uhid: matchingAdm?.uhid || "P-2026-9912",
          patientName: matchingAdm?.patientName || "Sunil Verma",
          bedNumber: matchingAdm?.bedNumber || "ICU-BED-01",
        };
      });
      setHandoverSummaries(mapped);
    } else {
      setHandoverSummaries([
        {
          id: "ho1",
          shift: "Morning (07:00 - 15:00)",
          ward: "Intensive Care Unit (ICU)",
          outgoing: "Nurse Sunita Deshmukh",
          incoming: "Nurse Kavita Roy",
          status: "ACCEPTED",
          notes: "Post-PTCA care stable. Troponin levels checked.",
          uhid: admissions[0]?.uhid || "P-2026-9912",
          patientName: admissions[0]?.patientName || "Sunil Verma",
          bedNumber: admissions[0]?.bedNumber || "ICU-BED-01",
        },
        {
          id: "ho2",
          shift: "Evening (15:00 - 23:00)",
          ward: "Female Surgical Ward 3B",
          outgoing: "Nurse Kavita Roy",
          incoming: "Duty Nurse Station",
          status: "PENDING_REVIEW",
          notes: "Physiotherapy completed for TKA patient.",
          uhid: admissions[1]?.uhid || "P-2026-9944",
          patientName: admissions[1]?.patientName || "Anita Roy",
          bedNumber: admissions[1]?.bedNumber || "WARD-3B-04",
        },
      ]);
    }
  }, [admissions]);

  const acceptedCount = handoverSummaries.filter((h) => h.status === "ACCEPTED").length;
  const pendingCount = handoverSummaries.filter((h) => h.status === "PENDING_REVIEW").length;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" /> Shift Handover & Duty Transfer Command Center
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">ISBAR shift handover logs, digital PIN signatures, and incoming nurse sign-offs.</p>
        </div>
        <Link href="/handover" className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1">
          Handover Console &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
          <span className="text-xs font-bold text-emerald-800 uppercase">Accepted Handovers</span>
          <h4 className="text-xl font-bold text-emerald-900 mt-0.5">{acceptedCount} Handovers</h4>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
          <span className="text-xs font-bold text-amber-800 uppercase">Pending Review</span>
          <h4 className="text-xl font-bold text-amber-900 mt-0.5">{pendingCount} Reviews</h4>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase">Active Ward Shift Handover Logs</h4>
        <div className="space-y-2">
          {handoverSummaries.map((ho) => (
            <div
              key={ho.id}
              onClick={() => setSelectedUhid(ho.uhid)}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:border-teal-400 transition-all flex justify-between items-center text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span className="font-mono text-xs bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">{ho.bedNumber}</span>
                  {ho.patientName} &bull; <span className="font-mono text-slate-500 text-xs">{ho.shift}</span>
                </div>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Outgoing: {ho.outgoing} &rarr; Incoming: {ho.incoming} &bull; {ho.notes}
                </p>
              </div>
              <Tag color={ho.status === "ACCEPTED" ? "emerald" : "warning"} className="text-xs font-bold font-mono">
                {ho.status}
              </Tag>
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
