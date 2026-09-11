"use client";

import React, { useState } from "react";
import { DoctorQueueTable } from "../_doctor_components/OpdQueue/DoctorQueueTable";
import { HmsPremiumCard, HmsCardGrid } from "@/common_components/HmsPremiumCard/HmsPremiumCard";
import { Stethoscope, Clock, CheckCircle2, Users, Activity, Calendar, Bell } from "lucide-react";
import { Badge, Tooltip } from "antd";
import Link from "next/link";

const SCHEDULE = [
  { time: "10:00 AM", patient: "Sunil Verma",   type: "Follow-up",   status: "done"    },
  { time: "10:30 AM", patient: "Anjali Gupta",   type: "New OPD",     status: "done"    },
  { time: "11:00 AM", patient: "Ramesh Kumar",   type: "Follow-up",   status: "current" },
  { time: "11:30 AM", patient: "Priya Mehta",    type: "New OPD",     status: "pending" },
  { time: "12:00 PM", patient: "Dinesh Bhatia",  type: "Review",      status: "pending" },
  { time: "02:00 PM", patient: "Kavita Singh",   type: "Follow-up",   status: "pending" },
];

export default function DoctorQueuePage() {
  const [waiting,   setWaiting]   = useState(5);
  const [completed, setCompleted] = useState(18);

  const handleQueueChange = React.useCallback((w: number, c: number) => {
    setWaiting(w);
    setCompleted(c);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white safe-area-padding safe-area-bottom">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200/50 py-4 px-4 sm:px-6">
        <div className="container mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-teal to-emerald-green rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-dark-slate leading-tight">Doctor Console</h1>
              <p className="text-sm text-slate-600 flex flex-wrap items-center gap-1">
                <span className="font-medium">Dr. Rajesh Sharma</span>
                <span className="text-slate-400">•</span>
                <span>Cardiology OPD – Clinic 3</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs px-2 py-0.5 bg-primary-light-teal text-primary-teal rounded-full">On Duty</span>
              </p>
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Tooltip title="Notifications">
              <Badge count={3} size="small">
                <button className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                  <Bell className="w-5 h-5 text-slate-600" />
                </button>
              </Badge>
            </Tooltip>
            <Tooltip title="Schedule">
              <button className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                <Calendar className="w-5 h-5 text-slate-600" />
              </button>
            </Tooltip>
            <Tooltip title="Vitals Monitor">
              <button className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                <Activity className="w-5 h-5 text-slate-600" />
              </button>
            </Tooltip>
          </div>

          {/* Mobile icon strip */}
          <div className="flex items-center gap-2 sm:hidden">
            <Badge count={3} size="small">
              <button className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center active:scale-95 transition-transform">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
            </Badge>
            <button className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center active:scale-95 transition-transform">
              <Calendar className="w-5 h-5 text-slate-600" />
            </button>
          </div>

        </div>
      </header>

      {/* ── Main ── */}
      <main className="container mx-auto py-5 sm:py-6 px-4 sm:px-6 lg:pr-[22rem]">

        {/* KPI cards */}
        <HmsCardGrid cols={2} gap="md" className="mb-6 sm:mb-8">
          <HmsPremiumCard variant="elevated" role="doctor" icon={Users} iconColor="text-amber" iconBgColor="bg-amber-light" compact>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Waiting</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-amber">{waiting}</h3>
                <p className="text-xs text-slate-500 mt-1">Patients in queue</p>
              </div>
              <div className="relative">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber/70" />
                {waiting > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber rounded-full animate-pulse-subtle" />}
              </div>
            </div>
          </HmsPremiumCard>

          <HmsPremiumCard variant="elevated" role="doctor" icon={CheckCircle2} iconColor="text-emerald-green" iconBgColor="bg-emerald-light" compact>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Completed</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-emerald-green">{completed}</h3>
                <p className="text-xs text-slate-500 mt-1">Today&apos;s consultations</p>
              </div>
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-green/70" />
            </div>
          </HmsPremiumCard>
        </HmsCardGrid>

        {/* Extra stats (tablet+) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Avg. Consult", value: "12m 45s" },
            { label: "Next Slot",    value: "2:30 PM"  },
            { label: "Room",         value: "OPD-3"    },
            { label: "Status",       value: "Active", chip: true },
          ].map(({ label, value, chip }) => (
            <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{label}</p>
              {chip
                ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-light text-emerald-green">{value}</span>
                : <p className="text-lg font-bold text-dark-slate">{value}</p>}
            </div>
          ))}
        </div>

        {/* Queue Table */}
        <HmsPremiumCard title="Patient Queue" subtitle="Tap 'Call' → then 'Start' to open encounter workspace" icon={Users} variant="elevated" role="doctor" className="mb-6">
          <div className="overflow-x-auto -mx-2 sm:-mx-3">
            <div className="min-w-[720px] px-2 sm:px-3">
              <DoctorQueueTable onQueueChange={handleQueueChange} />
            </div>
          </div>

          {/* Mobile call-next bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 sm:hidden grid grid-cols-2 gap-3">
            <button
              onClick={() => window.dispatchEvent(new Event("hms_call_next_patient"))}
              className="h-12 bg-primary-teal text-white rounded-lg font-semibold flex items-center justify-center text-sm active:scale-98 transition-transform cursor-pointer"
            >
              <PhoneCallIcon /> Call Next Patient
            </button>
            <button className="h-12 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold flex items-center justify-center text-sm active:scale-98 transition-transform cursor-pointer">
              Pause Session
            </button>
          </div>
        </HmsPremiumCard>

        {/* Mobile bottom bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom shadow-lg">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Activity className="w-5 h-5 text-primary-teal mb-1" />, label: "Status" },
              { icon: <Users    className="w-5 h-5 text-primary-teal mb-1" />, label: "Queue",  active: true },
              { icon: <Calendar className="w-5 h-5 text-primary-teal mb-1" />, label: "Schedule" },
            ].map(({ icon, label, active }) => (
              <button key={label} className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors active:scale-95 ${active ? "bg-primary-light-teal" : "bg-slate-50 active:bg-slate-100"}`}>
                {icon}
                <span className="text-xs font-medium text-slate-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* ── Desktop Sidebar – Today's Schedule ── */}
      <aside className="hidden lg:flex fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-200 flex-col">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-base font-bold text-dark-slate flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-teal" /> Today&apos;s Schedule
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Friday, 11 Sep 2026</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {SCHEDULE.map((s, i) => (
            <div key={i} className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
              s.status === "current" ? "bg-primary-light-teal border-primary-teal" :
              s.status === "done"    ? "bg-slate-50 border-slate-200 opacity-60"   :
              "bg-white border-slate-200"
            }`}>
              <div className="font-mono font-semibold text-slate-700 whitespace-nowrap">{s.time}</div>
              <div>
                <div className="font-semibold text-slate-900">{s.patient}</div>
                <div className="text-slate-500">{s.type}</div>
              </div>
              {s.status === "current" && (
                <span className="ml-auto px-1.5 py-0.5 bg-primary-teal text-white rounded text-[10px] font-bold">NOW</span>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200">
          <Link href="/encounter/P-2026-1049">
            <button className="w-full h-11 bg-primary-teal text-white rounded-lg font-semibold text-sm hover:bg-primary-dark-teal transition-colors">
              Open Current Patient
            </button>
          </Link>
        </div>
      </aside>

    </div>
  );
}

// tiny inline icon to avoid import cycle
const PhoneCallIcon = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L8.5 10.5S9.5 12 10.5 13s2.5 2 2.5 2l1.113-1.724a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2C10 21 3 14 3 5z"/>
  </svg>
);
