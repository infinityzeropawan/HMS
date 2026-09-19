"use client";

import React, { useState } from "react";
import { Table, Tag } from "antd";
import { TrendingUp, DollarSign } from "lucide-react";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { ReportFilterBar } from "@/common_components/ReportFilterBar/ReportFilterBar";
import { RevenueTrendChart } from "../Charts/RevenueTrendChart";
import { DepartmentRevenueBarChart } from "../Charts/DepartmentRevenueBarChart";
import { ExportColumn } from "@/lib/export_service/export_service";

export const RevenueAnalyticsChart: React.FC = () => {
  const [deptData] = useState([
    { key: "1", dept: "OPD Consultation Desk", opdRev: "₹1,45,000", ipdRev: "-", total: "₹1,45,000", share: "28%" },
    { key: "2", dept: "Cardiology & Cath Lab", opdRev: "₹85,000", ipdRev: "₹2,40,000", total: "₹3,25,000", share: "45%" },
    { key: "3", dept: "Orthopedics & OT", opdRev: "₹45,000", ipdRev: "₹1,80,000", total: "₹2,25,000", share: "18%" },
    { key: "4", dept: "Pharmacy & Store", opdRev: "₹65,000", ipdRev: "₹45,000", total: "₹1,10,000", share: "9%" },
  ]);

  const exportColumns: ExportColumn[] = [
    { label: "Department / Service", key: "dept" },
    { label: "OPD Revenue", key: "opdRev" },
    { label: "IPD Revenue", key: "ipdRev" },
    { label: "Total Collection", key: "total" },
    { label: "Revenue Share", key: "share" },
  ];

  const columns = [
    { title: "Department / Service", dataIndex: "dept", key: "dept" },
    { title: "OPD Revenue", dataIndex: "opdRev", key: "opdRev" },
    { title: "IPD Revenue", dataIndex: "ipdRev", key: "ipdRev" },
    { title: "Total Collection", dataIndex: "total", key: "total" },
    { title: "Revenue Share (%)", dataIndex: "share", key: "share", render: (s: string) => <Tag color="teal">{s}</Tag> },
  ];

  return (
    <div className="space-y-6">
      {/* Standard Filter Bar with Exports */}
      <ReportFilterBar
        reportTitle="Hospital Financial Revenue Analytics Report"
        exportFilename="revenue_financial_report"
        columns={exportColumns}
        data={deptData}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Revenue (This Month)</p>
              <h3 className="text-2xl font-bold text-teal-700 mt-1">₹8,05,000</h3>
            </div>
            <TrendingUp className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Cash & UPI Collections</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹5,80,000</h3>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">TPA Cashless Claims Pending</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">₹2,25,000</h3>
            </div>
            <DollarSign className="w-8 h-8 text-amber-500" />
          </div>
        </HmsCard>
      </div>

      {/* Responsive Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart />
        <DepartmentRevenueBarChart />
      </div>

      {/* Departmental Revenue Distribution Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-800">Departmental Revenue Breakdown</h3>
        <div className="w-full overflow-x-auto">
          <Table columns={columns} dataSource={deptData} pagination={false} scroll={{ x: "max-content" }} />
        </div>
      </div>
    </div>
  );
};
