"use client";

import React from "react";
import Link from "next/link";
import { TpaClaimsTable } from "@/app/(billing)/_billing_components/InsuranceClaims/TpaClaimsTable";
import { ShieldCheck, Receipt, SlidersHorizontal, LayoutDashboard, TrendingUp } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function ClaimsPage() {
  return (
    <HmsAppShell title="TPA & Insurance Claims Console">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-purple-600" /> TPA & Insurance Claims Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage insurance pre-authorizations, claim submissions, query responses, and settlements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/billing">
              <HmsButton size="sm" variant="secondary" icon={<LayoutDashboard className="w-4 h-4" />}>
                Billing Hub
              </HmsButton>
            </Link>
            <Link href="/invoices">
              <HmsButton size="sm" variant="emerald" icon={<Receipt className="w-4 h-4" />}>
                GST Invoices
              </HmsButton>
            </Link>
            <Link href="/tariffs">
              <HmsButton size="sm" variant="secondary" icon={<SlidersHorizontal className="w-4 h-4" />}>
                Tariffs Master
              </HmsButton>
            </Link>
            <Link href="/revenue">
              <HmsButton size="sm" variant="secondary" icon={<TrendingUp className="w-4 h-4" />}>
                Revenue Analytics
              </HmsButton>
            </Link>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <TpaClaimsTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
