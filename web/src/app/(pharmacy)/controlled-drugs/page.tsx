"use client";
import { Alert, Space, Typography } from "antd";
import { ControlledDrugRegisterTable } from "@/app/(pharmacy)/_pharmacy_components/ControlledDrugRegister/ControlledDrugRegisterTable";

export default function ControlledDrugsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Controlled Drug Register
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: "4px 0 0" }}>
            Schedule H / H1 / X dispensing log — CDSCO Regulatory Compliance
          </Typography.Paragraph>
        </div>

        <Alert
          type="error"
          showIcon
          message="Regulatory Notice"
          description="This register is governed by the Drugs and Cosmetics Act, 1940 (Schedule H, H1 & X). All entries are immutable. Tampering with this register is a criminal offence under Section 27 of the Act."
          style={{ borderRadius: 8 }}
        />

        <ControlledDrugRegisterTable />
      </Space>
    </main>
  );
}
