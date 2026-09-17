"use client";

import React from "react";
import Link from "next/link";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import {
  Microscope,
  TestTube,
  Barcode,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { LabResultForm } from "../_lab_components/ResultEntry/LabResultForm";

export default function LabMainDashboard() {
  return (
    <HmsAppShell title="Laboratory & Diagnostics">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Microscope className="w-3.5 h-3.5" /> Pathology & Diagnostic Laboratory
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Central Pathology & Clinical Lab Console
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Phlebotomy sample collection, tube barcode tracking (EDTA/Serum), analyzer auto-comm, and panic result alerts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/lab/specimens">
                <HmsButton variant="emerald" icon={<TestTube className="w-4 h-4" />}>
                  Collect Specimen
                </HmsButton>
              </Link>
              <Link href="/lab/orders">
                <HmsButton variant="secondary" icon={<Microscope className="w-4 h-4" />}>
                  Lab Orders Queue
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Lab KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Pending Sample Collection</p>
                <h3 className="text-2xl font-bold text-purple-800 mt-1">3 Specimens</h3>
                <p className="text-3xs text-purple-600 font-semibold mt-0.5 font-mono">EDTA / Serum Tubes</p>
              </div>
              <TestTube className="w-8 h-8 text-purple-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Analyzer Auto-Runs</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">2 Tests Running</h3>
                <p className="text-3xs text-teal-600 font-semibold mt-0.5">Biochemistry Auto-Comm</p>
              </div>
              <Microscope className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-rose-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Critical Panic Alerts</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">1 Panic Alert</h3>
                <p className="text-3xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Serum K+ High
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Verified Lab Reports</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">18 Verified</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Pathologist Signed
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>
        </div>

        {/* Module Quick Link Navigation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Microscope className="w-5 h-5 text-purple-600" /> Laboratory Workspaces & Tools
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/lab/specimens"
              className="p-5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <TestTube className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Sample Collection & Barcoding</h3>
                <p className="text-xs text-slate-500 mt-0.5">Phlebotomy collection queue, tube barcode printing (EDTA/Serum), and analyzer dispatch.</p>
              </div>
            </Link>

            <Link
              href="/lab/orders"
              className="p-5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <Microscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Lab Orders & Report Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">Test entry, reference range checking, panic alert triggers, and verified PDF reports.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Lab Orders Table Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Microscope className="w-5 h-5 text-purple-600" /> Active Pathology Orders Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Select a test order to enter results and sign off.</p>
            </div>
            <Link href="/lab/orders">
              <HmsButton size="sm" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Orders Queue
              </HmsButton>
            </Link>
          </div>

          <LabResultForm />
        </div>
      </div>
    </HmsAppShell>
  );
}
