"use client";

import { useAppointmentStore } from "@/app/(reception)/_reception_stores/appointment_store";
import { useReceptionVisitStore } from "@/app/(reception)/_reception_stores/reception_visit_store";
import type { ReceptionVisit } from "@/app/(reception)/_reception_types/visit_types";
import { todayLocalDate } from "@/app/(reception)/_reception_utils/date_utils";

/**
 * Enterprise HMS Universal Demo Data Seeder
 * Populates complete schema-compliant mock data into browser localStorage
 * for testing all frontend dashboards across the entire HMS system.
 */

export interface SchemaSectionStat {
  key: string;
  name: string;
  count: number;
  description: string;
}

export const DEMO_PATIENTS = [
  {
    uhid: "P-2026-1049",
    fullName: "Sunil Verma",
    gender: "MALE",
    dob: "1981-05-14",
    phone: "+91 98765 43210",
    aadhaarNumber: "XXXX-XXXX-1234",
    address: "Flat 402, Sunshine Apts, Bandra West, Mumbai",
    emergencyContact: "+91 98765 43211",
    bloodGroup: "O_POSITIVE",
    abhaId: "sunil.verma@abdm",
    registeredAt: "2026-09-01T09:00:00Z",
  },
  {
    uhid: "P-2026-1052",
    fullName: "Anjali Gupta",
    gender: "FEMALE",
    dob: "1994-08-22",
    phone: "+91 98111 22334",
    aadhaarNumber: "XXXX-XXXX-5678",
    address: "12/A Gokuldham Society, Goregaon East, Mumbai",
    emergencyContact: "+91 98111 22335",
    bloodGroup: "B_POSITIVE",
    abhaId: "anjali.gupta@abdm",
    registeredAt: "2026-09-02T10:30:00Z",
  },
  {
    uhid: "P-2026-1058",
    fullName: "Ramesh Kumar",
    gender: "MALE",
    dob: "1968-11-03",
    phone: "+91 99222 33445",
    aadhaarNumber: "XXXX-XXXX-9012",
    address: "78 Heritage Enclave, Thane West, Mumbai",
    emergencyContact: "+91 99222 33446",
    bloodGroup: "A_POSITIVE",
    abhaId: "ramesh.kumar@abdm",
    registeredAt: "2026-09-03T11:15:00Z",
  },
  {
    uhid: "P-2026-1062",
    fullName: "Priya Sharma",
    gender: "FEMALE",
    dob: "1988-02-19",
    phone: "+91 97333 44556",
    aadhaarNumber: "XXXX-XXXX-3456",
    address: "B-101 Sea Face Towers, Worli, Mumbai",
    emergencyContact: "+91 97333 44557",
    bloodGroup: "AB_POSITIVE",
    abhaId: "priya.sharma@abdm",
    registeredAt: "2026-09-04T14:00:00Z",
  },
  {
    uhid: "P-2026-1065",
    fullName: "Meena Joshi",
    gender: "FEMALE",
    dob: "1997-09-30",
    phone: "+91 96444 55667",
    aadhaarNumber: "XXXX-XXXX-7890",
    address: "45 Green Meadows, Powai, Mumbai",
    emergencyContact: "+91 96444 55668",
    bloodGroup: "O_NEGATIVE",
    abhaId: "meena.joshi@abdm",
    registeredAt: "2026-09-05T16:20:00Z",
  },
];

/**
 * Demo front-desk triage visits (the OPD vs IPD decision records of the reception desk).
 * Tokens/appointments themselves are seeded from the appointment store defaults so the
 * reception console, doctor queue and kiosk all read the same live queue.
 */
