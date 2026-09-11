"use client";

import React from "react";
import { Table, Tag } from "antd";
import { TrendingUp, DollarSign } from "lucide-react";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";

export const RevenueAnalyticsChart: React.FC = () => {
  const deptData = [
    { key: "1", dept: "OPD Consultation Desk", opdRev: "₹1,45,000", ipdRev: "-", total: "₹1,45,000", share: "28%" },
    { key: "2", dept: "Cardiology & Cath Lab", opdRev: "₹85,000", ipdRev: "₹2,40,000", total: "₹3,25,000", share: "45%" },
    { key: "3", dept: "Orthopedics & OT", opdRev: "₹45,000", ipdRev: "₹1,80,000", total: "₹2,25,000", share: "18%" },
    { key: "4", dept: "Pharmacy & Store", opdRev: "₹65,000", ipdRev: "₹45,000", total: "₹1,10,000", share: "9%" },
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HmsCard elevated>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Revenue (This Month)</p>
              <h3 className="text-2xl font-bold text-teal-700 mt-1">₹8,05,000</h3>
            </div>
            <TrendingUp className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Cash & UPI Collections</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹5,80,000</h3>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>

        <HmsCard elevated>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">TPA Cashless Claims Pending</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">₹2,25,000</h3>
            </div>
            <DollarSign className="w-8 h-8 text-amber-500" />
          </div>
        </HmsCard>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4">Departmental Revenue Distribution</h3>
        <Table columns={columns} dataSource={deptData} pagination={false} />
      </div>
    </div>
  );
};
