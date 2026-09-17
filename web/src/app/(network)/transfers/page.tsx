"use client";

import React from "react";
import Link from "next/link";
import { InterHospitalTransferTable } from "../_network_components/BranchTransfers/InterHospitalTransferTable";
import { Share2, Building2, LayoutDashboard } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function NetworkTransfersPage() {
  return (
    <HmsAppShell title="Inter-Hospital Network Transfers">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-teal-600" /> Multi-Hospital Branch & Network Transfers
            </h1>
            <p className="text-sm text-slate-500 mt-1">Inter-Facility Patient Transfers, Ambulance Dispatch & Central Warehouse Stock Sync</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/network">
              <HmsButton size="sm" variant="secondary" icon={<LayoutDashboard className="w-4 h-4" />}>
                Network Command Center
              </HmsButton>
            </Link>
            <Link href="/beds">
              <HmsButton size="sm" variant="emerald" icon={<Building2 className="w-4 h-4" />}>
                Ward & Bed Matrix
              </HmsButton>
            </Link>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <InterHospitalTransferTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
