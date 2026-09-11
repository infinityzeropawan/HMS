"use client";
import { Space, Typography } from "antd";
import { TpaClaimsTable } from "@/app/(billing)/_billing_components/InsuranceClaims/TpaClaimsTable";

export default function ClaimsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>TPA & Insurance Claims</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: "4px 0 0" }}>
            Manage insurance pre-authorizations, claim submissions, query responses, and settlements.
          </Typography.Paragraph>
        </div>
        <TpaClaimsTable />
      </Space>
    </main>
  );
}
