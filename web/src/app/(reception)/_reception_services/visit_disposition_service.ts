"use client";

import { BedService } from "@/app/(admin)/_admin_services/bed_service";
import { NotificationService } from "@/app/(admin)/_admin_services/notification_service";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import { useIpdStore, IpdAdmissionRecord } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useBillingStore } from "@/app/(billing)/_billing_stores/billing_store";
import { useReceptionVisitStore } from "../_reception_stores/reception_visit_store";
import { CareDisposition, ReceptionVisit } from "../_reception_types/visit_types";
import { PatientRegistryService } from "./patient_registry_service";
import { todayLocalDate } from "../_reception_utils/date_utils";

export interface AdmitToIpdInput {
  visitId?: string | null;
  uhid: string;
  patientName: string;
  attendingDoctor: string;
  bedId: string;
  initialDeposit: number;
  tpaCashlessApproved: boolean;
  primaryDiagnosis?: string;
}

export interface DispositionResult {
  success: boolean;
  message: string;
  admissionNo?: string;
  bedNumber?: string;
  ward?: string;
}

const ACTOR = "OPD Reception Desk";
const ACTOR_ROLE = "RECEPTIONIST";

/**
 * OPD vs IPD decision engine for the front desk.
 *
 * The reception desk is the hospital entry point: triage vitals + priority captured at
 * registration feed this decision. When the decision is "admit", the admission is created here
 * from the registered patient record (never re-typed data), the physical bed is locked through
 * the central BedService, the advance deposit is posted to the billing ledger and the ward is
 * notified — the previously missing link between reception and the IPD module.
 */
export class VisitDispositionService {
  /** Beds that can be allocated right now (central bed engine). */
  static getAvailableBeds() {
    return BedService.getAvailableBeds();
  }

  /** Open (not yet admitted) reception visit for a patient, if any. */
  static getOpenVisit(uhid: string): ReceptionVisit | undefined {
    return useReceptionVisitStore
      .getState()
      .visits.find((v) => v.uhid === uhid && v.disposition !== "IPD_ADMITTED");
  }

  static getVisit(visitId?: string | null): ReceptionVisit | undefined {
    if (!visitId) return undefined;
    return useReceptionVisitStore.getState().visits.find((v) => v.id === visitId);
  }

  /** Live inpatient admission for a UHID (duplicate-admission guard). */
  static findActiveAdmission(uhid: string): IpdAdmissionRecord | undefined {
    return useIpdStore
      .getState()
      .admissions.find((a) => a.uhid === uhid && a.status !== "DISCHARGED");
  }

  /** Records the OPD / emergency / referral decision against a reception visit. */
  static recordDisposition(
    visit: ReceptionVisit | undefined,
    uhid: string,
    patientName: string,
    disposition: CareDisposition,
    note: string,
    decidedBy: string
  ): DispositionResult {
    if (disposition === "IPD_ADMITTED") {
      return {
        success: false,
        message: "Use “Admit to IPD” to admit the patient — the bed and deposit must be captured first.",
      };
    }

    let visitId = visit?.id;
    if (!visitId) {
      // No triage visit exists (e.g. token booked without registration) — open one so the
      // disposition is never lost.
      const created = useReceptionVisitStore.getState().createVisit({
        uhid,
        patientName,
        ageGender: this.ageGenderFor(uhid),
        phone: PatientRegistryService.findByUhid(uhid)?.phone || "",
        visitDate: todayLocalDate(),
        triagePriority: "P4_STANDARD",
        vitals: {},
      });
      visitId = created.id;
    }

    const ok = useReceptionVisitStore
      .getState()
      .recordDisposition(visitId, disposition, note, decidedBy);
    if (!ok) return { success: false, message: "Unable to record the disposition for this visit." };

    this.audit(
      "Reception Disposition Recorded",
      uhid,
      patientName,
      `Disposition ${disposition} recorded at the reception desk. Note: ${note || "—"}`
    );

    return { success: true, message: `Disposition recorded: ${disposition}.` };
  }

