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

  // 1. Operational Settings
  financialYear: string;
  timezone: string;
  dateFormat: string;
  currencyCode: string;
  weekStartDay: string;
  workingDays: string[];

  // 2. Hospital Identity
  hospitalType: string;
  ownershipType: string;
  emergencyFacility: boolean;
  traumaCenter: boolean;
  teachingHospital: boolean;

  // 3. Accreditation & Compliance
  nabhAccreditationNumber: string;
  nabhValidity: string;
  nablAccreditationNumber: string;
  nablValidity: string;
  abdmHfrId: string;
  hprMappingStatus: "MAPPED" | "PENDING" | "UNMAPPED";

  // 4. Clinical Policy Settings
  opdSlotDurationMinutes: number;
  prescriptionExpiryDays: number;
  autoDischargeGraceHours: number;
  vitalsBpSystolicUpperLimit: number;
  vitalsBpDiastolicUpperLimit: number;
  vitalsSpO2LowerLimit: number;
  enableCdssAlerts: boolean;
  allergyWarningEnforcement: boolean;
  duplicateMedicationWarning: boolean;
  highRiskDrugAlerts: boolean;
  controlledDrugPolicy: string;
  criticalLabAlertPolicy: string;

  // 5. Notification Policies
  appointmentSms: boolean;
  appointmentWhatsApp: boolean;
  labResultNotification: boolean;
  dischargeNotification: boolean;
  invoiceNotification: boolean;

  // 6. Document Numbering Policies & Billing
  defaultGstRatePercent: number;
  invoicePrefix: string;
  currencySymbol: string;
  tpaCashlessMinDeposit: number;
  maxStaffDiscountPercent: number;
  uhidPrefix: string;
  mrnPrefix: string;
  encounterPrefix: string;
  admissionPrefix: string;
  labOrderPrefix: string;

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

  // 1. Operational Settings
  financialYear: "2026-2027",
  timezone: "Asia/Kolkata (IST +05:30)",
  dateFormat: "DD/MM/YYYY",
  currencyCode: "INR",
  weekStartDay: "Monday",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  // 2. Hospital Identity
  hospitalType: "Super-Specialty",
  ownershipType: "Private Corporate",
  emergencyFacility: true,
  traumaCenter: true,
  teachingHospital: true,

  // 3. Accreditation & Compliance
  nabhAccreditationNumber: "NABH-HOSP-2024-8891",
  nabhValidity: "2028-12-31",
  nablAccreditationNumber: "NABL-LAB-2024-6622",
  nablValidity: "2027-06-30",
  abdmHfrId: "IN2710002819",
  hprMappingStatus: "MAPPED",

  // 4. Clinical Policy Settings
  opdSlotDurationMinutes: 15,
  prescriptionExpiryDays: 30,
  autoDischargeGraceHours: 4,
  vitalsBpSystolicUpperLimit: 140,
  vitalsBpDiastolicUpperLimit: 90,
  vitalsSpO2LowerLimit: 92,
  enableCdssAlerts: true,
  allergyWarningEnforcement: true,
  duplicateMedicationWarning: true,
  highRiskDrugAlerts: true,
  controlledDrugPolicy: "Strict Double-Check Signoff",
  criticalLabAlertPolicy: "Immediate Telephonic & SMS Alert",

  // 5. Notification Policies
  appointmentSms: true,
  appointmentWhatsApp: true,
  labResultNotification: true,
  dischargeNotification: true,
  invoiceNotification: true,

  // 6. Document Numbering Policies & Billing
  defaultGstRatePercent: 18,
  invoicePrefix: "INV-2026-",
  currencySymbol: "₹",
  tpaCashlessMinDeposit: 10000,
  maxStaffDiscountPercent: 15,
  uhidPrefix: "UHID-APL-",
  mrnPrefix: "MRN-2026-",
  encounterPrefix: "ENC-",
  admissionPrefix: "ADM-",
  labOrderPrefix: "LAB-",

  // API & ABDM Gateway Credentials
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
