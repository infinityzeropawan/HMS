"use client";

import React from "react";
import { TpaClaimsTable } from "@/app/(billing)/_billing_components/InsuranceClaims/TpaClaimsTable";
import { ShieldCheck } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function ClaimsPage() {
  return (
    <HmsAppShell title="TPA & Insurance Claims Console">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-teal-600" /> TPA & Insurance Claims Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage insurance pre-authorizations, claim submissions, query responses, and settlements.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <TpaClaimsTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
