"use client";

import React from "react";
import { RevenueAnalyticsChart } from "../_analytics_components/RevenueReport/RevenueAnalyticsChart";
import { TrendingUp } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function AnalyticsRevenuePage() {
  return (
    <HmsAppShell title="Revenue Analytics & Reports">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-teal-600" /> Revenue & Financial Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">OPD & IPD Revenue Breakdown, Daily Collections & Payout Analysis</p>
          </div>
        </div>

        <RevenueAnalyticsChart />
      </div>
    </HmsAppShell>
  );
}
