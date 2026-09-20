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

  // 1. RBAC Claim Audit & pacs:dicom:view Specific Licensing Check
  console.log("--- 1. RBAC Claim Audit & PACS DICOM Mapping Assertion ---");
  const pacsClaim = PERMISSION_CLAIMS.find((c) => c.id === "pacs:dicom:view");
  if (!pacsClaim) {
    console.error("FAIL: pacs:dicom:view claim not found in PERMISSION_CLAIMS!");
    passed = false;
  } else {
    const pacsCanonical = normalizeToCanonicalFeatureId(pacsClaim.requiredFeatureId || "");
    if (pacsCanonical !== "FEAT-CLIN-06") {
      console.error(`FAIL: pacs:dicom:view maps to '${pacsClaim.requiredFeatureId}' -> '${pacsCanonical}'. Expected 'FEAT-CLIN-06' (PACS DICOM Imaging)!`);
      passed = false;
    } else {
      console.log(`  ✓ pacs:dicom:view correctly maps to requiredFeatureId '${pacsClaim.requiredFeatureId}' -> Canonical 'FEAT-CLIN-06' (Radiology & DICOM PACS Imaging).`);
    }
  }

  // Verify all claims map to valid catalog features
  console.log(`Auditing all ${PERMISSION_CLAIMS.length} permission claims against canonical FEATURE_CATALOG...`);
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

  // 2. Tenant Management Operational Lifecycle Audit
  console.log("\n--- 2. Tenant Management Operational Lifecycle Audit ---");

  // Test Suspend Tenant
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

  // Verify Audit Log Emission
  const auditLogsAfterSuspend = PlatformAuditService.getAuditLogs();
  const suspendAuditLog = auditLogsAfterSuspend.find(
    (log) => log.action.includes("Suspended hospital tenant") && log.entity.includes(testTenantId)
  );
  if (!suspendAuditLog) {
    console.error("FAIL: Tenant suspension did NOT emit a canonical platform audit event!");
    passed = false;
  } else {
    console.log(`  ✓ Tenant suspension emitted canonical audit event [${suspendAuditLog.id}] (${suspendAuditLog.action}).`);
  }

  // Test Restore Tenant
  console.log(`Testing tenant restoration for '${testTenantId}'...`);
  await TenantApiService.restoreTenant(testTenantId, "Platform Audit Restoration Pass");
  const restoredTenant = TenantApiService.getTenantById(testTenantId);
  if (restoredTenant?.status !== "Active") {
    console.error(`FAIL: Tenant status for '${testTenantId}' is '${restoredTenant?.status}', expected 'Active'.`);
    passed = false;
  } else {
    console.log(`  ✓ Tenant '${testTenantId}' status mutated back to 'Active'.`);
  }

  // 3. Fail-Closed Licensing & Access Evaluation Check
  console.log("\n--- 3. Fail-Closed Licensing & Access Evaluation Check ---");
  // Unknown feature evaluateAccess
  const unkFeatureAccess = UnifiedAuthEvaluator.getFeatureStateForClaim(testTenantId, "FEAT-NONEXISTENT-999");
  if (unkFeatureAccess.state !== "Disabled" || unkFeatureAccess.source !== "Restricted") {
    console.error(`FAIL: Unknown feature was NOT failed closed! state=${unkFeatureAccess.state}, source=${unkFeatureAccess.source}`);
    passed = false;
  } else {
    console.log("  ✓ Unknown feature 'FEAT-NONEXISTENT-999' failed closed -> Disabled (Restricted).");
  }

  // Unknown tenant access evaluation
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

  // 4. Support Ticket Operational Controls Audit
  console.log("\n--- 4. Support Ticket Operational Controls Audit ---");
  const tickets = SupportTicketService.getTickets();
  if (tickets.length === 0) {
    console.error("FAIL: No support tickets found in SupportTicketService!");
    passed = false;
  } else {
    const targetTicket = tickets[0];
    console.log(`Updating status of ticket '${targetTicket.ticketId}' to 'RESOLVED'...`);
    SupportTicketService.updateTicketStatus(targetTicket.ticketId, "RESOLVED");

    const updatedTicket = SupportTicketService.getTickets().find((t) => t.ticketId === targetTicket.ticketId);
    if (updatedTicket?.status !== "RESOLVED") {
      console.error(`FAIL: Ticket status is '${updatedTicket?.status}', expected 'RESOLVED'.`);
      passed = false;
    } else {
      console.log(`  ✓ Ticket '${targetTicket.ticketId}' status updated to 'RESOLVED'.`);
    }

    // Verify Audit Event for Ticket Update
    const ticketAudit = PlatformAuditService.getAuditLogs().find(
      (log) => log.action.includes("Updated Ticket Status") && log.details.includes(targetTicket.ticketId)
    );
    if (!ticketAudit) {
      console.error("FAIL: Support ticket status update did NOT emit a platform audit event!");
      passed = false;
    } else {
      console.log(`  ✓ Support ticket status update emitted canonical audit event [${ticketAudit.id}].`);
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
  const allLogs = PlatformAuditService.getAuditLogs();
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

  // 7. Architectural Dependency & Circular Import Audit
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
