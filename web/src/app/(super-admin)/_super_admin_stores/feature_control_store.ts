"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SubscriptionPlan } from "../_super_admin_types/tenant_management";
import {
  LicenseState,
  FeatureHistoryRecord,
  LicenseEnforcementStats,
  TenantFeatureAssignment,
  FeatureSource,
  FeatureTrialDetails,
  TrialStatus,
} from "../_super_admin_types/feature_management";
import { FeatureCatalogService } from "../_super_admin_services/feature_catalog_service";
import { SubscriptionPlanService } from "../_super_admin_services/subscription_plan_service";
import { PlatformAuditService } from "../_super_admin_services/platform_audit_service";

interface StoredTrialRecord {
  startDate: string;
  endDate: string;
  estimatedMonthlyPrice: number;
  autoConvertOnExpiry: boolean;
}

interface FeatureControlStoreState {
  // Tenant ID -> (Feature ID -> LicenseState)
  tenantAssignments: Record<string, Record<string, LicenseState>>;

  // Tenant ID -> SubscriptionPlan
  tenantSubscriptionPlans: Record<string, SubscriptionPlan>;

  // Tenant ID -> (Feature ID -> StoredTrialRecord)
  tenantTrialRecords: Record<string, Record<string, StoredTrialRecord>>;

  // Feature ID -> Global Kill Switch (true if Globally Killed/Disabled)
  globalKillSwitches: Record<string, boolean>;

  // Audit History Trail
  historyLogs: FeatureHistoryRecord[];

  // Actions
  getTenantSubscriptionPlan: (tenantId: string) => SubscriptionPlan | undefined;
  updateTenantSubscriptionPlan: (tenantId: string, newPlan: SubscriptionPlan) => void;
  getTenantFeatureStates: (tenantId: string) => Record<string, LicenseState>;
  getTenantFeatureAssignments: (tenantId: string) => TenantFeatureAssignment[];
  setFeatureState: (
    tenantId: string,
    tenantName: string,
    featureId: string,
    newState: LicenseState,
    reason?: string,
    adminName?: string
  ) => boolean;
  startFeatureTrial: (
    tenantId: string,
    tenantName: string,
    featureId: string,
    durationDays?: number,
    adminName?: string
  ) => void;
  extendFeatureTrial: (
    tenantId: string,
    tenantName: string,
    featureId: string,
    additionalDays: number,
    reason?: string,
    adminName?: string
  ) => void;
  convertTrialToPaid: (
    tenantId: string,
    tenantName: string,
    featureId: string,
    adminName?: string
  ) => void;
  disableFeatureTrial: (
    tenantId: string,
    tenantName: string,
    featureId: string,
    reason?: string,
    adminName?: string
  ) => void;
  applyTemplate: (tenantId: string, tenantName: string, templateId: string, adminName?: string) => void;
  toggleGlobalKillSwitch: (featureId: string, killStatus: boolean, reason?: string, adminName?: string) => void;
  getLicenseStats: (tenantId: string) => LicenseEnforcementStats;
  getRouteEnforcement: (tenantId: string) => {
    allowedRoutes: string[];
    hiddenRoutes: string[];
    blockedRoutes: string[];
  };
}

const INITIAL_TENANT_PLANS: Record<string, SubscriptionPlan> = {
  "TNT-9014": "Enterprise",
  "TNT-1042": "Enterprise",
  "TNT-2088": "Enterprise",
  "TNT-3105": "Professional",
  "TNT-4412": "Enterprise",
  "TENANT-003": "Basic",
  "TNT-5611": "Enterprise",
};


const recordFeatureAudit = (
  action: string,
  tenantId: string,
  tenantName: string,
  featureId: string,
  details: Record<string, unknown>,
  reason: string,
  adminName: string
) => {
  PlatformAuditService.recordAuditEvent({
    actor: adminName,
    actorRole: "SUPER_ADMIN",
    action,
    category: "FEATURE_LICENSE_EVENT",
    entity: tenantName + " (" + tenantId + ")",
    ipAddress: "N/A",
    riskLevel: action.includes("DISABLED") || action.includes("KILL") ? "WARNING" : "INFO",
    details: JSON.stringify({ featureId, ...details, reason }),
  });
};

// Date helper utility for trials
const formatDateOffset = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
};

