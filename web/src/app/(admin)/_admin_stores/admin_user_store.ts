"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StaffUser, StaffUserStatus } from "../_admin_types/staff_user_types";

interface AdminUserStoreState {
  users: StaffUser[];
  addUser: (user: StaffUser) => void;
  updateUser: (id: string, updates: Partial<StaffUser>) => void;
  updateUserStatus: (id: string, status: StaffUserStatus) => void;
  deleteUser: (id: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_STAFF_USERS: StaffUser[] = [
  {
    id: "usr-101",
    staffId: "DOC-101",
    employeeId: "EMP-9014-101",
    fullName: "Dr. Rajesh Sharma",
    email: "rajesh.sharma@apollo.hms.com",
    phone: "+91 98200 11223",
    roleCategory: "DOCTOR",
    roleId: "TMPL-SR-DOC",
    roleTemplateId: "TMPL-SR-DOC",
    roleName: "Senior Consultant Specialist",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    departmentName: "Cardiology & Cardiac Sciences",
    status: "ACTIVE",
    joinedDate: "2024-01-15",
    lastLogin: "Today at 08:30 AM",
    licenseNumber: "MCI-2012-44912",
    effectivePermissions: [
      "opd:queue:read", "opd:encounter:read", "opd:encounter:write", "opd:prescription:create", "opd:telehealth:consult",
      "ipd:admissions:read", "ipd:rounds:write", "ipd:discharge:approve", "ot:schedule:read", "pacs:dicom:view"
    ],
  },
  {
    id: "usr-102",
    staffId: "REC-202",
    employeeId: "EMP-9014-202",
    fullName: "Sunita Deshmukh",
    email: "sunita.d@apollo.hms.com",
    phone: "+91 98200 22334",
    roleCategory: "RECEPTIONIST",
    roleId: "TMPL-RECP",
    roleTemplateId: "TMPL-RECP",
    roleName: "OPD Front Desk Officer",
    departmentId: "dept-104",
    departmentCode: "EMG-24X7",
    departmentName: "Emergency & Trauma Medicine",
    status: "ACTIVE",
    joinedDate: "2024-03-01",
    lastLogin: "Today at 07:45 AM",
    effectivePermissions: [
      "reception:checkin:write", "reception:appointment:create", "reception:queue:manage", "billing:invoice:read"
    ],
  },
  {
    id: "usr-103",
    staffId: "NUR-303",
    employeeId: "EMP-9014-303",
    fullName: "Sr. Kavita R.",
    email: "kavita.r@apollo.hms.com",
    phone: "+91 98200 33445",
    roleCategory: "NURSE",
    roleId: "TMPL-NURSE",
    roleTemplateId: "TMPL-NURSE",
    roleName: "ICU Charge Nurse",
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    departmentName: "Intensive Care & Coronary Care Unit",
    status: "ACTIVE",
    joinedDate: "2024-02-10",
    lastLogin: "Today at 06:50 AM",
    licenseNumber: "INC-NUR-2018-9921",
    effectivePermissions: [
      "nurse:vitals:write", "nurse:mar:dispense", "nurse:orders:execute", "ipd:admissions:read"
    ],
  },
  {
    id: "usr-104",
    staffId: "BIL-404",
    employeeId: "EMP-9014-404",
    fullName: "Vikram Patil",
    email: "vikram.patil@apollo.hms.com",
    phone: "+91 98200 44556",
    roleCategory: "BILLER",
    roleId: "TMPL-BILLER",
    roleTemplateId: "TMPL-BILLER",
    roleName: "Senior Billing Executive",
    departmentId: "dept-105",
    departmentCode: "ORTHO-03",
    departmentName: "Orthopedics & Joint Replacement",
    status: "ACTIVE",
    joinedDate: "2024-04-12",
    lastLogin: "Yesterday at 05:15 PM",
    effectivePermissions: [
      "billing:invoice:create", "billing:payment:collect", "billing:tpa:submit", "billing:reports:view"
    ],
  },
  {
    id: "usr-105",
    staffId: "DOC-102",
    employeeId: "EMP-9014-102",
    fullName: "Dr. Ananya Roy",
    email: "ananya.roy@apollo.hms.com",
    phone: "+91 98200 55667",
    roleCategory: "DOCTOR",
    roleId: "TMPL-SR-DOC",
    roleTemplateId: "TMPL-SR-DOC",
    roleName: "Senior Consultant Specialist",
    departmentId: "dept-102",
    departmentCode: "NEURO-02",
    departmentName: "Neurology & Neurosurgery",
    status: "ACTIVE",
    joinedDate: "2024-02-01",
    lastLogin: "Today at 09:10 AM",
    licenseNumber: "MCI-2014-88331",
    effectivePermissions: [
      "opd:queue:read", "opd:encounter:read", "opd:encounter:write", "opd:prescription:create", "pacs:dicom:view"
    ],
  },
  {
    id: "usr-106",
    staffId: "DOC-103",
    employeeId: "EMP-9014-103",
    fullName: "Dr. Vikram Sethi",
    email: "vikram.sethi@apollo.hms.com",
    phone: "+91 98200 66778",
    roleCategory: "DOCTOR",
    roleId: "TMPL-SR-DOC",
    roleTemplateId: "TMPL-SR-DOC",
    roleName: "Critical Care Lead Physician",
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    departmentName: "Intensive Care & Coronary Care Unit",
    status: "ACTIVE",
    joinedDate: "2023-11-10",
    lastLogin: "Today at 07:00 AM",
    licenseNumber: "MCI-2011-77112",
    effectivePermissions: [
      "ipd:admissions:read", "ipd:rounds:write", "ipd:discharge:approve", "nurse:orders:execute"
    ],
  },
];

export const useStaffUserStore = create<AdminUserStoreState>()(
  persist(
    (set) => ({
      users: DEFAULT_STAFF_USERS,

      addUser: (user) =>
        set((state) => ({
          users: [user, ...state.users],
        })),

      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),

      updateUserStatus: (id, status) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, status } : u)),
        })),

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),

      resetToDefaults: () => set({ users: DEFAULT_STAFF_USERS }),
    }),
    {
      name: "hms_admin_staff_users_store",
    }
  )
);
