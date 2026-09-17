"use client";

import React from "react";
import Link from "next/link";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import {
  Users,
  Fingerprint,
  Calendar,
  DollarSign,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { StaffShiftScheduler } from "../_hr_components/DutyRoster/StaffShiftScheduler";

export default function HrMainDashboard() {
  return (
    <HmsAppShell title="HR & Staff Management">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Users className="w-3.5 h-3.5" /> Human Resources & Staff Operations
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Hospital HR & Payroll Management Console
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Biometric duty attendance, doctor shift rosters, staff leave tracking, and consultant commission payouts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/hr/attendance">
                <HmsButton variant="emerald" icon={<Fingerprint className="w-4 h-4" />}>
                  Biometric Attendance
                </HmsButton>
              </Link>
              <Link href="/hr/payouts">
                <HmsButton variant="secondary" icon={<DollarSign className="w-4 h-4" />}>
                  Doctor Payouts
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* HR KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Staff Present On Duty</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">237 Staff</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Morning Shift Active
                </p>
              </div>
              <Users className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Biometric Clock-Ins</p>
                <h3 className="text-2xl font-bold text-purple-800 mt-1">98.2% On-Time</h3>
                <p className="text-3xs text-slate-500 mt-0.5">Biometric Device Synced</p>
              </div>
              <Fingerprint className="w-8 h-8 text-purple-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Pending Leave Requests</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">4 Applications</h3>
                <p className="text-3xs text-amber-600 font-semibold mt-0.5">Approval Pending</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Doctor Commission Share</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">₹ 3.85 Lakhs</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">Monthly Calculated</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>
        </div>

        {/* Quick Link Navigation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" /> HR & Staff Operations Workspaces
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/hr/attendance"
              className="p-5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Biometric Attendance & Shift Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">Biometric punch timestamps, duty hours, late flags, and overtime tracking.</p>
              </div>
            </Link>

            <Link
              href="/hr/roster"
              className="p-5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Doctor & Staff Duty Roster</h3>
                <p className="text-xs text-slate-500 mt-0.5">Shift scheduling (Morning, Evening, Night, 24x7 On-Call) and room assignments.</p>
              </div>
            </Link>

            <Link
              href="/hr/payouts"
              className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Doctor Commission & Payroll Payouts</h3>
                <p className="text-xs text-slate-500 mt-0.5">Doctor OPD/IPD consultation share, salary slips, and payout disbursements.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Roster Table Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" /> Active Staff Duty Roster
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Doctor and nursing shift schedules.</p>
            </div>
            <Link href="/hr/roster">
              <HmsButton size="sm" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Duty Roster
              </HmsButton>
            </Link>
          </div>

          <StaffShiftScheduler />
        </div>
      </div>
    </HmsAppShell>
  );
}