// Initial mock trial records for active trial demonstrations
const INITIAL_TRIAL_RECORDS: Record<string, Record<string, StoredTrialRecord>> = {
  "TNT-1042": {
    "FEAT-CLIN-07": {
      startDate: formatDateOffset(-8),
      endDate: formatDateOffset(22),
      estimatedMonthlyPrice: 14999,
      autoConvertOnExpiry: false,
    },
    "FEAT-INT-01": {
      startDate: formatDateOffset(-26),
      endDate: formatDateOffset(4),
      estimatedMonthlyPrice: 19999,
      autoConvertOnExpiry: true,
    },
  },
  "TNT-9014": {
    "FEAT-PREM-02": {
      startDate: formatDateOffset(-30),
      endDate: formatDateOffset(0),
      estimatedMonthlyPrice: 24999,
      autoConvertOnExpiry: false,
    },
  },
};

// Initial default state generator for mock tenants
const createInitialAssignments = (): Record<string, Record<string, LicenseState>> => {
  const catalog = FeatureCatalogService.getCatalog();
  const defaultStates: Record<string, LicenseState> = {};

  catalog.forEach((f) => {
    defaultStates[f.id] = f.isPremium ? "Restricted" : "Enabled";
  });

  return {
    "TNT-9014": { ...defaultStates, "FEAT-PREM-01": "Enabled", "FEAT-CLIN-07": "Enabled", "FEAT-PREM-02": "Trial" },
    "TNT-1042": { ...defaultStates, "FEAT-BIZ-03": "Enabled", "FEAT-CLIN-07": "Trial", "FEAT-INT-01": "Trial" },
    "TENANT-003": {
      "FEAT-CLIN-01": "Enabled",
      "FEAT-BIZ-01": "Enabled",
      "FEAT-CLIN-02": "Restricted",
      "FEAT-CLIN-03": "Restricted",
      "FEAT-BIZ-03": "Disabled",
      "FEAT-CLIN-05": "Restricted",
      "FEAT-CLIN-06": "Restricted",
      "FEAT-CLIN-07": "Restricted",
      "FEAT-CLIN-08": "Restricted",
      "FEAT-BIZ-02": "Disabled",
      "FEAT-INT-01": "Restricted",
      "FEAT-INT-02": "Restricted",
      "FEAT-PREM-01": "Restricted",
      "FEAT-PREM-02": "Restricted",
    },
  };
};

const computeTrialTelemetry = (stored: StoredTrialRecord): FeatureTrialDetails => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(stored.endDate);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: TrialStatus = "Active";
  if (remainingDays <= 0) {
    status = "Expired";
  } else if (remainingDays <= 7) {
    status = "Expiring Soon";
  }

  return {
    startDate: stored.startDate,
    endDate: stored.endDate,
    remainingDays: remainingDays < 0 ? 0 : remainingDays,
    status,
    estimatedMonthlyPrice: stored.estimatedMonthlyPrice,
    autoConvertOnExpiry: stored.autoConvertOnExpiry,
  };
};

