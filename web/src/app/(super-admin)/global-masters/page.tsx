"use client";

import React from "react";
import { Tabs, Typography } from "antd";
import { DrugMasterTable, Icd10BrowserTable } from "@/app/(super-admin)/_super_admin_components/GlobalMasters/DrugMasterTable";
import { Database } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

const TABS = [
  { key: "drugs", label: "💊 Drug Catalog", children: <DrugMasterTable /> },
  { key: "icd10", label: "🩺 ICD-10 Browser", children: <Icd10BrowserTable /> },
  { key: "snomed", label: "🔬 SNOMED-CT", children: <Typography.Paragraph type="secondary" style={{ padding: 24 }}>SNOMED-CT browser coming in Phase 6.</Typography.Paragraph> },
  { key: "loinc", label: "🧪 LOINC Codes", children: <Typography.Paragraph type="secondary" style={{ padding: 24 }}>LOINC code browser coming in Phase 6.</Typography.Paragraph> },
];

export default function GlobalMastersPage() {
  return (
    <HmsAppShell title="Global Master Catalogs">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-teal-600" /> Global Master Catalogs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Platform-level clinical master data: Drug catalog, ICD-10, SNOMED-CT, LOINC codes. Changes here propagate across all tenants.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <Tabs id="global-masters-tabs" defaultActiveKey="drugs" items={TABS} />
        </div>
      </div>
    </HmsAppShell>
  );
}
