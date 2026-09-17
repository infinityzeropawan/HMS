"use client";

import React from "react";
import Link from "next/link";
import { ReorderAlertsTable } from "../../_analytics_components/InventoryForecast/ReorderAlertsTable";
import { Package, TrendingUp, BarChart3, Pill } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function AnalyticsInventoryPage() {
  return (
    <HmsAppShell title="Stock Expiry & Reorder Forecast">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-teal-600" /> Inventory Expiry & Re-order Alerts
            </h1>
            <p className="text-sm text-slate-500 mt-1">Low Stock Forecasting & Automated Purchase Orders</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/analytics">
              <HmsButton size="sm" variant="secondary" icon={<BarChart3 className="w-4 h-4" />}>
                Analytics Hub
              </HmsButton>
            </Link>
            <Link href="/revenue">
              <HmsButton size="sm" variant="secondary" icon={<TrendingUp className="w-4 h-4" />}>
                Revenue Reports
              </HmsButton>
            </Link>
            <Link href="/inventory">
              <HmsButton size="sm" variant="emerald" icon={<Pill className="w-4 h-4" />}>
                Pharmacy Inventory
              </HmsButton>
            </Link>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <ReorderAlertsTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
