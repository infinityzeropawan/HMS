"use client";

import React from "react";
import { MasterPriceListTable } from "../_admin_components/TariffEditor/MasterPriceListTable";
import { DollarSign, Plus } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function AdminTariffsPage() {
  return (
    <HmsAppShell title="Service Tariffs & Price Master">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-teal-600" /> Hospital Tariff & Master Price List
            </h1>
            <p className="text-sm text-slate-500 mt-1">Service Charges, Consultation Fees, Room Tariffs & GST Mapping</p>
          </div>
          <HmsButton variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Tariff Item
          </HmsButton>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <MasterPriceListTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
