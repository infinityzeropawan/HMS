"use client";

import React, { useState } from "react";
import { ReportFilterBar } from "@/common_components/ReportFilterBar/ReportFilterBar";
import { RevenueTrendChart } from "../Charts/RevenueTrendChart";
import { DepartmentRevenueBarChart } from "../Charts/DepartmentRevenueBarChart";
import { BedOccupancyGauge } from "../Charts/BedOccupancyGauge";
import { AdmissionTrendChart } from "../Charts/AdmissionTrendChart";
import { AttendanceTrendChart } from "../Charts/AttendanceTrendChart";
import { InventoryRiskChart } from "../Charts/InventoryRiskChart";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { TrendingUp, Activity, ShieldCheck, DollarSign, Package } from "lucide-react";
import { ExportColumn } from "@/lib/export_service/export_service";

export const ExecutiveAnalyticsDashboard: React.FC = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const reportColumns: ExportColumn[] = [
    { label: "Metric Category", key: "category" },
    { label: "Indicator / Department", key: "indicator" },
    { label: "Current Value / Revenue (₹)", key: "value" },
    { label: "Growth / Status", key: "status" },
  ];

  const reportData = [
    { category: "Revenue", indicator: "Monthly Gross Revenue", value: "₹48.2 Lakhs", status: "+14.2% YoY" },
    { category: "Revenue", indicator: "Cardiology & Cath Lab", value: "₹14.5 Lakhs", status: "42% Share" },
    { category: "Revenue", indicator: "Orthopedics & OT", value: "₹9.8 Lakhs", status: "28% Share" },
    { category: "Occupancy", indicator: "ICU / Cardiac Care", value: "18 / 20 Beds", status: "90% Occupied" },
    { category: "Occupancy", indicator: "General Ward A", value: "32 / 40 Beds", status: "80% Occupied" },
    { category: "Admissions", indicator: "Monthly IPD Admissions", value: "260 Patients", status: "+10.6% Growth" },
    { category: "Staffing", indicator: "Roster Attendance Rate", value: "112 / 118 Staff", status: "94.9% Compliant" },
    { category: "Inventory", indicator: "FEFO Near Expiry Batches", value: "12 Batches", status: "Action Required" },
  ];

  const handleFilterChange = (filters: { dateRange: [string, string] | null; departmentId: string }) => {
    setSelectedDeptId(filters.departmentId);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Standard Filter Bar */}
      <ReportFilterBar
        reportTitle="Hospital Executive Intelligence & Analytics Report"
        exportFilename="executive_hospital_analytics"
        columns={reportColumns}
        data={reportData}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
      />

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Monthly Gross Revenue</p>
              <h3 className="text-2xl font-bold text-teal-800 mt-1">₹48.2 Lakhs</h3>
              <p className="text-3xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2% Growth
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Bed Occupancy Rate</p>
              <h3 className="text-2xl font-bold text-indigo-800 mt-1">78% Occupied</h3>
              <p className="text-3xs text-indigo-600 font-semibold mt-0.5">67 Active Inpatients</p>
            </div>
            <Activity className="w-8 h-8 text-indigo-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Monthly Admissions</p>
              <h3 className="text-2xl font-bold text-purple-800 mt-1">260 Patients</h3>
              <p className="text-3xs text-purple-600 font-semibold mt-0.5">245 Discharges</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Near-Expiry Drug SKUs</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">12 Batches</h3>
              <p className="text-3xs text-amber-600 font-semibold mt-0.5">FEFO Expiry Alert</p>
            </div>
            <Package className="w-8 h-8 text-amber-500" />
          </div>
        </HmsCard>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart />
        <DepartmentRevenueBarChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BedOccupancyGauge />
        <AdmissionTrendChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceTrendChart />
        <InventoryRiskChart />
      </div>
    </div>
  );
};
