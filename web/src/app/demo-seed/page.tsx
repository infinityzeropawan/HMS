"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { message, Tag } from "antd";
import { Database, DatabaseZap, Trash2, CheckCircle2, RefreshCw, ArrowRight, Building2, Users, Pill, Receipt, ShieldCheck, Microscope, BedDouble, Stethoscope, Share2 } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { seedAllDemoData, clearAllDemoData, getStorageStats, SchemaSectionStat } from "@/lib/demo_seeder/hms_demo_seeder";

export default function DemoSeedTestingPage() {
  const [stats, setStats] = useState<SchemaSectionStat[]>([]);

  const refreshStats = () => {
    setStats(getStorageStats());
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleSeedData = () => {
    const success = seedAllDemoData();
    if (success) {
      message.success("Successfully seeded complete HMS demo dataset into browser database (localStorage)!");
      refreshStats();
    } else {
      message.error("Failed to seed demo dataset.");
    }
  };

  const handleClearData = () => {
    const success = clearAllDemoData();
    if (success) {
      message.info("Local browser database cleared.");
      refreshStats();
    } else {
      message.error("Failed to clear database.");
    }
  };

  return (
    <HmsAppShell title="Frontend Demo Data & Local Database Seeder Console">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Database className="w-3.5 h-3.5" /> Frontend Offline Local Storage Database & Testing Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                HMS Universal Mock Data Seeder
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Pre-populate realistic schema-compliant mock data into browser local storage for testing all 15+ HMS dashboards, forms, workflows, and state stores.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <HmsButton variant="emerald" icon={<DatabaseZap className="w-4 h-4" />} onClick={handleSeedData}>
                ⚡ Seed All HMS Demo Data
              </HmsButton>
              <HmsButton variant="outline" className="text-slate-300 border-slate-700 hover:text-rose-400" icon={<Trash2 className="w-4 h-4" />} onClick={handleClearData}>
                🧹 Clear Database
              </HmsButton>
            </div>
          </div>
        </div>

        {/* Live Storage Section Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" /> Active Browser Storage Schemas & Data Counts
            </h2>
            <HmsButton size="sm" variant="secondary" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={refreshStats}>
              Refresh Stats
            </HmsButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((item) => (
              <HmsCard key={item.key} elevated className="border-l-4 border-l-teal-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Tag color={item.count > 0 ? "emerald" : "default"} className="font-mono font-bold">
                        {item.count > 0 ? `${item.count} Active Records` : "Empty (0 Records)"}
                      </Tag>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-5 h-5 ${item.count > 0 ? "text-emerald-500" : "text-slate-300"}`} />
                </div>
              </HmsCard>
            ))}
          </div>
        </div>

        {/* Direct Links to Test All Dashboard Sections */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" /> Test HMS Dashboards with Seeded Data
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/reception"
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-100 text-teal-700 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Reception & OPD Queue</h4>
                  <p className="text-xs text-slate-500">Token queue, OPD check-in</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/pharmacy"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Central Pharmacy</h4>
                  <p className="text-xs text-slate-500">Dispense, Controlled drugs vault</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/controlled-drugs"
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Controlled Drug Vault</h4>
                  <p className="text-xs text-slate-500">CDSCO Schedule H/H1/X log</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/billing"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Billing & Revenue</h4>
                  <p className="text-xs text-slate-500">GST invoices, TPA claims</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/pacs"
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Microscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">PACS DICOM Viewer</h4>
                  <p className="text-xs text-slate-500">Radiology worklist, 2D/3D</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/transfers"
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Branch Patient Transfers</h4>
                  <p className="text-xs text-slate-500">Inter-hospital transfers</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/portal"
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-100 text-teal-700 rounded-lg">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Patient Portal</h4>
                  <p className="text-xs text-slate-500">ABHA consent, PDF health records</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/tenants"
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-500 hover:bg-slate-50/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Super Admin Tenants</h4>
                  <p className="text-xs text-slate-500">Hospital onboarding, SaaS tiers</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </HmsAppShell>
  );
}
