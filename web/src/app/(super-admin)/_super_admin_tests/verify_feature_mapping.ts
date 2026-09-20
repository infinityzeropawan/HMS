import { FEATURE_ID_ALIAS_MAP, UnifiedAuthEvaluator } from "../_super_admin_services/unified_auth_evaluator";
import { FeatureCatalogService } from "../_super_admin_services/feature_catalog_service";
import { PERMISSION_CLAIMS } from "../_super_admin_services/rbac_catalog_service";
import { SubscriptionPlanService } from "../_super_admin_services/subscription_plan_service";

function runVerification() {
  console.log("=== START FEATURE IDENTITY MAPPING & REGRESSION VERIFICATION ===");
  let passed = true;

  // 1. Verify Claim -> Canonical Feature Mapping
  const billingClaim = PERMISSION_CLAIMS.find((c) => c.id === "billing:invoice:create");
  const analyticsClaim = PERMISSION_CLAIMS.find((c) => c.id === "admin:audit:view");
  const pharmacyClaim = PERMISSION_CLAIMS.find((c) => c.id === "pharmacy:dispense:write");
  const telemedClaim = PERMISSION_CLAIMS.find((c) => c.id === "opd:telehealth:consult");
  const pacsClaim = PERMISSION_CLAIMS.find((c) => c.id === "pacs:dicom:view");
  const abdmClaim = PERMISSION_CLAIMS.find((c) => c.id === "abdm:healthid:link");

  const billingCanonical = FEATURE_ID_ALIAS_MAP[billingClaim?.requiredFeatureId || ""];
  const analyticsCanonical = FEATURE_ID_ALIAS_MAP[analyticsClaim?.requiredFeatureId || ""];
  const pharmacyCanonical = FEATURE_ID_ALIAS_MAP[pharmacyClaim?.requiredFeatureId || ""];
  const telemedCanonical = FEATURE_ID_ALIAS_MAP[telemedClaim?.requiredFeatureId || ""];
  const pacsCanonical = FEATURE_ID_ALIAS_MAP[pacsClaim?.requiredFeatureId || ""];
  const abdmCanonical = FEATURE_ID_ALIAS_MAP[abdmClaim?.requiredFeatureId || ""];

  console.log(`Billing Claim (${billingClaim?.requiredFeatureId}) -> Canonical: ${billingCanonical}`);
  console.log(`Analytics Claim (${analyticsClaim?.requiredFeatureId}) -> Canonical: ${analyticsCanonical}`);
  console.log(`Pharmacy Claim (${pharmacyClaim?.requiredFeatureId}) -> Canonical: ${pharmacyCanonical}`);
  console.log(`Telemedicine Claim (${telemedClaim?.requiredFeatureId}) -> Canonical: ${telemedCanonical}`);
  console.log(`PACS Claim (${pacsClaim?.requiredFeatureId}) -> Canonical: ${pacsCanonical}`);
  console.log(`ABDM Claim (${abdmClaim?.requiredFeatureId}) -> Canonical: ${abdmCanonical}`);

  // Assertions
  if (billingCanonical !== "FEAT-BIZ-01") {
    console.error("FAIL: Billing claim did not resolve to FEAT-BIZ-01!");
    passed = false;
  }
  if (analyticsCanonical !== "FEAT-BIZ-04") {
    console.error("FAIL: Analytics claim did not resolve to FEAT-BIZ-04!");
    passed = false;
  }
  if (pharmacyCanonical !== "FEAT-BIZ-03") {
    console.error("FAIL: Pharmacy claim did not resolve to FEAT-BIZ-03!");
    passed = false;
  }
  if (telemedCanonical !== "FEAT-CLIN-07") {
    console.error("FAIL: Telemedicine claim did not resolve to FEAT-CLIN-07!");
    passed = false;
  }
  if (pacsCanonical !== "FEAT-CLIN-06" && pacsCanonical !== "FEAT-PREM-01") {
    console.error("FAIL: PACS claim did not resolve to a valid catalog feature!");
    passed = false;
  }
  if (abdmCanonical !== "FEAT-INT-01") {
    console.error("FAIL: ABDM claim did not resolve to FEAT-INT-01!");
    passed = false;
  }

  // Verify Billing and Analytics NEVER resolve to the same canonical ID
  console.log(`\nChecking Billing vs Analytics Distinction: ${billingCanonical} vs ${analyticsCanonical}`);
  if (billingCanonical === analyticsCanonical) {
    console.error("FAIL: Billing and Analytics resolved to the SAME canonical ID!");
    passed = false;
  } else {
    console.log("PASS: Billing and Analytics resolve to DISTINCT canonical IDs.");
  }

  // 2. Verify Real Plan Definitions (Included, Restricted, Optional/Add-on)
  console.log("\n--- Real Plan Feature Evaluation Checks ---");

  const includedEval = UnifiedAuthEvaluator.getFeatureStateForClaim("TENANT-003", "FEAT-BUS-BILLING");
  console.log(`Included Feature (Billing on BASIC): State=${includedEval.state}, Source=${includedEval.source}`);
  if (includedEval.state !== "Enabled" || includedEval.source !== "Included By Plan") {
    console.error("FAIL: Included feature evaluation failed!");
    passed = false;
  } else {
    console.log("PASS: Included feature correctly identified.");
  }

  const restrictedEval = UnifiedAuthEvaluator.getFeatureStateForClaim("TENANT-003", "FEAT-CLIN-IPD");
  console.log(`Restricted Feature (IPD on BASIC): State=${restrictedEval.state}, Source=${restrictedEval.source}`);
  if (restrictedEval.state !== "Restricted" || restrictedEval.source !== "Restricted") {
    console.error("FAIL: Restricted feature evaluation failed!");
    passed = false;
  } else {
    console.log("PASS: Restricted feature correctly identified.");
  }

  const optionalEval = UnifiedAuthEvaluator.getFeatureStateForClaim("TENANT-003", "FEAT-CLIN-TELEMEDICINE");
  console.log(`Optional Add-on Feature (Telemedicine on BASIC): State=${optionalEval.state}, Source=${optionalEval.source}`);
  if (optionalEval.state !== "Enabled" || optionalEval.source !== "Purchased Add-on") {
    console.error("FAIL: Optional Add-on feature evaluation failed!");
    passed = false;
  } else {
    console.log("PASS: Optional Add-on feature correctly identified.");
  }

  const unknownEval = UnifiedAuthEvaluator.getFeatureStateForClaim("TNT-9014", "FEAT-UNKNOWN-999");
  console.log(`Unknown Feature (FEAT-UNKNOWN-999): State=${unknownEval.state}, Source=${unknownEval.source}`);
  if (unknownEval.state !== "Disabled" || unknownEval.source !== "Restricted") {
    console.error("FAIL: Unknown feature evaluation failed!");
    passed = false;
  } else {
    console.log("PASS: Unknown feature correctly denied and handled fail-closed.");
  }

  // 3. Verify Existing Security Fixes (Regressions Check)
  console.log("\n--- Existing Security Safeguard Checks ---");

  const unknownTenantEval = UnifiedAuthEvaluator.evaluateAccess({
    tenantId: "TNT-NON-EXISTENT",
    permissionId: "billing:invoice:create",
    userRoleId: "TMPL-DOC",
  });
  if (!unknownTenantEval.allowed && unknownTenantEval.failingStep?.stepKey === "STEP_1_TENANT_ACTIVE") {
    console.log("PASS: Unknown tenant denied at STEP 1.");
  } else {
    console.error("FAIL: Unknown tenant check failed!");
    passed = false;
  }

  const missingSubEval = UnifiedAuthEvaluator.evaluateAccess({
    tenantId: "TENANT-WITHOUT-SUB",
    permissionId: "billing:invoice:create",
    userRoleId: "TMPL-DOC",
  });
  if (!missingSubEval.allowed && (missingSubEval.failingStep?.stepKey === "STEP_1_TENANT_ACTIVE" || missingSubEval.failingStep?.stepKey === "STEP_2_SUBSCRIPTION_VALID")) {
    console.log("PASS: Missing subscription denied.");
  } else {
    console.error("FAIL: Missing subscription check failed!");
    passed = false;
  }

  const deptScopeEval = UnifiedAuthEvaluator.evaluateAccess({
    tenantId: "TNT-9014",
    permissionId: "ipd:admissions:read",
    userRoleId: "TMPL-NURSE",
    userRole: {
      id: "TMPL-NURSE",
      name: "Nurse",
      description: "Bedside staff nurse",
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
  if (!deptScopeEval.allowed && deptScopeEval.failingStep?.stepKey === "STEP_5_SCOPE_VALIDATION") {
    console.log("PASS: Department scoped role without departmentId denied at STEP 5.");
  } else {
    console.error("FAIL: Department scope check failed! Failing step:", deptScopeEval.failingStep);
    passed = false;
  }

  console.log("\n=== VERIFICATION RESULT ===");
  if (passed) {
    console.log("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  } else {
    console.error("SOME VERIFICATION CHECKS FAILED!");
    process.exit(1);
  }
}

runVerification();
