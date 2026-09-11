"use client";

import React from "react";
import { SubscriptionManagerTable } from "../_super_admin_components/Subscriptions/SubscriptionManagerTable";
import { Shield, Building2 } from "lucide-react";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function SuperAdminTenantsPage() {
  return (
    <HmsAppShell title="Super Admin Platform Console">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-600" /> Super Admin Platform Control Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">Multi-Tenant Hospital Provisioning, Subscriptions & SLA Health</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Total Hospital Tenants</p>
                <h3 className="text-2xl font-bold text-teal-700 mt-1">3 Active Tenants</h3>
              </div>
              <Building2 className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Active Staff Licenses</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">237 / 315 Allocated</h3>
              </div>
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Provisioned Hospital Tenants</h2>
          <SubscriptionManagerTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
