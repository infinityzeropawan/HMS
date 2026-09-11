"use client";

import React from "react";
import { Tabs } from "antd";
import { HipRecordTransferPanel } from "../_abdm_components/HieGateway/HipRecordTransferPanel";
import { UhiAppointmentDiscoverer } from "../_abdm_components/UhiProtocol/UhiAppointmentDiscoverer";
import { ShieldCheck, Share2, Globe } from "lucide-react";

export default function AbdmGatewayPage() {
  const items = [
    {
      key: "hie",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Share2 className="w-4 h-4" /> ABDM HIP / HIU Record Exchange
        </span>
      ),
      children: <HipRecordTransferPanel />,
    },
    {
      key: "uhi",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Globe className="w-4 h-4" /> UHI National Booking Protocol
        </span>
      ),
      children: <UhiAppointmentDiscoverer />,
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-600" /> ABDM National Health Gateway & UHI Protocol
          </h1>
          <p className="text-sm text-slate-500">M1/M2/M3 FHIR Bundles & National Health Information Exchange (HIE)</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <Tabs defaultActiveKey="hie" items={items} />
      </div>
    </div>
  );
}
