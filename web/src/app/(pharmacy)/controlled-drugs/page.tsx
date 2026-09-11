"use client";

import React from "react";
import { Alert } from "antd";
import { ControlledDrugRegisterTable } from "@/app/(pharmacy)/_pharmacy_components/ControlledDrugRegister/ControlledDrugRegisterTable";
import { ShieldCheck } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function ControlledDrugsPage() {
  return (
    <HmsAppShell title="Controlled Drug Register (Schedule H/H1/X)">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-rose-600" /> Controlled Drug Register
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Schedule H / H1 / X dispensing log — CDSCO Regulatory Compliance
            </p>
          </div>
        </div>

        <Alert
          type="error"
          showIcon
          message="Regulatory Notice"
          description="This register is governed by the Drugs and Cosmetics Act, 1940 (Schedule H, H1 & X). All entries are immutable. Tampering with this register is a criminal offence under Section 27 of the Act."
          className="rounded-xl border-rose-200"
        />

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <ControlledDrugRegisterTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
