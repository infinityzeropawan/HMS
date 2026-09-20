import { PermissionClaim, RoleDefinition, RoleScopeRule } from "../_super_admin_types/rbac_management";
import { FeatureSource, LicenseState } from "../_super_admin_types/feature_management";
import { PERMISSION_CLAIMS } from "./rbac_catalog_service";
import { getPlanByTenant } from "./subscription_plan_service";
import { getTenantById } from "./tenant_api_service";

export type EvaluationStepKey =
  | "STEP_1_TENANT_ACTIVE"
  | "STEP_2_SUBSCRIPTION_VALID"
  | "STEP_3_FEATURE_ENABLED"
  | "STEP_4_ROLE_PERMISSION"
  | "STEP_5_SCOPE_VALIDATION";

export interface EvaluationStepResult {
  stepKey: EvaluationStepKey;
  stepName: string;
  passed: boolean;
  reason: string;
}

export interface AccessEvaluationContext {
  tenantId: string;
  permissionId: string;
  userRoleId: string;
  userRole?: RoleDefinition;
  departmentId?: string;
  isOnDutyRoster?: boolean;
  isEmergencyBreakGlass?: boolean;
}

export interface AccessEvaluationResult {
  allowed: boolean;
  permission: PermissionClaim | undefined;
  requiredFeatureId: string | undefined;
  featureState: LicenseState;
  featureSource: FeatureSource;
  failingStep?: EvaluationStepResult;
  stepTrace: EvaluationStepResult[];
}

// Map short feature IDs used in permission claims to canonical catalog IDs
export const FEATURE_ID_ALIAS_MAP: Record<string, string> = {
  // Legacy / Short Claim Feature Aliases
  "FEAT-CLIN-OPD": "FEAT-CLIN-01",
  "FEAT-CLIN-IPD": "FEAT-CLIN-02",
  "FEAT-CLIN-OT": "FEAT-CLIN-03",
  "FEAT-CLIN-ICU": "FEAT-CLIN-04",
  "FEAT-CLIN-LAB": "FEAT-CLIN-05",
  "FEAT-CLIN-PACS": "FEAT-CLIN-06",
  "FEAT-CLIN-PHARM": "FEAT-BIZ-03",
  "FEAT-CLIN-TELEMEDICINE": "FEAT-CLIN-07",
  "FEAT-CLIN-PORTAL": "FEAT-CLIN-08",
  "FEAT-BUS-BILLING": "FEAT-BIZ-01",
  "FEAT-BUS-TPA": "FEAT-BIZ-02",
  "FEAT-BUS-ROSTER": "FEAT-BIZ-04",
  "FEAT-INT-ABDM": "FEAT-INT-01",
  "FEAT-INT-KIOSK": "FEAT-INT-02",
  "FEAT-PREM-AI": "FEAT-PREM-01",
  "FEAT-PREM-BLOOD": "FEAT-PREM-02",
  "FEAT-BUS-ANALYTICS": "FEAT-BIZ-01",
  // Identity Mappings for Canonical Catalog IDs
  "FEAT-CLIN-01": "FEAT-CLIN-01",
  "FEAT-CLIN-02": "FEAT-CLIN-02",
  "FEAT-CLIN-03": "FEAT-CLIN-03",
  "FEAT-CLIN-04": "FEAT-CLIN-04",
  "FEAT-CLIN-05": "FEAT-CLIN-05",
  "FEAT-CLIN-06": "FEAT-CLIN-06",
  "FEAT-CLIN-07": "FEAT-CLIN-07",
  "FEAT-CLIN-08": "FEAT-CLIN-08",
  "FEAT-BIZ-01": "FEAT-BIZ-01",
  "FEAT-BIZ-02": "FEAT-BIZ-02",
  "FEAT-BIZ-03": "FEAT-BIZ-03",
  "FEAT-BIZ-04": "FEAT-BIZ-04",
  "FEAT-INT-01": "FEAT-INT-01",
  "FEAT-INT-02": "FEAT-INT-02",
  "FEAT-PREM-01": "FEAT-PREM-01",
  "FEAT-PREM-02": "FEAT-PREM-02",
};

