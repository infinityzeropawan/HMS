"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  role: string;
  clockInTime: string;
  clockOutTime?: string;
  totalDutyHours: number;
  status: "PRESENT" | "LATE" | "ON_LEAVE" | "ABSENT";
  biometricId: string;
}

interface HrStoreState {
  attendanceLogs: StaffAttendanceRecord[];
  addClockIn: (record: Omit<StaffAttendanceRecord, "id" | "totalDutyHours">) => void;
  resetToDefaults: () => void;
}

const DEFAULT_ATTENDANCE: StaffAttendanceRecord[] = [
  {
    id: "att-1",
    staffId: "STF-101",
    staffName: "Dr. Rajesh Sharma",
    department: "Cardiology",
    role: "Doctor / Senior Consultant",
    clockInTime: "07:55 AM",
    clockOutTime: "02:15 PM",
    totalDutyHours: 6.3,
    status: "PRESENT",
    biometricId: "BIO-8801",
  },
  {
    id: "att-2",
    staffId: "STF-204",
    staffName: "Nurse Sunita Deshmukh",
    department: "Intensive Care Unit (ICU)",
    role: "Nurse / Sister In-Charge",
    clockInTime: "06:50 AM",
    clockOutTime: "03:00 PM",
    totalDutyHours: 8.1,
    status: "PRESENT",
    biometricId: "BIO-8822",
  },
  {
    id: "att-3",
    staffId: "STF-308",
    staffName: "Rohan Varma",
    department: "Central Pharmacy",
    role: "Pharmacist",
    clockInTime: "08:25 AM",
    clockOutTime: undefined,
    totalDutyHours: 4.5,
    status: "LATE",
    biometricId: "BIO-8845",
  },
];

export const useHrStore = create<HrStoreState>()(
  persist(
    (set) => ({
      attendanceLogs: DEFAULT_ATTENDANCE,

      addClockIn: (record) =>
        set((state) => ({
          attendanceLogs: [
            {
              ...record,
              id: `att-${Date.now()}`,
              totalDutyHours: 8.0,
            },
            ...state.attendanceLogs,
          ],
        })),

      resetToDefaults: () => set({ attendanceLogs: DEFAULT_ATTENDANCE }),
    }),
    {
      name: "hms_hr_attendance_store",
    }
  )
);
