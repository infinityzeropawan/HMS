"use client";

import React from "react";
import { Building2, CheckCircle2, Clock, AlertOctagon, ShieldAlert, IndianRupee } from "lucide-react";
import { TenantStats } from "../../_super_admin_types/tenant_management";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";

interface TenantStatsCardsProps {
  stats: TenantStats;
  loading?: boolean;
}

export const TenantStatsCards: React.FC<TenantStatsCardsProps> = ({ stats, loading }) => {
  const formatCurrency = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const cards = [
    {
      title: "Total Hospitals",
      value: stats.totalHospitals,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
      badge: "Total Multi-Tenant",
    },
    {
      title: "Active Hospitals",
      value: stats.activeHospitals,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
      badge: `${stats.totalHospitals ? Math.round((stats.activeHospitals / stats.totalHospitals) * 100) : 0}% Active`,
    },
    {
      title: "Trial Hospitals",
      value: stats.trialHospitals,
      icon: Clock,
      color: "text-sky-600",
      bg: "bg-sky-50 border-sky-100",
      badge: "Onboarding Stage",
    },
    {
      title: "Expired Hospitals",
      value: stats.expiredHospitals,
      icon: AlertOctagon,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
      badge: "Requires Renewal",
    },
    {
      title: "Suspended Hospitals",
      value: stats.suspendedHospitals,
      icon: ShieldAlert,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-100",
      badge: "Governance Lockout",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      icon: IndianRupee,
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-100",
      badge: "Platform MRR",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse border border-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <HmsCard key={idx} elevated className="!p-3.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900 tracking-tight">{card.value}</span>
              <span className="text-[10px] font-medium text-slate-500 px-1.5 py-0.5 rounded-md bg-slate-100">
                {card.badge}
              </span>
            </div>
          </HmsCard>
        );
      })}
    </div>
  );
};