export class UnifiedAuthEvaluator {
  /**
   * Main 5-step Unified Access Evaluation Pipeline
   */
  public static evaluateAccess(context: AccessEvaluationContext): AccessEvaluationResult {
    const trace: EvaluationStepResult[] = [];
    const claim = PERMISSION_CLAIMS.find((c) => c.id === context.permissionId);
    const requiredFeatureId = claim?.requiredFeatureId;

    // Fetch Tenant Context
    const tenant = getTenantById(context.tenantId);

    // --- STEP 1: Tenant Active Check ---
    if (!tenant) {
      const step1Result: EvaluationStepResult = {
        stepKey: "STEP_1_TENANT_ACTIVE",
        stepName: "1. Tenant Active",
        passed: false,
        reason: `Tenant ID '${context.tenantId}' was not found. Access denied.`,
      };
      trace.push(step1Result);
      return {
        allowed: false,
        permission: claim,
        requiredFeatureId,
        featureState: "Disabled",
        featureSource: "Restricted",
        failingStep: step1Result,
        stepTrace: trace,
      };
    }

    const tenantStatus = tenant.status;
    const step1Passed = tenantStatus === "Active" || tenantStatus === "Trial";
    const step1Result: EvaluationStepResult = {
      stepKey: "STEP_1_TENANT_ACTIVE",
      stepName: "1. Tenant Active",
      passed: step1Passed,
      reason: step1Passed
        ? `Tenant status is '${tenantStatus}'.`
        : `Tenant is ${tenantStatus}. Access blocked for all users.`,
    };
    trace.push(step1Result);
    if (!step1Passed) {
      return {
        allowed: false,
        permission: claim,
        requiredFeatureId,
        featureState: "Disabled",
        featureSource: "Restricted",
        failingStep: step1Result,
        stepTrace: trace,
      };
    }

    // --- STEP 2: Subscription Valid Check ---
    const subscriptionPlan = getPlanByTenant(context.tenantId);
    if (!subscriptionPlan) {
      const step2Result: EvaluationStepResult = {
        stepKey: "STEP_2_SUBSCRIPTION_VALID",
        stepName: "2. Subscription Valid",
        passed: false,
        reason: `Tenant '${context.tenantId}' has no active subscription plan. Access denied.`,
      };
      trace.push(step2Result);
      return {
        allowed: false,
        permission: claim,
        requiredFeatureId,
        featureState: "Disabled",
        featureSource: "Restricted",
        failingStep: step2Result,
        stepTrace: trace,
      };
    }

    const isPlanExpired = tenant.expiryDate
      ? new Date(tenant.expiryDate).getTime() < new Date().getTime()
      : false;
    const step2Passed = !isPlanExpired;
    const step2Result: EvaluationStepResult = {
      stepKey: "STEP_2_SUBSCRIPTION_VALID",
      stepName: "2. Subscription Valid",
      passed: step2Passed,
      reason: step2Passed
        ? `Subscription plan '${subscriptionPlan.name}' is active.`
        : `Subscription expired on ${tenant.expiryDate}. Renewal required.`,
    };
    trace.push(step2Result);
    if (!step2Passed) {
      return {
        allowed: false,
        permission: claim,
        requiredFeatureId,
        featureState: "Disabled",
        featureSource: "Restricted",
        failingStep: step2Result,
        stepTrace: trace,
      };
    }

    // --- STEP 3: Feature Enabled Check ---
    let featureState: LicenseState = "Enabled";
    let featureSource: FeatureSource = "Included By Plan";

    if (requiredFeatureId) {
      const catalogId = FEATURE_ID_ALIAS_MAP[requiredFeatureId] || requiredFeatureId;
      const isRestrictedByPlan = subscriptionPlan.restrictedFeatures?.includes(catalogId) ?? false;
      const isOptionalAddon = subscriptionPlan.optionalAddons?.includes(catalogId) ?? false;

      if (isRestrictedByPlan) {
        featureState = "Restricted";
        featureSource = "Restricted";
      } else if (isOptionalAddon) {
        // Mock add-on check for demonstration (Telemedicine / AI PACS optional)
        if (catalogId === "FEAT-CLIN-06") {
          featureState = "Disabled";
          featureSource = "Optional Add-on";
        } else {
          featureState = "Enabled";
          featureSource = "Purchased Add-on";
        }
      } else {
        featureState = "Enabled";
        featureSource = "Included By Plan";
      }
    }

    const step3Passed = (featureState as LicenseState) === "Enabled" || (featureState as LicenseState) === "Trial";
    const step3Result: EvaluationStepResult = {
      stepKey: "STEP_3_FEATURE_ENABLED",
      stepName: "3. Feature Enabled",
      passed: step3Passed,
      reason: step3Passed
        ? `Feature '${requiredFeatureId}' is licensed (${featureSource}).`
        : `Feature '${requiredFeatureId}' is ${featureState} (${featureSource}). Related permissions unavailable.`,
    };
    trace.push(step3Result);
    if (!step3Passed) {
      return {
        allowed: false,
        permission: claim,
        requiredFeatureId,
        featureState,
        featureSource,
        failingStep: step3Result,
        stepTrace: trace,
      };
    }

    // --- STEP 4: User Role Permission Check ---
    const rolePermissions = context.userRole?.permissions || [];
    const step4Passed = rolePermissions.includes(context.permissionId);
    const step4Result: EvaluationStepResult = {
      stepKey: "STEP_4_ROLE_PERMISSION",
      stepName: "4. User Role Permission",
      passed: step4Passed,
      reason: step4Passed
        ? `Permission '${context.permissionId}' granted in role '${context.userRole?.name || context.userRoleId}'.`
        : `Role '${context.userRole?.name || context.userRoleId}' does NOT hold claim '${context.permissionId}'.`,
    };
    trace.push(step4Result);
    if (!step4Passed) {
      return {
        allowed: false,
        permission: claim,
        requiredFeatureId,
        featureState,
        featureSource,
        failingStep: step4Result,
        stepTrace: trace,
      };
    }

    // --- STEP 5: Scope Validation Check ---
    let step5Passed = true;
    let step5Reason = "Scope rules satisfied.";
    const scope = context.userRole?.scopeRules;

    if (scope) {
      if (scope.requiresOnDutyRoster && !context.isOnDutyRoster && !context.isEmergencyBreakGlass) {
        step5Passed = false;
        step5Reason = "Role requires active on-duty shift roster check-in.";
      } else if (scope.scopeType === "Department Scoped") {
        if (!context.departmentId) {
          step5Passed = false;
          step5Reason = "Role is department-scoped but no departmentId context was provided.";
        } else if (
          !scope.allowedDepartments.includes("ALL") &&
          !scope.allowedDepartments.includes(context.departmentId)
        ) {
          step5Passed = false;
          step5Reason = `Role scope restricted to departments [${scope.allowedDepartments.join(", ")}]. Current: '${context.departmentId}'.`;
        }
      }
    }

    const step5Result: EvaluationStepResult = {
      stepKey: "STEP_5_SCOPE_VALIDATION",
      stepName: "5. Scope Validation",
      passed: step5Passed,
      reason: step5Reason,
    };
    trace.push(step5Result);

    return {
      allowed: step5Passed,
      permission: claim,
      requiredFeatureId,
      featureState,
      featureSource,
      failingStep: step5Passed ? undefined : step5Result,
      stepTrace: trace,
    };
  }


  /**
   * Helper to evaluate feature state and source for a specific claim in a tenant context
   */
  public static getFeatureStateForClaim(tenantId: string, requiredFeatureId?: string): { state: LicenseState; source: FeatureSource } {
    if (!requiredFeatureId) return { state: "Enabled", source: "Included By Plan" };
    const plan = getPlanByTenant(tenantId);
    const catalogId = FEATURE_ID_ALIAS_MAP[requiredFeatureId] || requiredFeatureId;

    if (plan?.restrictedFeatures?.includes(catalogId)) {
      return { state: "Restricted", source: "Restricted" };
    }
    if (plan?.optionalAddons?.includes(catalogId)) {
      // Mock status for demo
      if (catalogId === "FEAT-CLIN-06") {
        return { state: "Disabled", source: "Optional Add-on" };
      }
      return { state: "Enabled", source: "Purchased Add-on" };
    }
    return { state: "Enabled", source: "Included By Plan" };
  }
}
