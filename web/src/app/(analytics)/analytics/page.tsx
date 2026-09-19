"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Package, BarChart3 } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ExecutiveAnalyticsDashboard } from "../_analytics_components/ExecutiveDashboard/ExecutiveAnalyticsDashboard";

export default function AnalyticsMainDashboard() {
  return (
    <HmsAppShell title="Analytics & Executive Intelligence Hub">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <BarChart3 className="w-3.5 h-3.5" /> Executive Intelligence & Predictive Analytics
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Hospital Analytics & Forecasting Control Center
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Financial revenue metrics, OPD/IPD patient throughput, pharmacy FEFO stock expiry predictions, and doctor payout analytics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/revenue">
                <HmsButton variant="emerald" icon={<TrendingUp className="w-4 h-4" />}>
                  Revenue Reports
                </HmsButton>
              </Link>
              <Link href="/analytics/inventory">
                <HmsButton variant="secondary" icon={<Package className="w-4 h-4" />}>
                  Stock Expiry Forecast
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Executive Analytics Interactive Dashboard */}
        <ExecutiveAnalyticsDashboard />
      </div>
    </HmsAppShell>
  );
}
