"use client";

import React, { useState } from "react";
import { Tabs } from "antd";
import {
  ShieldCheck,
  SlidersHorizontal,
  Layers,
  History,
} from "lucide-react";
import { LicenseEnforcementDashboard } from "./LicenseEnforcementDashboard";
import { TenantFeatureAssignmentGrid } from "./TenantFeatureAssignmentGrid";
import { FeatureCatalogGrid } from "./FeatureCatalogGrid";
import { FeatureHistoryTimelineModal } from "./FeatureHistoryTimelineModal";
import { useFeatureControlStore } from "../../_super_admin_stores/feature_control_store";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface HospitalFacilityControlManagerProps {
  initialTenantId?: string;
  onClose?: () => void;
}

export const HospitalFacilityControlManager: React.FC<HospitalFacilityControlManagerProps> = ({
  initialTenantId = "TNT-9014",
}) => {
  const [activeTenantId, setActiveTenantId] = useState(initialTenantId);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const { getLicenseStats } = useFeatureControlStore();
  const stats = getLicenseStats(activeTenantId);

  const items = [
    {
      key: "assignment",
      label: (
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" /> Tenant Feature Assignment
        </span>
      ),
      children: (
        <div className="space-y-6">
          <LicenseEnforcementDashboard stats={stats} tenantName={activeTenantId} />
          <TenantFeatureAssignmentGrid onOpenHistory={() => setHistoryModalOpen(true)} />
        </div>
      ),
    },
    {
      key: "catalog",
      label: (
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" /> Central Feature Catalog
        </span>
      ),
      children: <FeatureCatalogGrid />,
    },
    {
      key: "audit",
      label: (
        <span className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-600" /> License Audit History
        </span>
      ),
      children: (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" /> Feature License &amp; Capability Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Immutable ledger of every feature enablement, template application, trial extension, and global kill-switch action across all tenants.
            </p>
          </div>
          <HmsButton
            variant="secondary"
            icon={<History className="w-4 h-4" />}
            onClick={() => setHistoryModalOpen(true)}
          >
            Open Full Audit Trail
          </HmsButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
              SaaS Capability Control System
            </span>
            <span className="text-xs text-slate-400">License Engine v3.0</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0" />
            Hospital Feature & License Control Console
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Centralized feature catalog, tenant capability assignments, dependency validation, route enforcement & kill-switch controls.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Tabs defaultActiveKey="assignment" items={items} size="large" />
      </div>

      {/* History Modal */}
      <FeatureHistoryTimelineModal open={historyModalOpen} onClose={() => setHistoryModalOpen(false)} />
    </div>
  );
};
