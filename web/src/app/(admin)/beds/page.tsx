"use client";
import { Space, Typography } from "antd";
import { HospitalBedConfigTable } from "@/app/(admin)/_admin_components/BedConfig/HospitalBedConfigTable";

export default function BedsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Bed & Ward Configuration
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: "4px 0 0" }}>
            Manage the hospital physical bed layout — wards, bed numbers, types, status and daily charges.
          </Typography.Paragraph>
        </div>
        <HospitalBedConfigTable />
      </Space>
    </main>
  );
}
