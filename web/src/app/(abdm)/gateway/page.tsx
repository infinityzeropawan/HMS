"use client";

import React from "react";
import { Tabs } from "antd";
import { HipRecordTransferPanel } from "../_abdm_components/HieGateway/HipRecordTransferPanel";
import { UhiAppointmentDiscoverer } from "../_abdm_components/UhiProtocol/UhiAppointmentDiscoverer";
import { ShieldCheck, Share2, Globe } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function AbdmGatewayPage() {
  const items = [
    {
      key: "hie",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Share2 className="w-4 h-4 text-teal-600" /> ABDM HIP / HIU Record Exchange
        </span>
      ),
      children: <HipRecordTransferPanel />,
    },
    {
      key: "uhi",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Globe className="w-4 h-4 text-teal-600" /> UHI National Booking Protocol
        </span>
      ),
      children: <UhiAppointmentDiscoverer />,
    },
  ];

  return (
    <HmsAppShell title="ABDM National Health Gateway">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-teal-600" /> ABDM National Health Gateway & UHI Protocol
            </h1>
            <p className="text-sm text-slate-500 mt-1">M1/M2/M3 FHIR Bundles & National Health Information Exchange (HIE)</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <Tabs defaultActiveKey="hie" items={items} />
        </div>
      </div>
    </HmsAppShell>
  );
}