export const DEMO_RECEPTION_VISITS: ReceptionVisit[] = [
  {
    id: "visit-demo-101",
    uhid: "P-2026-1049",
    patientName: "Sunil Verma",
    ageGender: "45 / Male",
    phone: "9876543210",
    visitDate: todayLocalDate(),
    registeredAt: new Date().toISOString(),
    triagePriority: "P2_EMERGENT",
    vitals: { systolicBp: 168, diastolicBp: 104, pulseRate: 108, temperatureF: 99.2, weightKg: 82, spo2: 95 },
    disposition: "PENDING",
  },
  {
    id: "visit-demo-102",
    uhid: "P-2026-1052",
    patientName: "Anjali Gupta",
    ageGender: "32 / Female",
    phone: "9811122334",
    visitDate: todayLocalDate(),
    registeredAt: new Date().toISOString(),
    triagePriority: "P4_STANDARD",
    vitals: { systolicBp: 118, diastolicBp: 76, pulseRate: 78, temperatureF: 98.4, weightKg: 61, spo2: 99 },
    disposition: "OPD",
    dispositionNote: "Stable vitals, continue OPD review.",
    dispositionAt: new Date().toISOString(),
    decidedBy: "Reception Desk",
  },
  {
    id: "visit-demo-103",
    uhid: "P-2026-1058",
    patientName: "Ramesh Kumar",
    ageGender: "58 / Male",
    phone: "9922233445",
    visitDate: todayLocalDate(),
    registeredAt: new Date().toISOString(),
    triagePriority: "P4_STANDARD",
    vitals: { systolicBp: 132, diastolicBp: 86, pulseRate: 84, temperatureF: 97.8, weightKg: 74, spo2: 98 },
    disposition: "PENDING",
  },
];


export const DEMO_CONTROLLED_DRUGS = [
  {
    id: "cdr-001",
    drugName: "Alprazolam 0.5mg",
    scheduleClass: "H1",
    patientName: "Ramesh Kumar",
    uhid: "P-2026-1058",
    prescriberRegNo: "MH-NMC-12345",
    patientIdProof: "Aadhaar XXXX-XXXX-1234",
    quantityDispensed: 10,
    unit: "Tabs",
    dispensedAt: "2026-09-17T09:15:00Z",
    dispensedBy: "Pharm. Anjali Shah",
    batchNumber: "BT-ALP-001",
  },
  {
    id: "cdr-002",
    drugName: "Morphine Sulfate 10mg",
    scheduleClass: "X",
    patientName: "Priya Sharma",
    uhid: "P-2026-1062",
    prescriberRegNo: "MH-NMC-67890",
    patientIdProof: "Aadhaar XXXX-XXXX-5678",
    quantityDispensed: 5,
    unit: "Inj",
    dispensedAt: "2026-09-17T11:30:00Z",
    dispensedBy: "Pharm. Rohan Tiwari",
    batchNumber: "BT-MOR-002",
  },
  {
    id: "cdr-003",
    drugName: "Clonazepam 1mg",
    scheduleClass: "H",
    patientName: "Sunil Verma",
    uhid: "P-2026-1049",
    prescriberRegNo: "MH-NMC-11223",
    patientIdProof: "Aadhaar XXXX-XXXX-9012",
    quantityDispensed: 30,
    unit: "Tabs",
    dispensedAt: "2026-09-16T16:45:00Z",
    dispensedBy: "Pharm. Anjali Shah",
    batchNumber: "BT-CLO-003",
  },
];

