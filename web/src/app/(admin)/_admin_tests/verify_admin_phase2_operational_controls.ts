/**
 * Verification Test Suite for Admin Subsystem Phase 2 Operational Controls
 * Run via: npx tsx src/app/\(admin\)/_admin_tests/verify_admin_phase2_operational_controls.ts
 */

import { StaffUserService } from "../_admin_services/staff_user_service";
import { BedService } from "../_admin_services/bed_service";
import { TariffService } from "../_admin_services/tariff_service";
import { DepartmentService } from "../_admin_services/department_service";
import { RosterService } from "../_admin_services/roster_service";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";

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
  console.log("   ADMIN SUBSYSTEM PHASE 2 OPERATIONAL CONTROLS SUITE   ");
  console.log("=======================================================\n");

  // 1. Bulk Staff User Status Transition Test
  try {
    const bulkRes = StaffUserService.bulkUpdateUserStatus(["usr-101", "usr-102"], "SUSPENDED", "Test Admin");
    assert(bulkRes.updatedCount > 0, "Bulk update returned positive updated count");

    const u1 = StaffUserService.getStaffUserById("usr-101");
    assert(u1?.status === "SUSPENDED", "Staff user status updated to SUSPENDED via bulk operation");

    // Re-enable for subsequent tests
    StaffUserService.bulkUpdateUserStatus(["usr-101", "usr-102"], "ACTIVE", "Test Admin");
  } catch (err: unknown) {
    assert(false, "Bulk staff status update threw error", String(err));
  }

  // 2. Inpatient Bed Transfer & Housekeeping Clearance Test
  try {
    const beds = BedService.getBeds();
    const vacantBed = beds.find((b) => b.status === "VACANT");
    assert(!!vacantBed, "Found a vacant bed for transfer target");

    if (vacantBed) {
      // Register temporary occupied bed
      const bed1Res = BedService.registerBed({
        bedNumber: "PH2-BD-101",
        wardId: "ward-1",
        wardName: "Cardiology IPD",
        departmentId: "dept-101",
        departmentCode: "CARD-01",
        departmentName: "Cardiology & Cardiac Sciences",
        roomId: "rm-1",
        roomNumber: "101",
        floor: "1st Floor",
        billingCode: "BILL-BED-GEN",
        category: "GENERAL",
        status: "OCCUPIED",
        currentPatientName: "Rohan Patel",
        currentUhid: "UHID-2026-888",
        currentIpdNo: "IPD-2026-999",
      });

      assert(bed1Res.success && !!bed1Res.bed, "Temporary source bed registered");

      if (bed1Res.bed) {
        const transferRes = BedService.transferBed(
          bed1Res.bed.id,
          vacantBed.id,
          { uhid: "UHID-2026-888", ipdNo: "IPD-2026-999", patientName: "Rohan Patel" },
          "Ward Sister In-Charge"
        );

        assert(transferRes.fromBed.status === "CLEANING", "Source bed transitioned to CLEANING upon transfer");
        assert(transferRes.toBed.status === "OCCUPIED", "Target bed transitioned to OCCUPIED upon transfer");
        assert(transferRes.toBed.currentPatientName === "Rohan Patel", "Patient details transferred to target bed");

        // Complete cleaning on source bed
        const cleanedBed = BedService.completeCleaning(bed1Res.bed.id, "Housekeeping Supervisor");
        assert(cleanedBed.status === "VACANT", "Housekeeping clearance restored source bed status to VACANT");
      }
    }
  } catch (err: unknown) {
    assert(false, "Bed transfer & cleaning test threw error", String(err));
  }

  // 3. Tariff CSV Export & Bulk GST Adjustment Test
  try {
    const csvData = TariffService.exportTariffsToCsv();
    assert(csvData.includes("Service Code,Billing Code"), "CSV export header row generated");
    assert(csvData.includes("SRV-CONS-OPD"), "CSV export contains registered tariff service codes");

    const bulkGst = TariffService.bulkAdjustGstRate("LABORATORY", 18, "Finance Officer", "FINANCE");
    assert(bulkGst.updatedCount > 0, "Bulk GST adjustment updated category tariffs");
  } catch (err: unknown) {
    assert(false, "Tariff CSV export & GST adjustment test threw error", String(err));
  }

  // 4. Department HOD Replacement Safety Verification Test
  try {
    const dept = DepartmentService.getDepartments()[0];
    assert(!!dept, "Retrieved hospital department record");
    if (dept) {
      const safety = DepartmentService.checkHODReplacementSafety(dept.id);
      assert(safety.safe === true, "HOD replacement safety check executed successfully");
    }
  } catch (err: unknown) {
    assert(false, "Department HOD safety test threw error", String(err));
  }

  // 5. Roster Shift Swap & Biometric Punch Clock-in Test
  try {
    const shifts = RosterService.getShifts();
    if (shifts.length >= 2) {
      const s1 = shifts[0];
      const s2 = shifts[1];
      const s1Name = s1.staffName;
      const s2Name = s2.staffName;

      const swapRes = RosterService.swapShift(s1.id, s2.id, "Admin Test Runner");
      assert(swapRes.shift1.staffName === s2Name, "Shift 1 assigned staff swapped to second staff member");
      assert(swapRes.shift2.staffName === s1Name, "Shift 2 assigned staff swapped to first staff member");
    }

    // Biometric punch simulation
    RosterService.recordAttendancePunch("EMP-101", "08:15", "BIO-GATE-01", "Biometric Gate");
    const logs = PlatformAuditService.getAuditLogs();
    const punchLog = logs.find((l) => l.action.includes("Biometric Punch Recorded"));
    assert(!!punchLog, "Biometric punch recorded audit event in PlatformAuditService");
  } catch (err: unknown) {
    assert(false, "Roster swap & biometric punch test threw error", String(err));
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
