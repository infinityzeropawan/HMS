"use client";

import { useEncounterStore } from "../_doctor_stores/encounter_store";
import { ClinicalEncounter, LabOrderInput, RadiologyOrderInput, FollowUpInput } from "../_doctor_types/encounter_types";
import { AppointmentService } from "@/app/(reception)/_reception_services/appointment_service";
import { useAppointmentStore } from "@/app/(reception)/_reception_stores/appointment_store";
import { NotificationService } from "@/app/(admin)/_admin_services/notification_service";
import { PacsService } from "@/app/(pacs)/_pacs_services/pacs_service";
import { PatientProfileService } from "@/app/(patient)/_patient_services/patient_profile_service";

export class EncounterService {
  /**
   * Fetches or initializes an active encounter draft for a given patient UHID
   */
  static getOrCreateEncounter(uhid: string, patientName?: string, ageGender?: string): ClinicalEncounter {
    const store = useEncounterStore.getState();
    let enc = store.getEncounter(uhid);
    if (!enc) {
      store.saveDraft(uhid, {
        uhid,
        patientName: patientName || "Patient Record",
        ageGender: ageGender || "35 / M",
      });
      enc = store.getEncounter(uhid)!;
    }
    return enc;
  }

  /**
   * Saves updated SOAP notes or diagnoses for an encounter draft
   */
  static saveDraft(uhid: string, updates: Partial<ClinicalEncounter>): void {
    useEncounterStore.getState().saveDraft(uhid, updates);
  }

  /**
   * Adds a laboratory order to the encounter
   */
  static addLabOrder(uhid: string, order: LabOrderInput): void {
    useEncounterStore.getState().addLabOrder(uhid, order);
  }

  /**
   * Adds a radiology order to the encounter
   */
  static addRadiologyOrder(uhid: string, order: RadiologyOrderInput): void {
    useEncounterStore.getState().addRadiologyOrder(uhid, order);
  }

  /**
   * Sets a follow-up revisit timeline for the patient
   */
  static setFollowUp(uhid: string, followUp: FollowUpInput): void {
    useEncounterStore.getState().setFollowUp(uhid, followUp);
  }

  /**
   * Single Authoritative Service for Encounter Sign-off and Locking.
   * Handles encounter state mutation, appointment completion, Patient360 refresh,
   * EMR timeline logging, and downstream dispatches.
   */
  static signAndLockEncounter(uhid: string): { success: boolean; message: string; encounter?: ClinicalEncounter } {
    const store = useEncounterStore.getState();
    const encounter = store.signEncounter(uhid);

    if (!encounter) {
      return { success: false, message: "Encounter record not found." };
    }

    if (typeof window !== "undefined") {
      // 1. Save signed encounter to localStorage for historical audit
      try {
        const existingSigned = JSON.parse(localStorage.getItem("hms_encounter_signed") || "[]");
        existingSigned.unshift(encounter);
        localStorage.setItem("hms_encounter_signed", JSON.stringify(existingSigned));
      } catch { /* ignore */ }

      // 2. Dispatch to Pharmacy Queue if prescriptions exist
      if (encounter.prescriptions.length > 0) {
        try {
          const rxId = `RX-${Math.floor(9000 + Math.random() * 1000)}`;
          const existingRx = JSON.parse(localStorage.getItem("hms_pharmacy_queue") || "[]");
          existingRx.unshift({
            rxId,
            uhid: encounter.uhid,
            patientName: encounter.patientName,
            meds: encounter.prescriptions.map((p) => `${p.drugName} (${p.dosage} ${p.frequency})`).join(", "),
            status: "PENDING",
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem("hms_pharmacy_queue", JSON.stringify(existingRx));
        } catch { /* ignore */ }
      }

      // 3. Lab Orders are created & dispatched solely by DoctorOrderService.createLabOrder() to prevent duplicate queue entries.

      // 3b. Dispatch Radiology Orders to PACS Worklist & Billing
      if (encounter.radiologyOrders && encounter.radiologyOrders.length > 0) {
        try {
          encounter.radiologyOrders.forEach((radOrder) => {
            PacsService.dispatchOrderFromEncounter(
              encounter.uhid,
              encounter.patientName,
              encounter.doctorName,
              radOrder
            );
          });
        } catch { /* ignore */ }
      }

      // 4. Handle Follow-up Booking if specified
      if (encounter.followUp) {
        try {
          AppointmentService.bookAppointment({
            uhid: encounter.uhid,
            patientName: encounter.patientName,
            phone: "+91 98765 43210",
            ageGender: encounter.ageGender,
            departmentId: "CARDIOLOGY",
            departmentCode: "CARD-01",
            departmentName: encounter.departmentName || "Cardiology",
            doctorId: encounter.doctorId || "DOC-101",
            doctorName: encounter.doctorName || "Dr. Rajesh Sharma",
            opdRoom: "OPD 3",
            date: encounter.followUp.revisitDate,
            slot: "10:00 AM",
          });
        } catch { /* non-blocking */ }
      }

      // 5. Update Appointment Store Queue Status to COMPLETED (Single Execution)
      try {
        const apps = useAppointmentStore.getState().appointments;
        const matchingApp = apps.find((a) => a.uhid === uhid && a.status !== "COMPLETED" && a.status !== "CANCELLED");
        if (matchingApp) {
          useAppointmentStore.getState().updateStatus(matchingApp.id, "COMPLETED");
        }
      } catch { /* ignore */ }

      // 6. Refresh Patient360 Profile Summary & Encounter History
      try {
        PatientProfileService.getPatient360(uhid);
      } catch { /* ignore */ }

      // 7. Append Signed Encounter Event to Central EMR Timeline
      try {
        const existingTimeline = JSON.parse(localStorage.getItem(`hms_emr_timeline_${uhid}`) || "[]");
        existingTimeline.unshift({
          id: `time-signed-${Date.now()}`,
          timestamp: new Date().toISOString(),
          category: "ENCOUNTER",
          title: "OPD Clinical Encounter Signed & Locked",
          subtitle: "Physician sign-off complete. Pharmacy, Lab & Radiology orders dispatched.",
          provider: encounter.doctorName || "Dr. Rajesh Sharma (Cardiology)",
          status: "SIGNED",
        });
        localStorage.setItem(`hms_emr_timeline_${uhid}`, JSON.stringify(existingTimeline));
      } catch { /* ignore */ }

      // 8. Notify Patient SMS
      try {
        NotificationService.sendNotification(
          {
            channel: "sms",
            priority: "normal",
            category: "PATIENT_DISCHARGE",
            patientName: encounter.patientName,
            recipientRole: "PATIENT",
            recipientContact: "+91 98765 43210",
            templateKey: "PATIENT_DISCHARGE",
            templateVariables: {
              patientName: encounter.patientName,
              doctorName: encounter.doctorName,
            },
          },
          "Doctor OPD Console",
          "DOCTOR"
        );
      } catch { /* ignore */ }
    }

    return {
      success: true,
      message: `Encounter ${encounter.encounterId} signed & locked. Dispatched to Pharmacy & Diagnostics.`,
      encounter,
    };
  }
}

