"use client";

import React from "react";
import Link from "next/link";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { NetworkCommandDashboard } from "../_network_components/Command/NetworkCommandDashboard";
import { Network, Building2, ArrowRightLeft } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function NetworkMainDashboard() {
  return (
    <HmsAppShell title="Multi-Hospital Network Command">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Network className="w-6 h-6 text-teal-600" /> Multi-Hospital Branch Network Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor real-time bed capacity, ICU availability, ambulance fleet status, and inter-branch referrals across hospital campuses.
          </p>
        </div>

        <NetworkCommandDashboard />
      </div>
    </HmsAppShell>
  );
}
