"use client";

import React from "react";
import Link from "next/link";
import { Tabs } from "antd";
import { DrugMasterTable, Icd10BrowserTable, TerminologyBrowserTable } from "@/app/(super-admin)/_super_admin_components/GlobalMasters/DrugMasterTable";
import { Database, Building2, Receipt, SlidersHorizontal, ShieldCheck, Headphones } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

const TABS = [
  { key: "drugs", label: "💊 Global Drug Catalog", children: <DrugMasterTable /> },
  { key: "icd10", label: "🩺 ICD-10 Disease Browser", children: <Icd10BrowserTable /> },
  {
    key: "snomed",
    label: "🔬 SNOMED-CT Terminology",
    children: (
      <TerminologyBrowserTable
        vocabulary="SNOMED-CT"
        entries={[
          { id: "sct-1", code: "44054006", description: "Diabetes mellitus type 2 (disorder)" },
          { id: "sct-2", code: "38341003", description: "Hypertensive vascular disease (disorder)" },
          { id: "sct-3", code: "195967001", description: "Asthma (disorder)" },
          { id: "sct-4", code: "22298006", description: "Myocardial infarction (disorder)" },
        ]}
      />
    ),
  },
  {
    key: "loinc",
    label: "🧪 LOINC Lab Master",
    children: (
      <TerminologyBrowserTable
        vocabulary="LOINC"
        entries={[
          { id: "loinc-1", code: "718-7", description: "Hemoglobin [Mass/volume] in Blood" },
          { id: "loinc-2", code: "6690-2", description: "Leukocytes [#/volume] in Blood" },
          { id: "loinc-3", code: "4548-4", description: "Hemoglobin A1c/Hemoglobin.total in Blood" },
          { id: "loinc-4", code: "2345-7", description: "Glucose [Mass/volume] in Blood" },
        ]}
      />
    ),
  },
];

export default function GlobalMastersPage() {
  return (
    <HmsAppShell title="Global Clinical Master Catalogs">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-teal-600" /> Global Clinical Master Catalogs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Platform-level clinical master data: Drug catalog, ICD-10, SNOMED-CT, and LOINC codes. Changes propagate across all SaaS tenants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/tenants">
              <HmsButton size="sm" variant="secondary" icon={<Building2 className="w-4 h-4" />}>
                Tenants
              </HmsButton>
            </Link>
            <Link href="/subscription-plans">
              <HmsButton size="sm" variant="secondary" icon={<Receipt className="w-4 h-4" />}>
                Subscriptions
              </HmsButton>
            </Link>
            <Link href="/feature-flags">
              <HmsButton size="sm" variant="secondary" icon={<SlidersHorizontal className="w-4 h-4" />}>
                Feature Flags
              </HmsButton>
            </Link>
            <Link href="/platform-audit">
              <HmsButton size="sm" variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
                Platform Audit
              </HmsButton>
            </Link>
            <Link href="/support-tickets">
              <HmsButton size="sm" variant="secondary" icon={<Headphones className="w-4 h-4" />}>
                Support Tickets
              </HmsButton>
            </Link>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <Tabs id="global-masters-tabs" defaultActiveKey="drugs" items={TABS} />
        </div>
      </div>
    </HmsAppShell>
  );
}
