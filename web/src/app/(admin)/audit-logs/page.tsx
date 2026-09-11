"use client";

import React from "react";
import { DpdpAuditLogTable } from "../_admin_components/AuditLogs/DpdpAuditLogTable";
import { ShieldCheck } from "lucide-react";

export default function AdminAuditLogsPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-600" /> DPDP Act & ABDM Compliance Audit Log
          </h1>
          <p className="text-sm text-slate-500">Immutable Read-Only Access Event Audit Trail</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <DpdpAuditLogTable />
      </div>
    </div>
  );
}
