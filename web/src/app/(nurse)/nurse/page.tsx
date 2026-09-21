"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import {
  BedDouble,
  HeartPulse,
  Pill,
  ClipboardList,
  Droplet,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { NurseBedMatrixGrid } from "../_nurse_components/StationDashboard/NurseBedMatrixGrid";

export default function NurseMainDashboard() {
  return (
    <HmsAppShell title="Nurse Executive Station Dashboard">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <BedDouble className="w-3.5 h-3.5" /> Central Nurse Duty Station
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ICU & Inpatient Nursing Executive Console
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Sr. Kavita R. / Duty Station Nurse | Morning Shift (07:00 AM - 03:00 PM) | ICU & Ward Active Duty
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/vitals">
                <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />}>
                  Record Vitals
                </HmsButton>
              </Link>
              <Link href="/mar/IPD-2026-0881">
                <HmsButton variant="secondary" icon={<Pill className="w-4 h-4" />}>
                  MAR Medication Check
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Nursing KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Assigned Beds</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">8 Inpatients</h3>
                <p className="text-3xs text-slate-500 mt-0.5">ICU-01 to 04, Ward 3B</p>
              </div>
              <BedDouble className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">MAR Doses Due</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">2 Doses Now</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 5-Rights Verified
                </p>
              </div>
              <Pill className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-rose-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Doctor STAT Orders</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">2 Pending Tasks</h3>
                <p className="text-3xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Heparin IV & Dressing
                </p>
              </div>
              <ClipboardList className="w-8 h-8 text-rose-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Fluid I/O Net Balance</p>
                <h3 className="text-2xl font-bold text-blue-800 mt-1">+270 mL</h3>
                <p className="text-3xs text-blue-600 font-semibold mt-0.5">24-Hour Balance</p>
              </div>
              <Droplet className="w-8 h-8 text-blue-500" />
            </div>
          </HmsCard>
        </div>

        {/* Quick Shortcut Module Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-teal-600" /> Nurse Station Workspaces & Care Tools
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/station"
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl group-hover:scale-105 transition-transform">
                <BedDouble className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Ward Bed Matrix</span>
              <span className="text-3xs text-slate-400">Live Bed Occupancy</span>
            </Link>

            <Link
              href="/vitals"
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-rose-100 text-rose-700 rounded-xl group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Bedside Vitals</span>
              <span className="text-3xs text-slate-400">BP, SpO2 & Temp</span>
            </Link>

            <Link
              href="/mar/IPD-2026-0881"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">MAR Medication</span>
              <span className="text-3xs text-slate-400">Barcode Dose Check</span>
            </Link>

            <Link
              href="/fluid-chart"
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
                <Droplet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Fluid I/O Chart</span>
              <span className="text-3xs text-slate-400">Intake & Output</span>
            </Link>

            <Link
              href="/worklist"
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Doctor Orders</span>
              <span className="text-3xs text-slate-400">Nursing Worklist</span>
            </Link>

            <Link
              href="/handover"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Shift Handover</span>
              <span className="text-3xs text-slate-400">ISBAR Transfer Notes</span>
            </Link>
          </div>
        </div>

        {/* Live Ward Bed Matrix Grid Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-teal-600" /> Active Ward & ICU Bed Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Live patient bed occupancy and quick status badges.</p>
            </div>
            <Link href="/station">
              <HmsButton size="sm" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Station Grid
              </HmsButton>
            </Link>
          </div>

          <NurseBedMatrixGrid />
        </div>
      </div>
    </HmsAppShell>
  );
}
