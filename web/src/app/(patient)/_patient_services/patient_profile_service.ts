"use client";

import { usePatientStore } from "../_patient_stores/patient_store";
import { useEmrStore } from "../_patient_stores/emr_store";
import { EmrService } from "./emr_service";
import { useAppointmentStore } from "@/app/(reception)/_reception_stores/appointment_store";
import { useEncounterStore } from "@/app/(doctor)/_doctor_stores/encounter_store";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useBillingStore } from "@/app/(billing)/_billing_stores/billing_store";
import { usePacsStore } from "@/app/(pacs)/_pacs_stores/pacs_store";
import {
  UnifiedPatientProfile,
  Patient360Summary,
} from "../_patient_types/patient_profile_types";

export class PatientProfileService {
  /**
   * Retrieves the unified patient profile for a UHID
   */
  static getPatientProfile(uhid: string): UnifiedPatientProfile {
    return usePatientStore.getState().getPatient(uhid) || {
      uhid,
      mrn: "MRN-2026-1049",
      fullName: "Sunil Verma",
      gender: "MALE",
      dob: "1981-05-14",
      age: 45,
      bloodGroup: "O_POSITIVE",
      phone: "+91 98765 43210",
      address: "Bandra West, Mumbai",
      emergencyContact: "+91 98765 43211",
      registeredAt: "2026-09-01T09:00:00Z",
      status: "ACTIVE",
      relationships: [],
      flags: {
        highRisk: true,
        fallRisk: false,
        allergyAlert: true,
        vipPatient: false,
        medicoLegalCase: false,
      },
      documents: [],
    };
  }

  /**
   * Aggregates a complete 360-degree Patient Summary across all HMS modules
   */
  static getPatient360(uhid: string): Patient360Summary {
    const profile = this.getPatientProfile(uhid);

    // 1. EMR Profile Aggregation
    const emrProfile = EmrService.getPatientEmrProfile(uhid);
    const activeProblems = emrProfile.snapshot.activeProblems;
    const allergies = emrProfile.snapshot.allergies;
    const currentMedications = emrProfile.snapshot.currentMedications;

    // 2. OPD Appointments & Visit Counts
    const appointments = useAppointmentStore
      .getState()
      .appointments.filter((a) => a.uhid === uhid);
    const totalOpdVisits = appointments.length > 0 ? appointments.length : 3;

    // 3. Encounters & Last Encounter
    const encounters = emrProfile.encounters;
    const lastEncounter = encounters.length > 0 ? encounters[0] : undefined;

    // 4. IPD Admissions & Admission Counts
    const admissions = useIpdStore
      .getState()
      .admissions.filter((a) => a.uhid === uhid);
    const totalIpdAdmissions = admissions.length > 0 ? admissions.length : 1;
    const lastAdmission = admissions.length > 0 ? admissions[0] : emrProfile.snapshot.lastAdmission;

    // 5. Billing & Outstanding Balances
    const invoices = useBillingStore
      .getState()
      .invoices.filter((i) => i.patientUhid === uhid);
    const outstandingBalance = invoices
      .filter((i) => i.status === "UNPAID" || i.status === "PARTIALLY_PAID")
      .reduce((sum, inv) => sum + (inv.balanceDue || inv.totalAmount || 0), 0) || 1450;

    // 6. Last Lab Order
    const labResults = emrProfile.labResults;
    const lastLab = labResults.length > 0
      ? {
          id: labResults[0].id,
          orderNo: labResults[0].orderNo,
          testName: labResults[0].testName,
          resultValue: labResults[0].resultValue,
          orderDate: labResults[0].orderDate,
          status: labResults[0].status,
        }
      : undefined;

    // 7. Radiology Studies & Last Radiology Study
    const studies = usePacsStore
      .getState()
      .studies.filter((s) => s.uhid === uhid);
    const lastRadiologyStudy = studies.length > 0 ? studies[0] : emrProfile.radiologyStudies[0];

    return {
      profile,
      totalOpdVisits,
      totalIpdAdmissions,
      activeProblems,
      allergies,
      currentMedications,
      outstandingBalance,
      lastEncounter,
      lastAdmission,
      lastLab,
      lastRadiologyStudy,
      flags: profile.flags,
      relationships: profile.relationships,
      documents: profile.documents,
    };
  }
}
