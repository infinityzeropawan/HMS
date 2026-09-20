"use client";

import React, { useState } from "react";
import { Select, Tag, Switch, Dropdown, MenuProps, message, Tooltip, Input, Progress } from "antd";
import {
  Building2,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  Clock,
  Activity,
  Users,
  History,
  SlidersHorizontal,
  Layers,
  Route,
  ArrowRight,
  ShieldCheck,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import {
  LicenseState,
  FeatureDependencyViolation,
  FeatureCategory,
  FeatureDefinition,
  FeatureSource,
  FeatureTrialDetails,
} from "../../_super_admin_types/feature_management";
import { FeatureCatalogService } from "../../_super_admin_services/feature_catalog_service";
import { useFeatureControlStore } from "../../_super_admin_stores/feature_control_store";
import { DependencyWarningModal } from "./DependencyWarningModal";
import { RouteEnforcementPreviewModal } from "./RouteEnforcementPreviewModal";
import { DisableImpactPreviewModal } from "./DisableImpactPreviewModal";
import { PlanUpgradeModal } from "./PlanUpgradeModal";
import { ManageTrialModal } from "./ManageTrialModal";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { TenantApiService } from "../../_super_admin_services/tenant_api_service";


export const TenantFeatureAssignmentGrid: React.FC<{
  onOpenHistory: () => void;
}> = ({ onOpenHistory }) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>("TNT-9014");
  const [tenantOptions, setTenantOptions] = useState<{ value: string; label: string }[]>([]);
  const [tenantLoadError, setTenantLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [violation, setViolation] = useState<FeatureDependencyViolation | null>(null);
  const [pendingTargetChange, setPendingTargetChange] = useState<{
    featureId: string;
    newState: LicenseState;
  } | null>(null);

  // Route enforcement preview modal state
  const [routePreviewFeature, setRoutePreviewFeature] = useState<FeatureDefinition | null>(null);
  const [routePreviewOpen, setRoutePreviewOpen] = useState(false);

  // Disable impact preview modal state
  const [disableTargetFeature, setDisableTargetFeature] = useState<FeatureDefinition | null>(null);
  const [disableImpactOpen, setDisableImpactOpen] = useState(false);

  // Plan upgrade modal state
  const [upgradeTargetFeature, setUpgradeTargetFeature] = useState<FeatureDefinition | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Trial management modal state
  const [trialTargetFeature, setTrialTargetFeature] = useState<FeatureDefinition | null>(null);
  const [trialDetailsTarget, setTrialDetailsTarget] = useState<FeatureTrialDetails | undefined>(undefined);
  const [trialModalOpen, setTrialModalOpen] = useState(false);

  React.useEffect(() => {
    let cancelled = false;

    TenantApiService.fetchTenants({}, { field: "hospitalName", order: "asc" }, 1, 100)
      .then((response) => {
        if (cancelled) return;

        const options = response.tenants.map((tenant) => ({
          value: tenant.id,
          label: `${tenant.hospitalName} (${tenant.id})`,
        }));

        setTenantOptions(options);
        setTenantLoadError(null);

        if (options.length > 0 && !options.some((option) => option.value === selectedTenantId)) {
          setSelectedTenantId(options[0].value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTenantLoadError("Unable to load hospital tenants.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTenantId]);

  const {
    getTenantFeatureAssignments,
    getTenantFeatureStates,
    getTenantSubscriptionPlan,
    setFeatureState,
    startFeatureTrial,
    applyTemplate,
    getLicenseStats,
  } = useFeatureControlStore();

  const currentTenantLabel =
    tenantOptions.find((t) => t.value === selectedTenantId)?.label.split(" (")[0] || selectedTenantId;

  const currentPlan = getTenantSubscriptionPlan(selectedTenantId);
  const catalog = FeatureCatalogService.getCatalog();
  const templates = FeatureCatalogService.getTemplates();
  const assignments = getTenantFeatureAssignments(selectedTenantId);
  const currentStates = getTenantFeatureStates(selectedTenantId);
  const stats = getLicenseStats(selectedTenantId);

  const processStateChange = (featureId: string, newState: LicenseState) => {
    const violationCheck = FeatureCatalogService.validateDependencyChange(
      featureId,
      newState,
      currentStates
    );

    if (violationCheck) {
      setViolation(violationCheck);
      setPendingTargetChange({ featureId, newState });
    } else {
      executeStateChange(featureId, newState);
    }
  };

  // Handle Status Change Trigger with Dependency Validation & Disabling Impact Preview
  const handleStateChangeRequest = (featureId: string, newState: LicenseState) => {
    const assignment = assignments.find((a) => a.featureId === featureId);
    if (assignment?.featureSource === "Restricted") {
      const fDef = catalog.find((item) => item.id === featureId) || null;
      setUpgradeTargetFeature(fDef);
      setUpgradeModalOpen(true);
      return;
    }

    if (newState === "Trial") {
      const fDef = catalog.find((item) => item.id === featureId) || null;
      startFeatureTrial(selectedTenantId, currentTenantLabel, featureId, 30);
      setTrialTargetFeature(fDef);
      setTrialDetailsTarget(assignment?.trialDetails);
      setTrialModalOpen(true);
      return;
    }

    if (newState === "Disabled" && currentStates[featureId] !== "Disabled") {
      const fDef = catalog.find((item) => item.id === featureId) || null;
      setDisableTargetFeature(fDef);
      setDisableImpactOpen(true);
      return;
    }

    processStateChange(featureId, newState);
  };

  const executeStateChange = (featureId: string, newState: LicenseState) => {
    const success = setFeatureState(selectedTenantId, currentTenantLabel, featureId, newState);
    if (success) {
      message.success(`Feature license status updated to ${newState}`);
    } else {
      const fDef = catalog.find((item) => item.id === featureId) || null;
      setUpgradeTargetFeature(fDef);
      setUpgradeModalOpen(true);
    }
  };

  const handleAutoResolveDependency = () => {
    if (!pendingTargetChange || !violation) return;

    if (violation.missingPrerequisites.length > 0) {
      // Auto-enable missing prerequisites
      violation.missingPrerequisites.forEach((req) => {
        setFeatureState(selectedTenantId, currentTenantLabel, req.id, "Enabled", "Auto-enabled prerequisite");
      });
      executeStateChange(pendingTargetChange.featureId, pendingTargetChange.newState);
      message.success("Auto-enabled prerequisites and updated target feature state!");
    } else if (violation.affectedDownstream.length > 0) {
      // Auto-disable dependent downstream modules
      violation.affectedDownstream.forEach((aff) => {
        setFeatureState(selectedTenantId, currentTenantLabel, aff.id, "Disabled", "Auto-disabled downstream module");
      });
      executeStateChange(pendingTargetChange.featureId, pendingTargetChange.newState);
      message.warning("Auto-disabled dependent downstream modules.");
    }

    setViolation(null);
    setPendingTargetChange(null);
  };

  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = templates.find((t) => t.id === tmplId);
    if (!tmpl) return;

    applyTemplate(selectedTenantId, currentTenantLabel, tmplId);
    message.success(`Applied 1-click license preset template "${tmpl.name}" to ${currentTenantLabel}`);
  };

  const templateMenuItems: MenuProps["items"] = templates.map((tmpl) => ({
    key: tmpl.id,
    label: (
      <div>
        <div className="font-bold text-slate-900 text-xs">{tmpl.name}</div>
        <div className="text-[11px] text-slate-500">{tmpl.description}</div>
      </div>
    ),
    onClick: () => handleApplyTemplate(tmpl.id),
  }));

  const filteredCatalog = catalog.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderSourceTag = (source: FeatureSource, trial?: FeatureTrialDetails) => {
    switch (source) {
      case "Included By Plan":
        return (
          <Tag color="green" className="!font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Included By Plan
          </Tag>
        );
      case "Purchased Add-on":
        return (
          <Tag color="teal" className="!font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Purchased Add-on
          </Tag>
        );
      case "Optional Add-on":
        return (
          <Tag color="default" className="!font-semibold">
            Optional Add-on
          </Tag>
        );
      case "Trial Feature":
        const statusColor = trial?.status === "Expired" ? "red" : trial?.status === "Expiring Soon" ? "volcano" : "cyan";
        return (
          <Tag color={statusColor} className="!font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Trial: {trial?.status || "Active"} ({trial?.remainingDays ?? 14}d left)
          </Tag>
        );
      case "Restricted":
        return (
          <Tag color="volcano" className="!font-bold flex items-center gap-1">
            <Lock className="w-3 h-3" /> Restricted
          </Tag>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Tenant Control Selector & Preset Template Actions */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Selected Hospital Tenant:
            </span>
          </div>
          <Select
            value={selectedTenantId}
            onChange={(val) => setSelectedTenantId(val)}
            options={tenantOptions}
            loading={tenantOptions.length === 0 && !tenantLoadError}
            className="w-full sm:w-80 font-semibold"
            size="large"
            notFoundContent={tenantLoadError || "No hospital tenants found"}
          />
          <Tag
            color={currentPlan === "Enterprise" ? "gold" : currentPlan === "Super Specialty" ? "purple" : currentPlan === "Professional" ? "blue" : "volcano"}
            className="!font-extrabold !px-3 !py-1 flex items-center gap-1.5 text-xs shrink-0"
          >
            <ShieldCheck className="w-4 h-4" /> Subscription Plan: {currentPlan}
          </Tag>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Dropdown menu={{ items: templateMenuItems }} trigger={["click"]}>
            <HmsButton variant="secondary" icon={<Layers className="w-4 h-4 text-teal-400" />}>
              1-Click Preset Templates
            </HmsButton>
          </Dropdown>

          <HmsButton variant="secondary" icon={<History className="w-4 h-4" />} onClick={onOpenHistory}>
            Audit Trail
          </HmsButton>
        </div>
      </div>

      {/* Tenant source health */}
      {tenantLoadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800" role="status">
          {tenantLoadError} Feature assignment controls are still using the selected tenant ID.
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <Input
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Filter features by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 text-xs"
          allowClear
        />

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Category:</span>
          <Select
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            className="w-36"
            size="small"
          >
            <Select.Option value="ALL">All Categories</Select.Option>
            <Select.Option value="Clinical">Clinical</Select.Option>
            <Select.Option value="Business">Business</Select.Option>
            <Select.Option value="Integrations">Integrations</Select.Option>
            <Select.Option value="Premium">Premium</Select.Option>
          </Select>
        </div>
      </div>

      {/* Feature Assignment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCatalog.map((f) => {
          const assignment = assignments.find((a) => a.featureId === f.id);
          const currentState = assignment?.state || "Disabled";
          const isRestricted = assignment?.featureSource === "Restricted";
          const isTrial = currentState === "Trial" || assignment?.featureSource === "Trial Feature";
          const trial = assignment?.trialDetails;

          return (
            <HmsCard
              key={f.id}
              elevated
              className={`!p-4 border transition-all ${
                isRestricted
                  ? "bg-rose-50/30 border-rose-200"
                  : isTrial
                  ? trial?.status === "Expiring Soon"
                    ? "bg-amber-50/50 border-amber-300"
                    : trial?.status === "Expired"
                    ? "bg-rose-50/50 border-rose-300"
                    : "bg-sky-50/40 border-sky-200"
                  : currentState === "Enabled"
                  ? "bg-white border-teal-200 shadow-xs"
                  : "bg-slate-50/80 border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
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
                    {assignment && renderSourceTag(assignment.featureSource, trial)}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                    {f.name}
                    {isRestricted && <Lock className="w-4 h-4 text-rose-500" />}
                    {isTrial && <Clock className="w-4 h-4 text-sky-600" />}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.description}</p>
                </div>

                {/* License State Selector */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    License State
                  </span>
                  <Select
                    value={currentState}
                    disabled={isRestricted}
                    onChange={(val) => handleStateChangeRequest(f.id, val as LicenseState)}
                    className="w-28 text-xs font-bold"
                    size="small"
                  >
                    <Select.Option value="Enabled">
                      <span className="text-emerald-600 font-bold">✓ Enabled</span>
                    </Select.Option>
                    <Select.Option value="Disabled">
                      <span className="text-slate-500">✕ Disabled</span>
                    </Select.Option>
                    <Select.Option value="Trial">
                      <span className="text-sky-600 font-bold">⏱ Trial</span>
                    </Select.Option>
                    <Select.Option value="Restricted">
                      <span className="text-rose-600 font-bold">🔒 Restricted</span>
                    </Select.Option>
                  </Select>
                </div>
              </div>

              {/* Trial Telemetry & Contextual Banners */}
              {isTrial && trial && (
                <div className="mt-3 space-y-2">
                  {/* Warning Banner: < 7 Days Remaining (Critical Alert) */}
                  {trial.remainingDays <= 7 && trial.remainingDays > 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-100/90 border border-rose-300 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-rose-900 font-semibold">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          <strong>Expiring Soon ({trial.remainingDays}d remaining)</strong> — Action required to prevent service lock!
                        </span>
                      </div>
                      <HmsButton
                        size="sm"
                        variant="danger"
                        icon={<Clock className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setTrialTargetFeature(f);
                          setTrialDetailsTarget(trial);
                          setTrialModalOpen(true);
                        }}
                      >
                        Manage Trial
                      </HmsButton>
                    </div>
                  )}

                  {/* Warning Banner: < 30 Days & > 7 Days Remaining (Expiry Notice) */}
                  {trial.remainingDays <= 30 && trial.remainingDays > 7 && (
                    <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-amber-900">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Trial Active: <strong>{trial.remainingDays} days remaining</strong> (Expires on {trial.endDate})
                        </span>
                      </div>
                      <HmsButton
                        size="sm"
                        variant="secondary"
                        icon={<Clock className="w-3.5 h-3.5 text-teal-600" />}
                        onClick={() => {
                          setTrialTargetFeature(f);
                          setTrialDetailsTarget(trial);
                          setTrialModalOpen(true);
                        }}
                      >
                        Manage Trial
                      </HmsButton>
                    </div>
                  )}

                  {/* Warning Banner: Expired Trial */}
                  {trial.remainingDays <= 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-100/90 border border-rose-300 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-rose-900 font-bold">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Trial Expired on {trial.endDate}. Action required.</span>
                      </div>
                      <HmsButton
                        size="sm"
                        variant="danger"
                        icon={<Clock className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setTrialTargetFeature(f);
                          setTrialDetailsTarget(trial);
                          setTrialModalOpen(true);
                        }}
                      >
                        Extend / Convert
                      </HmsButton>
                    </div>
                  )}

                  {/* Trial Dates Bar */}
                  <div className="p-2 rounded-lg bg-sky-50/70 border border-sky-200/80 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-600" /> Start: {trial.startDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-600" /> End: {trial.endDate}
                    </span>
                  </div>
                </div>
              )}

              {/* Restriction Alert Box */}
              {isRestricted && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-50/90 border border-rose-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-rose-900">
                    <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">Restricted under {currentPlan} Plan</span>
                      <span className="text-[10px] text-rose-700 block">{assignment?.restrictionReason}</span>
                    </div>
                  </div>
                  <HmsButton
                    size="sm"
                    variant="danger"
                    icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setUpgradeTargetFeature(f);
                      setUpgradeModalOpen(true);
                    }}
                  >
                    Upgrade Plan
                  </HmsButton>
                </div>
              )}

              {/* Usage Metrics Telemetry */}
              {assignment && !isRestricted && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span>Active Users: <strong className="text-slate-900">{assignment.usage.activeUsers}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>Usage Count: <strong className="text-slate-900">{assignment.usage.usageCount}</strong></span>
                  </div>
                  <button
                    onClick={() => {
                      setRoutePreviewFeature(f);
                      setRoutePreviewOpen(true);
                    }}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-0.5 cursor-pointer ml-auto"
                  >
                    Routes <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </HmsCard>
          );
        })}
      </div>

      {/* Dependency Warning Modal */}
      <DependencyWarningModal
        violation={violation}
        open={Boolean(violation)}
        onClose={() => {
          setViolation(null);
          setPendingTargetChange(null);
        }}
        onAutoResolve={handleAutoResolveDependency}
      />

      {/* Route Enforcement Preview Modal */}
      <RouteEnforcementPreviewModal
        feature={routePreviewFeature}
        open={routePreviewOpen}
        onClose={() => setRoutePreviewOpen(false)}
      />

      {/* Disabling Impact Preview Modal */}
      <DisableImpactPreviewModal
        feature={disableTargetFeature}
        tenantName={currentTenantLabel}
        open={disableImpactOpen}
        onClose={() => setDisableImpactOpen(false)}
        onConfirmDisable={() => {
          if (disableTargetFeature) {
            processStateChange(disableTargetFeature.id, "Disabled");
          }
        }}
      />

      {/* Plan Upgrade Recommendation Modal */}
      <PlanUpgradeModal
        tenantId={selectedTenantId}
        tenantName={currentTenantLabel}
        currentPlan={currentPlan}
        feature={upgradeTargetFeature}
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />

      {/* Manage Trial Modal */}
      <ManageTrialModal
        tenantId={selectedTenantId}
        tenantName={currentTenantLabel}
        feature={trialTargetFeature}
        trialDetails={trialDetailsTarget}
        open={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
      />
    </div>
  );
};