export const useFeatureControlStore = create<FeatureControlStoreState>()(
  persist(
    (set, get) => ({
      tenantAssignments: createInitialAssignments(),
      tenantSubscriptionPlans: INITIAL_TENANT_PLANS,
      tenantTrialRecords: INITIAL_TRIAL_RECORDS,
      globalKillSwitches: {},
      historyLogs: [
        {
          id: "HIST-101",
          featureId: "FEAT-PREM-01",
          featureName: "AI Clinical Decision Support (CDSS)",
          tenantId: "TNT-9014",
          tenantName: "Apollo Super Speciality Hospital",
          action: "ENABLED",
          performedBy: "SuperAdmin Console",
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toTimeString().slice(0, 8),
          timestamp: new Date().toISOString(),
          reason: "Enterprise Tier Upgrade",
        },
        {
          id: "HIST-102",
          featureId: "FEAT-CLIN-06",
          featureName: "Telemedicine & Virtual Care Desk",
          tenantId: "TNT-1042",
          tenantName: "Fortis Heart & Vascular Institute",
          action: "TRIAL_STARTED",
          performedBy: "SuperAdmin Console",
          date: formatDateOffset(-8),
          time: "10:30:00",
          timestamp: new Date().toISOString(),
          reason: "Initiated 30-Day Evaluation Trial",
        },
      ],

      getTenantSubscriptionPlan: (tenantId) => {
        const state = get();
        const planFromSubscriptionService = SubscriptionPlanService.getPlanByTenant(tenantId);
        if (planFromSubscriptionService) {
          switch (planFromSubscriptionService.code) {
            case "BASIC":
              return "Basic";
            case "PRO":
              return "Professional";
            case "ENTERPRISE":
              return "Enterprise";
            default:
              return undefined;
          }
        }
        return state.tenantSubscriptionPlans[tenantId];
      },

      updateTenantSubscriptionPlan: (tenantId, newPlan) => {
        const state = get();
        const planDef = SubscriptionPlanService.getPlan(newPlan);
        const catalog = FeatureCatalogService.getCatalog();
        const currentStates = state.getTenantFeatureStates(tenantId);
        const updatedStates: Record<string, LicenseState> = { ...currentStates };

        // Adjust features based on new plan tier
        catalog.forEach((f) => {
          if (planDef?.restrictedFeatures?.includes(f.id)) {
            updatedStates[f.id] = "Restricted";
          } else if (planDef?.includedFeatures?.includes(f.id)) {
            if (updatedStates[f.id] === "Restricted" || updatedStates[f.id] === "Disabled") {
              updatedStates[f.id] = "Enabled";
            }
          }
        });

        const now = new Date();
        const historyItem: FeatureHistoryRecord = {
          id: `HIST-${Math.floor(1000 + Math.random() * 9000)}`,
          featureId: `PLAN-${newPlan.toUpperCase()}`,
          featureName: `Subscription Plan Upgrade: ${planDef?.name || newPlan}`,
          tenantId,
          tenantName: tenantId,
          action: "TEMPLATE_APPLIED",
          performedBy: "SuperAdmin Billing Manager",
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8),
          timestamp: now.toISOString(),
          reason: `Subscription Plan updated to ${newPlan}`,
        };

        set({
          tenantSubscriptionPlans: {
            ...state.tenantSubscriptionPlans,
            [tenantId]: newPlan,
          },
          tenantAssignments: {
            ...state.tenantAssignments,
            [tenantId]: updatedStates,
          },
          historyLogs: [historyItem, ...state.historyLogs],
        });
      },

      getTenantFeatureStates: (tenantId) => {
        const state = get();
        const assignments = state.tenantAssignments[tenantId];
        const planCode = state.getTenantSubscriptionPlan(tenantId);
        const planDef = planCode ? SubscriptionPlanService.getPlan(planCode) : undefined;

        if (!assignments) {
          const catalog = FeatureCatalogService.getCatalog();
          const fallback: Record<string, LicenseState> = {};
          catalog.forEach((f) => {
            if (planDef?.restrictedFeatures?.includes(f.id)) {
              fallback[f.id] = "Restricted";
            } else if (planDef?.includedFeatures?.includes(f.id)) {
              fallback[f.id] = "Enabled";
            } else {
              fallback[f.id] = "Disabled";
            }
          });
          return fallback;
        }
        return assignments;
      },

      getTenantFeatureAssignments: (tenantId) => {
        const state = get();
        const catalog = FeatureCatalogService.getCatalog();
        const featureStates = state.getTenantFeatureStates(tenantId);
        const planCode = state.getTenantSubscriptionPlan(tenantId);
        const planDef = planCode ? SubscriptionPlanService.getPlan(planCode) : undefined;

        return catalog.map((f, idx) => {
          const isKilled = state.globalKillSwitches[f.id] || false;
          let assignedState = isKilled ? "Disabled" : featureStates[f.id] || "Disabled";

          const isRestrictedByPlan = planDef?.restrictedFeatures?.includes(f.id) ?? false;
          if (isRestrictedByPlan) {
            assignedState = "Restricted";
          }

          const featureSource: FeatureSource = planCode
            ? SubscriptionPlanService.getFeatureSource(planCode, f.id)
            : "Restricted";

          const restrictionReason = isRestrictedByPlan
            ? planCode
              ? SubscriptionPlanService.getRestrictionReason(planCode, f.id)
              : undefined
            : undefined;

          // Compute trial details if feature is in Trial state
          let trialDetails: FeatureTrialDetails | undefined = undefined;
          if (assignedState === "Trial" || featureSource === "Trial Feature") {
            const stored = state.tenantTrialRecords[tenantId]?.[f.id] || {
              startDate: formatDateOffset(-14),
              endDate: formatDateOffset(16),
              estimatedMonthlyPrice: 12500,
              autoConvertOnExpiry: false,
            };
            trialDetails = computeTrialTelemetry(stored);
          }

          return {
            featureId: f.id,
            state: assignedState,
            featureSource,
            restrictionReason,
            trialDetails,
            usage: {
              activeUsers: assignedState === "Restricted" || assignedState === "Disabled" ? 0 : Math.floor(15 + (idx + 1) * 8.5),
              usageCount: assignedState === "Restricted" || assignedState === "Disabled" ? 0 : Math.floor(120 + (idx + 1) * 140),
              lastAccessed: assignedState === "Restricted" || assignedState === "Disabled" ? "Never" : `${Math.floor(2 + idx * 3)} mins ago`,
            },
            updatedAt: new Date().toISOString().slice(0, 10),
            updatedBy: "SuperAdmin System",
          };
        });
      },

      setFeatureState: (tenantId, tenantName, featureId, newState, reason = "Manual Admin Change", adminName = "Super Admin Console") => {
        const state = get();
        const feature = FeatureCatalogService.getFeatureById(featureId);
        if (!feature) return false;

        const planCode = state.getTenantSubscriptionPlan(tenantId);
        const planDef = SubscriptionPlanService.getPlan(planCode);

        // Prevent enabling restricted features
        if ((newState === "Enabled" || newState === "Trial") && (planDef?.restrictedFeatures?.includes(featureId) ?? false)) {
          return false;
        }

        const currentTenantStates = state.getTenantFeatureStates(tenantId);
        const updatedTenantStates = {
          ...currentTenantStates,
          [featureId]: newState,
        };

        // If setting state to Trial, initialize trial record if missing
        const updatedTrialRecords = { ...state.tenantTrialRecords };
        if (newState === "Trial") {
          if (!updatedTrialRecords[tenantId]) updatedTrialRecords[tenantId] = {};
          if (!updatedTrialRecords[tenantId][featureId]) {
            updatedTrialRecords[tenantId][featureId] = {
              startDate: formatDateOffset(0),
              endDate: formatDateOffset(30),
              estimatedMonthlyPrice: 14999,
              autoConvertOnExpiry: false,
            };
          }
        }

        const now = new Date();
        const historyItem: FeatureHistoryRecord = {
          id: `HIST-${Math.floor(1000 + Math.random() * 9000)}`,
          featureId,
          featureName: feature.name,
          tenantId,
          tenantName,
          action: newState === "Enabled" ? "ENABLED" : newState === "Trial" ? "TRIAL_STARTED" : "DISABLED",
          performedBy: adminName,
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8),
          timestamp: now.toISOString(),
          reason,
        };

        set({
          tenantAssignments: {
            ...state.tenantAssignments,
            [tenantId]: updatedTenantStates,
          },
          tenantTrialRecords: updatedTrialRecords,
          historyLogs: [historyItem, ...state.historyLogs],
        });

        return true;
      },

      startFeatureTrial: (tenantId, tenantName, featureId, durationDays = 30, adminName = "Super Admin Console") => {
        const state = get();
        const feature = FeatureCatalogService.getFeatureById(featureId);
        if (!feature) return;

        const tenantTrials = state.tenantTrialRecords[tenantId] || {};
        const updatedTrials = {
          ...tenantTrials,
          [featureId]: {
            startDate: formatDateOffset(0),
            endDate: formatDateOffset(durationDays),
            estimatedMonthlyPrice: 14999,
            autoConvertOnExpiry: false,
          },
        };

        state.setFeatureState(
          tenantId,
          tenantName,
          featureId,
          "Trial",
          `Initiated ${durationDays}-day trial period`,
          adminName
        );

        set({
          tenantTrialRecords: {
            ...state.tenantTrialRecords,
            [tenantId]: updatedTrials,
          },
        });
      },

      extendFeatureTrial: (tenantId, tenantName, featureId, additionalDays, reason = "SuperAdmin Trial Extension", adminName = "Super Admin Console") => {
        const state = get();
        const feature = FeatureCatalogService.getFeatureById(featureId);
        if (!feature) return;

        const stored = state.tenantTrialRecords[tenantId]?.[featureId] || {
          startDate: formatDateOffset(-14),
          endDate: formatDateOffset(14),
          estimatedMonthlyPrice: 14999,
          autoConvertOnExpiry: false,
        };

        const currentEndDate = new Date(stored.endDate);
        currentEndDate.setDate(currentEndDate.getDate() + additionalDays);
        const newEndDateStr = currentEndDate.toISOString().slice(0, 10);

        const updatedTenantTrials = {
          ...(state.tenantTrialRecords[tenantId] || {}),
          [featureId]: {
            ...stored,
            endDate: newEndDateStr,
          },
        };

        const now = new Date();
        const historyItem: FeatureHistoryRecord = {
          id: `HIST-${Math.floor(1000 + Math.random() * 9000)}`,
          featureId,
          featureName: feature.name,
          tenantId,
          tenantName,
          action: "TRIAL_EXTENDED",
          performedBy: adminName,
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8),
          timestamp: now.toISOString(),
          reason: `Extended trial by +${additionalDays} days (New expiry: ${newEndDateStr}). Rationale: ${reason}`,
        };

        set({
          tenantTrialRecords: {
            ...state.tenantTrialRecords,
            [tenantId]: updatedTenantTrials,
          },
          historyLogs: [historyItem, ...state.historyLogs],
        });

        recordFeatureAudit(
          "Feature trial extended",
          tenantId,
          tenantName,
          featureId,
          { additionalDays, newEndDate: newEndDateStr },
          reason,
          adminName
        );
      },

      convertTrialToPaid: (tenantId, tenantName, featureId, adminName = "Super Admin Console") => {
        const state = get();
        const feature = FeatureCatalogService.getFeatureById(featureId);
        if (!feature) return;

        const currentTenantStates = state.getTenantFeatureStates(tenantId);
        const updatedTenantStates = {
          ...currentTenantStates,
          [featureId]: "Enabled" as LicenseState,
        };

        const now = new Date();
        const historyItem: FeatureHistoryRecord = {
          id: `HIST-${Math.floor(1000 + Math.random() * 9000)}`,
          featureId,
          featureName: feature.name,
          tenantId,
          tenantName,
          action: "CONVERTED_TO_PAID",
          performedBy: adminName,
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8),
          timestamp: now.toISOString(),
          reason: `Converted trial feature "${feature.name}" to paid active subscription license`,
        };

        set({
          tenantAssignments: {
            ...state.tenantAssignments,
            [tenantId]: updatedTenantStates,
          },
          historyLogs: [historyItem, ...state.historyLogs],
        });

        recordFeatureAudit(
          "Trial converted to paid feature",
          tenantId,
          tenantName,
          featureId,
          { state: "Enabled" },
          "Trial converted to paid active subscription",
          adminName
        );
      },

      disableFeatureTrial: (tenantId, tenantName, featureId, reason = "Trial Revoked", adminName = "Super Admin Console") => {
        const state = get();
        const feature = FeatureCatalogService.getFeatureById(featureId);
        if (!feature) return;

        const currentTenantStates = state.getTenantFeatureStates(tenantId);
        const updatedTenantStates = {
          ...currentTenantStates,
          [featureId]: "Disabled" as LicenseState,
        };

        const now = new Date();
        const historyItem: FeatureHistoryRecord = {
          id: `HIST-${Math.floor(1000 + Math.random() * 9000)}`,
          featureId,
          featureName: feature.name,
          tenantId,
          tenantName,
          action: "TRIAL_DISABLED",
          performedBy: adminName,
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8),
          timestamp: now.toISOString(),
          reason: `Disabled trial feature "${feature.name}". Rationale: ${reason}`,
        };

        set({
          tenantAssignments: {
            ...state.tenantAssignments,
            [tenantId]: updatedTenantStates,
          },
          historyLogs: [historyItem, ...state.historyLogs],
        });

        recordFeatureAudit(
          "Feature trial disabled",
          tenantId,
          tenantName,
          featureId,
          { state: "Disabled" },
          reason,
          adminName
        );
      },

      applyTemplate: (tenantId, tenantName, templateId, adminName = "Super Admin Console") => {
        const state = get();
        const templates = FeatureCatalogService.getTemplates();
        const tmpl = templates.find((t) => t.id === templateId);
        if (!tmpl) return;

        const catalog = FeatureCatalogService.getCatalog();
        const planCode = state.getTenantSubscriptionPlan(tenantId);
        const planDef = SubscriptionPlanService.getPlan(planCode);
        const newStates: Record<string, LicenseState> = {};

        catalog.forEach((f) => {
          if (planDef?.restrictedFeatures?.includes(f.id)) {
            newStates[f.id] = "Restricted";
          } else if (tmpl.featureIds.includes(f.id)) {
            newStates[f.id] = "Enabled";
          } else {
            newStates[f.id] = "Disabled";
          }
        });

        const now = new Date();
        const historyItem: FeatureHistoryRecord = {
          id: `HIST-${Math.floor(1000 + Math.random() * 9000)}`,
          featureId: templateId,
          featureName: `Preset Template: ${tmpl.name}`,
          tenantId,
          tenantName,
          action: "TEMPLATE_APPLIED",
          performedBy: adminName,
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8),
          timestamp: now.toISOString(),
          reason: `Applied preset license template ${tmpl.name}`,
        };

        set({
          tenantAssignments: {
            ...state.tenantAssignments,
            [tenantId]: newStates,
          },
          historyLogs: [historyItem, ...state.historyLogs],
        });

        recordFeatureAudit(
          "Feature preset template applied",
          tenantId,
          tenantName,
          templateId,
          { templateId: tmpl.id, templateName: tmpl.name },
          historyItem.reason,
          adminName
        );
      },

      toggleGlobalKillSwitch: (featureId, killStatus, reason = "Global Kill Switch Update", adminName = "Super Admin Console") => {
        const state = get();
        const feature = FeatureCatalogService.getFeatureById(featureId);
        if (!feature) return;

        const now = new Date();
        const historyItem: FeatureHistoryRecord = {
          id: `HIST-${Math.floor(1000 + Math.random() * 9000)}`,
          featureId,
          featureName: feature.name,
          tenantId: "ALL_TENANTS",
          tenantName: "Global Multi-Tenant Network",
          action: killStatus ? "GLOBAL_KILL_SWITCH_ON" : "GLOBAL_KILL_SWITCH_OFF",
          performedBy: adminName,
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8),
          timestamp: now.toISOString(),
          reason,
        };

        set({
          globalKillSwitches: {
            ...state.globalKillSwitches,
            [featureId]: killStatus,
          },
          historyLogs: [historyItem, ...state.historyLogs],
        });

        recordFeatureAudit(
          killStatus ? "Global feature kill-switch enabled" : "Global feature kill-switch disabled",
          "ALL_TENANTS",
          "Global Multi-Tenant Network",
          featureId,
          { killSwitchActive: killStatus },
          reason,
          adminName
        );
      },

      getLicenseStats: (tenantId) => {
        const state = get();
        const assignments = state.getTenantFeatureAssignments(tenantId);

        let enabledCount = 0;
        let disabledCount = 0;
        let restrictedCount = 0;
        let trialCount = 0;

        assignments.forEach((a) => {
          if (a.state === "Enabled") enabledCount++;
          else if (a.state === "Disabled") disabledCount++;
          else if (a.state === "Restricted") restrictedCount++;
          else if (a.state === "Trial") trialCount++;
        });

        const globalKillSwitchActiveCount = Object.values(state.globalKillSwitches).filter(Boolean).length;

        return {
          enabledCount,
          disabledCount,
          restrictedCount,
          trialCount,
          globalKillSwitchActiveCount,
        };
      },

      getRouteEnforcement: (tenantId) => {
        const state = get();
        const assignments = state.getTenantFeatureAssignments(tenantId);
        const catalog = FeatureCatalogService.getCatalog();

        const allowedRoutes: string[] = [];
        const hiddenRoutes: string[] = [];
        const blockedRoutes: string[] = [];

        catalog.forEach((f) => {
          const isKilled = state.globalKillSwitches[f.id] || false;
          const assignedState = isKilled ? "Disabled" : state.getTenantFeatureStates(tenantId)[f.id];

          if (assignedState === "Enabled" || assignedState === "Trial") {
            allowedRoutes.push(...f.routeMeta.allowedRoutes.map((r) => r.path));
          } else {
            hiddenRoutes.push(...f.routeMeta.hiddenRoutes.map((r) => r.path));
            blockedRoutes.push(...f.routeMeta.blockedRoutes.map((r) => r.path));
          }
        });

        return {
          allowedRoutes: Array.from(new Set(allowedRoutes)),
          hiddenRoutes: Array.from(new Set(hiddenRoutes)),
          blockedRoutes: Array.from(new Set(blockedRoutes)),
        };
      },
    }),
    {
      name: "superadmin_feature_control_v2",
    }
  )
);

