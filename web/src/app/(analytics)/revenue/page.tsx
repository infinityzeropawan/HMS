"use client";

import React from "react";
import Link from "next/link";
import { RevenueAnalyticsChart } from "../_analytics_components/RevenueReport/RevenueAnalyticsChart";
import { TrendingUp, Package, BarChart3, Receipt } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function AnalyticsRevenuePage() {
  return (
    <HmsAppShell title="Revenue Analytics & Financial Reports">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-teal-600" /> Revenue & Financial Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">OPD & IPD Revenue Breakdown, Daily Collections & Payout Analysis</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/analytics">
              <HmsButton size="sm" variant="secondary" icon={<BarChart3 className="w-4 h-4" />}>
                Analytics Hub
              </HmsButton>
            </Link>
            <Link href="/analytics/inventory">
              <HmsButton size="sm" variant="secondary" icon={<Package className="w-4 h-4" />}>
                Stock Forecast
              </HmsButton>
            </Link>
            <Link href="/billing">
              <HmsButton size="sm" variant="emerald" icon={<Receipt className="w-4 h-4" />}>
                Billing Desk
              </HmsButton>
            </Link>
          </div>
        </div>

        <RevenueAnalyticsChart />
      </div>
    </HmsAppShell>
  );
}
