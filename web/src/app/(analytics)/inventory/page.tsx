"use client";

import React from "react";
import { ReorderAlertsTable } from "../_analytics_components/InventoryForecast/ReorderAlertsTable";
import { Package } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function AnalyticsInventoryPage() {
  return (
    <HmsAppShell title="Stock Expiry & Reorder Forecast">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-teal-600" /> Inventory Expiry & Re-order Alerts
            </h1>
            <p className="text-sm text-slate-500 mt-1">Low Stock Forecasting & Automated Purchase Orders</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <ReorderAlertsTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
