"use client";

import React from "react";
import Link from "next/link";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import {
  Stethoscope,
  Users,
  BedDouble,
  FileText,
  Microscope,
  Calendar,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
} from "lucide-react";
import { DoctorQueueTable } from "../_doctor_components/OpdQueue/DoctorQueueTable";

export default function DoctorMainDashboard() {
  return (
    <HmsAppShell title="Doctor Clinical Workspace">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Stethoscope className="w-3.5 h-3.5" /> Doctor Clinical Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Dr. Rajesh Sharma, MD (Cardiology)
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                OPD Room 104 | Morning Clinic Shift (09:00 AM - 01:00 PM) | ABDM Health Stack & CDSS Active
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/doctor/queue">
                <HmsButton variant="emerald" icon={<UserCheck className="w-4 h-4" />}>
                  Call Next OPD Patient
                </HmsButton>
              </Link>
              <Link href="/doctor/inpatient">
                <HmsButton variant="secondary" icon={<BedDouble className="w-4 h-4" />}>
                  IPD Ward Rounds
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Doctor Clinical KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">OPD Patients Waiting</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">4 Tokens Active</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~12 Min Avg Consult
                </p>
              </div>
              <Users className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Inpatient Rounds Due</p>
                <h3 className="text-2xl font-bold text-purple-800 mt-1">3 Patients</h3>
                <p className="text-3xs text-slate-500 mt-0.5">ICU-01, Ward 3B, Deluxe 402</p>
              </div>
              <BedDouble className="w-8 h-8 text-purple-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Signed Prescriptions</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">12 e-Rx Today</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Digitally Signed
                </p>
              </div>
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-rose-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Critical Panic Alerts</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">1 Lab Panic Alert</h3>
                <p className="text-3xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> K+ 6.2 mmol/L High
                </p>
              </div>
              <Microscope className="w-8 h-8 text-rose-500" />
            </div>
          </HmsCard>
        </div>

        {/* Quick Shortcut Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" /> Doctor Clinical Tools & Workspaces
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link
              href="/doctor/queue"
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">OPD Patient Queue</span>
              <span className="text-3xs text-slate-400">Consultation Workspace</span>
            </Link>

            <Link
              href="/doctor/inpatient"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-105 transition-transform">
                <BedDouble className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">IPD Ward Rounds</span>
              <span className="text-3xs text-slate-400">Daily SOAP Notes</span>
            </Link>

            <Link
              href="/doctor/prescriptions"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">e-Prescription Vault</span>
              <span className="text-3xs text-slate-400">Signed Rx History</span>
            </Link>

            <Link
              href="/doctor/lab-results"
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-rose-100 text-rose-700 rounded-xl group-hover:scale-105 transition-transform">
                <Microscope className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Lab Results Inbox</span>
              <span className="text-3xs text-slate-400">Verify & Panic Alerts</span>
            </Link>

            <Link
              href="/doctor/schedule"
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Clinic Schedule</span>
              <span className="text-3xs text-slate-400">OPD Roster & Slots</span>
            </Link>
          </div>
        </div>

        {/* Live OPD Patient Queue Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" /> Today&apos;s Live OPD Consultation Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Click &quot;Call Patient&quot; to start SOAP consultation and e-prescription.</p>
            </div>
            <Link href="/doctor/queue">
              <HmsButton size="sm" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Queue View
              </HmsButton>
            </Link>
          </div>

          <DoctorQueueTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
