"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  HospitalTariff,
  TariffCategory,
  TariffStatus,
  PriceHistoryEntry,
} from "../_admin_types/tariff_types";

export type { HospitalTariff, TariffCategory, TariffStatus, PriceHistoryEntry };

interface TariffStoreState {
  tariffs: HospitalTariff[];
  addTariff: (tariff: Omit<HospitalTariff, "id" | "history">) => void;
  updateTariff: (id: string, updates: Partial<HospitalTariff>) => void;
  updateTariffPrice: (
    id: string,
    newPrice: number,
    newGstRate: number,
    modifiedBy: string,
    modifiedRole: string,
    reason?: string
  ) => void;
  toggleTariffStatus: (id: string) => void;
  deleteTariff: (id: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_TARIFFS: HospitalTariff[] = [
  {
    id: "trf-101",
    serviceCode: "SRV-CONS-OPD",
    billingCode: "BILL-CONS-01",
    serviceName: "OPD Senior Consultant Fee",
    category: "CONSULTATION",
    hsnSacCode: "999312",
    baseRate: 800,
    gstRate: 0,
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: "hist-101",
        oldPrice: 750,
        newPrice: 800,
        oldGstRate: 0,
        newGstRate: 0,
        modifiedBy: "Dr. Rajesh Sharma (Admin)",
        modifiedRole: "HOSPITAL_ADMIN",
        modifiedDate: "2026-01-01T10:00:00Z",
        reason: "Annual tariff revision per hospital board directive",
      },
    ],
  },
  {
    id: "trf-102",
    serviceCode: "SRV-DIAG-ECG",
    billingCode: "BILL-DIAG-02",
    serviceName: "12-Lead Digital ECG Test",
    category: "RADIOLOGY",
    hsnSacCode: "999313",
    baseRate: 450,
    gstRate: 12,
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-103",
    serviceCode: "SRV-BED-ICU",
    billingCode: "BILL-BED-ICU",
    serviceName: "ICU Bed Daily Tariff",
    category: "BED_CHARGES",
    hsnSacCode: "999311",
    baseRate: 8500,
    gstRate: 0,
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    departmentName: "Intensive Care & Coronary Care Unit",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-104",
    serviceCode: "SRV-BED-GEN",
    billingCode: "BILL-BED-GEN",
    serviceName: "General Ward Bed Daily Tariff",
    category: "BED_CHARGES",
    hsnSacCode: "999311",
    baseRate: 1500,
    gstRate: 0,
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-105",
    serviceCode: "SRV-BED-SEMI",
    billingCode: "BILL-BED-SEMI",
    serviceName: "Semi-Private Room Daily Tariff",
    category: "BED_CHARGES",
    hsnSacCode: "999311",
    baseRate: 2800,
    gstRate: 0,
    departmentId: "dept-105",
    departmentCode: "ORTHO-03",
    departmentName: "Orthopedics & Joint Replacement",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-106",
    serviceCode: "SRV-BED-DLX",
    billingCode: "BILL-BED-DLX",
    serviceName: "Private Deluxe Suite Daily Tariff",
    category: "BED_CHARGES",
    hsnSacCode: "999311",
    baseRate: 6500,
    gstRate: 0,
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-107",
    serviceCode: "SRV-LAB-CBC",
    billingCode: "BILL-LAB-01",
    serviceName: "Complete Blood Count (CBC)",
    category: "LABORATORY",
    hsnSacCode: "999313",
    baseRate: 350,
    gstRate: 18,
    departmentId: "dept-106",
    departmentCode: "PATH-LAB",
    departmentName: "Central Pathology & Microbiology",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-108",
    serviceCode: "SRV-LAB-LIPID",
    billingCode: "BILL-LAB-02",
    serviceName: "Lipid Profile Test Panel",
    category: "LABORATORY",
    hsnSacCode: "999313",
    baseRate: 650,
    gstRate: 18,
    departmentId: "dept-106",
    departmentCode: "PATH-LAB",
    departmentName: "Central Pathology & Microbiology",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-109",
    serviceCode: "SRV-RAD-MRI",
    billingCode: "BILL-RAD-01",
    serviceName: "Brain MRI Scan (3T)",
    category: "RADIOLOGY",
    hsnSacCode: "999313",
    baseRate: 6500,
    gstRate: 12,
    departmentId: "dept-107",
    departmentCode: "RAD-PACS",
    departmentName: "Radiology & Imaging Sciences",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-110",
    serviceCode: "SRV-NURS-DAILY",
    billingCode: "BILL-NURS-01",
    serviceName: "24x7 Inpatient Nursing Care Charges",
    category: "NURSING_CHARGES",
    hsnSacCode: "999312",
    baseRate: 500,
    gstRate: 0,
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-111",
    serviceCode: "SRV-EMG-TRIAGE",
    billingCode: "BILL-EMG-01",
    serviceName: "Emergency Triage & Crash Bay Facility Fee",
    category: "EMERGENCY",
    hsnSacCode: "999312",
    baseRate: 1200,
    gstRate: 0,
    departmentId: "dept-104",
    departmentCode: "EMG-24X7",
    departmentName: "Emergency & Trauma Medicine",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-112",
    serviceCode: "SRV-OT-MAJOR",
    billingCode: "BILL-OT-01",
    serviceName: "Major Surgery OT Theatre Hourly Charges",
    category: "OPERATION_THEATRE",
    hsnSacCode: "999311",
    baseRate: 4500,
    gstRate: 18,
    departmentId: "dept-105",
    departmentCode: "ORTHO-03",
    departmentName: "Orthopedics & Joint Replacement",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-113",
    serviceCode: "PKG-CARDIAC-EVAL",
    billingCode: "BILL-PKG-01",
    serviceName: "Comprehensive Executive Cardiac Health Package",
    category: "PACKAGE",
    hsnSacCode: "999312",
    baseRate: 3200,
    gstRate: 0,
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    packageItems: [
      { serviceCode: "SRV-CONS-OPD", serviceName: "OPD Senior Consultant Fee", baseRate: 800, quantity: 1 },
      { serviceCode: "SRV-DIAG-ECG", serviceName: "12-Lead Digital ECG Test", baseRate: 450, quantity: 1 },
      { serviceCode: "SRV-LAB-CBC", serviceName: "Complete Blood Count (CBC)", baseRate: 350, quantity: 1 },
      { serviceCode: "SRV-LAB-LIPID", serviceName: "Lipid Profile Test Panel", baseRate: 650, quantity: 1 },
    ],
    history: [],
  },
  {
    id: "trf-114",
    serviceCode: "PKG-TPA-TKA",
    billingCode: "BILL-TPA-01",
    serviceName: "TPA Approved Package: Total Knee Arthroplasty (TKA)",
    category: "INSURANCE_PACKAGE",
    hsnSacCode: "999311",
    baseRate: 145000,
    gstRate: 0,
    departmentId: "dept-105",
    departmentCode: "ORTHO-03",
    departmentName: "Orthopedics & Joint Replacement",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
  {
    id: "trf-115",
    serviceCode: "SRV-PHARM-DISP",
    billingCode: "BILL-PHARM-01",
    serviceName: "Pharmacy Dispensing & Medication Supplies",
    category: "PHARMACY",
    hsnSacCode: "999313",
    baseRate: 250,
    gstRate: 12,
    departmentId: "dept-106",
    departmentCode: "PATH-LAB",
    departmentName: "Central Pathology & Microbiology",
    status: "ACTIVE",
    effectiveDate: "2026-01-01",
    updatedAt: new Date().toISOString(),
    history: [],
  },
];

export const useTariffStore = create<TariffStoreState>()(
  persist(
    (set) => ({
      tariffs: DEFAULT_TARIFFS,

      addTariff: (tariff) =>
        set((state) => ({
          tariffs: [
            ...state.tariffs,
            {
              ...tariff,
              id: `trf-${Date.now()}`,
              history: [],
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTariff: (id, updates) =>
        set((state) => ({
          tariffs: state.tariffs.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      updateTariffPrice: (id, newPrice, newGstRate, modifiedBy, modifiedRole, reason) =>
        set((state) => ({
          tariffs: state.tariffs.map((t) => {
            if (t.id !== id) return t;

            const historyEntry: PriceHistoryEntry = {
              id: `hist-${Date.now()}`,
              oldPrice: t.baseRate,
              newPrice,
              oldGstRate: t.gstRate,
              newGstRate,
              modifiedBy,
              modifiedRole,
              modifiedDate: new Date().toISOString(),
              reason,
            };

            return {
              ...t,
              baseRate: newPrice,
              gstRate: newGstRate,
              history: [historyEntry, ...t.history],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      toggleTariffStatus: (id) =>
        set((state) => ({
          tariffs: state.tariffs.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      deleteTariff: (id) =>
        set((state) => ({
          tariffs: state.tariffs.filter((t) => t.id !== id),
        })),

      resetToDefaults: () => set({ tariffs: DEFAULT_TARIFFS }),
    }),
    {
      name: "hms_tariff_master_store",
    }
  )
);
