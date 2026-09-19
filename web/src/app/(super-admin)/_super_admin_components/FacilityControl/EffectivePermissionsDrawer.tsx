"use client";

import React, { useState } from "react";
import { Drawer, Tag, Input, Badge, Divider } from "antd";
import { ShieldCheck, Lock, Search, CheckCircle2, SlidersHorizontal, GitFork, Building2, AlertCircle } from "lucide-react";
import { RoleDefinition, PermissionCategory } from "../../_super_admin_types/rbac_management";
import { RbacCatalogService, PERMISSION_CLAIMS } from "../../_super_admin_services/rbac_catalog_service";
import { UnifiedAuthEvaluator } from "../../_super_admin_services/unified_auth_evaluator";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface EffectivePermissionsDrawerProps {
  role: RoleDefinition | null;
  open: boolean;
  onClose: () => void;
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  "Clinical OPD",
  "Inpatient Care (IPD)",
  "Operation Theatre (OT)",
  "Pharmacy & Dispensing",
  "Pathology & Diagnostics",
  "Billing & Financials",
  "Integrations & ABDM",
  "System Administration",
];

export const EffectivePermissionsDrawer: React.FC<EffectivePermissionsDrawerProps> = ({
  role,
  open,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!role) return null;

  const parentTemplate = role.parentTemplateId
    ? RbacCatalogService.getTemplateById(role.parentTemplateId)
    : null;

  const grantedPermSet = new Set(role.permissions);

  const filteredClaims = PERMISSION_CLAIMS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <span>Effective Permissions Preview: {role.name}</span>
        </div>
      }
      placement="right"
      width={560}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <div className="space-y-4 my-2 text-xs">
        {/* Role Overview Box */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
              {role.id}
            </span>
            <Tag color={role.isGlobalTemplate ? "purple" : "emerald"} className="!font-bold">
              {role.isGlobalTemplate ? "GLOBAL TEMPLATE" : "TENANT CUSTOM ROLE"}
            </Tag>
            <Tag color="blue">{role.category}</Tag>
          </div>

          <h3 className="text-base font-bold text-white mt-1">{role.name}</h3>
          <p className="text-xs text-slate-400">{role.description}</p>

          {parentTemplate && (
            <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-xs text-slate-300">
              <GitFork className="w-3.5 h-3.5 text-teal-400" />
              <span>Inherited from Global Template: <strong className="text-white">{parentTemplate.name}</strong></span>
            </div>
          )}
        </div>

        {/* Scope Boundary Summary */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" /> Scope Rules & Roster Constraints
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block font-semibold">Scope Boundary:</span>
              <span className="font-bold text-slate-800 block">{role.scopeRules.scopeType}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Shift Roster Required:</span>
              <span className="font-bold text-slate-800 block">
                {role.scopeRules.requiresOnDutyRoster ? "✓ Active Roster Required" : "✕ Always Active"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Emergency Break-Glass:</span>
              <span className="font-bold text-slate-800 block">
                {role.scopeRules.allowEmergencyBreakGlass ? "✓ Granted Override" : "✕ Disabled"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Active Status:</span>
              <Tag color={role.status === "Active" ? "green" : "red"} className="!font-bold !text-[10px]">
                {role.status}
              </Tag>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Input
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Filter permission claims by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          className="text-xs"
        />

        {/* Permission Claim Breakdown Categories */}
        <div className="space-y-3">
          {PERMISSION_CATEGORIES.map((cat) => {
            const catClaims = filteredClaims.filter((p) => p.category === cat);
            if (catClaims.length === 0) return null;

            const grantedCount = catClaims.filter((p) => grantedPermSet.has(p.id)).length;

            return (
              <div key={cat} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-teal-600" />
                    {cat}
                  </span>
                  <Tag color={grantedCount > 0 ? "teal" : "default"} className="!font-semibold !text-[10px]">
                    {grantedCount} / {catClaims.length} Granted
                  </Tag>
                </div>

                <div className="space-y-1.5 pt-1">
                  {catClaims.map((claim) => {
                    const isGranted = grantedPermSet.has(claim.id);
                    const isInherited = parentTemplate?.permissions.includes(claim.id);
                    const featInfo = UnifiedAuthEvaluator.getFeatureStateForClaim(role.tenantId, claim.requiredFeatureId);
                    const isFeatureUnavailable = featInfo.state === "Disabled" || featInfo.state === "Restricted";

                    return (
                      <div
                        key={claim.id}
                        className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                          isFeatureUnavailable
                            ? "bg-rose-50/40 border-rose-200 text-slate-500 opacity-80"
                            : isGranted
                            ? "bg-emerald-50/70 border-emerald-200 text-slate-900"
                            : "bg-slate-50/40 border-slate-100 text-slate-400 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-bold text-xs ${isFeatureUnavailable ? "line-through text-slate-500" : ""}`}>
                              {claim.name}
                            </span>
                            <Tag color={isFeatureUnavailable ? "volcano" : "cyan"} className="!text-[9px] !font-mono">
                              {featInfo.source}
                            </Tag>
                            {isGranted && isInherited && !isFeatureUnavailable && (
                              <Tag color="purple" className="!text-[9px] !font-semibold">Inherited</Tag>
                            )}
                            {isGranted && !isInherited && !role.isGlobalTemplate && !isFeatureUnavailable && (
                              <Tag color="emerald" className="!text-[9px] !font-bold">Custom Granted</Tag>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{claim.description}</span>
                          <span className="font-mono text-[9px] text-slate-400 block">{claim.id}</span>
                        </div>

                        <div className="shrink-0 pl-2">
                          {isFeatureUnavailable ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                              <Lock className="w-3 h-3 text-rose-600" /> Feature {featInfo.state}
                            </span>
                          ) : isGranted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Granted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Not Granted
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
};
