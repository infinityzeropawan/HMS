"use client";

import React from "react";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useBedStore } from "@/app/(admin)/_admin_stores/admin_bed_store";
import { BedDouble, Users, AlertTriangle, Pill, ClipboardList } from "lucide-react";

export const NurseStationLiveCensus: React.FC = () => {
  const admissions = useIpdStore((state) => state.admissions);
  const beds = useBedStore((state) => state.beds);

  const wardCensus = admissions.filter((a) => a.status !== "DISCHARGED").length;
  const occupiedBeds = beds.filter((b) => b.status === "OCCUPIED").length || wardCensus;
  const criticalCount = admissions.filter(
    (a) => a.roundStatus === "CRITICAL" || (a.vitals && a.vitals.spO2 < 94)
  ).length;
  const dueMedicationsCount = admissions.filter((a) => a.roundStatus === "DUE").length;
  let pendingOrdersCount = 2;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("hms_nurse_orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          pendingOrdersCount = parsed.filter((o: { status: string }) => o.status === "PENDING" || o.status === "IN_PROGRESS").length;
        }
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <HmsCard elevated className="border-l-4 border-l-teal-600 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Ward Census</p>
            <h3 className="text-xl sm:text-2xl font-black text-teal-900 mt-0.5">{wardCensus} Patients</h3>
          </div>
          <Users className="w-6 h-6 text-teal-600 opacity-80" />
        </div>
      </HmsCard>

      <HmsCard elevated className="border-l-4 border-l-blue-600 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Occupied Beds</p>
            <h3 className="text-xl sm:text-2xl font-black text-blue-900 mt-0.5">{occupiedBeds} Beds</h3>
          </div>
          <BedDouble className="w-6 h-6 text-blue-600 opacity-80" />
        </div>
      </HmsCard>

      <HmsCard elevated className="border-l-4 border-l-rose-600 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Critical Patients</p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">{criticalCount} High Risk</h3>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-600 opacity-80" />
        </div>
      </HmsCard>

      <HmsCard elevated className="border-l-4 border-l-amber-600 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Pending Orders</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">{pendingOrdersCount} Orders</h3>
          </div>
          <ClipboardList className="w-6 h-6 text-amber-600 opacity-80" />
        </div>
      </HmsCard>

      <HmsCard elevated className="border-l-4 border-l-purple-600 bg-white col-span-2 sm:col-span-1">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Due Medications</p>
            <h3 className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">{dueMedicationsCount} Due</h3>
          </div>
          <Pill className="w-6 h-6 text-purple-600 opacity-80" />
        </div>
      </HmsCard>
    </div>
  );
};
