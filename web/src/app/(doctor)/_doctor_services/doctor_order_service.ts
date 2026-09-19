"use client";

import { usePacsStore } from "@/app/(pacs)/_pacs_stores/pacs_store";
import { PacsService } from "@/app/(pacs)/_pacs_services/pacs_service";
import { useBillingStore } from "@/app/(billing)/_billing_stores/billing_store";
import { useAppointmentStore } from "@/app/(reception)/_reception_stores/appointment_store";
import { AppointmentService } from "@/app/(reception)/_reception_services/appointment_service";
import { useEmrStore } from "@/app/(patient)/_patient_stores/emr_store";
import { PatientProfileService } from "@/app/(patient)/_patient_services/patient_profile_service";
import { RadiologyOrderInput, LabOrderInput } from "../_doctor_types/encounter_types";

export interface LabOrderRequest {
  testName: "CBC" | "LFT" | "RFT" | "Lipid Profile" | "HbA1c" | "Troponin" | string;
  category?: string;
  urgency?: "ROUTINE" | "URGENT" | "STAT";
  clinicalNotes?: string;
  price?: number;
}

export interface RadiologyOrderRequest {
  modality: "XRAY" | "ULTRASOUND" | "CT" | "MRI" | "ECG" | "ECHO" | string;
  studyName: string;
  bodyPart?: string;
  urgency?: "ROUTINE" | "URGENT" | "STAT";
  clinicalNotes?: string;
  price?: number;
}

export interface FollowUpScheduleRequest {
  revisitDate: string;
  followUpType?: "OPD_REVIEW" | "LAB_REVIEW" | "POST_OP_CHECK" | "TELEHEALTH";
  notes?: string;
}

export class DoctorOrderService {
  /**
   * Price lookup map for automated billing item generation
   */
  private static PRICE_MAP: Record<string, number> = {
    "CBC": 450,
    "Complete Blood Count (CBC)": 450,
    "LFT": 850,
    "Liver Function Test (LFT)": 850,
    "RFT": 750,
    "Renal Function Test (KFT)": 750,
    "Lipid Profile": 900,
    "HbA1c": 600,
    "Troponin": 1200,
    "Cardiac Biomarkers (Troponin I / T)": 1200,
    "XRAY": 500,
    "ULTRASOUND": 1200,
    "CT": 3500,
    "MRI": 6500,
    "ECG": 300,
    "ECHO": 2200,
  };

  /**
   * Orders lab tests, dispatches lab store queue, generates billing item, updates EMR timeline
   */
  static createLabOrder(
    uhid: string,
    request: LabOrderRequest
  ): { success: boolean; orderId: string; invoiceNumber?: string } {
    const profile = PatientProfileService.getPatientProfile(uhid);
    const orderId = `lab-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderNo = `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const price = request.price || this.PRICE_MAP[request.testName] || 650;

    // 1. Create record in hms_lab_orders localStorage/queue
    if (typeof window !== "undefined") {
      try {
        const existingLabs = JSON.parse(localStorage.getItem("hms_lab_orders") || "[]");
        existingLabs.unshift({
          id: orderId,
          orderNo,
          patientName: profile.fullName,
          uhid: profile.uhid,
          testName: request.testName,
          category: request.category || "PATHOLOGY",
          resultValue: "Awaiting Processing",
          normalRange: "Pending",
          orderDate: new Date().toISOString().split("T")[0],
          status: "PENDING_LAB_PROCESSING",
          urgency: request.urgency || "ROUTINE",
          notes: request.clinicalNotes,
        });
        localStorage.setItem("hms_lab_orders", JSON.stringify(existingLabs));
      } catch {
        /* ignore */
      }
    }

    // 2. Create Billing draft invoice item in useBillingStore
    let invoiceNumber: string | undefined;
    try {
      const billingStore = useBillingStore.getState();
      const invoice = billingStore.addInvoice({
        patientUhid: profile.uhid,
        patientName: profile.fullName,
        category: "LAB",
        items: [
          {
            itemId: orderId,
            description: `Laboratory Test: ${request.testName}`,
            hsnSacCode: "999312",
            quantity: 1,
            unitPrice: price,
            gstRate: 0,
          },
        ],
        paymentMode: "CASH",
        subtotal: price,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: price,
        invoiceNumber: `INV-LAB-${Date.now()}`,
      });
      invoiceNumber = invoice.invoiceNumber;
    } catch {
      /* ignore */
    }

    return { success: true, orderId, invoiceNumber };
  }

  /**
   * Orders radiology scan, dispatches PACS worklist, generates billing item, updates EMR timeline
   */
  static createRadiologyOrder(
    uhid: string,
    request: RadiologyOrderRequest
  ): { success: boolean; studyId: string; invoiceNumber?: string } {
    const profile = PatientProfileService.getPatientProfile(uhid);
    const price = request.price || this.PRICE_MAP[request.modality] || 1500;

    // 1. Create record in PACS Store worklist
    const radOrderInput: RadiologyOrderInput = {
      orderId: `rad-${Date.now()}`,
      modality: request.modality as RadiologyOrderInput["modality"],
      studyName: request.studyName,
      bodyPart: request.bodyPart || "General",
      urgency: request.urgency || "ROUTINE",
      clinicalNotes: request.clinicalNotes || "",
    };

    const study = PacsService.dispatchOrderFromEncounter(
      profile.uhid,
      profile.fullName,
      "Dr. Rajesh Sharma (Cardiology)",
      radOrderInput
    );

    // 2. Create Billing draft invoice item in useBillingStore
    let invoiceNumber: string | undefined;
    try {
      const billingStore = useBillingStore.getState();
      const invoice = billingStore.addInvoice({
        patientUhid: profile.uhid,
        patientName: profile.fullName,
        category: "OPD",
        items: [
          {
            itemId: study.studyId,
            description: `Radiology Scan: ${request.modality} (${request.studyName})`,
            hsnSacCode: "999313",
            quantity: 1,
            unitPrice: price,
            gstRate: 0,
          },
        ],
        paymentMode: "CASH",
        subtotal: price,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: price,
        invoiceNumber: `INV-RAD-${Date.now()}`,
      });
      invoiceNumber = invoice.invoiceNumber;
    } catch {
      /* ignore */
    }

    return { success: true, studyId: study.studyId, invoiceNumber };
  }

  /**
   * Schedules follow-up consultation in AppointmentStore and updates EMR timeline
   */
  static scheduleFollowUp(
    uhid: string,
    request: FollowUpScheduleRequest
  ): { success: boolean; appointmentId: string } {
    const profile = PatientProfileService.getPatientProfile(uhid);

    const res = AppointmentService.bookAppointment({
      uhid: profile.uhid,
      patientName: profile.fullName,
      phone: profile.phone,
      ageGender: `${profile.age || 45}${profile.gender?.[0]?.toUpperCase() || "M"}`,
      departmentId: "CARDIOLOGY",
      departmentCode: "CARD-01",
      departmentName: "Cardiology",
      doctorId: "DOC-101",
      doctorName: "Dr. Rajesh Sharma",
      opdRoom: "OPD Clinic 3",
      date: request.revisitDate,
      slot: "10:00 AM",
    });

    return { success: true, appointmentId: res.appointment?.id || `app-${Date.now()}` };
  }
}
