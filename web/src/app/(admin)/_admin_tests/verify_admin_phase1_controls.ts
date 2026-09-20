/**
 * Verification Test Suite for Admin Subsystem Phase 1 Audit & Controls
 * Run via: npx tsx src/app/\(admin\)/_admin_tests/verify_admin_phase1_controls.ts
 */

import { StaffUserService } from "../_admin_services/staff_user_service";
import { BedService } from "../_admin_services/bed_service";
import { TariffService } from "../_admin_services/tariff_service";
import { DepartmentService } from "../_admin_services/department_service";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import { useAdminSettingsStore } from "../_admin_stores/admin_settings_store";
import { authApiService } from "@/app/(auth)/_auth_services/auth_api_service";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, failureDetail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${testName}${failureDetail ? `: ${failureDetail}` : ""}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("   ADMIN SUBSYSTEM PHASE 1 CONTROL VERIFICATION SUITE   ");
  console.log("=======================================================\n");

  // 1. Staff User License Quota & User Creation Test
  try {
    const initialUsage = StaffUserService.getLicenseUsage();
    assert(initialUsage.licensedSeats === 50, "License seat quota defaults to 50");
    assert(initialUsage.activeUsers >= 0, "Active users metric returns non-negative number");

    const createResult = StaffUserService.createStaffUser(
      {
        staffId: "STF-TEST-999",
        employeeId: "EMP-TEST-999",
        fullName: "Dr. Verification Test",
        email: "test.verify@apollohospital.com",
        phone: "+91 99999 88888",
        departmentId: "dept-101",
        departmentCode: "CARD-01",
        departmentName: "Cardiology",
        roleId: "TMPL-SR-DOC",
        roleName: "Senior Consultant Doctor",
        roleCategory: "DOCTOR",
        status: "ACTIVE",
        joinedDate: "2026-09-20",
        effectivePermissions: ["opd:read", "opd:write"],
      },
      "System Administrator"
    );

    assert(createResult.success, "Staff user created successfully");
    assert(createResult.user?.staffId === "STF-TEST-999", "Created user retains passed staff ID");
  } catch (err: unknown) {
    assert(false, "Staff user creation threw error", String(err));
  }

  // 2. Bed Service Tariff Integration & Registration Test
  try {
    // Resolve rate for DELUXE_SUITE (SRV-BED-DLX base rate is 6500)
    const suiteRate = TariffService.resolveBedRate("DELUXE_SUITE");
    assert(suiteRate === 6500, `Deluxe suite tariff rate resolves to 6500 (got ${suiteRate})`);

    const bedRegistration = BedService.registerBed(
      {
        bedNumber: "TEST-BD-501",
        wardId: "ward-icu-01",
        wardName: "ICU West Wing",
        departmentId: "dept-101",
        departmentCode: "CARD-01",
        departmentName: "Cardiology & Cardiac Sciences",
        roomId: "rm-501",
        roomNumber: "501",
        floor: "5th Floor",
        billingCode: "BILL-BED-ICU",
        category: "ICU",
        status: "VACANT",
      },
      "Test Actor"
    );

    assert(bedRegistration.success, "Bed registration returns success true");
    assert(bedRegistration.bed?.bedNumber === "TEST-BD-501", "Bed registered with correct bed number");
    assert(bedRegistration.bed?.dailyRate === 8500, `ICU daily rate auto-resolved to 8500 (got ${bedRegistration.bed?.dailyRate})`);

    const storedBeds = BedService.getBeds();
    const foundBed = storedBeds.find((b) => b.bedNumber === "TEST-BD-501");
    assert(!!foundBed, "Newly registered bed exists in bed store");
  } catch (err: unknown) {
    assert(false, "Bed registration threw error", String(err));
  }

  // 3. Department Service Resolution & Sub-department Hierarchy Test
  try {
    const dept = DepartmentService.resolveDepartment("Cardiology");
    assert(!!dept, "DepartmentService resolves department by name 'Cardiology'");
    assert(Boolean(dept && (dept.code === "CARD-01" || dept.name.includes("Cardiology"))), "Resolved department matches expected code/name");
  } catch (err: unknown) {
    assert(false, "Department resolution threw error", String(err));
  }

  // 4. Audit Log Recording & Querying Test
  try {
    PlatformAuditService.recordAuditEvent({
      actor: "Dr. Rajesh Sharma",
      actorRole: "HOSPITAL_ADMIN",
      action: "Test Verification Audit Event",
      category: "GOVERNANCE_EVENT",
      entity: "Admin Test Runner",
      ipAddress: "127.0.0.1",
      riskLevel: "INFO",
      details: "Automated test verification event",
    });

    const logs = PlatformAuditService.getAuditLogs();
    const testLog = logs.find((l) => l.action === "Test Verification Audit Event");
    assert(!!testLog, "PlatformAuditService records and retrieves audit events");
    assert(testLog?.actor === "Dr. Rajesh Sharma", "Audit log actor matches recorded payload");
  } catch (err: unknown) {
    assert(false, "Audit logging test threw error", String(err));
  }

  // 5. Admin Settings & Print Template Customizer Persistence Test
  try {
    const store = useAdminSettingsStore.getState();
    store.updateSettings({
      printTemplateConfigs: {
        OPD_PRESCRIPTION: {
          logoPosition: "CENTER",
          showWatermark: true,
          showDoctorRegNo: true,
          showGstinOnInvoice: false,
          pageSize: "A4",
          disclaimerFooter: "Automated test disclaimer",
        },
      },
    });

    const updatedStore = useAdminSettingsStore.getState();
    assert(!!updatedStore.printTemplateConfigs, "printTemplateConfigs state exists in AdminSettingsStore");
    assert(
      updatedStore.printTemplateConfigs?.OPD_PRESCRIPTION?.logoPosition === "CENTER",
      "Print template logo position updated to CENTER"
    );
    assert(
      updatedStore.printTemplateConfigs?.OPD_PRESCRIPTION?.disclaimerFooter === "Automated test disclaimer",
      "Print template disclaimer updated"
    );
  } catch (err: unknown) {
    assert(false, "Print template settings store test threw error", String(err));
  }

  // 6. MFA Flow Submitted Tenant Carryover Test
  try {
    const mfaRes = await authApiService.login({
      username: "mfauser",
      password: "any",
      tenantId: "TNT-9014",
    });

    assert(mfaRes.mfaRequired === true, "mfauser login requires MFA");
    assert(!!mfaRes.mfaSessionToken, "mfaSessionToken returned for mfauser");

    const verifiedSession = await authApiService.verifyMfa({
      otpCode: "123456",
      mfaSessionToken: mfaRes.mfaSessionToken!,
    });

    assert(verifiedSession.tenantId === "TNT-9014", `verifyMfa returned submitted tenantId TNT-9014 (got ${verifiedSession.tenantId})`);
  } catch (err: unknown) {
    assert(false, "MFA tenant carryover test threw error", String(err));
  }

  console.log("\n-------------------------------------------------------");
  console.log(`VERIFICATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("-------------------------------------------------------\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
