"use client";

import React from "react";
import { RevenueAnalyticsChart } from "../_analytics_components/RevenueReport/RevenueAnalyticsChart";
import { TrendingUp } from "lucide-react";

export default function AnalyticsRevenuePage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-600" /> Revenue & Financial Analytics
          </h1>
          <p className="text-sm text-slate-500">OPD & IPD Revenue Breakdown, Daily Collections & Payout Analysis</p>
        </div>
      </div>

      <RevenueAnalyticsChart />
    </div>
  );
}
