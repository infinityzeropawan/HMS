"use client";

import React, { useState } from "react";
import { DoctorQueueTable } from "../_doctor_components/OpdQueue/DoctorQueueTable";
import { HmsPremiumCard, HmsCardGrid } from "@/common_components/HmsPremiumCard/HmsPremiumCard";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { Stethoscope, Clock, CheckCircle2, Users, Calendar } from "lucide-react";
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
  const [waiting, setWaiting] = useState(5);
  const [completed, setCompleted] = useState(18);

  const currentDateString = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleQueueChange = React.useCallback((w: number, c: number) => {
    setWaiting(w);
    setCompleted(c);
  }, []);

  return (
    <HmsAppShell title="Doctor OPD Console">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main OPD Queue Content */}
        <div className="flex-1 min-w-0">
          {/* Header Sub-bar */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-teal rounded-xl flex items-center justify-center text-white shadow-sm">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Dr. Rajesh Sharma</h2>
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>Cardiology OPD • Clinic 3</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-light text-emerald-green">
                    On Duty
                  </span>
                </p>
              </div>
            </div>
            
            <div className="text-right text-xs font-medium text-slate-500">
              <p>{currentDateString}</p>
              <p className="text-primary-teal font-semibold mt-0.5">Session: Morning OPD</p>
            </div>
          </div>

          {/* KPI Cards */}
          <HmsCardGrid cols={2} gap="md" className="mb-6">
            <HmsPremiumCard variant="elevated" role="doctor" icon={Users} iconColor="text-amber" iconBgColor="bg-amber-light" compact>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Waiting</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-amber">{waiting}</h3>
                  <p className="text-xs text-slate-500 mt-1">Patients in queue</p>
                </div>
                <div className="relative">
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber/70" />
                  {waiting > 0 && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber rounded-full animate-pulse-subtle" />}
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

          {/* Extra stats */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Avg. Consult", value: "12m 45s" },
              { label: "Next Slot",    value: "11:30 AM" },
              { label: "Room",         value: "OPD-3"    },
              { label: "Status",       value: "Active Queue", chip: true },
            ].map(({ label, value, chip }) => (
              <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</p>
                {chip
                  ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-light text-emerald-green">{value}</span>
                  : <p className="text-base font-bold text-slate-900">{value}</p>}
              </div>
            ))}
          </div>

          {/* OPD Queue Table Component */}
          <HmsPremiumCard title="Live Patient Queue" subtitle="Call patient to open active clinical encounter" icon={Users} variant="elevated" role="doctor">
            <div className="overflow-x-auto">
              <DoctorQueueTable onQueueChange={handleQueueChange} />
            </div>
          </HmsPremiumCard>
        </div>

        {/* Schedule Sidebar Pane */}
        <div className="w-full xl:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sticky top-20">
            <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-teal" /> Today&apos;s Schedule
              </h3>
              <span className="text-xs font-medium text-slate-500">{currentDateString}</span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {SCHEDULE.map((s, i) => (
                <div key={i} className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                  s.status === "current" ? "bg-primary-light-teal border-primary-teal text-slate-900" :
                  s.status === "done"    ? "bg-slate-50 border-slate-200 text-slate-500 opacity-70" :
                  "bg-white border-slate-200 text-slate-800"
                }`}>
                  <div className="font-mono font-semibold whitespace-nowrap">{s.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{s.patient}</div>
                    <div className="text-[11px] text-slate-500">{s.type}</div>
                  </div>
                  {s.status === "current" && (
                    <span className="px-1.5 py-0.5 bg-primary-teal text-white rounded text-[10px] font-bold">NOW</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link href="/encounter/ENC-2026-8801">
                <button className="w-full h-11 bg-primary-teal hover:bg-dark-teal text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                  <Stethoscope className="w-4 h-4" /> Open Active Encounter
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HmsAppShell>
  );
}
