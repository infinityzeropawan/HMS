"use client";

import React from "react";
import { Tag } from "antd";
import { Bed } from "lucide-react";
import Link from "next/link";

interface BedInfo {
  bedNo: string;
  ward: string;
  patientName?: string;
  uhid?: string;
  ipdNo?: string;
  status: "OCCUPIED" | "VACANT" | "CLEANING" | "CRITICAL";
}

export const NurseBedMatrixGrid: React.FC = () => {
  const beds: BedInfo[] = [
    { bedNo: "ICU-01", ward: "Intensive Care Unit", patientName: "Sunil Verma", uhid: "P-2026-1049", ipdNo: "IPD-8801", status: "CRITICAL" },
    { bedNo: "ICU-02", ward: "Intensive Care Unit", status: "VACANT" },
    { bedNo: "GW-101", ward: "General Ward A", patientName: "Anjali Gupta", uhid: "P-2026-1052", ipdNo: "IPD-8804", status: "OCCUPIED" },
    { bedNo: "GW-102", ward: "General Ward A", patientName: "Ramesh Kumar", uhid: "P-2026-1058", ipdNo: "IPD-8809", status: "OCCUPIED" },
    { bedNo: "PVT-301", ward: "Private Deluxe Ward", status: "CLEANING" },
    { bedNo: "PVT-302", ward: "Private Deluxe Ward", patientName: "Meena Kumari", uhid: "P-2026-1065", ipdNo: "IPD-8812", status: "OCCUPIED" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {beds.map((bed) => {
        let borderClass = "border-slate-200 bg-white";
        let badgeColor = "default";

        if (bed.status === "OCCUPIED") {
          borderClass = "border-teal-200 bg-teal-50/50";
          badgeColor = "teal";
        } else if (bed.status === "CRITICAL") {
          borderClass = "border-rose-300 bg-rose-50/80 animate-pulse";
          badgeColor = "rose";
        } else if (bed.status === "VACANT") {
          borderClass = "border-emerald-200 bg-emerald-50/30";
          badgeColor = "emerald";
        } else if (bed.status === "CLEANING") {
          borderClass = "border-amber-200 bg-amber-50/50";
          badgeColor = "amber";
        }

        return (
          <div
            key={bed.bedNo}
            className={`p-3 rounded-lg border shadow-sm transition-all flex flex-col justify-between h-32 ${borderClass}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-1">
                <Bed className="w-4 h-4 text-teal-600" /> {bed.bedNo}
              </span>
              <Tag color={badgeColor}>{bed.status}</Tag>
            </div>

            {bed.patientName ? (
              <div>
                <p className="font-bold text-xs text-slate-900 truncate">{bed.patientName}</p>
                <p className="text-[10px] text-slate-500 font-mono">{bed.uhid} &bull; {bed.ipdNo}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No Patient Assigned</p>
            )}

            {bed.ipdNo ? (
              <Link href={`/mar/${bed.ipdNo}`} className="text-[11px] font-semibold text-teal-700 hover:underline">
                View MAR & Vitals &rarr;
              </Link>
            ) : (
              <span className="text-[11px] text-slate-300">Ready for Admission</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
