"use client";

import React from "react";
import Link from "next/link";
import { Shield, Building2, Server, Cpu, Receipt, SlidersHorizontal, ShieldCheck, Database, FileText, Headphones } from "lucide-react";
import { SubscriptionManagerTable } from "../_super_admin_components/Subscriptions/SubscriptionManagerTable";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function SuperAdminTenantsPage() {
  return (
    <HmsAppShell title="Super Admin Platform Console">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Control Center Page Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                Multi-Tenant Governance
              </span>
              <span className="text-xs text-slate-400">SLA & Provisioning v2.4</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 flex items-center gap-2.5 tracking-tight">
              <Shield className="w-6 h-6 text-teal-400 shrink-0" />
              Hospital SaaS Multi-Tenant Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Global tenant provisioning, SLA health telemetry, multi-region hospital cluster allocation, and license governance.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300 self-start md:self-auto bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Isolated DB Schemas</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>ABDM Gateway M3 Active</span>
            </div>
          </div>
        </div>

        {/* Cross-Module Navigation Row */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/subscription-plans">
            <HmsButton size="sm" variant="secondary" icon={<Receipt className="w-4 h-4" />}>
              Subscriptions
            </HmsButton>
          </Link>
          <Link href="/feature-flags">
            <HmsButton size="sm" variant="secondary" icon={<SlidersHorizontal className="w-4 h-4" />}>
              Feature Flags
            </HmsButton>
          </Link>
          <Link href="/role-templates">
            <HmsButton size="sm" variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
              Role Templates
            </HmsButton>
          </Link>
          <Link href="/compliance-governance">
            <HmsButton size="sm" variant="secondary" icon={<Shield className="w-4 h-4" />}>
              Compliance &amp; Governance
            </HmsButton>
          </Link>
          <Link href="/global-masters">
            <HmsButton size="sm" variant="secondary" icon={<Database className="w-4 h-4" />}>
              Global Masters
            </HmsButton>
          </Link>
          <Link href="/platform-audit">
            <HmsButton size="sm" variant="secondary" icon={<FileText className="w-4 h-4" />}>
              Platform Audit
            </HmsButton>
          </Link>
          <Link href="/support-tickets">
            <HmsButton size="sm" variant="secondary" icon={<Headphones className="w-4 h-4" />}>
              Support Tickets
            </HmsButton>
          </Link>
        </div>

        {/* Enterprise Data Grid & Telemetry Controls */}
        <SubscriptionManagerTable />
      </div>
    </HmsAppShell>
  );
}
