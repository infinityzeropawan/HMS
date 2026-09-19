"use client";

import React, { useState } from "react";
import { Input, Tag, Switch, Modal, message, Segmented } from "antd";
import { Search, ShieldAlert, Sparkles, Layers, Lock, Route, ArrowRight } from "lucide-react";
import { FeatureDefinition, FeatureCategory } from "../../_super_admin_types/feature_management";
import { FeatureCatalogService } from "../../_super_admin_services/feature_catalog_service";
import { useFeatureControlStore } from "../../_super_admin_stores/feature_control_store";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { RouteEnforcementPreviewModal } from "./RouteEnforcementPreviewModal";

export const FeatureCatalogGrid: React.FC = () => {
  const { globalKillSwitches, toggleGlobalKillSwitch } = useFeatureControlStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [previewFeature, setPreviewFeature] = useState<FeatureDefinition | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const catalog = FeatureCatalogService.getCatalog();

  const filteredFeatures = catalog.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || f.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleToggleKillSwitch = (f: FeatureDefinition, isKilled: boolean) => {
    Modal.confirm({
      title: isKilled ? `Deactivate Global Kill-Switch for ${f.name}?` : `ACTIVATE GLOBAL KILL-SWITCH for ${f.name}?`,
      content: isKilled
        ? `This will restore normal tenant licensing for ${f.name}.`
        : `CRITICAL ACTION: Activating Global Kill-Switch will force-disable ${f.name} across ALL hospital tenants immediately, hiding navigation routes and blocking access!`,
      okText: isKilled ? "Restore Feature" : "ENABLE GLOBAL KILL SWITCH",
      okType: isKilled ? "primary" : "danger",
      onOk: () => {
        toggleGlobalKillSwitch(f.id, !isKilled, isKilled ? "Kill switch removed" : "Master Kill switch triggered");
        message.warning(`Global Kill-Switch ${!isKilled ? "ACTIVATED" : "REMOVED"} for ${f.name}`);
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <Input
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Search Central Feature Catalog..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-72"
          allowClear
        />

        <Segmented
          options={["ALL", "Clinical", "Business", "Integrations", "Premium"]}
          value={selectedCategory}
          onChange={(val) => setSelectedCategory(val as string)}
        />
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeatures.map((f) => {
          const isKilled = globalKillSwitches[f.id] || false;

          return (
            <HmsCard
              key={f.id}
              elevated
              className={`!p-4 border transition-all ${
                isKilled ? "bg-rose-50/40 border-rose-200" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {f.id}
                    </span>
                    <Tag
                      color={
                        f.category === "Clinical"
                          ? "teal"
                          : f.category === "Business"
                          ? "blue"
                          : f.category === "Integrations"
                          ? "purple"
                          : "gold"
                      }
                      className="!font-semibold"
                    >
                      {f.category}
                    </Tag>
                    {f.isPremium && (
                      <Tag color="volcano" className="!font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Premium
                      </Tag>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1.5">{f.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.description}</p>
                </div>

                {/* Global Kill Switch Toggle */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    Master Kill-Switch
                  </span>
                  <Switch
                    checked={isKilled}
                    onChange={() => handleToggleKillSwitch(f, isKilled)}
                    checkedChildren="KILLED"
                    unCheckedChildren="Normal"
                    className={isKilled ? "!bg-rose-600" : ""}
                  />
                </div>
              </div>

              {/* Dependencies Section */}
              {f.dependencies.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">
                    Requires Prerequisite:
                  </span>
                  {f.dependencies.map((depId) => (
                    <Tag key={depId} color="amber" className="!text-[11px] font-mono">
                      {depId}
                    </Tag>
                  ))}
                </div>
              )}

              {/* Route Enforcement Metadata */}
              <div className="mt-3 pt-2.5 border-t border-slate-100/80 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Route className="w-3.5 h-3.5 text-teal-600" /> Route Enforcement Metadata:
                  </span>
                  <button
                    onClick={() => {
                      setPreviewFeature(f);
                      setPreviewOpen(true);
                    }}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    View Route Tree <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-emerald-700 font-bold block">Allowed ({f.routeMeta.allowedRoutes.length}):</span>
                    <span className="font-mono text-slate-600 block truncate">
                      {f.routeMeta.allowedRoutes.map((r) => r.path).join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-bold block">Hidden ({f.routeMeta.hiddenRoutes.length}):</span>
                    <span className="font-mono text-slate-600 block truncate">
                      {f.routeMeta.hiddenRoutes.map((r) => r.path).join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-700 font-bold block">Blocked ({f.routeMeta.blockedRoutes.length}):</span>
                    <span className="font-mono text-slate-600 block truncate">
                      {f.routeMeta.blockedRoutes.map((r) => r.path).join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            </HmsCard>
          );
        })}
      </div>

      {/* Route Enforcement Tree Modal */}
      <RouteEnforcementPreviewModal
        feature={previewFeature}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};
