"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HospitalDepartment, DepartmentType, DepartmentStatus } from "../_admin_types/department_types";

export type { DepartmentType, DepartmentStatus, HospitalDepartment };

interface AdminDepartmentStoreState {
  departments: HospitalDepartment[];
  addDepartment: (dept: HospitalDepartment) => void;
  updateDepartment: (id: string, updates: Partial<HospitalDepartment>) => void;
  toggleDepartmentStatus: (id: string) => void;
  deleteDepartment: (id: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_DEPARTMENTS: HospitalDepartment[] = [
  {
    id: "dept-101",
    code: "CARD-01",
    name: "Cardiology & Cardiac Sciences",
    type: "OPD",
    status: "ACTIVE",
    headOfDepartment: "Dr. Rajesh Sharma (MD, DM Cardiology)",
    hodUserId: "DOC-101",
    hodDisplayName: "Dr. Rajesh Sharma",
    location: "Block A, 2nd Floor",
    allocatedBeds: 24,
    activeStaffCount: 18,
    phoneExtension: "4012",
    description: "Outpatient cardiac consultations, ECG, ECHO, and TMT diagnostics.",
    bedCapacity: {
      approvedBeds: 24,
      operationalBeds: 24,
      reservedBeds: 4,
      occupiedBeds: 18,
    },
    staffCapacity: {
      approvedStaffCount: 22,
      activeStaffCount: 18,
      vacantStaffCount: 4,
    },
    createdDate: "2024-01-15",
    updatedDate: "2026-09-15",
  },
  {
    id: "dept-102",
    code: "NEURO-02",
    name: "Neurology & Neurosurgery",
    type: "OPD",
    status: "ACTIVE",
    headOfDepartment: "Dr. Ananya Roy (MCh Neurosurgery)",
    hodUserId: "DOC-102",
    hodDisplayName: "Dr. Ananya Roy",
    location: "Block B, 3rd Floor",
    allocatedBeds: 18,
    activeStaffCount: 14,
    phoneExtension: "4015",
    description: "Brain and spine surgical evaluations, EEG, and stroke care clinic.",
    bedCapacity: {
      approvedBeds: 18,
      operationalBeds: 18,
      reservedBeds: 2,
      occupiedBeds: 12,
    },
    staffCapacity: {
      approvedStaffCount: 16,
      activeStaffCount: 14,
      vacantStaffCount: 2,
    },
    createdDate: "2024-02-01",
    updatedDate: "2026-09-12",
  },
  {
    id: "dept-103",
    code: "ICU-CCU",
    name: "Intensive Care & Coronary Care Unit",
    type: "ICU",
    status: "ACTIVE",
    headOfDepartment: "Dr. Vikram Sethi (Critical Care Lead)",
    hodUserId: "DOC-103",
    hodDisplayName: "Dr. Vikram Sethi",
    parentDepartmentId: "dept-101",
    parentDepartmentName: "Cardiology & Cardiac Sciences",
    location: "Block C, 1st Floor",
    allocatedBeds: 30,
    activeStaffCount: 32,
    phoneExtension: "5001",
    description: "Level 3 tertiary ICU with ventilator support and hemodialysis beds.",
    bedCapacity: {
      approvedBeds: 30,
      operationalBeds: 30,
      reservedBeds: 5,
      occupiedBeds: 26,
    },
    staffCapacity: {
      approvedStaffCount: 35,
      activeStaffCount: 32,
      vacantStaffCount: 3,
    },
    createdDate: "2023-11-10",
    updatedDate: "2026-09-18",
  },
  {
    id: "dept-104",
    code: "EMG-24X7",
    name: "Emergency & Trauma Medicine",
    type: "EMERGENCY",
    status: "ACTIVE",
    headOfDepartment: "Dr. Sameer Khan (EM Physician)",
    hodUserId: "DOC-104",
    hodDisplayName: "Dr. Sameer Khan",
    location: "Ground Floor, Gate 2",
    allocatedBeds: 15,
    activeStaffCount: 28,
    phoneExtension: "1008",
    description: "24x7 Emergency Triage, Crash Cart Bay, and Medico-Legal case handling.",
    bedCapacity: {
      approvedBeds: 15,
      operationalBeds: 15,
      reservedBeds: 3,
      occupiedBeds: 11,
    },
    staffCapacity: {
      approvedStaffCount: 30,
      activeStaffCount: 28,
      vacantStaffCount: 2,
    },
    createdDate: "2023-09-01",
    updatedDate: "2026-09-17",
  },
  {
    id: "dept-105",
    code: "ORTHO-03",
    name: "Orthopedics & Joint Replacement",
    type: "IPD",
    status: "ACTIVE",
    headOfDepartment: "Dr. Manoj Patil (MS Ortho)",
    hodUserId: "DOC-105",
    hodDisplayName: "Dr. Manoj Patil",
    location: "Block A, 4th Floor",
    allocatedBeds: 40,
    activeStaffCount: 22,
    phoneExtension: "4020",
    description: "Joint replacement surgery, trauma fixation, and inpatient rehab ward.",
    bedCapacity: {
      approvedBeds: 40,
      operationalBeds: 40,
      reservedBeds: 4,
      occupiedBeds: 31,
    },
    staffCapacity: {
      approvedStaffCount: 25,
      activeStaffCount: 22,
      vacantStaffCount: 3,
    },
    createdDate: "2024-03-10",
    updatedDate: "2026-09-10",
  },
  {
    id: "dept-106",
    code: "PATH-LAB",
    name: "Central Pathology & Microbiology",
    type: "DIAGNOSTIC",
    status: "ACTIVE",
    headOfDepartment: "Dr. Sneha Verma (MD Pathology)",
    hodUserId: "DOC-106",
    hodDisplayName: "Dr. Sneha Verma",
    location: "Basement 1, Diagnostic Wing",
    allocatedBeds: 0,
    activeStaffCount: 25,
    phoneExtension: "3005",
    description: "Automated biochemistry, hematology, histology, and molecular testing.",
    bedCapacity: {
      approvedBeds: 0,
      operationalBeds: 0,
      reservedBeds: 0,
      occupiedBeds: 0,
    },
    staffCapacity: {
      approvedStaffCount: 28,
      activeStaffCount: 25,
      vacantStaffCount: 3,
    },
    createdDate: "2024-01-05",
    updatedDate: "2026-09-14",
  },
  {
    id: "dept-107",
    code: "RAD-PACS",
    name: "Radiology & Imaging Sciences",
    type: "DIAGNOSTIC",
    status: "ACTIVE",
    headOfDepartment: "Dr. Ramesh Gupta (MD Radiology)",
    hodUserId: "DOC-107",
    hodDisplayName: "Dr. Ramesh Gupta",
    location: "Ground Floor, Radiology Wing",
    allocatedBeds: 0,
    activeStaffCount: 20,
    phoneExtension: "3010",
    description: "3T MRI, 128-Slice CT Scan, Digital X-Ray, Color Doppler & Ultrasound.",
    bedCapacity: {
      approvedBeds: 0,
      operationalBeds: 0,
      reservedBeds: 0,
      occupiedBeds: 0,
    },
    staffCapacity: {
      approvedStaffCount: 22,
      activeStaffCount: 20,
      vacantStaffCount: 2,
    },
    createdDate: "2024-01-10",
    updatedDate: "2026-09-16",
  },
];

export const useAdminDepartmentStore = create<AdminDepartmentStoreState>()(
  persist(
    (set) => ({
      departments: DEFAULT_DEPARTMENTS,

      addDepartment: (dept) =>
        set((state) => ({
          departments: [
            ...state.departments,
            dept.id ? dept : { ...dept, id: `dept-${Date.now()}` },
          ],
        })),

      updateDepartment: (id, updates) =>
        set((state) => ({
          departments: state.departments.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),

      toggleDepartmentStatus: (id) =>
        set((state) => ({
          departments: state.departments.map((d) =>
            d.id === id
              ? { ...d, status: d.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }
              : d
          ),
        })),

      deleteDepartment: (id) =>
        set((state) => ({
          departments: state.departments.filter((d) => d.id !== id),
        })),

      resetToDefaults: () => set({ departments: DEFAULT_DEPARTMENTS }),
    }),
    {
      name: "hms_admin_departments_store",
    }
  )
);
