"use client";

import React from "react";
import { DpdpAuditLogTable } from "../_admin_components/AuditLogs/DpdpAuditLogTable";
import { ShieldCheck } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function AdminAuditLogsPage() {
  return (
    <HmsAppShell title="Audit Trail & DPDP Compliance">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-teal-600" /> DPDP Act & ABDM Compliance Audit Log
            </h1>
            <p className="text-sm text-slate-500 mt-1">Immutable Read-Only Access Event Audit Trail</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <DpdpAuditLogTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
