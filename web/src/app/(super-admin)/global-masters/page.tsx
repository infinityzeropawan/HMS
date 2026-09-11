"use client";
import { Space, Tabs, Typography } from "antd";
import { DrugMasterTable, Icd10BrowserTable } from "@/app/(super-admin)/_super_admin_components/GlobalMasters/DrugMasterTable";

const TABS = [
  { key: "drugs", label: "💊 Drug Catalog", children: <DrugMasterTable /> },
  { key: "icd10", label: "🩺 ICD-10 Browser", children: <Icd10BrowserTable /> },
  { key: "snomed", label: "🔬 SNOMED-CT", children: <Typography.Paragraph type="secondary" style={{ padding: 24 }}>SNOMED-CT browser coming in Phase 6.</Typography.Paragraph> },
  { key: "loinc", label: "🧪 LOINC Codes", children: <Typography.Paragraph type="secondary" style={{ padding: 24 }}>LOINC code browser coming in Phase 6.</Typography.Paragraph> },
];

export default function GlobalMastersPage() {
  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>Global Master Catalogs</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: "4px 0 0" }}>
            Platform-level clinical master data: Drug catalog, ICD-10, SNOMED-CT, LOINC codes.
            Changes here propagate across all tenants.
          </Typography.Paragraph>
        </div>
        <Tabs
          id="global-masters-tabs"
          defaultActiveKey="drugs"
          items={TABS}
          style={{ background: "var(--hms-surface-raised)", borderRadius: 8, padding: "0 16px 16px" }}
        />
      </Space>
    </main>
  );
}
