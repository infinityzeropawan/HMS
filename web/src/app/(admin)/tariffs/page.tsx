"use client";

import React from "react";
import { MasterPriceListTable } from "../_admin_components/TariffEditor/MasterPriceListTable";
import { DollarSign, Plus } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function AdminTariffsPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-teal-600" /> Hospital Tariff & Master Price List
          </h1>
          <p className="text-sm text-slate-500">Service Charges, Consultation Fees, Room Tariffs & GST Mapping</p>
        </div>
        <HmsButton type="primary" icon={<Plus className="w-4 h-4" />}>
          Add Tariff Item
        </HmsButton>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <MasterPriceListTable />
      </div>
    </div>
  );
}
