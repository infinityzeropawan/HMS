"use client";

import React from "react";
import { InterHospitalTransferTable } from "../_network_components/BranchTransfers/InterHospitalTransferTable";
import { Share2 } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function NetworkTransfersPage() {
  return (
    <HmsAppShell title="Inter-Hospital Network Transfers">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-teal-600" /> Multi-Hospital Branch & Network Transfers
            </h1>
            <p className="text-sm text-slate-500 mt-1">Inter-Facility Patient Transfer & Central Warehouse Pharmacy Sync</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <InterHospitalTransferTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
