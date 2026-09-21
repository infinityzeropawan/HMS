"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HospitalBed, HospitalWard, BedStatus, BedCategory } from "../_admin_types/bed_types";

export type { HospitalBed, HospitalWard, BedStatus, BedCategory };

interface BedStoreState {
  beds: HospitalBed[];
  wards: HospitalWard[];
  addBed: (bed: Omit<HospitalBed, "id">) => void;
  updateBed: (id: string, updates: Partial<HospitalBed>) => void;
  setBedStatus: (id: string, status: BedStatus, notes?: string) => void;
  deleteBed: (id: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_WARDS: HospitalWard[] = [
  {
    id: "ward-101",
    name: "Intensive Care Unit (ICU)",
    code: "ICU-WING",
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    floor: "1st Floor, Block C",
    totalBeds: 10,
  },
  {
    id: "ward-102",
    name: "General Ward A (Medical-Surgical)",
    code: "GW-A",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    floor: "2nd Floor, Block A",
    totalBeds: 20,
  },
  {
    id: "ward-103",
    name: "Female Surgical Ward 3B",
    code: "SW-3B",
    departmentId: "dept-105",
    departmentCode: "ORTHO-03",
    floor: "3rd Floor, Block A",
    totalBeds: 15,
  },
  {
    id: "ward-104",
    name: "Private Deluxe Wing 4th Floor",
    code: "PVT-4F",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    floor: "4th Floor, Block B",
    totalBeds: 8,
  },
  {
    id: "ward-105",
    name: "Emergency & Trauma Triage Bay",
    code: "EMG-BAY",
    departmentId: "dept-104",
    departmentCode: "EMG-24X7",
    floor: "Ground Floor, Gate 2",
    totalBeds: 12,
  },
];

const DEFAULT_BEDS: HospitalBed[] = [
  {
    id: "bed-101",
    bedNumber: "ICU-BED-01",
    roomId: "rm-icu-01",
    roomNumber: "ICU Cubicle 1",
    wardId: "ward-101",
    wardName: "Intensive Care Unit (ICU)",
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    departmentName: "Intensive Care & Coronary Care Unit",
    floor: "1st Floor",
    category: "ICU",
    status: "OCCUPIED",
    dailyRate: 8500,
    billingCode: "SRV-BED-ICU",
    currentPatientId: "usr-101",
    currentUhid: "P-2026-9912",
    currentIpdNo: "IPD-2026-0881",
    currentPatientName: "Sunil Verma",
    admissionDate: "2026-09-14",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-102",
    bedNumber: "ICU-BED-02",
    roomId: "rm-icu-02",
    roomNumber: "ICU Cubicle 2",
    wardId: "ward-101",
    wardName: "Intensive Care Unit (ICU)",
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    departmentName: "Intensive Care & Coronary Care Unit",
    floor: "1st Floor",
    category: "ICU",
    status: "VACANT",
    dailyRate: 8500,
    billingCode: "SRV-BED-ICU",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-103",
    bedNumber: "GW-BED-101",
    roomId: "rm-gw-101",
    roomNumber: "General Room 101",
    wardId: "ward-102",
    wardName: "General Ward A (Medical-Surgical)",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    floor: "2nd Floor",
    category: "GENERAL",
    status: "OCCUPIED",
    dailyRate: 1500,
    billingCode: "SRV-BED-GEN",
    currentPatientId: "usr-104",
    currentUhid: "P-2026-1052",
    currentIpdNo: "IPD-2026-8804",
    currentPatientName: "Anjali Gupta",
    admissionDate: "2026-09-15",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-104",
    bedNumber: "GW-BED-102",
    roomId: "rm-gw-101",
    roomNumber: "General Room 101",
    wardId: "ward-102",
    wardName: "General Ward A (Medical-Surgical)",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    floor: "2nd Floor",
    category: "GENERAL",
    status: "OCCUPIED",
    dailyRate: 1500,
    billingCode: "SRV-BED-GEN",
    currentPatientId: "usr-105",
    currentUhid: "P-2026-1058",
    currentIpdNo: "IPD-2026-8809",
    currentPatientName: "Ramesh Kumar",
    admissionDate: "2026-09-16",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-105",
    bedNumber: "WARD-3B-04",
    roomId: "rm-sw-304",
    roomNumber: "Surgical Room 304",
    wardId: "ward-103",
    wardName: "Female Surgical Ward 3B",
    departmentId: "dept-105",
    departmentCode: "ORTHO-03",
    departmentName: "Orthopedics & Joint Replacement",
    floor: "3rd Floor",
    category: "SEMI_PRIVATE",
    status: "OCCUPIED",
    dailyRate: 2800,
    billingCode: "SRV-BED-SEMI",
    currentPatientId: "usr-102",
    currentUhid: "P-2026-9944",
    currentIpdNo: "IPD-2026-0895",
    currentPatientName: "Anita Roy",
    admissionDate: "2026-09-15",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-106",
    bedNumber: "WARD-3B-05",
    roomId: "rm-sw-305",
    roomNumber: "Surgical Room 305",
    wardId: "ward-103",
    wardName: "Female Surgical Ward 3B",
    departmentId: "dept-105",
    departmentCode: "ORTHO-03",
    departmentName: "Orthopedics & Joint Replacement",
    floor: "3rd Floor",
    category: "SEMI_PRIVATE",
    status: "CLEANING",
    dailyRate: 2800,
    billingCode: "SRV-BED-SEMI",
    notes: "Housekeeping sanitation in progress after patient discharge",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-107",
    bedNumber: "DELUXE-402",
    roomId: "rm-pvt-402",
    roomNumber: "Private Suite 402",
    wardId: "ward-104",
    wardName: "Private Deluxe Wing 4th Floor",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    floor: "4th Floor",
    category: "DELUXE",
    status: "OCCUPIED",
    dailyRate: 6500,
    billingCode: "SRV-BED-DLX",
    currentPatientId: "usr-103",
    currentUhid: "P-2026-9978",
    currentIpdNo: "IPD-2026-0902",
    currentPatientName: "Rajesh Kulkarni",
    admissionDate: "2026-09-16",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-108",
    bedNumber: "DELUXE-403",
    roomId: "rm-pvt-403",
    roomNumber: "Private Suite 403",
    wardId: "ward-104",
    wardName: "Private Deluxe Wing 4th Floor",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    floor: "4th Floor",
    category: "DELUXE",
    status: "VACANT",
    dailyRate: 6500,
    billingCode: "SRV-BED-DLX",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-109",
    bedNumber: "EMG-BAY-01",
    roomId: "rm-emg-01",
    roomNumber: "Triage Crash Bay 1",
    wardId: "ward-105",
    wardName: "Emergency & Trauma Triage Bay",
    departmentId: "dept-104",
    departmentCode: "EMG-24X7",
    departmentName: "Emergency & Trauma Medicine",
    floor: "Ground Floor",
    category: "EMERGENCY",
    status: "OCCUPIED",
    dailyRate: 3500,
    billingCode: "SRV-BED-EMG",
    currentPatientId: "usr-106",
    currentUhid: "P-2026-1065",
    currentIpdNo: "IPD-2026-8812",
    currentPatientName: "Meena Kumari",
    admissionDate: "2026-09-18",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-110",
    bedNumber: "EMG-BAY-02",
    roomId: "rm-emg-01",
    roomNumber: "Triage Crash Bay 2",
    wardId: "ward-105",
    wardName: "Emergency & Trauma Triage Bay",
    departmentId: "dept-104",
    departmentCode: "EMG-24X7",
    departmentName: "Emergency & Trauma Medicine",
    floor: "Ground Floor",
    category: "EMERGENCY",
    status: "VACANT",
    dailyRate: 3500,
    billingCode: "SRV-BED-EMG",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-111",
    bedNumber: "ISO-ROOM-01",
    roomId: "rm-iso-101",
    roomNumber: "Negative Pressure Isolation Room 1",
    wardId: "ward-101",
    wardName: "Intensive Care Unit (ICU)",
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    departmentName: "Intensive Care & Coronary Care Unit",
    floor: "1st Floor",
    category: "ISOLATION",
    status: "MAINTENANCE",
    dailyRate: 9000,
    billingCode: "SRV-BED-ISO",
    notes: "HEPA Filter Replacement & UV sterilization scheduled",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "bed-112",
    bedNumber: "PVT-SUITE-301",
    roomId: "rm-pvt-301",
    roomNumber: "Suite 301",
    wardId: "ward-104",
    wardName: "Private Deluxe Wing 4th Floor",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    floor: "3rd Floor",
    category: "PRIVATE",
    status: "VACANT",
    dailyRate: 5000,
    billingCode: "SRV-BED-PVT",
    updatedAt: new Date().toISOString(),
  },
];

export const useBedStore = create<BedStoreState>()(
  persist(
    (set) => ({
      beds: DEFAULT_BEDS,
      wards: DEFAULT_WARDS,

      addBed: (bed) =>
        set((state) => ({
          beds: [
            ...state.beds,
            {
              ...bed,
              id: (bed as { id?: string }).id || `bed-${Date.now()}`,
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateBed: (id, updates) =>
        set((state) => ({
          beds: state.beds.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        })),

      setBedStatus: (id, status, notes) =>
        set((state) => ({
          beds: state.beds.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status,
                  notes: notes !== undefined ? notes : b.notes,
                  ...(status === "VACANT" || status === "CLEANING"
                    ? {
                        currentPatientId: undefined,
                        currentUhid: undefined,
                        currentIpdNo: undefined,
                        currentPatientName: undefined,
                        admissionDate: undefined,
                      }
                    : {}),
                  updatedAt: new Date().toISOString(),
                }
              : b
          ),
        })),

      deleteBed: (id) =>
        set((state) => ({
          beds: state.beds.filter((b) => b.id !== id),
        })),

      resetToDefaults: () => set({ beds: DEFAULT_BEDS, wards: DEFAULT_WARDS }),
    }),
    {
      name: "hms_bed_master_store",
    }
  )
);
