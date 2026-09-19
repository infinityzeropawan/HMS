"use client";

import React from "react";
import { Modal, Tag, Tree } from "antd";
import { Route, Lock, EyeOff, CheckCircle2, ShieldAlert, FolderTree } from "lucide-react";
import { FeatureDefinition } from "../../_super_admin_types/feature_management";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface RouteEnforcementPreviewModalProps {
  feature: FeatureDefinition | null;
  open: boolean;
  onClose: () => void;
}

export const RouteEnforcementPreviewModal: React.FC<RouteEnforcementPreviewModalProps> = ({
  feature,
  open,
  onClose,
}) => {
  if (!feature) return null;

  const allowedCount = feature.routeMeta.allowedRoutes.length;
  const hiddenCount = feature.routeMeta.hiddenRoutes.length;
  const blockedCount = feature.routeMeta.blockedRoutes.length;

  // Tree visualization data
  const treeData = [
    {
      title: (
        <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Allowed Routes ({allowedCount})</span>
        </div>
      ),
      key: "allowed-root",
      children: feature.routeMeta.allowedRoutes.map((r, i) => ({
        title: (
          <div className="flex items-center justify-between text-xs py-0.5">
            <span className="font-bold text-slate-800">{r.label}</span>
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {r.path}
            </span>
          </div>
        ),
        key: `allowed-${i}`,
      })),
    },
    {
      title: (
        <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
          <EyeOff className="w-3.5 h-3.5 text-amber-600" />
          <span>Hidden Navigation Routes ({hiddenCount})</span>
        </div>
      ),
      key: "hidden-root",
      children: feature.routeMeta.hiddenRoutes.map((r, i) => ({
        title: (
          <div className="flex items-center justify-between text-xs py-0.5">
            <span className="font-bold text-slate-800">{r.label}</span>
            <span className="font-mono text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {r.path}
            </span>
          </div>
        ),
        key: `hidden-${i}`,
      })),
    },
    {
      title: (
        <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
          <Lock className="w-3.5 h-3.5 text-rose-600" />
          <span>Blocked Routes & Workspaces ({blockedCount})</span>
        </div>
      ),
      key: "blocked-root",
      children: feature.routeMeta.blockedRoutes.map((r, i) => ({
        title: (
          <div className="flex items-center justify-between text-xs py-0.5">
            <span className="font-bold text-slate-800">{r.label}</span>
            <span className="font-mono text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {r.path}
            </span>
          </div>
        ),
        key: `blocked-${i}`,
      })),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Route className="w-5 h-5 text-teal-600" />
          <span>Route Enforcement Tree Preview: {feature.name}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <HmsButton variant="secondary" onClick={onClose}>
          Close Preview
        </HmsButton>
      }
      width={620}
      destroyOnClose
    >
      <div className="space-y-4 my-4">
        {/* Feature Header Card */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
              {feature.id}
            </span>
            <Tag color="purple">{feature.category}</Tag>
          </div>
          <h3 className="text-base font-bold text-white mt-1">{feature.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{feature.description}</p>
        </div>

        {/* Route Counts Summary Badges */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">Allowed Routes</span>
            <span className="text-2xl font-extrabold text-emerald-700">{allowedCount}</span>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 uppercase block">Hidden Routes</span>
            <span className="text-2xl font-extrabold text-amber-700">{hiddenCount}</span>
          </div>

          <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
            <span className="text-[11px] font-bold text-rose-800 uppercase block">Blocked Routes</span>
            <span className="text-2xl font-extrabold text-rose-700">{blockedCount}</span>
          </div>
        </div>

        {/* Route Tree Visualization */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FolderTree className="w-4 h-4 text-teal-600" /> Navigation Route Tree Breakdown
          </h4>

          <div className="bg-white p-3 rounded-lg border border-slate-200 max-h-72 overflow-y-auto">
            <Tree
              defaultExpandAll
              showLine={{ showLeafIcon: false }}
              treeData={treeData}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