  /** Admits the patient as an inpatient: bed lock + IPD record + deposit + ward notification. */
  static admitToIpd(input: AdmitToIpdInput): DispositionResult {
    if (!input.uhid) return { success: false, message: "Patient UHID is required for admission." };
    if (!input.bedId) return { success: false, message: "Select an available bed for admission." };
    if (!input.attendingDoctor) {
      return { success: false, message: "Select the attending consultant for the admission." };
    }

    // 1. Duplicate admission guard
    const active = this.findActiveAdmission(input.uhid);
    if (active) {
      return {
        success: false,
        message: `${input.patientName} is already admitted (${active.admissionNo} — bed ${active.bedNumber}, ${active.admittedWard}). Discharge or transfer the existing admission first.`,
      };
    }

    // 2. Bed validation through the central bed engine
    const validation = BedService.validateBedAllocation(input.bedId);
    if (!validation.valid) {
      return { success: false, message: validation.errors.join("; ") };
    }

    const bed = BedService.getBedById(input.bedId);
    if (!bed) return { success: false, message: "Selected bed was not found in the bed master." };

    // 3. Demographics + age from the patient index (no re-typing, no hard-coded defaults)
    const patient = PatientRegistryService.findByUhid(input.uhid);
    const age = patient ? PatientRegistryService.computeAge(patient.dob) : 0;
    const gender = patient ? PatientRegistryService.genderLabel(patient.gender) : "Unknown";
    const admissionDate = todayLocalDate();

    // 4. Lock the physical bed first (throws when the bed was grabbed in the meantime)
    try {
      BedService.allocateBed(
        bed.id,
        { uhid: input.uhid, ipdNo: "PENDING", patientName: input.patientName, admissionDate },
        "Reception Desk — OPD to IPD conversion"
      );
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : "Bed allocation failed." };
    }

    // 5. Create the IPD admission record
    const admission = useIpdStore.getState().addAdmission({
      uhid: input.uhid,
      patientName: input.patientName,
      age,
      gender,
      admittedWard: bed.wardName,
      bedNumber: bed.bedNumber,
      attendingDoctor: input.attendingDoctor,
      admissionDate,
      initialDepositAmount: input.initialDeposit,
      tpaCashlessApproved: input.tpaCashlessApproved,
      primaryDiagnosis: input.primaryDiagnosis || "Admitted from OPD / Reception triage",
    });

    // 6. Post the advance deposit to the billing ledger
    if (input.initialDeposit > 0) {
      try {
        useBillingStore.getState().recordAdvanceDeposit({
          depositNo: "",
          patientUhid: input.uhid,
          patientName: input.patientName,
          roomBedNo: `${bed.wardName} - ${bed.bedNumber}`,
          admissionDate,
          initialDeposit: input.initialDeposit,
          roomCharges: 0,
          nursingCharges: 0,
          labCharges: 0,
          pharmacyCharges: 0,
        });
      } catch {
        /* billing ledger write is best-effort; the admission itself is recorded */
      }
    }

    // 7. Link the visit (creating one when the token was issued without triage)
    const visit = this.getVisit(input.visitId);
    const targetVisitId =
      visit?.id ||
      useReceptionVisitStore.getState().createVisit({
        uhid: input.uhid,
        patientName: input.patientName,
        ageGender: `${age > 0 ? age : "NA"} / ${gender}`,
        phone: patient?.phone || "",
        visitDate: admissionDate,
        triagePriority: "P4_STANDARD",
        vitals: {},
      }).id;

    useReceptionVisitStore.getState().linkAdmission(targetVisitId, {
      admissionNo: admission.admissionNo,
      bedNumber: bed.bedNumber,
      ward: bed.wardName,
    });

    // 8. Notify the ward / nursing station
    try {
      NotificationService.sendNotification(
        {
          channel: "system",
          priority: "normal",
          category: "PATIENT_ADMISSION",
          patientId: input.uhid,
          patientName: input.patientName,
          recipientRole: "NURSE",
          templateKey: "TPL_PATIENT_ADMISSION",
          templateVariables: {
            patientName: input.patientName,
            departmentName: bed.wardName,
            doctorName: input.attendingDoctor,
            amount: input.initialDeposit,
          },
        },
        ACTOR,
        ACTOR_ROLE
      );
    } catch {
      /* notification dispatch must never block an admission */
    }

    this.audit(
      "Reception Admitted Patient to IPD",
      input.uhid,
      input.patientName,
      `Admitted to ${bed.wardName} / bed ${bed.bedNumber} as ${admission.admissionNo} under ${input.attendingDoctor}. Deposit ₹${input.initialDeposit}.`
    );

    return {
      success: true,
      message: `Inpatient ${input.patientName} admitted as ${admission.admissionNo} to ${bed.bedNumber} (${bed.wardName}).`,
      admissionNo: admission.admissionNo,
      bedNumber: bed.bedNumber,
      ward: bed.wardName,
    };
  }

  private static ageGenderFor(uhid: string): string {
    const patient = PatientRegistryService.findByUhid(uhid);
    return patient ? PatientRegistryService.toAgeGender(patient) : "NA / Unknown";
  }

  private static audit(action: string, uhid: string, patientName: string, details: string): void {
    try {
      PlatformAuditService.recordAuditEvent({
        actor: ACTOR,
        actorRole: ACTOR_ROLE,
        action,
        category: "COMPLIANCE_EVENT",
        entity: `Reception Visit: ${uhid} (${patientName})`,
        ipAddress: "192.168.1.105",
        riskLevel: "WARNING",
        details,
      });
    } catch {
      /* audit logging must never block the desk */
    }
  }
}
