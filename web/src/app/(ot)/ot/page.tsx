"use client";

import React from "react";
import Link from "next/link";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import {
  Scissors,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Plus,
} from "lucide-react";
import { SurgerySchedulerTable } from "../_ot_components/OtSchedule/SurgerySchedulerTable";

export default function OtMainDashboard() {
  return (
    <HmsAppShell title="Operation Theatre Control Center">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Scissors className="w-3.5 h-3.5" /> Surgical Suite & OT Management
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Operation Theatre Control Center
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Surgical roster scheduling, Pre-Anaesthesia Clearance (PAC), WHO Surgical Safety Checklists, and intra-op logs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/ot/schedule">
                <HmsButton variant="emerald" icon={<Calendar className="w-4 h-4" />}>
                  Surgical Schedule Roster
                </HmsButton>
              </Link>
              <Link href="/ot/surgery-log">
                <HmsButton variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
                  WHO Safety Checklist
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* OT KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Surgeries Today</p>
                <h3 className="text-2xl font-bold text-purple-800 mt-1">3 Scheduled</h3>
                <p className="text-3xs text-purple-600 font-semibold mt-0.5">OT-01, OT-02, OT-03</p>
              </div>
              <Scissors className="w-8 h-8 text-purple-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Active OT Suites</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">1 In-Progress</h3>
                <p className="text-3xs text-teal-600 font-semibold mt-0.5">Cath Lab PTCA Active</p>
              </div>
              <Activity className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">PAC Clearance</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">3 / 3 Cleared</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Anaesthesia Approved
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">WHO Safety Verifications</p>
                <h3 className="text-2xl font-bold text-blue-800 mt-1">100% Verified</h3>
                <p className="text-3xs text-blue-600 font-semibold mt-0.5">Sign-In / Time-Out / Sign-Out</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
          </HmsCard>
        </div>

        {/* Quick Link Navigation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-purple-600" /> Operation Theatre Workspaces
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/ot/schedule"
              className="p-5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">OT Roster & Surgical Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">Multi-theatre booking matrix across OT-1, OT-2, OT-3, surgeon & PAC status.</p>
              </div>
            </Link>

            <Link
              href="/ot/surgery-log"
              className="p-5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">WHO Safety Checklist & Intra-Op Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">Stage 1-3 WHO safety verification, instrument/swab counts, and intra-op logs.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Live OT Schedule Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" /> Today&apos;s OT Surgical Schedule Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Surgical suite allocation and team roster.</p>
            </div>
            <Link href="/ot/schedule">
              <HmsButton size="sm" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full OT Grid
              </HmsButton>
            </Link>
          </div>

          <SurgerySchedulerTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
