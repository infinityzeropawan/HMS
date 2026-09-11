"use client";

import React from "react";
import { InterHospitalTransferTable } from "../_network_components/BranchTransfers/InterHospitalTransferTable";
import { Share2 } from "lucide-react";

export default function NetworkTransfersPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-teal-600" /> Multi-Hospital Branch & Network Transfers
          </h1>
          <p className="text-sm text-slate-500">Inter-Facility Patient Transfer & Central Warehouse Pharmacy Sync</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <InterHospitalTransferTable />
      </div>
    </div>
  );
}
