"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DepartmentType = "OPD" | "IPD" | "ICU" | "EMERGENCY" | "DIAGNOSTIC" | "SUPPORT";

export interface HospitalDepartment {
  id: string;
  code: string;
  name: string;
  type: DepartmentType;
  headOfDepartment: string;
  location: string;
  allocatedBeds: number;
  activeStaffCount: number;
  phoneExtension: string;
  status: "ACTIVE" | "INACTIVE";
  description: string;
}

interface AdminDepartmentStoreState {
  departments: HospitalDepartment[];
  addDepartment: (dept: Omit<HospitalDepartment, "id">) => void;
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
    headOfDepartment: "Dr. Rajesh Sharma (MD, DM Cardiology)",
    location: "Block A, 2nd Floor",
    allocatedBeds: 24,
    activeStaffCount: 18,
    phoneExtension: "4012",
    status: "ACTIVE",
    description: "Outpatient cardiac consultations, ECG, ECHO, and TMT diagnostics.",
  },
  {
    id: "dept-102",
    code: "NEURO-02",
    name: "Neurology & Neurosurgery",
    type: "OPD",
    headOfDepartment: "Dr. Ananya Roy (MCh Neurosurgery)",
    location: "Block B, 3rd Floor",
    allocatedBeds: 18,
    activeStaffCount: 14,
    phoneExtension: "4015",
    status: "ACTIVE",
    description: "Brain and spine surgical evaluations, EEG, and stroke care clinic.",
  },
  {
    id: "dept-103",
    code: "ICU-CCU",
    name: "Intensive Care & Coronary Care Unit",
    type: "ICU",
    headOfDepartment: "Dr. Vikram Sethi (Critical Care Lead)",
    location: "Block C, 1st Floor",
    allocatedBeds: 30,
    activeStaffCount: 32,
    phoneExtension: "5001",
    status: "ACTIVE",
    description: "Level 3 tertiary ICU with ventilator support and hemodialysis beds.",
  },
  {
    id: "dept-104",
    code: "EMG-24X7",
    name: "Emergency & Trauma Medicine",
    type: "EMERGENCY",
    headOfDepartment: "Dr. Sameer Khan (EM Physician)",
    location: "Ground Floor, Gate 2",
    allocatedBeds: 15,
    activeStaffCount: 28,
    phoneExtension: "1008",
    status: "ACTIVE",
    description: "24x7 Emergency Triage, Crash Cart Bay, and Medico-Legal case handling.",
  },
  {
    id: "dept-105",
    code: "ORTHO-03",
    name: "Orthopedics & Joint Replacement",
    type: "IPD",
    headOfDepartment: "Dr. Manoj Patil (MS Ortho)",
    location: "Block A, 4th Floor",
    allocatedBeds: 40,
    activeStaffCount: 22,
    phoneExtension: "4020",
    status: "ACTIVE",
    description: "Joint replacement surgery, trauma fixation, and inpatient rehab ward.",
  },
  {
    id: "dept-106",
    code: "PATH-LAB",
    name: "Central Pathology & Microbiology",
    type: "DIAGNOSTIC",
    headOfDepartment: "Dr. Sneha Verma (MD Pathology)",
    location: "Basement 1, Diagnostic Wing",
    allocatedBeds: 0,
    activeStaffCount: 25,
    phoneExtension: "3005",
    status: "ACTIVE",
    description: "Automated biochemistry, hematology, histology, and molecular testing.",
  },
  {
    id: "dept-107",
    code: "RAD-PACS",
    name: "Radiology & Imaging Sciences",
    type: "DIAGNOSTIC",
    headOfDepartment: "Dr. Ramesh Gupta (MD Radiology)",
    location: "Ground Floor, Radiology Wing",
    allocatedBeds: 0,
    activeStaffCount: 20,
    phoneExtension: "3010",
    status: "ACTIVE",
    description: "3T MRI, 128-Slice CT Scan, Digital X-Ray, Color Doppler & Ultrasound.",
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
            { ...dept, id: `dept-${Date.now()}` },
          ],
        })),

      updateDepartment: (id, updates) =>
        set((state) => ({
          departments: state.departments.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),

      toggleDepartmentStatus: (id) =>
        set((state) => ({
          departments: state.departments.map((d) =>
            d.id === id ? { ...d, status: d.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : d
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
