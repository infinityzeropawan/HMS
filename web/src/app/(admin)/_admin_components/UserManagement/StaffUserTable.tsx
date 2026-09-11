"use client";

import React from "react";
import { Table, Tag, Switch, message } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const StaffUserTable: React.FC = () => {
  const columns = [
    { title: "Staff ID", dataIndex: "staffId", key: "staffId" },
    { title: "Full Name", dataIndex: "name", key: "name" },
    { title: "Role", dataIndex: "role", key: "role", render: (r: string) => <Tag color="purple">{r}</Tag> },
    { title: "Department", dataIndex: "dept", key: "dept" },
    { title: "Contact Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Active Status",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <Switch defaultChecked={active} onChange={(checked) => message.info(`Staff account status updated: ${checked ? "Active" : "Disabled"}`)} />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <HmsButton size="sm" variant="secondary">
          Edit Roles
        </HmsButton>
      ),
    },
  ];

  const data = [
    { key: "1", staffId: "DOC-101", name: "Dr. Rajesh Sharma", role: "DOCTOR", dept: "Cardiology", phone: "9820011223", active: true },
    { key: "2", staffId: "REC-202", name: "Sunita Deshmukh", role: "RECEPTIONIST", dept: "OPD Desk", phone: "9820022334", active: true },
    { key: "3", staffId: "NUR-303", name: "Sr. Kavita R.", role: "NURSE", dept: "ICU Ward", phone: "9820033445", active: true },
    { key: "4", staffId: "BIL-404", name: "Vikram Patil", role: "BILLER", dept: "Accounts", phone: "9820044556", active: true },
  ];

  return <Table columns={columns} dataSource={data} pagination={false} />;
};
