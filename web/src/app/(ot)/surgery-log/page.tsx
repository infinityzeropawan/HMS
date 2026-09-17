"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { IntraOpSurgeryLog } from "../_ot_components/SurgeryLog/IntraOpSurgeryLog";
import { ShieldCheck } from "lucide-react";

export default function OtSurgeryLogPage() {
  return (
    <HmsAppShell title="WHO Surgical Safety Checklist">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-600" /> WHO Surgical Safety Checklist & Intra-Op Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Execute 3-stage WHO Surgical Safety Verification (Sign-In, Time-Out, Sign-Out) and record intra-operative notes.
          </p>
        </div>

        <IntraOpSurgeryLog />
      </div>
    </HmsAppShell>
  );
}
