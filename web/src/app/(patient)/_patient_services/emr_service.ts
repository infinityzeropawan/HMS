"use client";

import {
  PatientDemographics,
  EmrPatientProfile,
  EmrTimelineEvent,
  EmrMedicalRecordDocument,
  ProblemItem,
  AllergyItem,
  MedicationHistoryItem,
  PatientSnapshot,
  EmrCategory,
} from "../_patient_types/emr_types";
import { DEMO_PATIENTS } from "@/lib/demo_seeder/hms_demo_seeder";
import { useAppointmentStore } from "@/app/(reception)/_reception_stores/appointment_store";
import { useEncounterStore } from "@/app/(doctor)/_doctor_stores/encounter_store";
import { usePacsStore } from "@/app/(pacs)/_pacs_stores/pacs_store";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useBillingStore } from "@/app/(billing)/_billing_stores/billing_store";
import { useEmrStore } from "../_patient_stores/emr_store";
import { useOtStore } from "@/app/(ot)/_ot_stores/ot_store";
import { ClinicalEncounter, PrescriptionItem } from "@/app/(doctor)/_doctor_types/encounter_types";

export class EmrService {
  /**
   * Retrieves patient demographics by UHID from localStorage or demo seeder
   */
  static getPatientDemographics(uhid: string): PatientDemographics {
    let demographics: PatientDemographics | undefined;

    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("hms_patients") || "[]");
        const found = stored.find((p: PatientDemographics) => p.uhid === uhid);
        if (found) demographics = found;
      } catch {
        /* ignore */
      }
    }

    if (!demographics) {
      const demoFound = DEMO_PATIENTS.find((p) => p.uhid === uhid);
      if (demoFound) {
        demographics = {
          uhid: demoFound.uhid,
          fullName: demoFound.fullName,
          gender: demoFound.gender,
          dob: demoFound.dob,
          phone: demoFound.phone,
          aadhaarNumber: demoFound.aadhaarNumber,
          address: demoFound.address,
          emergencyContact: demoFound.emergencyContact,
          bloodGroup: demoFound.bloodGroup,
          abhaId: demoFound.abhaId,
          registeredAt: demoFound.registeredAt,
        };
      }
    }

    if (!demographics) {
      demographics = {
        uhid,
        fullName: "Sunil Verma",
        gender: "MALE",
        dob: "1981-05-14",
        age: 45,
        phone: "+91 98765 43210",
        email: "sunil.verma@example.com",
        aadhaarNumber: "XXXX-XXXX-1234",
        address: "Flat 402, Sunshine Apts, Bandra West, Mumbai",
        emergencyContact: "+91 98765 43211",
        bloodGroup: "O_POSITIVE",
        abhaId: "sunil.verma@abdm",
        registeredAt: "2026-09-01T09:00:00Z",
      };
    }

    return demographics;
  }

  /**
   * Aggregates longitudinal EMR profile across all HMS modules for a patient UHID
   */
  static getPatientEmrProfile(uhid: string): EmrPatientProfile {
    const demographics = this.getPatientDemographics(uhid);

    // 1. Appointments
    const appointments = useAppointmentStore
      .getState()
      .appointments.filter((a) => a.uhid === uhid);

    // 2. Encounters & Prescriptions
    const storeEncounters = useEncounterStore.getState().encounters;
    const encounters: ClinicalEncounter[] = [];
    Object.values(storeEncounters).forEach((enc) => {
      if (enc.uhid === uhid) encounters.push(enc);
    });

    if (typeof window !== "undefined") {
      try {
        const signedEnc: ClinicalEncounter[] = JSON.parse(
          localStorage.getItem("hms_encounter_signed") || "[]"
        );
        signedEnc.forEach((enc) => {
          if (enc.uhid === uhid && !encounters.some((e) => e.encounterId === enc.encounterId)) {
            encounters.push(enc);
          }
        });
      } catch {
        /* ignore */
      }
    }

    const prescriptions: PrescriptionItem[] = [];
    encounters.forEach((enc) => {
      if (enc.prescriptions && enc.prescriptions.length > 0) {
        prescriptions.push(...enc.prescriptions);
      }
    });

    // 3. Lab Results
    let labResults: Array<{
      id: string;
      orderNo: string;
      patientName: string;
      uhid: string;
      testName: string;
      category: string;
      resultValue: string;
      normalRange: string;
      orderDate: string;
      status: string;
    }> = [];

    if (typeof window !== "undefined") {
      try {
        const storedLabs = JSON.parse(localStorage.getItem("hms_lab_orders") || "[]");
        labResults = storedLabs.filter(
          (l: { uhid: string }) => l.uhid === uhid || l.uhid === demographics.uhid
        );
      } catch {
        /* ignore */
      }
    }

    if (labResults.length === 0) {
      labResults = [
        {
          id: "lab-102",
          orderNo: "LAB-2026-9915",
          patientName: demographics.fullName,
          uhid: demographics.uhid,
          testName: "Cardiac Biomarkers (Troponin I)",
          category: "PATHOLOGY",
          resultValue: "0.02 ng/mL",
          normalRange: "< 0.04 ng/mL",
          orderDate: "2026-09-16 09:15 AM",
          status: "VERIFIED",
        },
        {
          id: "lab-101",
          orderNo: "LAB-2026-9901",
          patientName: demographics.fullName,
          uhid: demographics.uhid,
          testName: "Complete Blood Count (CBC)",
          category: "HEMATOLOGY",
          resultValue: "Hb: 14.2 g/dL | WBC: 7,800/mcL",
          normalRange: "Normal Range",
          orderDate: "2026-09-14 10:00 AM",
          status: "VERIFIED",
        },
      ];
    }

    // 4. Radiology Studies
    const radiologyStudies = usePacsStore
      .getState()
      .studies.filter((s) => s.uhid === uhid);

    // 5. Admissions (ADT)
    const admissions = useIpdStore
      .getState()
      .admissions.filter((a) => a.uhid === uhid);

    // 6. Invoices & Billing
    const invoices = useBillingStore
      .getState()
      .invoices.filter((i) => i.patientUhid === uhid);

    // 7. OT Surgeries & Operative Logs
    const surgeries = useOtStore
      .getState()
      .surgeries.filter((s) => s.uhid === uhid);

    // 8. Compile Medical Record Documents
    const documents: EmrMedicalRecordDocument[] = [];

    encounters.forEach((enc) => {
      documents.push({
        id: `doc-rx-${enc.encounterId}`,
        date: enc.signedAt || enc.createdAt || "2026-09-17",
        category: "e-Prescription",
        title: `OPD Consultation Note & e-Prescription (${enc.departmentName || "Cardiology"})`,
        provider: enc.doctorName || "Dr. Rajesh Sharma",
        docType: "eRx",
        details: enc.chiefComplaints,
      });
    });

    labResults.forEach((lab) => {
      documents.push({
        id: `doc-lab-${lab.id}`,
        date: lab.orderDate,
        category: "Lab Report",
        title: `${lab.testName} Diagnostic Report`,
        provider: "Central Diagnostic Lab",
        docType: "Lab",
        details: lab.resultValue,
      });
    });

    radiologyStudies.forEach((rad) => {
      documents.push({
        id: `doc-rad-${rad.studyId}`,
        date: rad.date,
        category: "Radiology DICOM",
        title: `${rad.modality} Scan: ${rad.bodyPart} Report`,
        provider: rad.radiologist || "Dr. Vikram Seth (MD Rad)",
        docType: "Rad",
        details: rad.impression || "Radiology Scan Completed",
      });
    });

    admissions.forEach((adm) => {
      documents.push({
        id: `doc-adm-${adm.admissionNo}`,
        date: adm.admissionDate,
        category: "Discharge Summary",
        title: `Inpatient Admission & Discharge Summary (${adm.admittedWard})`,
        provider: adm.attendingDoctor,
        docType: "Discharge",
        details: `Bed ${adm.bedNumber} Stay`,
      });
    });

    invoices.forEach((inv) => {
      documents.push({
        id: `doc-inv-${inv.invoiceNumber}`,
        date: inv.createdAt,
        category: "GST Invoice",
        title: `${inv.category || "OPD"} Billing Receipt (${inv.invoiceNumber})`,
        provider: "Central Cashier Desk",
        docType: "Bill",
        details: `Total Amount: ₹${inv.totalAmount.toLocaleString()}`,
      });
    });

    surgeries.forEach((surg) => {
      documents.push({
        id: `doc-surg-${surg.id}`,
        date: surg.scheduledDate || "2026-09-19",
        category: "Operative Note",
        title: `OT Operative Note: ${surg.procedureName} (${surg.surgeryCode})`,
        provider: surg.surgeonName,
        docType: "Operative",
        details: surg.procedureNotes || `Status: ${surg.status}`,
      });
    });

    if (documents.length === 0) {
      documents.push(
        {
          id: "doc-1",
          date: "2026-09-17",
          category: "e-Prescription",
          title: "Cardiology OPD Consultation & e-Prescription",
          provider: "Dr. Rajesh Sharma",
          docType: "eRx",
        },
        {
          id: "doc-2",
          date: "2026-09-16",
          category: "Lab Report",
          title: "Cardiac Biomarkers & Lipid Profile Report",
          provider: "Central Pathology Lab",
          docType: "Lab",
        },
        {
          id: "doc-3",
          date: "2026-09-14",
          category: "Radiology DICOM",
          title: "Chest X-Ray (PA View) Diagnostic Report",
          provider: "Dr. Vikram Seth (MD Rad)",
          docType: "Rad",
        }
      );
    }

    // 8. Construct Unified Chronological Timeline
    const timeline: EmrTimelineEvent[] = [];

    appointments.forEach((a) => {
      timeline.push({
        id: `time-app-${a.id}`,
        timestamp: `${a.date} ${a.slot}`,
        category: "APPOINTMENT",
        title: `OPD Appointment Booked: ${a.departmentName}`,
        subtitle: `Doctor: ${a.doctorName} (Room: ${a.opdRoom || "OPD 1"})`,
        provider: a.doctorName,
        status: a.status,
      });
    });

    encounters.forEach((e) => {
      timeline.push({
        id: `time-enc-${e.encounterId}`,
        timestamp: e.signedAt || e.createdAt || "2026-09-17 10:30 AM",
        category: "ENCOUNTER",
        title: `OPD Consultation Signed & Locked`,
        subtitle: `Diagnosis: ${e.chiefComplaints || "General Consultation"}`,
        provider: e.doctorName || "Dr. Rajesh Sharma",
        status: e.status,
      });
    });

    labResults.forEach((l) => {
      timeline.push({
        id: `time-lab-${l.id}`,
        timestamp: l.orderDate,
        category: "LAB",
        title: `Lab Test Result: ${l.testName}`,
        subtitle: `Observed: ${l.resultValue} (Ref: ${l.normalRange})`,
        provider: "Central Pathology Lab",
        status: l.status,
      });
    });

    radiologyStudies.forEach((r) => {
      timeline.push({
        id: `time-rad-${r.studyId}`,
        timestamp: r.date,
        category: "RADIOLOGY",
        title: `Radiology ${r.modality} Scan: ${r.bodyPart}`,
        subtitle: `Impression: ${r.impression || "Scan Completed"}`,
        provider: r.radiologist || "Dr. Vikram Seth",
        status: r.status,
      });
    });

    admissions.forEach((ad) => {
      timeline.push({
        id: `time-adm-${ad.admissionNo}`,
        timestamp: ad.admissionDate,
        category: "ADT",
        title: `Inpatient Admission to ${ad.admittedWard}`,
        subtitle: `Bed ${ad.bedNumber} &bull; Attending: ${ad.attendingDoctor}`,
        provider: ad.attendingDoctor,
        status: ad.status,
      });
    });

    invoices.forEach((inv) => {
      timeline.push({
        id: `time-inv-${inv.invoiceNumber}`,
        timestamp: inv.createdAt,
        category: "BILLING",
        title: `Billing Invoice Generated: ${inv.invoiceNumber}`,
        subtitle: `Category: ${inv.category || "OPD"} &bull; Total: ₹${inv.totalAmount.toLocaleString()}`,
        provider: "Central Billing Desk",
        status: inv.status,
      });
    });

    surgeries.forEach((surg) => {
      timeline.push({
        id: `time-surg-${surg.id}`,
        timestamp: surg.scheduledDate || "2026-09-19",
        category: "SURGERY",
        title: `OT Surgical Procedure: ${surg.procedureName}`,
        subtitle: `Suite: ${surg.otRoom} &bull; Surgeon: ${surg.surgeonName} &bull; Outcome: ${surg.outcome || surg.status}`,
        provider: surg.surgeonName,
        status: surg.status,
      });
    });

    // Sort timeline by timestamp descending
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const { activeProblems, resolvedProblems } = this.getProblemList(uhid, encounters);
    const allergies = this.getAllergyRegistry(uhid);
    const currentMedications = this.getMedicationHistory(uhid, prescriptions);

    const outstandingBalances = invoices
      .filter((i) => i.status === "UNPAID" || i.status === "PARTIALLY_PAID")
      .reduce((sum, inv) => sum + (inv.balanceDue || inv.totalAmount || 0), 0);

    const alerts = useEmrStore.getState().generateClinicalAlerts(uhid);

    const snapshot: PatientSnapshot = {
      demographics,
      bloodGroup: demographics.bloodGroup || "O_POSITIVE",
      activeProblems,
      resolvedProblems,
      allergies,
      currentMedications,
      lastEncounter: encounters[0],
      lastAdmission: admissions[0],
      recentLabs: labResults.slice(0, 3).map((l) => ({
        id: l.id,
        orderNo: l.orderNo,
        testName: l.testName,
        resultValue: l.resultValue,
        orderDate: l.orderDate,
        status: l.status,
      })),
      outstandingBalances: outstandingBalances || 1450,
      allergyAlerts: alerts.allergyAlerts,
      medicationAlerts: alerts.medicationAlerts,
      followUpAlerts: alerts.followUpAlerts,
    };

    return {
      demographics,
      appointments,
      encounters,
      prescriptions,
      labResults,
      radiologyStudies,
      admissions,
      invoices,
      surgeries,
      documents,
      timeline,
      snapshot,
    };
  }

  /**
   * Returns active and resolved problem lists aggregated from useEmrStore and clinical encounters
   */
  static getProblemList(
    uhid: string,
    encounters?: ClinicalEncounter[]
  ): { activeProblems: ProblemItem[]; resolvedProblems: ProblemItem[] } {
    const storeProblems = useEmrStore.getState().getProblems(uhid);
    const activeProblems: ProblemItem[] = storeProblems.filter((p) => p.status === "ACTIVE");
    const resolvedProblems: ProblemItem[] = storeProblems.filter((p) => p.status === "RESOLVED");

    // Merge live encounter complaints if not already recorded
    if (encounters && encounters.length > 0) {
      encounters.forEach((enc, index) => {
        if (
          enc.chiefComplaints &&
          !activeProblems.some((p) => p.conditionName.toLowerCase() === enc.chiefComplaints?.toLowerCase())
        ) {
          activeProblems.push({
            id: `prob-enc-${index}`,
            icd10Code: "R69",
            conditionName: enc.chiefComplaints,
            status: "ACTIVE",
            onsetDate: enc.createdAt || "2026-09-01",
            diagnosedBy: enc.doctorName || "Attending Physician",
          });
        }
      });
    }

    return { activeProblems, resolvedProblems };
  }

  /**
   * Returns complete allergy registry from useEmrStore
   */
  static getAllergyRegistry(uhid: string): AllergyItem[] {
    return useEmrStore.getState().getAllergies(uhid);
  }

  /**
   * Aggregates medication history from useEmrStore and signed prescriptions
   */
  static getMedicationHistory(
    uhid: string,
    prescriptions?: PrescriptionItem[]
  ): MedicationHistoryItem[] {
    const storeMeds = useEmrStore.getState().getMedications(uhid);

    if (prescriptions && prescriptions.length > 0) {
      const liveMeds: MedicationHistoryItem[] = prescriptions.map((p, idx) => ({
        id: `med-rx-${idx}`,
        drugName: p.drugName,
        dosage: p.dosage,
        frequency: p.frequency,
        durationDays: p.durationDays || 30,
        prescribedDate: "2026-09-17",
        prescribedBy: "Dr. Rajesh Sharma",
        status: "ACTIVE",
      }));

      // Merge storeMeds and liveMeds without duplicates by drugName
      const merged = [...storeMeds];
      liveMeds.forEach((lm) => {
        if (!merged.some((m) => m.drugName.toLowerCase() === lm.drugName.toLowerCase())) {
          merged.push(lm);
        }
      });
      return merged;
    }

    return storeMeds;
  }

  /**
   * Filters timeline events by category
   */
  static getFilteredTimeline(
    uhid: string,
    categoryFilter?: EmrCategory | "ALL"
  ): EmrTimelineEvent[] {
    const profile = this.getPatientEmrProfile(uhid);
    if (!categoryFilter || categoryFilter === "ALL") {
      return profile.timeline;
    }
    return profile.timeline.filter((e) => e.category === categoryFilter);
  }
}