export const DEMO_PHARMACY_DISPENSE = [
  {
    key: "1",
    rxId: "RX-9910",
    uhid: "P-2026-1049",
    patientName: "Sunil Verma",
    doctorName: "Dr. Rajesh Sharma",
    department: "Cardiology Clinic",
    diagnosis: "Acute Coronary Syndrome / Angina",
    allergies: "No known drug allergies (NKDA)",
    status: "PENDING",
    totalAmount: 480,
    items: [
      { name: "Tab Sorbitrate 5mg", dosage: "5mg Sublingual", frequency: "Stat & SOS", duration: "5 days", qty: 10, unitPrice: 12, batchNo: "BT-SOR-09" },
      { name: "Tab Ecosprin 75mg", dosage: "75mg Oral", frequency: "1-0-0 (Morning)", duration: "30 days", qty: 30, unitPrice: 4, batchNo: "BT-ECO-44" },
      { name: "Tab Atorvastatin 20mg", dosage: "20mg Oral", frequency: "0-0-1 (Night)", duration: "30 days", qty: 30, unitPrice: 8, batchNo: "BT-ATO-12" },
    ],
  },
  {
    key: "2",
    rxId: "RX-9912",
    uhid: "P-2026-1052",
    patientName: "Anjali Gupta",
    doctorName: "Dr. Priya Nair",
    department: "Pediatrics & OPD",
    diagnosis: "Acute Upper Respiratory Tract Infection",
    allergies: "Penicillin Mild Rash",
    status: "PENDING",
    totalAmount: 320,
    items: [
      { name: "Cap Amoxicillin 500mg", dosage: "500mg", frequency: "1-0-1", duration: "5 days", qty: 10, unitPrice: 18, batchNo: "BT-AMX-88" },
      { name: "Tab Paracetamol 650mg", dosage: "650mg", frequency: "1-1-1 SOS", duration: "3 days", qty: 10, unitPrice: 5, batchNo: "BT-PCM-02" },
    ],
  },
];

export const DEMO_INVOICES = [
  {
    invoiceNumber: "INV-2026-01049",
    patientUhid: "P-2026-1049",
    patientName: "Sunil Verma",
    paymentMode: "UPI",
    subtotal: 1250,
    cgstAmount: 54,
    sgstAmount: 54,
    totalAmount: 1358,
    createdAt: "2026-09-17T10:15:00Z",
  },
  {
    invoiceNumber: "INV-2026-01052",
    patientUhid: "P-2026-1052",
    patientName: "Anjali Gupta",
    paymentMode: "CASH",
    subtotal: 870,
    cgstAmount: 42,
    sgstAmount: 42,
    totalAmount: 954,
    createdAt: "2026-09-17T10:45:00Z",
  },
];

export const DEMO_NETWORK_TRANSFERS = [
  {
    key: "1",
    transferId: "TRF-8801",
    type: "PATIENT_TRANSFER",
    originBranch: "HMS Main Hospital (Colaba)",
    targetBranch: "HMS Cardiac Institute (Bandra)",
    item: "Sunil Verma (Post-Op Angioplasty ICU Care)",
    uhid: "P-2026-1049",
    vehicleNo: "MH-01-AMB-8801 (ALS Cardiac Ambulance)",
    paramedic: "Paramedic Vikram R. & Dr. Alok",
    priority: "EMERGENCY_RED",
    status: "IN_TRANSIT",
    dispatchedAt: "2026-09-17T09:30:00Z",
  },
  {
    key: "2",
    transferId: "TRF-8805",
    type: "PHARMACY_STOCK",
    originBranch: "Central Pharma Warehouse",
    targetBranch: "HMS Main Hospital (Colaba)",
    item: "Tab Sorbitrate 5mg & Inj Morphine (1,500 Units)",
    vehicleNo: "MH-01-LOG-102 (Cold-Chain Van)",
    paramedic: "Logistics Officer Rajesh",
    priority: "HIGH_YELLOW",
    status: "COMPLETED",
    dispatchedAt: "2026-09-17T08:00:00Z",
    completedAt: "2026-09-17T09:15:00Z",
  },
];

