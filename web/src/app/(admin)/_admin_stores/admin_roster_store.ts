"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StaffShiftRoster, StandardShiftType, StaffRoleCategory } from "../_admin_types/roster_types";

export type ShiftType = StandardShiftType;
export type { StaffShiftRoster, StaffRoleCategory };

interface RosterStoreState {
  rosters: StaffShiftRoster[];
  /**
   * Clinic-day blocks keyed as `${staffId}-${dayName}` (e.g. "DOC-101-Wednesday").
   * A legacy doctor-agnostic key (`dayName`) still exists in browsers that used the old
   * implementation; it is only honoured for "DOC-101" (the doctor the legacy UI toggled for)
   * and is deleted on the next toggle.
   */
  blockedSlots: Record<string, boolean>;

  addShift: (shift: Omit<StaffShiftRoster, "id">) => void;
  updateShift: (id: string, updates: Partial<StaffShiftRoster>) => void;
  updateShiftStatus: (id: string, status: StaffShiftRoster["status"]) => void;
  deleteShift: (id: string) => void;
  toggleSlotBlock: (dayName: string, doctorId?: string) => void;
  isSlotBlocked: (dayName: string, doctorId?: string) => boolean;
  resetToDefaults: () => void;
}

const getTodayDateStr = (): string => {
  return new Date().toISOString().split("T")[0];
};

const DEFAULT_ROSTERS: StaffShiftRoster[] = [
  {
    id: "rost-101",
    userId: "USR-101",
    staffId: "STF-101",
    staffName: "Dr. Rajesh Sharma",
    role: "DOCTOR",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    department: "Cardiology & Cardiac Sciences",
    shift: "MORNING",
    shiftHours: "08:00 AM - 02:00 PM",
    assignedWardOrRoom: "OPD Clinic Room 104",
    dutyDate: getTodayDateStr(),
    status: "ON_DUTY",
    approvalStatus: "APPROVED",
    contactNumber: "+91 98200 11223",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rost-102",
    userId: "USR-102",
    staffId: "STF-102",
    staffName: "Dr. Priya Nair",
    role: "DOCTOR",
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    departmentName: "Intensive Care & Coronary Care Unit",
    department: "Intensive Care & Coronary Care Unit",
    shift: "NIGHT",
    shiftHours: "08:00 PM - 08:00 AM",
    assignedWardOrRoom: "ICU Bed Station A",
    dutyDate: getTodayDateStr(),
    status: "ON_DUTY",
    approvalStatus: "APPROVED",
    contactNumber: "+91 98200 44556",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rost-103",
    userId: "USR-103",
    staffId: "STF-103",
    staffName: "Nurse Sunita Deshmukh",
    role: "NURSE",
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    departmentName: "Intensive Care & Coronary Care Unit",
    department: "Intensive Care & Coronary Care Unit",
    shift: "MORNING",
    shiftHours: "07:00 AM - 03:00 PM",
    assignedWardOrRoom: "ICU Beds 01 - 04",
    dutyDate: getTodayDateStr(),
    status: "ON_DUTY",
    approvalStatus: "APPROVED",
    contactNumber: "+91 98199 77889",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rost-104",
    userId: "USR-104",
    staffId: "STF-104",
    staffName: "Nurse Kavita Roy",
    role: "NURSE",
    departmentId: "dept-104",
    departmentCode: "ORTHO-01",
    departmentName: "Orthopedics & Joint Replacement",
    department: "Orthopedics & Joint Replacement",
    shift: "EVENING",
    shiftHours: "03:00 PM - 11:00 PM",
    assignedWardOrRoom: "Female Ward 3B",
    dutyDate: getTodayDateStr(),
    status: "OFF_DUTY",
    approvalStatus: "APPROVED",
    contactNumber: "+91 98199 33221",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rost-105",
    userId: "USR-105",
    staffId: "STF-105",
    staffName: "Dr. Sameer Khan",
    role: "DOCTOR",
    departmentId: "dept-102",
    departmentCode: "EMERG-01",
    departmentName: "Emergency & Trauma Medicine",
    department: "Emergency & Trauma Medicine",
    shift: "ON_CALL",
    shiftHours: "24-Hour Emergency Standby",
    assignedWardOrRoom: "Emergency Crash Bay 1",
    dutyDate: getTodayDateStr(),
    status: "EMERGENCY_CALL",
    approvalStatus: "APPROVED",
    contactNumber: "+91 98200 99001",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rost-106",
    userId: "USR-106",
    staffId: "STF-106",
    staffName: "Rohan Varma",
    role: "PHARMACIST",
    departmentId: "dept-105",
    departmentCode: "PHARM-01",
    departmentName: "Pharmacy & Medicine Dispensing",
    department: "Pharmacy & Medicine Dispensing",
    shift: "MORNING",
    shiftHours: "08:00 AM - 04:00 PM",
    assignedWardOrRoom: "Main IPD Pharmacy Counter",
    dutyDate: getTodayDateStr(),
    status: "ON_DUTY",
    approvalStatus: "APPROVED",
    contactNumber: "+91 98700 55443",
    createdAt: new Date().toISOString(),
  },
];

export const useRosterStore = create<RosterStoreState>()(
  persist(
    (set, get) => ({
      rosters: DEFAULT_ROSTERS,
      blockedSlots: {},

      addShift: (shift) =>
        set((state) => ({
          rosters: [
            ...state.rosters,
            { ...shift, department: shift.departmentName, id: `rost-${Date.now()}` },
          ],
        })),

      updateShift: (id, updates) =>
        set((state) => ({
          rosters: state.rosters.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),

      updateShiftStatus: (id, status) =>
        set((state) => ({
          rosters: state.rosters.map((r) =>
            r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
          ),
        })),

      deleteShift: (id) =>
        set((state) => ({
          rosters: state.rosters.filter((r) => r.id !== id),
        })),

      toggleSlotBlock: (dayName, doctorId = "DOC-101") =>
        set((state) => {
          const keySpecific = `${doctorId}-${dayName}`;
          const blockedSlots = { ...(state.blockedSlots || {}) };
          const currentVal = !!blockedSlots[keySpecific];

          blockedSlots[keySpecific] = !currentVal;
          // The legacy implementation also wrote a doctor-agnostic key which blocked every
          // doctor for that weekday. Drop it whenever a block is toggled.
          delete blockedSlots[dayName];

          return { blockedSlots };
        }),

      isSlotBlocked: (dayName, doctorId = "DOC-101") => {
        const state = get();
        const keySpecific = `${doctorId}-${dayName}`;
        const legacyGenericKey = doctorId === "DOC-101" && !!state.blockedSlots?.[dayName];
        return !!(state.blockedSlots?.[keySpecific] || legacyGenericKey);
      },


      resetToDefaults: () => set({ rosters: DEFAULT_ROSTERS, blockedSlots: {} }),
    }),
    {
      name: "hms_roster_master_store",
    }
  )
);

// Backward compatibility alias
export const useAdminRosterStore = useRosterStore;
