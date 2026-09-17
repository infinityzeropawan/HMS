"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Package, BarChart3, ArrowRight, DollarSign, Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

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

        {/* High-Level Intelligence KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Monthly Gross Revenue</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">₹48.2 Lakhs</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +14.2% vs Last Month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-indigo-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Average OPD Conversion</p>
                <h3 className="text-2xl font-bold text-indigo-800 mt-1">68.4%</h3>
                <p className="text-3xs text-indigo-600 font-semibold mt-0.5">OPD to Lab/IPD Admissions</p>
              </div>
              <Activity className="w-8 h-8 text-indigo-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Near-Expiry Drug SKUs</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">14 Batches</h3>
                <p className="text-3xs text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> FEFO Priority Alert
                </p>
              </div>
              <Package className="w-8 h-8 text-amber-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Insurance Claim Ratio</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">94.8%</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Approved First-Pass
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>
        </div>

        {/* Analytics Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Analytics Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl w-fit">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Revenue & Financial Analytics</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Breakdown of OPD consultations, IPD ward stays, OT procedure charges, pathology diagnostics, and pharmacy daily collections with target comparisons.
              </p>
            </div>
            <Link href="/revenue" className="pt-2">
              <HmsButton variant="primary" icon={<ArrowRight className="w-4 h-4" />} fullWidth>
                Open Revenue Dashboard
              </HmsButton>
            </Link>
          </div>

          {/* Inventory Forecast Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl w-fit">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Stock Expiry & Reorder Forecast</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Predictive stock consumption analysis, reorder point thresholds, FEFO batch expiry dates, and automated purchase order generation for central pharmacy.
              </p>
            </div>
            <Link href="/analytics/inventory" className="pt-2">
              <HmsButton variant="secondary" icon={<ArrowRight className="w-4 h-4" />} fullWidth>
                Open Stock Expiry & Forecast
              </HmsButton>
            </Link>
          </div>
        </div>
      </div>
    </HmsAppShell>
  );
}
