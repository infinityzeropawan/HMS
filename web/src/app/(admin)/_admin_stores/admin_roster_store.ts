"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShiftType = "MORNING" | "EVENING" | "NIGHT" | "ON_CALL";
export type StaffRoleCategory = "DOCTOR" | "NURSE" | "LAB_TECH" | "PHARMACIST" | "RECEPTIONIST";

export interface StaffShiftRoster {
  id: string;
  staffName: string;
  role: StaffRoleCategory;
  department: string;
  shift: ShiftType;
  shiftHours: string;
  assignedWardOrRoom: string;
  dutyDate: string;
  status: "ON_DUTY" | "OFF_DUTY" | "ON_LEAVE" | "EMERGENCY_CALL";
  contactNumber: string;
}

interface AdminRosterStoreState {
  rosters: StaffShiftRoster[];
  addShift: (shift: Omit<StaffShiftRoster, "id">) => void;
  updateShiftStatus: (id: string, status: StaffShiftRoster["status"]) => void;
  deleteShift: (id: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_ROSTERS: StaffShiftRoster[] = [
  {
    id: "rost-1",
    staffName: "Dr. Rajesh Sharma",
    role: "DOCTOR",
    department: "Cardiology & Cardiac Sciences",
    shift: "MORNING",
    shiftHours: "08:00 AM - 02:00 PM",
    assignedWardOrRoom: "OPD Clinic Room 104",
    dutyDate: new Date().toISOString().split("T")[0],
    status: "ON_DUTY",
    contactNumber: "+91 98200 11223",
  },
  {
    id: "rost-2",
    staffName: "Dr. Priya Nair",
    role: "DOCTOR",
    department: "Intensive Care & Coronary Care Unit",
    shift: "NIGHT",
    shiftHours: "08:00 PM - 08:00 AM",
    assignedWardOrRoom: "ICU Bed Station A",
    dutyDate: new Date().toISOString().split("T")[0],
    status: "ON_DUTY",
    contactNumber: "+91 98200 44556",
  },
  {
    id: "rost-3",
    staffName: "Nurse Sunita Deshmukh",
    role: "NURSE",
    department: "Intensive Care & Coronary Care Unit",
    shift: "MORNING",
    shiftHours: "07:00 AM - 03:00 PM",
    assignedWardOrRoom: "ICU Beds 01 - 04",
    dutyDate: new Date().toISOString().split("T")[0],
    status: "ON_DUTY",
    contactNumber: "+91 98199 77889",
  },
  {
    id: "rost-4",
    staffName: "Nurse Kavita Roy",
    role: "NURSE",
    department: "Orthopedics & Joint Replacement",
    shift: "EVENING",
    shiftHours: "03:00 PM - 11:00 PM",
    assignedWardOrRoom: "Female Ward 3B",
    dutyDate: new Date().toISOString().split("T")[0],
    status: "OFF_DUTY",
    contactNumber: "+91 98199 33221",
  },
  {
    id: "rost-5",
    staffName: "Dr. Sameer Khan",
    role: "DOCTOR",
    department: "Emergency & Trauma Medicine",
    shift: "ON_CALL",
    shiftHours: "24-Hour Emergency Standby",
    assignedWardOrRoom: "Emergency Crash Bay 1",
    dutyDate: new Date().toISOString().split("T")[0],
    status: "EMERGENCY_CALL",
    contactNumber: "+91 98200 99001",
  },
  {
    id: "rost-6",
    staffName: "Rohan Varma",
    role: "PHARMACIST",
    department: "Pharmacy & Medicine Dispensing",
    shift: "MORNING",
    shiftHours: "08:00 AM - 04:00 PM",
    assignedWardOrRoom: "Main IPD Pharmacy Counter",
    dutyDate: new Date().toISOString().split("T")[0],
    status: "ON_DUTY",
    contactNumber: "+91 98700 55443",
  },
];

export const useAdminRosterStore = create<AdminRosterStoreState>()(
  persist(
    (set) => ({
      rosters: DEFAULT_ROSTERS,

      addShift: (shift) =>
        set((state) => ({
          rosters: [...state.rosters, { ...shift, id: `rost-${Date.now()}` }],
        })),

      updateShiftStatus: (id, status) =>
        set((state) => ({
          rosters: state.rosters.map((r) => (r.id === id ? { ...r, status } : r)),
        })),

      deleteShift: (id) =>
        set((state) => ({
          rosters: state.rosters.filter((r) => r.id !== id),
        })),

      resetToDefaults: () => set({ rosters: DEFAULT_ROSTERS }),
    }),
    {
      name: "hms_admin_roster_store",
    }
  )
);
