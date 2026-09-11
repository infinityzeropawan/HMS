"use client";

import React from "react";
import { Table, Tag } from "antd";

export const UhiAppointmentDiscoverer: React.FC = () => {
  const uhiBookings = [
    { key: "1", uhiTxnId: "UHI-2026-9901", appName: "Arogya Setu", doctor: "Dr. Rajesh Sharma", slot: "10:30 AM", status: "CONFIRMED" },
    { key: "2", uhiTxnId: "UHI-2026-9904", appName: "ABHA Health App", doctor: "Dr. Priya Nair", slot: "11:15 AM", status: "CONFIRMED" },
  ];

  const columns = [
    { title: "UHI Transaction ID", dataIndex: "uhiTxnId", key: "uhiTxnId" },
    { title: "Consumer App Source", dataIndex: "appName", key: "appName", render: (a: string) => <Tag color="blue">{a}</Tag> },
    { title: "Requested Doctor", dataIndex: "doctor", key: "doctor" },
    { title: "Time Slot", dataIndex: "slot", key: "slot" },
    { title: "Protocol Status", dataIndex: "status", key: "status", render: (s: string) => <Tag color="emerald">{s}</Tag> },
  ];

  return <Table columns={columns} dataSource={uhiBookings} pagination={false} />;
};
