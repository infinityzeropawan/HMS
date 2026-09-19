"use client";

import React, { useState } from "react";
import { Tag, Tooltip, message } from "antd";
import { Bed, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useBedStore } from "@/app/(admin)/_admin_stores/admin_bed_store";
import { BedService } from "@/app/(admin)/_admin_services/bed_service";
import { Patient360DrawerModal } from "../Patient360/Patient360DrawerModal";

export const NurseBedMatrixGrid: React.FC = () => {
  const beds = useBedStore((state) => state.beds);
  const [selectedUhid, setSelectedUhid] = useState<string | null>(null);

  const handleCompleteCleaning = (bedId: string) => {
    try {
      BedService.completeCleaning(bedId, "Nurse Station Console");
      message.success("Bed sanitation marked COMPLETE. Bed status updated to VACANT.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update sanitation status";
      message.error(errMsg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {beds.map((bed) => {
          let borderClass = "border-slate-200 bg-white";
          let badgeColor = "default";

          if (bed.status === "OCCUPIED") {
            borderClass = "border-teal-200 bg-teal-50/50 hover:border-teal-400 cursor-pointer";
          badgeColor = "teal";
        } else if (bed.status === "VACANT") {
          borderClass = "border-emerald-200 bg-emerald-50/30";
          badgeColor = "emerald";
        } else if (bed.status === "CLEANING") {
          borderClass = "border-amber-200 bg-amber-50/50";
          badgeColor = "amber";
        } else if (bed.status === "RESERVED") {
          borderClass = "border-purple-200 bg-purple-50/50";
          badgeColor = "purple";
        } else if (bed.status === "MAINTENANCE" || bed.status === "BLOCKED") {
          borderClass = "border-rose-200 bg-rose-50/50";
          badgeColor = "rose";
        }

        return (
          <div
            key={bed.id}
            onClick={() => bed.currentUhid && setSelectedUhid(bed.currentUhid)}
            className={`p-3.5 rounded-xl border shadow-2xs transition-all flex flex-col justify-between h-36 ${borderClass}`}
          >
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-teal-600" /> {bed.bedNumber}
                </span>
                <Tag color={badgeColor} className="text-3xs font-bold">{bed.status}</Tag>
              </div>
              <p className="text-3xs text-slate-400 font-mono truncate">{bed.wardName}</p>
            </div>

            {bed.currentPatientName ? (
              <div className="my-1">
                <p className="font-bold text-xs text-slate-900 truncate">{bed.currentPatientName}</p>
                <p className="text-3xs text-slate-500 font-mono">{bed.currentUhid} &bull; {bed.currentIpdNo}</p>
              </div>
            ) : (
              <p className="text-3xs text-slate-400 italic my-1">
                {bed.status === "CLEANING" ? "Awaiting Sanitization" : "No Patient Assigned"}
              </p>
            )}

            <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-3xs">
              {bed.currentIpdNo ? (
                <Link
                  href={`/mar/${bed.currentIpdNo}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-teal-700 hover:underline"
                >
                  View MAR & Vitals &rarr;
                </Link>
              ) : bed.status === "CLEANING" ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteCleaning(bed.id);
                  }}
                  className="font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-amber-600" /> Complete Cleaning
                </button>
              ) : (
                <span className="text-slate-400 font-mono">₹{bed.dailyRate}/Day</span>
              )}
            </div>
          </div>
        );
      })}
    </div>

    {selectedUhid && (
      <Patient360DrawerModal
        open={!!selectedUhid}
        onClose={() => setSelectedUhid(null)}
        uhid={selectedUhid}
      />
    )}
    </div>
  );
};
