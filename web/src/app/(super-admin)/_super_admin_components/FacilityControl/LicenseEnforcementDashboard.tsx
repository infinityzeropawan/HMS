"use client";

import React from "react";
import { CheckCircle2, XCircle, Lock, Clock, ShieldAlert, Cpu } from "lucide-react";
import { LicenseEnforcementStats } from "../../_super_admin_types/feature_management";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";

interface LicenseEnforcementDashboardProps {
  stats: LicenseEnforcementStats;
  tenantName: string;
}

export const LicenseEnforcementDashboard: React.FC<LicenseEnforcementDashboardProps> = ({
  stats,
  tenantName,
}) => {
  const total = stats.enabledCount + stats.disabledCount + stats.restrictedCount + stats.trialCount;
  const enabledPercentage = total > 0 ? Math.round((stats.enabledCount / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Global Kill Switch Banner */}
      {stats.globalKillSwitchActiveCount > 0 && (
        <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-extrabold text-rose-900">GLOBAL KILL-SWITCH ACTIVE:</span>
              <span className="ml-1.5 text-rose-800">
                {stats.globalKillSwitchActiveCount} feature(s) are globally disabled across all tenants.
              </span>
            </div>
          </div>
          <span className="font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
            Enforced System-wide
          </span>
        </div>
      )}

      {/* 4 KPI License Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* 1. Enabled Modules */}
        <HmsCard elevated className="!p-4 border-emerald-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Enabled Modules
            </span>
            <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.enabledCount}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {enabledPercentage}% Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Active for {tenantName}</p>
        </HmsCard>

        {/* 2. Disabled Modules */}
        <HmsCard elevated className="!p-4 border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Disabled Modules
            </span>
            <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200">
              <XCircle className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.disabledCount}</span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Inactive
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Inaccessible via navigation</p>
        </HmsCard>

        {/* 3. Restricted Modules */}
        <HmsCard elevated className="!p-4 border-amber-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Restricted Modules
            </span>
            <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-100">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.restrictedCount}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Tier Gated
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Requires plan tier upgrade</p>
        </HmsCard>

        {/* 4. Trial Modules */}
        <HmsCard elevated className="!p-4 border-sky-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Trial Modules
            </span>
            <div className="p-1.5 bg-sky-50 rounded-lg border border-sky-100">
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.trialCount}</span>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              Evaluation
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Temporary trial access</p>
        </HmsCard>
      </div>
    </div>
  );
};
