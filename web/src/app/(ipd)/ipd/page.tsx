"use client";

import React from "react";
import Link from "next/link";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import {
  BedDouble,
  Building2,
  FileCheck,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  Plus,
  TrendingUp,
} from "lucide-react";
import { IpdPatientCardGrid } from "../_ipd_components/WardCare/IpdPatientCardGrid";

export default function IpdMainDashboard() {
  return (
    <HmsAppShell title="Inpatient Department (IPD)">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <BedDouble className="w-3.5 h-3.5" /> Inpatient Department & Ward Management
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Inpatient Department (IPD) Control Center
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Bed allocation, ward management, TPA cashless clearance, medical discharge summaries, and bed release.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/ipd/admissions">
                <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />}>
                  Admit New Patient
                </HmsButton>
              </Link>
              <Link href="/ipd/discharge">
                <HmsButton variant="secondary" icon={<FileCheck className="w-4 h-4" />}>
                  Discharge Clearance
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* IPD KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Current Inpatients</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">148 Patients</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> 80% Occupancy Rate
                </p>
              </div>
              <BedDouble className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">ICU Beds Available</p>
                <h3 className="text-2xl font-bold text-purple-800 mt-1">6 Beds Free</h3>
                <p className="text-3xs text-slate-500 mt-0.5">Ventilator Ready</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">TPA Cashless Approved</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">42 Admissions</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Pre-Auth Granted
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Discharges Pending</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">4 Clearances</h3>
                <p className="text-3xs text-amber-600 font-semibold mt-0.5">Summary Drafted</p>
              </div>
              <FileCheck className="w-8 h-8 text-amber-500" />
            </div>
          </HmsCard>
        </div>

        {/* Quick Link Navigation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-teal-600" /> IPD Workspaces & Tools
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/ipd/admissions"
              className="p-5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Admission Desk & Bed Allocation</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register new admissions, select ward/bed, advance deposits, and TPA pre-auth.</p>
              </div>
            </Link>

            <Link
              href="/ipd/wards"
              className="p-5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Ward Matrix & Bed Board</h3>
                <p className="text-xs text-slate-500 mt-0.5">Interactive live bed occupancy, bed transfers, and attending nurse cues.</p>
              </div>
            </Link>

            <Link
              href="/ipd/discharge"
              className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Discharge Summary & Clearance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Medical discharge summary, medication reconciliation, final bill clearance, and bed release.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Ward Matrix Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-teal-600" /> Active Inpatient Bed Occupancy Board
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Live ward and bed status.</p>
            </div>
            <Link href="/ipd/wards">
              <HmsButton size="sm" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Ward View
              </HmsButton>
            </Link>
          </div>

          <IpdPatientCardGrid />
        </div>
      </div>
    </HmsAppShell>
  );
}
