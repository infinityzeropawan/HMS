"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SpecimenRecord {
  id: string;
  sampleBarcode: string;
  patientName: string;
  uhid: string;
  testName: string;
  containerType: "EDTA_PURPLE" | "SERUM_RED" | "URINE_CONTAINER" | "CITRATE_BLUE";
  collectionTime: string;
  collectedBy: string;
  status: "PENDING_COLLECTION" | "COLLECTED_DISPATCHED" | "ANALYZER_RUNNING" | "REJECTED";
}

export interface LabTestCatalogItem {
  id: string;
  testCode: string;
  testName: string;
  category: "HAEMATOLOGY" | "BIOCHEMISTRY" | "MICROBIOLOGY" | "SEROLOGY" | "HISTOPATHOLOGY";
  containerType: "EDTA_PURPLE" | "SERUM_RED" | "URINE_CONTAINER" | "CITRATE_BLUE";
  normalRange: string;
  unit: string;
  unitPrice: number;
  tatHours: number;
  nablAccredited: boolean;
}

export interface ReferralLabOrder {
  id: string;
  referralOrderNo: string;
  patientUhid: string;
  patientName: string;
  testName: string;
  referralLabName: "Lal PathLabs" | "Metropolis Healthcare" | "SRL Diagnostics" | "Thyrocare";
  dispatchDate: string;
  courierTrackingNo: string;
  coldChainTemp: string;
  status: "DISPATCHED" | "IN_TRANSIT" | "REPORT_RECEIVED";
}

export interface PathologistSignoffLog {
  id: string;
  orderId: string;
  patientUhid: string;
  patientName: string;
  pathologistName: string;
  registrationNo: string;
  signoffTimestamp: string;
  status: "VERIFIED_SIGNED";
}

interface LabStoreState {
  specimens: SpecimenRecord[];
  testCatalog: LabTestCatalogItem[];
  outsourcedOrders: ReferralLabOrder[];
  pathologistSignoffs: PathologistSignoffLog[];

