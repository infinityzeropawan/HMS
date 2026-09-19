"use client";

import React from "react";
import Link from "next/link";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import {
  Pill,
  Package,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Plus,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { PharmacyDispenseTable } from "../_pharmacy_components/DispenseQueue/PharmacyDispenseTable";

export default function PharmacyMainDashboard() {
  return (
    <HmsAppShell title="Pharmacy & Medicine Dispensing">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Pill className="w-3.5 h-3.5" /> Pharmacy Dispensing & Inventory System
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Hospital Central Pharmacy Console
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                e-Prescription dispensing queue, FEFO drug batch inventory, Schedule H1 narcotic vault, and cash counter billing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/pharmacy/dispense">
                <HmsButton variant="emerald" icon={<Pill className="w-4 h-4" />}>
                  Dispense e-Prescription
                </HmsButton>
              </Link>
              <Link href="/pharmacy/inventory">
                <HmsButton variant="secondary" icon={<Package className="w-4 h-4" />}>
                  Drug Inventory
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Pharmacy KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Pending Dispense Queue</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">3 Prescriptions</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">e-Rx Auto-Synced</p>
              </div>
              <Pill className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Inventory SKUs</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">1,420 Items</h3>
                <p className="text-3xs text-slate-500 mt-0.5">FEFO Picking Enabled</p>
              </div>
              <Package className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <Link href="/pharmacy/purchase-orders">
            <HmsCard elevated className="border-l-4 border-l-rose-500 hover:shadow-md cursor-pointer transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Low Stock Alerts</p>
                  <h3 className="text-2xl font-bold text-rose-600 mt-1">4 SKUs Low</h3>
                  <p className="text-3xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Click to Reorder PO
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
            </HmsCard>
          </Link>

          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Schedule H1 Vault</p>
                <h3 className="text-2xl font-bold text-purple-800 mt-1">28 Narcotic Vials</h3>
                <p className="text-3xs text-purple-600 font-semibold mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Double Verified
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-purple-500" />
            </div>
          </HmsCard>
        </div>

        {/* Module Quick Link Navigation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" /> Pharmacy Workspaces & Supply Chain Management
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/pharmacy/dispense"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Dispensing & Cashier</h3>
                <p className="text-xs text-slate-500 mt-0.5">Dispense OPD/IPD e-Rx & issue bill receipt.</p>
              </div>
            </Link>

            <Link
              href="/pharmacy/inventory"
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-teal-100 text-teal-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Drug Inventory & FEFO</h3>
                <p className="text-xs text-slate-500 mt-0.5">Expiry tracking, stock batch levels & picking.</p>
              </div>
            </Link>

            <Link
              href="/pharmacy/purchase-orders"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Purchase Orders (PO)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Trigger PO for low stock items & vendor orders.</p>
              </div>
            </Link>

            <Link
              href="/pharmacy/grn"
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">GRN Inward Entry</h3>
                <p className="text-xs text-slate-500 mt-0.5">Goods Received Notes, batch & GST invoice stock entry.</p>
              </div>
            </Link>

            <Link
              href="/pharmacy/vendors"
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Vendor & Supplier Master</h3>
                <p className="text-xs text-slate-500 mt-0.5">GSTIN vendors, distributor terms & credit days.</p>
              </div>
            </Link>

            <Link
              href="/pharmacy/transfers"
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Inter-Dept Stock Transfer</h3>
                <p className="text-xs text-slate-500 mt-0.5">Transfer stock to OT, ICU, ER & Wards.</p>
              </div>
            </Link>

            <Link
              href="/pharmacy/controlled-drugs"
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Schedule H1 Vault</h3>
                <p className="text-xs text-slate-500 mt-0.5">NDPS register for controlled drugs with sign-off.</p>
              </div>
            </Link>

            <Link
              href="/pharmacy/reports"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Reports & Valuation</h3>
                <p className="text-xs text-slate-500 mt-0.5">Inventory holding valuation & sales analytics.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Dispensing Queue Table Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" /> Active Prescriptions Dispensing Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Select a prescription to fulfill medications and print billing receipt.</p>
            </div>
            <Link href="/pharmacy/dispense">
              <HmsButton size="sm" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Dispense Counter
              </HmsButton>
            </Link>
          </div>

          <PharmacyDispenseTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
