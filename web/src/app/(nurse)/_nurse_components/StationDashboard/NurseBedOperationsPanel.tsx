"use client";

import React, { useState } from "react";
import { Tag, message } from "antd";
import { Bed, CheckCircle2, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { useBedStore } from "@/app/(admin)/_admin_stores/admin_bed_store";
import { BedService } from "@/app/(admin)/_admin_services/bed_service";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const NurseBedOperationsPanel: React.FC = () => {
  const beds = useBedStore((state) => state.beds);

  const occupied = beds.filter((b) => b.status === "OCCUPIED").length;
  const vacant = beds.filter((b) => b.status === "VACANT").length;
  const cleaning = beds.filter((b) => b.status === "CLEANING").length;
  const reserved = beds.filter((b) => b.status === "RESERVED").length;
  const maintenance = beds.filter((b) => b.status === "MAINTENANCE" || b.status === "BLOCKED").length;

  const handleCompleteCleaning = (bedId: string) => {
    try {
      BedService.completeCleaning(bedId, "Nurse Bed Operations Panel");
      message.success("Bed sanitation completed! Status updated to VACANT / READY.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update sanitation status";
      message.error(errMsg);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Bed className="w-5 h-5 text-teal-600" /> Ward Bed Operations & Sanitization Center
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time bed telemetry, housekeeping sanitation sign-offs, and turnover metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-center">
          <span className="text-3xs font-bold text-teal-800 uppercase">Occupied</span>
          <h4 className="text-xl font-bold text-teal-900 mt-0.5">{occupied} Beds</h4>
        </div>
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
          <span className="text-3xs font-bold text-emerald-800 uppercase">Vacant / Ready</span>
          <h4 className="text-xl font-bold text-emerald-900 mt-0.5">{vacant} Beds</h4>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
          <span className="text-3xs font-bold text-amber-800 uppercase">Sanitizing</span>
          <h4 className="text-xl font-bold text-amber-900 mt-0.5">{cleaning} Beds</h4>
        </div>
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
          <span className="text-3xs font-bold text-purple-800 uppercase">Reserved</span>
          <h4 className="text-xl font-bold text-purple-900 mt-0.5">{reserved} Beds</h4>
        </div>
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
          <span className="text-3xs font-bold text-rose-800 uppercase">Maintenance</span>
          <h4 className="text-xl font-bold text-rose-900 mt-0.5">{maintenance} Beds</h4>
        </div>
      </div>

      {cleaning > 0 && (
        <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong className="text-amber-900">{cleaning} Beds Awaiting Housekeeping Sign-off</strong> (Sanitization in progress)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {beds.filter((b) => b.status === "CLEANING").map((b) => (
              <HmsButton
                key={b.id}
                size="sm"
                variant="secondary"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => handleCompleteCleaning(b.id)}
              >
                Mark {b.bedNumber} Sanitized
              </HmsButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