  updateSpecimenStatus: (id: string, status: SpecimenRecord["status"]) => void;
  addSpecimen: (specimen: Omit<SpecimenRecord, "id" | "sampleBarcode">) => void;
  addTestCatalogItem: (item: Omit<LabTestCatalogItem, "id">) => void;
  dispatchOutsourcedOrder: (order: Omit<ReferralLabOrder, "id" | "referralOrderNo" | "status">) => ReferralLabOrder;
  signoffReport: (signoff: Omit<PathologistSignoffLog, "id" | "signoffTimestamp" | "status">) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SPECIMENS: SpecimenRecord[] = [
  {
    id: "spec-1",
    sampleBarcode: "BC-2026-9901",
    patientName: "Sunil Verma",
    uhid: "P-2026-9912",
    testName: "Complete Blood Count (CBC) & ESR",
    containerType: "EDTA_PURPLE",
    collectionTime: "2026-09-16 08:30 AM",
    collectedBy: "Phlebotomist Anand Kumar",
    status: "ANALYZER_RUNNING",
  },
  {
    id: "spec-2",
    sampleBarcode: "BC-2026-9908",
    patientName: "Rajesh Kulkarni",
    uhid: "P-2026-9978",
    testName: "Renal Function Test (Serum Electrolytes & Creatinine)",
    containerType: "SERUM_RED",
    collectionTime: "2026-09-16 09:15 AM",
    collectedBy: "Phlebotomist Anand Kumar",
    status: "COLLECTED_DISPATCHED",
  },
  {
    id: "spec-3",
    sampleBarcode: "BC-2026-9914",
    patientName: "Anita Roy",
    uhid: "P-2026-9944",
    testName: "Urine Routine & Microscopic",
    containerType: "URINE_CONTAINER",
    collectionTime: "2026-09-16 10:00 AM",
    collectedBy: "Nurse Kavita Roy",
    status: "PENDING_COLLECTION",
  },
];

const DEFAULT_CATALOG: LabTestCatalogItem[] = [
  {
    id: "cat-1",
    testCode: "LAB-CBC-01",
    testName: "Complete Blood Count (CBC) with Differential",
    category: "HAEMATOLOGY",
    containerType: "EDTA_PURPLE",
    normalRange: "Hb: 12.0 - 16.5 g/dL | TLC: 4,000 - 11,000 /cu mm",
    unit: "g/dL",
    unitPrice: 350,
    tatHours: 4,
    nablAccredited: true,
  },
  {
    id: "cat-2",
    testCode: "LAB-LFT-02",
    testName: "Liver Function Test (LFT Profile)",
    category: "BIOCHEMISTRY",
    containerType: "SERUM_RED",
    normalRange: "Bilirubin: 0.3 - 1.2 mg/dL | SGPT: 7 - 56 U/L",
    unit: "mg/dL",
    unitPrice: 650,
    tatHours: 6,
    nablAccredited: true,
  },
  {
    id: "cat-3",
    testCode: "LAB-HISTO-03",
    testName: "Biopsy Histopathology Analysis",
    category: "HISTOPATHOLOGY",
    containerType: "SERUM_RED",
    normalRange: "Normal Cellular Architecture",
    unit: "N/A",
    unitPrice: 2400,
    tatHours: 48,
    nablAccredited: true,
  },
];

const DEFAULT_OUTSOURCED: ReferralLabOrder[] = [
  {
    id: "out-1",
    referralOrderNo: "REF-2026-101",
    patientUhid: "P-2026-1049",
    patientName: "Sunil Verma",
    testName: "HLA-B27 Genetic Biomarker",
    referralLabName: "Lal PathLabs",
    dispatchDate: "2026-09-17 11:30 AM",
    courierTrackingNo: "AWB-8839201",
    coldChainTemp: "2 - 8 °C",
    status: "DISPATCHED",
  },
];

export const useLabStore = create<LabStoreState>()(
  persist(
    (set) => ({
      specimens: DEFAULT_SPECIMENS,
      testCatalog: DEFAULT_CATALOG,
      outsourcedOrders: DEFAULT_OUTSOURCED,
      pathologistSignoffs: [],

      updateSpecimenStatus: (id, status) =>
        set((state) => ({
          specimens: state.specimens.map((s) => (s.id === id ? { ...s, status } : s)),
        })),

      addSpecimen: (specimen) =>
        set((state) => ({
          specimens: [
            {
              ...specimen,
              id: `spec-${Date.now()}`,
              sampleBarcode: `BC-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
            },
            ...state.specimens,
          ],
        })),

      addTestCatalogItem: (item) =>
        set((state) => ({
          testCatalog: [{ ...item, id: `cat-${Date.now()}` }, ...state.testCatalog],
        })),

      dispatchOutsourcedOrder: (orderInput) => {
        const newOrder: ReferralLabOrder = {
          ...orderInput,
          id: `out-${Date.now()}`,
          referralOrderNo: `REF-2026-${Math.floor(100 + Math.random() * 900)}`,
          status: "DISPATCHED",
        };
        set((state) => ({ outsourcedOrders: [newOrder, ...state.outsourcedOrders] }));
        return newOrder;
      },

      signoffReport: (signoffInput) => {
        const newLog: PathologistSignoffLog = {
          ...signoffInput,
          id: `so-${Date.now()}`,
          signoffTimestamp: new Date().toLocaleString(),
          status: "VERIFIED_SIGNED",
        };
        set((state) => ({ pathologistSignoffs: [newLog, ...state.pathologistSignoffs] }));
      },

      resetToDefaults: () =>
        set({
          specimens: DEFAULT_SPECIMENS,
          testCatalog: DEFAULT_CATALOG,
          outsourcedOrders: DEFAULT_OUTSOURCED,
          pathologistSignoffs: [],
        }),
    }),
    {
      name: "hms_lab_master_store_v1",
    }
  )
);
