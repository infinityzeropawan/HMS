"use client";

import React from "react";
import Link from "next/link";
import { PharmacyDispenseTable } from "../_pharmacy_components/DispenseQueue/PharmacyDispenseTable";
import { Pill, ShieldCheck, Package, LayoutDashboard } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function PharmacyDispensePage() {
  return (
    <HmsAppShell title="Pharmacy Dispensing Console">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Quick Navigation Bar */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-purple-600" /> Pharmacy Dispensing Counter
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              First-Expiry, First-Out (FEFO) Medication Dispense Queue & Counter Cashier
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/pharmacy">
              <HmsButton size="sm" variant="secondary" icon={<LayoutDashboard className="w-4 h-4" />}>
                Pharmacy Hub
              </HmsButton>
            </Link>
            <Link href="/controlled-drugs">
              <HmsButton size="sm" variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
                Controlled Drugs Vault
              </HmsButton>
            </Link>
            <Link href="/inventory">
              <HmsButton size="sm" variant="secondary" icon={<Package className="w-4 h-4" />}>
                Inventory & Stock
              </HmsButton>
            </Link>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Live e-Prescription Dispense Queue</h2>
          <PharmacyDispenseTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
