"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tabs, Tag, message } from "antd";
import { PatientReportViewer } from "../_patient_components/HealthRecords/PatientReportViewer";
import { AbhaConsentManager } from "../_patient_components/AbhaLinkage/AbhaConsentManager";
import { UserCheck, FileText, ShieldCheck, Pill, Calendar, Video, Ticket, Clock, Download } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";
import { AppointmentBookingDrawer } from "@/app/(reception)/_reception_components/AppointmentBooking/AppointmentBookingDrawer";

export default function PatientPortalPage() {
  const user = useAuthUserStore((s) => s.user);
  const patientName = user?.username || "Sunil Verma";
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);

  const activeMeds = [
    { name: "Tab Sorbitrate 5mg", dosage: "5mg Sublingual", freq: "Stat & SOS", doctor: "Dr. Rajesh Sharma", refills: 2 },
    { name: "Tab Ecosprin 75mg", dosage: "75mg Oral", freq: "1-0-0 (Morning)", doctor: "Dr. Rajesh Sharma", refills: 5 },
    { name: "Tab Atorvastatin 20mg", dosage: "20mg Oral", freq: "0-0-1 (Night)", doctor: "Dr. Rajesh Sharma", refills: 4 },
  ];

  const items = [
    {
      key: "records",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <FileText className="w-4 h-4 text-teal-600" /> My Health Records & Lab Reports
        </span>
      ),
      children: <PatientReportViewer />,
    },
    {
      key: "abha",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-600" /> ABHA Linkage & Data Consents
        </span>
      ),
      children: <AbhaConsentManager />,
    },
    {
      key: "meds",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Pill className="w-4 h-4 text-purple-600" /> Active Prescriptions & Refills
        </span>
      ),
      children: (
        <div className="space-y-3 pt-2">
          {activeMeds.map((med, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                <p className="text-xs text-slate-600 mt-0.5">Dosage: {med.dosage} &bull; Frequency: {med.freq}</p>
                <p className="text-[11px] text-slate-500 font-mono">Prescribed by {med.doctor}</p>
              </div>
              <div className="flex items-center gap-2">
                <Tag color="purple">{med.refills} Refills Left</Tag>
                <HmsButton
                  size="sm"
                  variant="emerald"
                  onClick={() => message.success(`Refill request for ${med.name} submitted to Central Pharmacy!`)}
                >
                  Request Refill
                </HmsButton>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <HmsAppShell title="Patient Self-Service Portal">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Patient Profile Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center text-2xl font-bold">
              {patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-0.5 rounded-full text-xs font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ABHA Verified Patient
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{patientName}</h1>
              <p className="text-slate-300 text-xs font-mono mt-0.5">UHID: P-2026-1049 &bull; ABHA: sunil.verma@abdm</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <HmsButton
              variant="emerald"
              icon={<Calendar className="w-4 h-4" />}
              onClick={() => setBookingDrawerOpen(true)}
            >
              Book OPD Appointment
            </HmsButton>
            <Link href="/consult/TELE-8801">
              <HmsButton variant="secondary" icon={<Video className="w-4 h-4" />}>
                Telehealth Consult
              </HmsButton>
            </Link>
          </div>
        </div>

        {/* Live Token & Next Appointment Alert */}
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-900 block text-sm">Active OPD Appointment Today</span>
              <span className="text-amber-800">Token T-01 &bull; Dr. Rajesh Sharma (Cardiology - OPD 3) &bull; 10:30 AM Slot</span>
            </div>
          </div>
          <Tag color="orange" className="font-bold py-1 px-3 w-fit">WAITING IN QUEUE</Tag>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <Tabs defaultActiveKey="records" items={items} />
        </div>

        {/* Appointment Drawer */}
        <AppointmentBookingDrawer
          open={bookingDrawerOpen}
          onClose={() => setBookingDrawerOpen(false)}
        />
      </div>
    </HmsAppShell>
  );
}
