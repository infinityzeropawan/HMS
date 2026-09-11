"use client";

import React from "react";
import { ReorderAlertsTable } from "../_analytics_components/InventoryForecast/ReorderAlertsTable";
import { Package } from "lucide-react";

export default function AnalyticsInventoryPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-teal-600" /> Inventory Expiry & Re-order Alerts
          </h1>
          <p className="text-sm text-slate-500">Low Stock Forecasting & Automated Purchase Orders</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <ReorderAlertsTable />
      </div>
    </div>
  );
}
