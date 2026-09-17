"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HospitalSettingsState {
  // General & Branding
  hospitalName: string;
  tagline: string;
  registrationNumber: string;
  gstin: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  logoUrl: string;

  // Clinical Policies
  opdSlotDurationMinutes: number;
  prescriptionExpiryDays: number;
  autoDischargeGraceHours: number;
  vitalsBpSystolicUpperLimit: number;
  vitalsBpDiastolicUpperLimit: number;
  vitalsSpO2LowerLimit: number;
  enableCdssAlerts: boolean;

  // Billing & Tax Config
  defaultGstRatePercent: number;
  invoicePrefix: string;
  currencySymbol: string;
  tpaCashlessMinDeposit: number;
  maxStaffDiscountPercent: number;

  // API & ABDM Gateway Credentials
  abhaFacilityId: string;
  abhaClientSecret: string;
  smsGatewayApiKey: string;
  whatsAppBusinessToken: string;
  pacsDicomServerUrl: string;

  // Actions
  updateSettings: (updates: Partial<HospitalSettingsState>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: Omit<HospitalSettingsState, "updateSettings" | "resetToDefaults"> = {
  hospitalName: "Apollo Super Speciality Hospital",
  tagline: "Advanced Multi-Specialty Clinical Care & Cardiac Institute",
  registrationNumber: "MAH-HOSP-2024-88912",
  gstin: "27AAAAA0000A1Z5",
  phone: "+91 22 6123 4567",
  email: "admin@apollo.hms.com",
  website: "https://apollo.hms.com",
  address: "Plot 14, Healthcare Avenue, Bandra East",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400051",
  logoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80",

  opdSlotDurationMinutes: 15,
  prescriptionExpiryDays: 30,
  autoDischargeGraceHours: 4,
  vitalsBpSystolicUpperLimit: 140,
  vitalsBpDiastolicUpperLimit: 90,
  vitalsSpO2LowerLimit: 92,
  enableCdssAlerts: true,

  defaultGstRatePercent: 18,
  invoicePrefix: "INV-2026",
  currencySymbol: "₹",
  tpaCashlessMinDeposit: 10000,
  maxStaffDiscountPercent: 15,

  abhaFacilityId: "IN2710002819",
  abhaClientSecret: "••••••••••••••••",
  smsGatewayApiKey: "SMS-KEY-9981-X7",
  whatsAppBusinessToken: "WA-BIZ-TOKEN-8832",
  pacsDicomServerUrl: "dicom://pacs.apollo.hms.com:104",
};

export const useAdminSettingsStore = create<HospitalSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (updates) =>
        set((state) => ({
          ...state,
          ...updates,
        })),

      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: "hms_admin_settings_store",
    }
  )
);
