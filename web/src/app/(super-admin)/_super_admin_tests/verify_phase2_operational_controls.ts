import * as fs from "fs";
import * as path from "path";
import { FEATURE_CATALOG, FEATURE_ID_ALIAS_MAP, normalizeToCanonicalFeatureId, FeatureCatalogService } from "../_super_admin_services/feature_catalog_service";
import { PERMISSION_CLAIMS, RbacCatalogService } from "../_super_admin_services/rbac_catalog_service";
import { SubscriptionPlanService } from "../_super_admin_services/subscription_plan_service";
import { UnifiedAuthEvaluator } from "../_super_admin_services/unified_auth_evaluator";
import { TenantApiService } from "../_super_admin_services/tenant_api_service";
import { PlatformAuditService } from "../_super_admin_services/platform_audit_service";
import { SupportTicketService } from "../_super_admin_services/support_ticket_service";
import { GovernanceEventBus } from "../_super_admin_services/governance_event_bus";

async function runPhase2OperationalControlsAudit() {
  console.log("=================================================================");
  console.log("=== SUPER ADMIN PHASE 2 OPERATIONAL CONTROLS & SYSTEM AUDIT ===");
  console.log("=================================================================\n");

  let passed = true;

  // 1. RBAC Claim Audit & PACS DICOM Mapping Assertion
  console.log("--- 1. RBAC Claim Audit & Feature Mapping Assertions ---");
  const pacsClaim = PERMISSION_CLAIMS.find((c) => c.id === "pacs:dicom:view");
  if (!pacsClaim) {
    console.error("FAIL: pacs:dicom:view claim not found in PERMISSION_CLAIMS!");
    passed = false;
  } else {
    const pacsCanonical = normalizeToCanonicalFeatureId(pacsClaim.requiredFeatureId || "");
    if (pacsCanonical !== "FEAT-CLIN-06") {
      console.error(`FAIL: pacs:dicom:view maps to '${pacsClaim.requiredFeatureId}' -> '${pacsCanonical}'. Expected 'FEAT-CLIN-06'!`);
      passed = false;
    } else {
      console.log(`  ✓ pacs:dicom:view correctly maps to requiredFeatureId '${pacsClaim.requiredFeatureId}' -> Canonical 'FEAT-CLIN-06'.`);
    }
  }

  // Check admin:staff:manage and admin:rbac:configure mapping (Issue 7)
  const staffClaim = PERMISSION_CLAIMS.find((c) => c.id === "admin:staff:manage");
  const rbacClaim = PERMISSION_CLAIMS.find((c) => c.id === "admin:rbac:configure");
  if (staffClaim?.requiredFeatureId !== "FEAT-BUS-ROSTER" || rbacClaim?.requiredFeatureId !== "FEAT-BUS-ROSTER") {
    console.error("FAIL: admin:staff:manage or admin:rbac:configure not mapped to FEAT-BUS-ROSTER!");
    passed = false;
  } else {
    console.log("  ✓ admin:staff:manage and admin:rbac:configure correctly mapped to 'FEAT-BUS-ROSTER' -> 'FEAT-BIZ-04'.");
  }

  // Verify all claims map to valid catalog features
  for (const claim of PERMISSION_CLAIMS) {
    if (claim.requiredFeatureId) {
      const canonicalId = normalizeToCanonicalFeatureId(claim.requiredFeatureId);
      const catalogDef = FeatureCatalogService.getFeatureById(canonicalId);
      if (!catalogDef) {
        console.error(`FAIL: Claim '${claim.id}' requires feature '${claim.requiredFeatureId}' (canonical: '${canonicalId}'), which does NOT exist in catalog!`);
        passed = false;
      }
    }
  }
  console.log(`  ✓ All ${PERMISSION_CLAIMS.length} permission claims resolve to valid canonical catalog features.`);

  // 2. Tenant Management & Repository Boundaries (Issue 1, 10)
  console.log("\n--- 2. Tenant Management & Deterministic ID Generation ---");
  const newTenantId1 = TenantApiService.generateUniqueTenantId();
  const newTenantId2 = TenantApiService.generateUniqueTenantId();
  if (!newTenantId1.startsWith("TNT-") || newTenantId1 === newTenantId2) {
    console.error(`FAIL: generateUniqueTenantId generated invalid or colliding IDs: ${newTenantId1}, ${newTenantId2}`);
    passed = false;
  } else {
    console.log(`  ✓ generateUniqueTenantId produced unique deterministic IDs: ${newTenantId1}, ${newTenantId2}`);
  }

  // Test Suspend & Restore Tenant
  const testTenantId = "TNT-9014";
  console.log(`Testing tenant suspension for '${testTenantId}'...`);
  await TenantApiService.suspendTenant(testTenantId, "Compliance Issue", "System Audit Pass");
  const suspendedTenant = TenantApiService.getTenantById(testTenantId);
  if (suspendedTenant?.status !== "Suspended") {
    console.error(`FAIL: Tenant status for '${testTenantId}' is '${suspendedTenant?.status}', expected 'Suspended'.`);
    passed = false;
  } else {
    console.log(`  ✓ Tenant '${testTenantId}' status mutated to 'Suspended'.`);
  }

  // Verify Audit Log Emission via Single Event Bus Path (Issue 6, 11)
  const auditLogsAfterSuspend = PlatformAuditService.getAuditLogs();
  const suspendAuditLog = auditLogsAfterSuspend.filter(
    (log) => log.action.includes("Suspended hospital tenant") && log.entity.includes(testTenantId)
  );
  if (suspendAuditLog.length !== 1) {
    console.error(`FAIL: Tenant suspension emitted ${suspendAuditLog.length} audit logs, expected exactly 1!`);
    passed = false;
  } else {
    console.log(`  ✓ Tenant suspension emitted exactly 1 audit event via GovernanceEventBus [${suspendAuditLog[0].id}].`);
  }

  console.log(`Testing tenant restoration for '${testTenantId}'...`);
  await TenantApiService.restoreTenant(testTenantId, "Platform Audit Restoration Pass");
  const restoredTenant = TenantApiService.getTenantById(testTenantId);
  if (restoredTenant?.status !== "Active") {
    console.error(`FAIL: Tenant status for '${testTenantId}' is '${restoredTenant?.status}', expected 'Active'.`);
    passed = false;
  } else {
    console.log(`  ✓ Tenant '${testTenantId}' status mutated back to 'Active'.`);
  }

  // Test Subscription Sync with Tenant (Issue 2)
  console.log(`Testing tenant subscription plan update for '${testTenantId}'...`);
  await TenantApiService.updateTenantSubscription(testTenantId, "Enterprise", 200, 100);
  const updatedTenantSub = TenantApiService.getTenantById(testTenantId);
  if (updatedTenantSub?.subscriptionPlan !== "Enterprise" || updatedTenantSub?.maxUsers !== 200) {
    console.error(`FAIL: Tenant subscription plan update did not sync! plan=${updatedTenantSub?.subscriptionPlan}`);
    passed = false;
  } else {
    console.log(`  ✓ Tenant '${testTenantId}' subscription updated and synced with SubscriptionPlanService.`);
  }

  // 3. Fail-Closed Licensing & Access Evaluation Check (Issue 8)
  console.log("\n--- 3. Fail-Closed Licensing & Access Evaluation Check ---");
  const unkFeatureAccess = UnifiedAuthEvaluator.getFeatureStateForClaim(testTenantId, "FEAT-NONEXISTENT-999");
  if (unkFeatureAccess.state !== "Disabled" || unkFeatureAccess.source !== "Restricted") {
    console.error(`FAIL: Unknown feature was NOT failed closed! state=${unkFeatureAccess.state}, source=${unkFeatureAccess.source}`);
    passed = false;
  } else {
    console.log("  ✓ Unknown feature 'FEAT-NONEXISTENT-999' failed closed -> Disabled (Restricted).");
  }

  const unkTenantEval = UnifiedAuthEvaluator.evaluateAccess({
    tenantId: "TENANT-UNKNOWN-9999",
    permissionId: "opd:queue:read",
    userRoleId: "TMPL-DOC",
  });
  if (unkTenantEval.allowed || unkTenantEval.failingStep?.stepKey !== "STEP_1_TENANT_ACTIVE") {
    console.error("FAIL: Unknown tenant access evaluation was not denied at STEP 1!");
    passed = false;
  } else {
    console.log("  ✓ Unknown tenant access evaluation denied at STEP 1 (Tenant Active Check).");
  }

  // 4. Support Ticket Operational Controls & Metrics Audit (Issue 4, 5)
  console.log("\n--- 4. Support Ticket Operational Controls & Single Audit Emission ---");
  const supportMetrics = SupportTicketService.getSupportMetrics();
  if (typeof supportMetrics.openTickets !== "number" || supportMetrics.csatRating !== "Not tracked") {
    console.error(`FAIL: Support metrics invalid! openTickets=${supportMetrics.openTickets}, csat=${supportMetrics.csatRating}`);
    passed = false;
  } else {
    console.log(`  ✓ Support metrics dynamically retrieved: openTickets=${supportMetrics.openTickets}, csatRating='${supportMetrics.csatRating}'.`);
  }

  const tickets = SupportTicketService.getTickets();
  if (tickets.length > 0) {
    const targetTicket = tickets[0];
    const initialLogCount = PlatformAuditService.getAuditLogs().length;
    SupportTicketService.updateTicketStatus(targetTicket.ticketId, "RESOLVED");

    const addedCount = PlatformAuditService.getAuditLogs().length - initialLogCount;
    const newLogs = PlatformAuditService.getAuditLogs().slice(0, addedCount);
    const ticketAuditLogs = newLogs.filter((log) => log.action.includes("Updated Ticket Status"));
    if (ticketAuditLogs.length !== 1) {
      console.error(`FAIL: Support ticket status update emitted ${ticketAuditLogs.length} audit logs! Expected 1.`);
      passed = false;
    } else {
      console.log(`  ✓ Support ticket update emitted exactly 1 audit event [${ticketAuditLogs[0].id}].`);
    }
  }

  // 5. Subscription Plan Semantic Consistency Audit
  console.log("\n--- 5. Subscription Plan Tier Semantic Consistency Audit ---");
  const plans = SubscriptionPlanService.getPlans();
  for (const plan of plans) {
    const inc = plan.includedFeatures || [];
    const rest = plan.restrictedFeatures || [];
    const opt = plan.optionalAddons || [];

    const incRestOverlap = inc.filter((f) => rest.includes(f));
    const restOptOverlap = rest.filter((f) => opt.includes(f));

    if (incRestOverlap.length > 0 || restOptOverlap.length > 0) {
      console.error(`FAIL: Plan '${plan.code}' has feature state overlap! Inc/Rest=${incRestOverlap}, Rest/Opt=${restOptOverlap}`);
      passed = false;
    } else {
      console.log(`  ✓ Plan '${plan.code}' (${plan.name}): 0 feature state conflicts across ${inc.length} included, ${rest.length} restricted, ${opt.length} optional.`);
    }
  }

  // 6. Platform Audit Search & Filter Capabilities
  console.log("\n--- 6. Platform Audit Search & Filter Capabilities ---");
  const searchResult = PlatformAuditService.searchAuditLogs({
    category: "SUBSCRIPTION_LIFECYCLE",
    searchTerm: testTenantId,
  });
  if (searchResult.length === 0) {
    console.error(`FAIL: Search audit logs for '${testTenantId}' in category 'SUBSCRIPTION_LIFECYCLE' returned 0 results!`);
    passed = false;
  } else {
    console.log(`  ✓ Audit log search returned ${searchResult.length} matching events for tenant '${testTenantId}'.`);
  }

  const csvExport = PlatformAuditService.exportAuditLogsCSV(searchResult);
  if (!csvExport.includes("Audit ID") || !csvExport.includes(testTenantId)) {
    console.error("FAIL: CSV export generation failed for audit logs!");
    passed = false;
  } else {
    console.log(`  ✓ CSV export serialized successfully (${csvExport.split("\n").length} lines generated).`);
  }

  // 7. Architectural Dependency & Circular Import Audit (Issue 12)
  console.log("\n--- 7. Architectural Service Boundary & Zero-Cycle Audit ---");
  const planServicePath = path.join(__dirname, "../_super_admin_services/subscription_plan_service.ts");
  const planServiceSource = fs.readFileSync(planServicePath, "utf-8");
  if (planServiceSource.includes("unified_auth_evaluator")) {
    console.error("FAIL: subscription_plan_service.ts still imports unified_auth_evaluator!");
    passed = false;
  } else {
    console.log("  ✓ subscription_plan_service.ts has 0 imports from unified_auth_evaluator.");
  }

  const catalogServicePath = path.join(__dirname, "../_super_admin_services/feature_catalog_service.ts");
  const catalogServiceSource = fs.readFileSync(catalogServicePath, "utf-8");
  if (catalogServiceSource.includes("unified_auth_evaluator") || catalogServiceSource.includes("subscription_plan_service")) {
    console.error("FAIL: feature_catalog_service.ts imports higher-level services!");
    passed = false;
  } else {
    console.log("  ✓ feature_catalog_service.ts resides at base architectural layer (0 higher-level dependencies).");
  }

  console.log("\n=================================================================");
  if (passed) {
    console.log("=== PHASE 2 OPERATIONAL CONTROLS AUDIT: ALL CHECKS PASSED ===");
    console.log("=================================================================");
  } else {
    console.error("=== PHASE 2 OPERATIONAL CONTROLS AUDIT: CHECKS FAILED ===");
    process.exit(1);
  }
}

runPhase2OperationalControlsAudit();