export function seedAllDemoData(): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem("hms_patients", JSON.stringify(DEMO_PATIENTS));
    localStorage.setItem("hms_controlled_drugs", JSON.stringify(DEMO_CONTROLLED_DRUGS));
    localStorage.setItem("hms_pharmacy_dispense", JSON.stringify(DEMO_PHARMACY_DISPENSE));
    localStorage.setItem("hms_invoices", JSON.stringify(DEMO_INVOICES));
    localStorage.setItem("hms_network_transfers", JSON.stringify(DEMO_NETWORK_TRANSFERS));
    localStorage.setItem("hms_last_uhid_seq", "1065");
    localStorage.setItem("hms_last_invoice_seq", "1053");

    // Reception OPD queue + front-desk triage visits live in zustand persist stores.
    // The appointment store defaults are reset into the persisted state so the reception
    // console, doctor queue and kiosk all read the same live queue.
    useAppointmentStore.getState().resetToDefaults();
    const appointmentState = useAppointmentStore.getState();
    localStorage.setItem(
      "hms_appointment_store",
      JSON.stringify({
        state: {
          appointments: appointmentState.appointments,
          lastTokenSeqByDate: appointmentState.lastTokenSeqByDate,
        },
        version: 0,
      })
    );

    useReceptionVisitStore.getState().resetToDefaults();
    localStorage.setItem(
      "hms_reception_visits_store",
      JSON.stringify({ state: { visits: DEMO_RECEPTION_VISITS }, version: 0 })
    );

    return true;
  } catch (err) {
    console.error("Failed to seed demo data to localStorage", err);
    return false;
  }
}

export function clearAllDemoData(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const keysToClear = [
      "hms_patients",
      "hms_appointment_store",
      "hms_reception_visits_store",
      "hms_controlled_drugs",
      "hms_pharmacy_dispense",
      "hms_invoices",
      "hms_network_transfers",
      "hms_last_uhid_seq",
      "hms_last_invoice_seq",
      "hms_last_registered_uhid",
      "hms_controlled_drugs",
      "hms_super_subscription_plans",
      "hms_super_platform_audit",
      "hms_super_support_tickets",
    ];

    keysToClear.forEach((key) => localStorage.removeItem(key));

    // Reset the in-memory reception stores so a later mutation cannot re-persist old data.
    useAppointmentStore.getState().resetToDefaults();
    useReceptionVisitStore.getState().resetToDefaults();

    return true;
  } catch (err) {
    console.error("Failed to clear localStorage demo data", err);
    return false;
  }
}

export function getStorageStats(): SchemaSectionStat[] {
  if (typeof window === "undefined") return [];

  const getItemCount = (key: string): number => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.length;
      // zustand persist payloads: { state: { <collection>: [...] } }
      if (parsed && typeof parsed === "object" && parsed.state) {
        const collection = Object.values(parsed.state).find((value) => Array.isArray(value));
        if (Array.isArray(collection)) return collection.length;
      }
      return 1;
    } catch {
      return 0;
    }
  };

  return [
    { key: "hms_patients", name: "Patients & UHID Demographics", count: getItemCount("hms_patients"), description: "Patient records, ABHA IDs, Aadhaar link" },
    { key: "hms_appointment_store", name: "OPD Queue & Appointments", count: getItemCount("hms_appointment_store"), description: "Queue tokens, doctor slots, consultation status" },
    { key: "hms_reception_visits_store", name: "Reception Triage Visits (OPD vs IPD)", count: getItemCount("hms_reception_visits_store"), description: "Triage vitals, priority and care disposition" },
    { key: "hms_pharmacy_dispense", name: "Pharmacy Dispensing Queue", count: getItemCount("hms_pharmacy_dispense"), description: "e-Prescriptions, FEFO batches, itemized bills" },
    { key: "hms_controlled_drugs", name: "Schedule H/H1/X Vault Register", count: getItemCount("hms_controlled_drugs"), description: "CDSCO narcotic logs, prescriber NMC #, pharmacist sign-off" },
    { key: "hms_invoices", name: "GST Tax Invoices & Receipts", count: getItemCount("hms_invoices"), description: "Billing line items, CGST/SGST breakdown, cashier receipts" },
    { key: "hms_network_transfers", name: "Inter-Hospital Branch Transfers", count: getItemCount("hms_network_transfers"), description: "Ambulance transport dispatch, patient & stock transfers" },
  ];
}
