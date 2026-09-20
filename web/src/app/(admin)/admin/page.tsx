"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import {
  Building2,
  Users,
  BedDouble,
  DollarSign,
  ShieldCheck,
  Printer,
  Calendar,
  Award,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { StaffUserTable } from "../_admin_components/UserManagement/StaffUserTable";
import { DpdpAuditLogTable } from "../_admin_components/AuditLogs/DpdpAuditLogTable";
import { StaffUserService } from "../_admin_services/staff_user_service";
import { BedService } from "../_admin_services/bed_service";
import { useBedStore } from "../_admin_stores/admin_bed_store";

export default function HospitalAdminMainDashboard() {
  const licenseUsage = StaffUserService.getLicenseUsage();
  const rawBeds = useBedStore((s) => s.beds);
  const beds = useMemo(() => BedService.getBeds(), [rawBeds]);

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === "OCCUPIED").length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <HmsAppShell title="Hospital Admin Console">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" /> Hospital Operations Control Center
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                Hospital Administration Dashboard
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Configure facility departments, staff user RBAC, bed quotas, master service tariffs, print templates, and ABDM DPDP audit logs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <Link href="/users" className="w-full sm:w-auto">
                <HmsButton variant="emerald" fullWidth icon={<Plus className="w-4 h-4" />} className="min-h-[44px]">
                  Add Staff User
                </HmsButton>
              </Link>
              <Link href="/hospital-settings" className="w-full sm:w-auto">
                <HmsButton variant="secondary" fullWidth icon={<SlidersHorizontal className="w-4 h-4" />} className="min-h-[44px]">
                  Hospital Settings
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Core Administrative KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Active Staff Licenses</p>
                <h3 className="text-xl sm:text-2xl font-bold text-teal-800 mt-1">
                  {licenseUsage.activeUsers} / {licenseUsage.licensedSeats}
                </h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {licenseUsage.availableSeats} Available Seats
                </p>
              </div>
              <Users className="w-8 h-8 text-teal-500 shrink-0" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Bed Occupancy Rate</p>
                <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mt-1">{occupancyRate}%</h3>
                <p className="text-3xs text-slate-500 mt-0.5">
                  {occupiedBeds} Occupied / {totalBeds} Total Beds
                </p>
              </div>
              <BedDouble className="w-8 h-8 text-purple-500 shrink-0" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Daily Hospital Revenue</p>
                <h3 className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">₹ 4,82,500</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">OPD + IPD + Pharmacy + Lab</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500 shrink-0" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">NABH Quality Score</p>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mt-1">96% Compliant</h3>
                <p className="text-3xs text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ABDM M1/M2/M3 Verified
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-500 shrink-0" />
            </div>
          </HmsCard>
        </div>

        {/* Quick Shortcut Navigation Grid */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-teal-600" /> Hospital Administration Quick Modules
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/users"
              className="p-3 sm:p-4 min-h-[88px] rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group flex flex-col items-center text-center justify-center space-y-2"
            >
              <div className="p-2.5 sm:p-3 bg-teal-100 text-teal-700 rounded-xl group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Staff &amp; RBAC</span>
              <span className="text-3xs text-slate-400">Manage Credentials</span>
            </Link>

            <Link
              href="/departments"
              className="p-3 sm:p-4 min-h-[88px] rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group flex flex-col items-center text-center justify-center space-y-2"
            >
              <div className="p-2.5 sm:p-3 bg-blue-100 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Departments</span>
              <span className="text-3xs text-slate-400">Specialization Units</span>
            </Link>

            <Link
              href="/beds"
              className="p-3 sm:p-4 min-h-[88px] rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 group flex flex-col items-center text-center justify-center space-y-2"
            >
              <div className="p-2.5 sm:p-3 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-105 transition-transform">
                <BedDouble className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Beds &amp; Wards</span>
              <span className="text-3xs text-slate-400">Bed Quota Layout</span>
            </Link>

            <Link
              href="/tariffs"
              className="p-3 sm:p-4 min-h-[88px] rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200 group flex flex-col items-center text-center justify-center space-y-2"
            >
              <div className="p-2.5 sm:p-3 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Tariff Master</span>
              <span className="text-3xs text-slate-400">Price List &amp; GST</span>
            </Link>

            <Link
              href="/roster"
              className="p-3 sm:p-4 min-h-[88px] rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all duration-200 group flex flex-col items-center text-center justify-center space-y-2"
            >
              <div className="p-2.5 sm:p-3 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Shift Roster</span>
              <span className="text-3xs text-slate-400">Duty Schedules</span>
            </Link>

            <Link
              href="/print-templates"
              className="p-3 sm:p-4 min-h-[88px] rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-200 group flex flex-col items-center text-center justify-center space-y-2"
            >
              <div className="p-2.5 sm:p-3 bg-rose-100 text-rose-700 rounded-xl group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Print Studio</span>
              <span className="text-3xs text-slate-400">Prescriptions &amp; Bills</span>
            </Link>
          </div>
        </div>

        {/* Staff User Management Preview */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" /> Active Staff Credentials &amp; RBAC Access
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Role permissions for Doctors, Nurses, Pharmacists, and Billers.</p>
            </div>
            <Link href="/users" className="w-full sm:w-auto">
              <HmsButton size="sm" variant="secondary" fullWidth icon={<ArrowRight className="w-3.5 h-3.5" />} className="min-h-[44px] sm:min-h-0">
                View All Users
              </HmsButton>
            </Link>
          </div>

          <div className="w-full overflow-x-auto">
            <StaffUserTable />
          </div>
        </div>

        {/* DPDP Compliance Audit Trail Preview */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" /> DPDP Act &amp; ABDM Data Access Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Immutable clinical record access &amp; system action logs.</p>
            </div>
            <Link href="/audit-logs" className="w-full sm:w-auto">
              <HmsButton size="sm" variant="secondary" fullWidth icon={<ArrowRight className="w-3.5 h-3.5" />} className="min-h-[44px] sm:min-h-0">
                View Audit Trail
              </HmsButton>
            </Link>
          </div>

          <div className="w-full overflow-x-auto">
            <DpdpAuditLogTable />
          </div>
        </div>
      </div>
    </HmsAppShell>
  );
}
