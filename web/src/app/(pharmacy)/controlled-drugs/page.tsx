"use client";

import React from "react";
import Link from "next/link";
import { Alert } from "antd";
import { ControlledDrugRegisterTable } from "@/app/(pharmacy)/_pharmacy_components/ControlledDrugRegister/ControlledDrugRegisterTable";
import { ShieldCheck, Pill, Package, LayoutDashboard } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function ControlledDrugsPage() {
  return (
    <HmsAppShell title="Controlled Drug Register (Schedule H/H1/X)">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Quick Navigation Bar */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-rose-600" /> Controlled Drug Register
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Schedule H / H1 / X Narcotic Dispensing Vault — CDSCO Regulatory Compliance
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
            <Link href="/inventory">
              <HmsButton size="sm" variant="secondary" icon={<Package className="w-4 h-4" />}>
                Inventory & FEFO
              </HmsButton>
            </Link>
          </div>
        </div>

        <Alert
          type="error"
          showIcon
          message="Regulatory Compliance Notice"
          description="This register is governed by the Drugs and Cosmetics Act, 1940 (Schedule H, H1 & X). All entries are immutable. Tampering with or failing to log narcotic transactions is a punishable offense under Section 27 of the Act."
          className="rounded-xl border-rose-200 bg-rose-50/60"
        />

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <ControlledDrugRegisterTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
