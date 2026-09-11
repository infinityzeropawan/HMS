"use client";

import React from "react";
import { Table, Tag, message } from "antd";
import { CheckCircle2 } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const DoctorCommissionCalculator: React.FC = () => {
  const payouts = [
    { key: "1", doctor: "Dr. Rajesh Sharma", dept: "Cardiology", opdCount: 45, surgeryCount: 4, grossFee: "₹1,85,000", sharePercent: "70%", netPayout: "₹1,29,500", status: "PENDING" },
    { key: "2", doctor: "Dr. Priya Nair", dept: "Orthopedics", opdCount: 32, surgeryCount: 3, grossFee: "₹1,40,000", sharePercent: "65%", netPayout: "₹91,000", status: "PROCESSED" },
  ];

  const columns = [
    { title: "Doctor Name", dataIndex: "doctor", key: "doctor" },
    { title: "Department", dataIndex: "dept", key: "dept" },
    { title: "OPD Consults", dataIndex: "opdCount", key: "opdCount" },
    { title: "Surgeries", dataIndex: "surgeryCount", key: "surgeryCount" },
    { title: "Gross Fees", dataIndex: "grossFee", key: "grossFee" },
    { title: "Share (%)", dataIndex: "sharePercent", key: "sharePercent" },
    {
      title: "Net Payout (₹)",
      dataIndex: "netPayout",
      key: "netPayout",
      render: (p: string) => <span className="font-bold text-teal-800">{p}</span>,
    },
    {
      title: "Payout Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={s === "PROCESSED" ? "emerald" : "orange"}>{s}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: { doctor: string; status: string }) =>
        record.status === "PENDING" ? (
          <HmsButton
            size="sm"
            type="primary"
            variant="emerald"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            onClick={() => message.success(`Monthly Payout approved for ${record.doctor}`)}
          >
            Approve Payout
          </HmsButton>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Disbursed</span>
        ),
    },
  ];

  return <Table columns={columns} dataSource={payouts} pagination={false} />;
};
