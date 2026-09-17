"use client";

import React from "react";
import Link from "next/link";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { PharmacyInventoryTable } from "../_pharmacy_components/Inventory/PharmacyInventoryTable";
import { Package, Pill, ShieldCheck, LayoutDashboard } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function PharmacyInventoryPage() {
  return (
    <HmsAppShell title="Pharmacy Drug Stock & Inventory">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-teal-600" /> Pharmacy Drug Stock & FEFO Inventory Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor drug batches, expiration dates, First Expiration First Out (FEFO) picking order, and stock reorder thresholds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/pharmacy">
              <HmsButton size="sm" variant="secondary" icon={<LayoutDashboard className="w-4 h-4" />}>
                Pharmacy Hub
              </HmsButton>
            </Link>
            <Link href="/dispense">
              <HmsButton size="sm" variant="emerald" icon={<Pill className="w-4 h-4" />}>
                Dispensing Counter
              </HmsButton>
            </Link>
            <Link href="/controlled-drugs">
              <HmsButton size="sm" variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
                Controlled Drugs Vault
              </HmsButton>
            </Link>
          </div>
        </div>

        <PharmacyInventoryTable />
      </div>
    </HmsAppShell>
  );
}
