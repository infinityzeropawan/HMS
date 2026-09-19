"use client";

import React, { useState } from "react";
import { Drawer, Tag, Card, Select, Badge, Switch, Alert, Button } from "antd";
import {
  SlidersHorizontal,
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Key,
  Layers,
  Sparkles,
} from "lucide-react";
import { FEATURE_CATALOG } from "../../_super_admin_services/feature_catalog_service";
import { PERMISSION_CLAIMS } from "../../_super_admin_services/rbac_catalog_service";
import { RoleDefinition } from "../../_super_admin_types/rbac_management";
import {
  UnifiedAuthEvaluator,
  AccessEvaluationResult,
  FEATURE_ID_ALIAS_MAP,
} from "../../_super_admin_services/unified_auth_evaluator";
import { getPlanByTenant } from "../../_super_admin_services/subscription_plan_service";
import { useRbacControlStore } from "../../_super_admin_stores/rbac_control_store";

interface FeaturePermissionMappingDrawerProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
}

export const FeaturePermissionMappingDrawer: React.FC<FeaturePermissionMappingDrawerProps> = ({
  open,
  onClose,
  tenantId,
}) => {
  const { getRolesForTenant } = useRbacControlStore();
  const roles = getRolesForTenant(tenantId);
  const plan = getPlanByTenant(tenantId);

  // Simulator state
  const [simPermissionId, setSimPermissionId] = useState<string>("opd:encounter:write");
  const [simRoleId, setSimRoleId] = useState<string>("TMPL-DOC");
  const [simOnDuty, setSimOnDuty] = useState<boolean>(true);
  const [simBreakGlass, setSimBreakGlass] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<AccessEvaluationResult | null>(null);

  const selectedRole = roles.find((r: RoleDefinition) => r.id === simRoleId);

  const handleRunEvaluation = () => {
    const res = UnifiedAuthEvaluator.evaluateAccess({
      tenantId,
      permissionId: simPermissionId,
      userRoleId: simRoleId,
      userRole: selectedRole,
      departmentId: "Cardiology",
      isOnDutyRoster: simOnDuty,
      isEmergencyBreakGlass: simBreakGlass,
    });
    setEvalResult(res);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      title={
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Feature-Permission Mapping & Evaluation Engine
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Unified Authorization Logic & 5-Step Evaluation Pipeline (Tenant: {tenantId})
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 5-Step Pipeline Banner */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 5-Step Unified Evaluation Order
            </span>
            <Tag color="cyan" className="font-mono text-[10px]">
              Strict Order Enforced
            </Tag>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center text-[11px] font-medium pt-1">
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-teal-300 font-bold">1. Tenant</div>
              <div className="text-slate-400 text-[10px]">Active</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-teal-300 font-bold">2. Plan</div>
              <div className="text-slate-400 text-[10px]">Valid</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-teal-300 font-bold">3. Feature</div>
              <div className="text-slate-400 text-[10px]">Enabled</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-teal-300 font-bold">4. Role</div>
              <div className="text-slate-400 text-[10px]">Permission</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-teal-300 font-bold">5. Scope</div>
              <div className="text-slate-400 text-[10px]">Rule</div>
            </div>
          </div>
        </div>

        {/* Live Evaluation Simulator */}
        <Card
          title={
            <span className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Interactive Authorization Simulator
            </span>
          }
          className="border-slate-200 bg-slate-50/50"
          size="small"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Target Role</label>
                <Select
                  value={simRoleId}
                  onChange={setSimRoleId}
                  className="w-full text-xs"
                  options={roles.map((r: RoleDefinition) => ({
                    value: r.id,
                    label: `${r.name} (${r.isGlobalTemplate ? "Template" : "Custom"})`,
                  }))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Target Permission Claim</label>
                <Select
                  value={simPermissionId}
                  onChange={setSimPermissionId}
                  className="w-full text-xs"
                  options={PERMISSION_CLAIMS.map((c) => ({
                    value: c.id,
                    label: `${c.name} [${c.id}]`,
                  }))}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <Switch size="small" checked={simOnDuty} onChange={setSimOnDuty} />
                  On-Duty Shift Active
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <Switch size="small" checked={simBreakGlass} onChange={setSimBreakGlass} />
                  Emergency Break-Glass
                </label>
              </div>

              <Button type="primary" size="small" className="bg-teal-600 hover:bg-teal-700" onClick={handleRunEvaluation}>
                Evaluate Access
              </Button>
            </div>

            {/* Evaluation Results Output */}
            {evalResult && (
              <div className="mt-3 p-3 rounded-lg border bg-white space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Access Decision:</span>
                  {evalResult.allowed ? (
                    <Tag color="success" icon={<CheckCircle2 className="w-3 h-3 inline mr-1" />} className="font-bold">
                      ACCESS GRANTED (200 OK)
                    </Tag>
                  ) : (
                    <Tag color="error" icon={<XCircle className="w-3 h-3 inline mr-1" />} className="font-bold">
                      ACCESS DENIED (403 FORBIDDEN)
                    </Tag>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  {evalResult.stepTrace.map((step) => (
                    <div key={step.stepKey} className="flex items-start gap-2 text-xs">
                      {step.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-800">{step.stepName}:</span>{" "}
                        <span className={step.passed ? "text-slate-600" : "text-rose-600 font-medium"}>
                          {step.reason}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Feature to Permission Mappings Catalog */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" /> Feature-Permission Mappings & Licensing
          </h4>

          {FEATURE_CATALOG.map((feat) => {
            const aliasId = Object.keys(FEATURE_ID_ALIAS_MAP).find((k) => FEATURE_ID_ALIAS_MAP[k] === feat.id) || feat.id;
            const linkedClaims = PERMISSION_CLAIMS.filter((c) => c.requiredFeatureId === aliasId);
            const isRestricted = plan?.restrictedFeatures?.includes(feat.id) ?? false;
            const isOptional = plan?.optionalAddons?.includes(feat.id) ?? false;

            let featState = "Enabled";
            let featSource = "Included By Plan";
            let tagColor = "blue";

            if (isRestricted) {
              featState = "Restricted";
              featSource = "Restricted";
              tagColor = "volcano";
            } else if (isOptional) {
              if (feat.id === "FEAT-CLIN-06") {
                featState = "Disabled";
                featSource = "Optional Add-on";
                tagColor = "red";
              } else {
                featState = "Enabled";
                featSource = "Purchased Add-on";
                tagColor = "green";
              }
            }

            return (
              <div
                key={feat.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  featState === "Disabled" || featState === "Restricted"
                    ? "bg-slate-50 border-slate-200 opacity-90"
                    : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {feat.id}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{feat.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Tag color={tagColor} className="text-[10px] font-semibold">
                      {featSource}
                    </Tag>
                    {featState === "Disabled" || featState === "Restricted" ? (
                      <Tag color="error" icon={<Lock className="w-3 h-3 inline mr-1" />} className="text-[10px] font-bold">
                        {featState}
                      </Tag>
                    ) : (
                      <Tag color="success" icon={<CheckCircle2 className="w-3 h-3 inline mr-1" />} className="text-[10px] font-bold">
                        Active Feature
                      </Tag>
                    )}
                  </div>
                </div>

                {/* Claims linked */}
                <div className="pt-2 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Linked Permission Claims ({linkedClaims.length})
                  </div>

                  {linkedClaims.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No specific claims directly bound.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {linkedClaims.map((claim) => (
                        <div
                          key={claim.id}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            featState === "Disabled" || featState === "Restricted"
                              ? "bg-rose-50/50 border-rose-200 text-slate-500"
                              : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono font-medium truncate">{claim.id}</span>
                          </div>

                          {featState === "Disabled" || featState === "Restricted" ? (
                            <Tag color="red" className="text-[9px] font-bold shrink-0">
                              Unavailable
                            </Tag>
                          ) : (
                            <Tag color="green" className="text-[9px] font-bold shrink-0">
                              Available
                            </Tag>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
};
