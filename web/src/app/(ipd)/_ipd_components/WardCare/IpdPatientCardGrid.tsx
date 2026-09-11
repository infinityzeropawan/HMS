"use client";

import React from "react";
import { Tag } from "antd";
import { FileText } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const IpdPatientCardGrid: React.FC = () => {
  const ipdPatients = [
    { ipdNo: "IPD-8801", name: "Sunil Verma", uhid: "P-2026-1049", ageGender: "45 / M", bedNo: "ICU-01", doctor: "Dr. Rajesh Sharma", dayCount: 3, advanceBal: "₹45,000", totalEst: "₹38,500" },
    { ipdNo: "IPD-8804", name: "Anjali Gupta", uhid: "P-2026-1052", ageGender: "32 / F", bedNo: "GW-101", doctor: "Dr. Priya Nair", dayCount: 2, advanceBal: "₹20,000", totalEst: "₹12,400" },
    { ipdNo: "IPD-8809", name: "Ramesh Kumar", uhid: "P-2026-1058", ageGender: "58 / M", bedNo: "GW-102", doctor: "Dr. Rajesh Sharma", dayCount: 5, advanceBal: "₹30,000", totalEst: "₹28,900" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {ipdPatients.map((p) => (
        <div key={p.ipdNo} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {p.ipdNo}
              </span>
              <Tag color="blue">{p.bedNo}</Tag>
            </div>
            <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
            <p className="text-xs text-slate-500">{p.uhid} &bull; {p.ageGender}</p>

            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
              <div>Attending: <strong>{p.doctor}</strong></div>
              <div>Stay Duration: <strong>Day {p.dayCount}</strong></div>
              <div className="flex justify-between pt-1">
                <span>Advance: <strong className="text-emerald-700">{p.advanceBal}</strong></span>
                <span>Current Bill: <strong className="text-slate-800">{p.totalEst}</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
            <HmsButton href={`/discharge/${p.ipdNo}`} block size="sm" type="primary" icon={<FileText className="w-3.5 h-3.5" />}>
              Discharge Summary
            </HmsButton>
          </div>
        </div>
      ))}
    </div>
  );
};
