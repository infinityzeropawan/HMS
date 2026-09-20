import * as fs from "fs";
import * as path from "path";
import { FEATURE_ID_ALIAS_MAP, normalizeToCanonicalFeatureId, FeatureCatalogService } from "../_super_admin_services/feature_catalog_service";
import { PERMISSION_CLAIMS } from "../_super_admin_services/rbac_catalog_service";
import { SubscriptionPlanService } from "../_super_admin_services/subscription_plan_service";
import { UnifiedAuthEvaluator } from "../_super_admin_services/unified_auth_evaluator";

function runComprehensiveVerification() {
  console.log("=================================================");
  console.log("=== COMPREHENSIVE PHASE 1 CATALOG & RBAC AUDIT ===");
  console.log("=================================================\n");

  let passed = true;

  // 1. Alias & Canonical Catalog Completeness Audit
  console.log("--- 1. Alias -> Canonical ID -> Feature Catalog Verification ---");
  const allAliases = Object.keys(FEATURE_ID_ALIAS_MAP);
  console.log(`Auditing ${allAliases.length} feature aliases in FEATURE_ID_ALIAS_MAP...`);

  for (const alias of allAliases) {
    const canonicalId = normalizeToCanonicalFeatureId(alias);
    const catalogDef = FeatureCatalogService.getFeatureById(canonicalId);

    if (!catalogDef) {
      console.error(`FAIL: Alias '${alias}' resolves to canonical ID '${canonicalId}', which does NOT exist in FEATURE_CATALOG!`);
      passed = false;
    } else {
      console.log(`  ✓ Alias '${alias}' -> Canonical '${canonicalId}' -> Catalog Feature '${catalogDef.name}' (${catalogDef.category})`);
    }
  }

  // 2. Specific Feature Mapping Verification
  console.log("\n--- 2. Core Feature Alias Mapping Assertions ---");

  const coreMappings: Record<string, string> = {
    "FEAT-BUS-BILLING": "FEAT-BIZ-01",
    "FEAT-BUS-ROSTER": "FEAT-BIZ-04",
    "FEAT-CLIN-PHARM": "FEAT-BIZ-03",
    "FEAT-CLIN-TELEMEDICINE": "FEAT-CLIN-07",
    "FEAT-CLIN-PACS": "FEAT-CLIN-06",
    "FEAT-INT-ABDM": "FEAT-INT-01",
    "FEAT-CLIN-OPD": "FEAT-CLIN-01",
    "FEAT-CLIN-IPD": "FEAT-CLIN-02",
    "FEAT-CLIN-OT": "FEAT-CLIN-03",
    "FEAT-CLIN-ICU": "FEAT-CLIN-04",
    "FEAT-CLIN-LAB": "FEAT-CLIN-05",
    "FEAT-CLIN-PORTAL": "FEAT-CLIN-08",
    "FEAT-INT-KIOSK": "FEAT-INT-02",
    "FEAT-PREM-AI": "FEAT-PREM-01",
    "FEAT-PREM-BLOOD": "FEAT-PREM-02",
  };

  for (const [alias, expectedCanonical] of Object.entries(coreMappings)) {
    const actualCanonical = normalizeToCanonicalFeatureId(alias);
    if (actualCanonical !== expectedCanonical) {
      console.error(`FAIL: ${alias} resolved to ${actualCanonical}, expected ${expectedCanonical}`);
      passed = false;
    } else {
      console.log(`  ✓ ${alias} correctly maps to ${expectedCanonical}`);
    }
  }

  // 3. Billing vs HR/Roster vs Analytics Check
  console.log("\n--- 3. Semantic Distinction Verification ---");
  const billingCanonical = normalizeToCanonicalFeatureId("FEAT-BUS-BILLING");
  const rosterCanonical = normalizeToCanonicalFeatureId("FEAT-BUS-ROSTER");
  const analyticsCanonical = normalizeToCanonicalFeatureId("FEAT-BUS-ANALYTICS");

  console.log(`Billing Canonical: ${billingCanonical} (${FeatureCatalogService.getFeatureById(billingCanonical)?.name})`);
  console.log(`HR/Roster Canonical: ${rosterCanonical} (${FeatureCatalogService.getFeatureById(rosterCanonical)?.name})`);
  console.log(`Analytics Canonical: ${analyticsCanonical} (${FeatureCatalogService.getFeatureById(analyticsCanonical)?.name})`);

  if (billingCanonical === rosterCanonical) {
    console.error("FAIL: Billing and HR/Roster mapped to same canonical ID!");
    passed = false;
  } else {
    console.log("  ✓ Billing (FEAT-BIZ-01) and HR/Roster (FEAT-BIZ-04) are distinct.");
  }

  // 4. Plan Semantic Consistency Check
  console.log("\n--- 4. Plan Tier Semantic Consistency Verification ---");
  const plans = SubscriptionPlanService.getPlans();
  for (const plan of plans) {
    console.log(`Checking plan tier '${plan.code}' (${plan.name})...`);
    const inc = plan.includedFeatures || [];
    const rest = plan.restrictedFeatures || [];
    const opt = plan.optionalAddons || [];

    // Check for overlap between included and restricted
    const incRestOverlap = inc.filter((f) => rest.includes(f));
    if (incRestOverlap.length > 0) {
      console.error(`FAIL: Plan '${plan.code}' has features present in BOTH includedFeatures and restrictedFeatures: ${incRestOverlap.join(", ")}`);
      passed = false;
    }

    // Check for overlap between restricted and optional
    const restOptOverlap = rest.filter((f) => opt.includes(f));
    if (restOptOverlap.length > 0) {
      console.error(`FAIL: Plan '${plan.code}' has features present in BOTH restrictedFeatures and optionalAddons: ${restOptOverlap.join(", ")}`);
      passed = false;
    }

    console.log(`  ✓ Plan '${plan.code}' has 0 internal feature state conflicts.`);
  }

  // 5. Dependency Validation Verification
  console.log("\n--- 5. Dependency Engine Verification ---");
  // Test Case 1: Enabling OT (FEAT-CLIN-03) when IPD (FEAT-CLIN-02) is Disabled
  const currentStates: Record<string, "Enabled" | "Disabled" | "Restricted" | "Trial"> = {
    "FEAT-CLIN-01": "Enabled",
    "FEAT-CLIN-02": "Disabled",
  };
  const violation = FeatureCatalogService.validateDependencyChange("FEAT-CLIN-03", "Enabled", currentStates);
  if (violation && violation.missingPrerequisites.some((p) => p.id === "FEAT-CLIN-02")) {
    console.log("  ✓ Enabling OT without IPD correctly returns prerequisite violation (Requires FEAT-CLIN-02).");
  } else {
    console.error("FAIL: Dependency check failed to block enabling OT without IPD!");
    passed = false;
  }

  // 6. Real Plan Feature Evaluation & Fail-Closed Unknown Test
  console.log("\n--- 6. Feature Evaluation & Fail-Closed Tests ---");
  // Included on BASIC
  const incEval = UnifiedAuthEvaluator.getFeatureStateForClaim("TENANT-003", "FEAT-BUS-BILLING");
  if (incEval.state === "Enabled" && incEval.source === "Included By Plan") {
    console.log("  ✓ Billing on BASIC plan -> Enabled (Included By Plan)");
  } else {
    console.error(`FAIL: Billing evaluation on BASIC plan failed: state=${incEval.state}, source=${incEval.source}`);
    passed = false;
  }

  // Restricted on BASIC
  const restEval = UnifiedAuthEvaluator.getFeatureStateForClaim("TENANT-003", "FEAT-CLIN-IPD");
  if (restEval.state === "Restricted" && restEval.source === "Restricted") {
    console.log("  ✓ IPD on BASIC plan -> Restricted");
  } else {
    console.error(`FAIL: IPD evaluation on BASIC plan failed: state=${restEval.state}, source=${restEval.source}`);
    passed = false;
  }

  // Optional Add-on on BASIC
  const optEval = UnifiedAuthEvaluator.getFeatureStateForClaim("TENANT-003", "FEAT-CLIN-TELEMEDICINE");
  if (optEval.state === "Enabled" && optEval.source === "Purchased Add-on") {
    console.log("  ✓ Telemedicine on BASIC plan -> Enabled (Purchased Add-on)");
  } else {
    console.error(`FAIL: Telemedicine evaluation on BASIC plan failed: state=${optEval.state}, source=${optEval.source}`);
    passed = false;
  }

  // Unknown Feature -> Fail Closed
  const unknownEval = UnifiedAuthEvaluator.getFeatureStateForClaim("TNT-9014", "FEAT-FAKE-999");
  if (unknownEval.state === "Disabled" && unknownEval.source === "Restricted") {
    console.log("  ✓ Unknown feature 'FEAT-FAKE-999' -> Disabled (Restricted) - Failed Closed!");
  } else {
    console.error(`FAIL: Unknown feature was NOT failed closed: state=${unknownEval.state}, source=${unknownEval.source}`);
    passed = false;
  }

  // 7. Security Safeguards Regression Check
  console.log("\n--- 7. Auth & Scope Security Safeguards Regression Check ---");
  // Unknown Tenant
  const unkTenant = UnifiedAuthEvaluator.evaluateAccess({
    tenantId: "TNT-UNKNOWN-999",
    permissionId: "opd:queue:read",
    userRoleId: "TMPL-DOC",
  });
  if (!unkTenant.allowed && unkTenant.failingStep?.stepKey === "STEP_1_TENANT_ACTIVE") {
    console.log("  ✓ Unknown tenant access denied at STEP 1.");
  } else {
    console.error("FAIL: Unknown tenant check failed!");
    passed = false;
  }

  // Department Scope
  const deptScope = UnifiedAuthEvaluator.evaluateAccess({
    tenantId: "TNT-9014",
    permissionId: "ipd:admissions:read",
    userRoleId: "TMPL-NURSE",
    userRole: {
      id: "TMPL-NURSE",
      name: "Nurse",
      description: "Nurse role",
      category: "Nursing",
      isGlobalTemplate: true,
      parentTemplateId: null,
      tenantId: "GLOBAL",
      permissions: ["ipd:admissions:read"],
      scopeRules: { scopeType: "Department Scoped", allowedDepartments: ["Nursing"], requiresOnDutyRoster: false, allowEmergencyBreakGlass: false },
      status: "Active",
      updatedAt: "2026-09-01",
      updatedBy: "System",
    },
    isOnDutyRoster: true,
    // departmentId omitted!
  });
  if (!deptScope.allowed && deptScope.failingStep?.stepKey === "STEP_5_SCOPE_VALIDATION") {
    console.log("  ✓ Department-scoped role without departmentId denied at STEP 5.");
  } else {
    console.error("FAIL: Department scope check failed!");
    passed = false;
  }

  // 8. Service Dependency Cycle Audit
  console.log("\n--- 8. Service Dependency Cycle Audit ---");
  const planServicePath = path.join(__dirname, "../_super_admin_services/subscription_plan_service.ts");
  const planServiceSource = fs.readFileSync(planServicePath, "utf-8");
  if (planServiceSource.includes("unified_auth_evaluator")) {
    console.error("FAIL: subscription_plan_service.ts still imports unified_auth_evaluator!");
    passed = false;
  } else {
    console.log("  ✓ subscription_plan_service.ts has 0 imports from unified_auth_evaluator (Circular Dependency Resolved).");
  }

  const catalogServicePath = path.join(__dirname, "../_super_admin_services/feature_catalog_service.ts");
  const catalogServiceSource = fs.readFileSync(catalogServicePath, "utf-8");
  if (catalogServiceSource.includes("unified_auth_evaluator") || catalogServiceSource.includes("subscription_plan_service")) {
    console.error("FAIL: feature_catalog_service.ts depends on higher-level services!");
    passed = false;
  } else {
    console.log("  ✓ feature_catalog_service.ts is at base architectural layer (0 higher-level dependencies).");
  }

  console.log("\n=================================================");
  if (passed) {
    console.log("=== FINAL VERIFICATION RESULT: ALL CHECKS PASSED ===");
    console.log("=================================================");
  } else {
    console.error("=== FINAL VERIFICATION RESULT: CHECKS FAILED ===");
    process.exit(1);
  }
}

runComprehensiveVerification();
