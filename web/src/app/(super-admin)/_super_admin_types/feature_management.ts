export type FeatureCategory = "Clinical" | "Business" | "Integrations" | "Premium";

export type FeatureStatus = "Active" | "Deprecated" | "Beta" | "Disabled";

export type LicenseState = "Enabled" | "Disabled" | "Restricted" | "Trial";

export type FeatureSource =
  | "Included By Plan"
  | "Purchased Add-on"
  | "Optional Add-on"
  | "Trial Feature"
  | "Restricted";

export type TrialStatus = "Active" | "Expiring Soon" | "Expired";

export interface FeatureTrialDetails {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  remainingDays: number;
  status: TrialStatus;
  estimatedMonthlyPrice: number; // For future billing integration e.g. 12500
  autoConvertOnExpiry: boolean; // For future billing integration
}

export interface RouteItem {
  path: string;
  label: string;
}

export interface RouteEnforcementMeta {
  allowedRoutes: RouteItem[];
  hiddenRoutes: RouteItem[];
  blockedRoutes: RouteItem[];
}

export interface FeatureDefinition {
  id: string; // e.g. FEAT-CLIN-01
  name: string;
  description: string;
  category: FeatureCategory;
  status: FeatureStatus;
  dependencies: string[]; // Array of feature IDs required by this feature
  isPremium: boolean;
  routeMeta: RouteEnforcementMeta;
}

export interface FeatureUsageMetrics {
  activeUsers: number;
  usageCount: number;
  lastAccessed: string; // Relative string or timestamp
}

export interface TenantFeatureAssignment {
  featureId: string;
  state: LicenseState;
  featureSource: FeatureSource;
  restrictionReason?: string;
  trialDetails?: FeatureTrialDetails;
  usage: FeatureUsageMetrics;
  updatedAt: string;
  updatedBy: string;
}

export interface FeatureDependencyViolation {
  featureId: string;
  featureName: string;
  missingPrerequisites: { id: string; name: string }[];
  affectedDownstream: { id: string; name: string }[];
}

export interface FeatureHistoryRecord {
  id: string;
  featureId: string;
  featureName: string;
  tenantId: string;
  tenantName: string;
  action:
    | "ENABLED"
    | "DISABLED"
    | "GLOBAL_KILL_SWITCH_ON"
    | "GLOBAL_KILL_SWITCH_OFF"
    | "TEMPLATE_APPLIED"
    | "TRIAL_STARTED"
    | "TRIAL_EXTENDED"
    | "CONVERTED_TO_PAID"
    | "TRIAL_DISABLED";
  performedBy: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: string; // ISO string
  reason: string;
}

export interface FeatureTemplate {
  id: string;
  name: string;
  description: string;
  targetHospitalType: string;
  featureIds: string[];
}

export interface LicenseEnforcementStats {
  enabledCount: number;
  disabledCount: number;
  restrictedCount: number;
  trialCount: number;
  globalKillSwitchActiveCount: number;
}
