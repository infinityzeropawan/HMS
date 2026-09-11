"use client";

import React from "react";
import { Table, Tag } from "antd";

export const StaffShiftScheduler: React.FC = () => {
  const columns = [
    { title: "Staff Member", dataIndex: "name", key: "name" },
    { title: "Role", dataIndex: "role", key: "role", render: (r: string) => <Tag color="purple">{r}</Tag> },
    { title: "Mon (08-Sep)", dataIndex: "mon", key: "mon" },
    { title: "Tue (09-Sep)", dataIndex: "tue", key: "tue" },
    { title: "Wed (10-Sep)", dataIndex: "wed", key: "wed" },
    { title: "Thu (11-Sep)", dataIndex: "thu", key: "thu" },
    { title: "Fri (12-Sep)", dataIndex: "fri", key: "fri" },
  ];

  const data = [
    { key: "1", name: "Dr. Rajesh Sharma", role: "DOCTOR", mon: "OPD Morning", tue: "OPD Morning", wed: "OT Surgery", thu: "OPD Morning", fri: "OFF" },
    { key: "2", name: "Sr. Kavita R.", role: "NURSE", mon: "ICU Morning", tue: "ICU Night", wed: "ICU Night", thu: "OFF", fri: "Ward Day" },
    { key: "3", name: "Sunita Deshmukh", role: "RECEPTION", mon: "Front Desk", tue: "Front Desk", wed: "Front Desk", thu: "Front Desk", fri: "Front Desk" },
  ];

  return <Table columns={columns} dataSource={data} pagination={false} />;
};
