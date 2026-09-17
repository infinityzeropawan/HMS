"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ServiceCategory = "CLINICAL" | "DIAGNOSTICS" | "INTEGRATIONS" | "FINANCIAL";
export type ServiceStatus = "OPEN" | "CLOSED";
export type TenantOperationalStatus = "FULL_OPERATIONAL" | "PARTIAL_SERVICES" | "EMERGENCY_ONLY" | "SUSPENDED_KILL_SWITCH" | "MAINTENANCE";

export interface HospitalFacilityService {
  id: string;
  code: string;
  name: string;
  category: ServiceCategory;
  description: string;
  status: ServiceStatus;
  maintenanceReason?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface TenantFacilityConfig {
  tenantId: string;
  tenantName: string;
  operationalStatus: TenantOperationalStatus;
  suspensionReason?: string;
  lastUpdated: string;
  services: HospitalFacilityService[];
}

interface HospitalServiceStoreState {
  tenantConfigs: Record<string, TenantFacilityConfig>;
  selectedTenantId: string;
  setSelectedTenantId: (tenantId: string) => void;
  getTenantConfig: (tenantId: string) => TenantFacilityConfig;
  toggleServiceStatus: (tenantId: string, serviceId: string, status?: ServiceStatus, reason?: string) => void;
  setTenantOperationalStatus: (tenantId: string, status: TenantOperationalStatus, reason?: string) => void;
  bulkToggleCategoryServices: (tenantId: string, category: ServiceCategory, status: ServiceStatus) => void;
  resetTenantToDefaults: (tenantId: string) => void;
}

const DEFAULT_SERVICES: Omit<HospitalFacilityService, "updatedAt" | "updatedBy">[] = [
  // Clinical Facilities
  { id: "srv-opd", code: "OPD_CONSULT", name: "OPD Consultation & Token System", category: "CLINICAL", description: "Outpatient registration, doctor queue, and prescriptions", status: "OPEN" },
  { id: "srv-ipd", code: "IPD_ADMISSION", name: "IPD Admissions & Bed Allocation", category: "CLINICAL", description: "Inpatient admission desk, ward matrix, and transfers", status: "OPEN" },
  { id: "srv-emg", code: "EMERGENCY_24X7", name: "Emergency & Trauma Care 24x7", category: "CLINICAL", description: "Triage desk, crash cart allocation, emergency admissions", status: "OPEN" },
  { id: "srv-icu", code: "ICU_CRITICAL", name: "Intensive Care Unit (ICU / HDU)", category: "CLINICAL", description: "Critical care monitoring, ventilator beds, and telemetry", status: "OPEN" },
  { id: "srv-ot", code: "OT_SCHEDULING", name: "Operation Theatre (OT) Scheduling", category: "CLINICAL", description: "Surgical roster, PAC clearance, and intra-op logs", status: "OPEN" },

  // Diagnostics & Pharmacy
  { id: "srv-path", code: "PATHOLOGY_LAB", name: "Pathology & Clinical Lab Services", category: "DIAGNOSTICS", description: "Sample collection, analyzer auto-comm, and verified lab reports", status: "OPEN" },
  { id: "srv-rad", code: "RADIOLOGY_PACS", name: "Radiology & DICOM PACS Imaging", category: "DIAGNOSTICS", description: "X-Ray, CT, MRI bookings and DICOM viewer access", status: "OPEN" },
  { id: "srv-pharm", code: "PHARMACY_DISPENSE", name: "Pharmacy & Medicine Dispensing", category: "DIAGNOSTICS", description: "IPD/OPD medication dispensing, inventory, and batch tracking", status: "OPEN" },
  { id: "srv-blood", code: "BLOOD_BANK", name: "Blood Bank & Transfusion Unit", category: "DIAGNOSTICS", description: "Donor management, cross-matching, and blood component release", status: "OPEN" },

  // Digital & Integrations
  { id: "srv-tele", code: "TELEHEALTH_CARE", name: "Telehealth & Remote Consultations", category: "INTEGRATIONS", description: "Video appointments, remote vitals monitoring, e-prescriptions", status: "OPEN" },
  { id: "srv-abdm", code: "ABDM_HEALTH_STACK", name: "ABDM ABHA M1/M2/M3 Gateway", category: "INTEGRATIONS", description: "Ayushman Bharat Digital Mission record sharing & ABHA creation", status: "OPEN" },
  { id: "srv-cdss", code: "CDSS_AI_ASSISTANT", name: "AI Clinical Decision Support (CDSS)", category: "INTEGRATIONS", description: "Drug interaction alerts, diagnostic warnings, AI clinical assistance", status: "OPEN" },
  { id: "srv-kiosk", code: "PATIENT_KIOSK", name: "Self-Service Patient Kiosks", category: "INTEGRATIONS", description: "Self check-in, queue token printing, and bill pay terminals", status: "OPEN" },

  // Financial & Admin
  { id: "srv-billing", code: "IPD_OPD_BILLING", name: "IPD & OPD Billing Engine", category: "FINANCIAL", description: "Final discharge billing, cash counter, and GST invoices", status: "OPEN" },
  { id: "srv-tpa", code: "INSURANCE_TPA", name: "Insurance & TPA Cashless Desk", category: "FINANCIAL", description: "Pre-authorization, claims submission, and cashless desk", status: "OPEN" },
  { id: "srv-hr", code: "STAFF_HR_PAYROLL", name: "Staff Duty Roster & HR Console", category: "FINANCIAL", description: "Doctor shifts, nurse station assignments, attendance logs", status: "OPEN" },
];

const INITIAL_TENANTS: Record<string, string> = {
  "TENANT-001": "Apollo Super Speciality Hospital",
  "TENANT-002": "Fortis Care Heart Institute",
  "TENANT-003": "City Diagnostics & OPD Clinic",
};

const createInitialTenantConfig = (tenantId: string, tenantName: string): TenantFacilityConfig => ({
  tenantId,
  tenantName,
  operationalStatus: "FULL_OPERATIONAL",
  lastUpdated: new Date().toISOString(),
  services: DEFAULT_SERVICES.map((s) => ({
    ...s,
    updatedAt: new Date().toISOString(),
    updatedBy: "SuperAdmin System",
  })),
});

export const useHospitalServiceStore = create<HospitalServiceStoreState>()(
  persist(
    (set, get) => ({
      tenantConfigs: {
        "TENANT-001": createInitialTenantConfig("TENANT-001", "Apollo Super Speciality Hospital"),
        "TENANT-002": createInitialTenantConfig("TENANT-002", "Fortis Care Heart Institute"),
        "TENANT-003": createInitialTenantConfig("TENANT-003", "City Diagnostics & OPD Clinic"),
      },
      selectedTenantId: "TENANT-001",

      setSelectedTenantId: (tenantId) => set({ selectedTenantId: tenantId }),

      getTenantConfig: (tenantId) => {
        const state = get();
        if (state.tenantConfigs[tenantId]) {
          return state.tenantConfigs[tenantId];
        }
        const newConfig = createInitialTenantConfig(tenantId, INITIAL_TENANTS[tenantId] || `Hospital Tenant ${tenantId}`);
        set((prev) => ({
          tenantConfigs: { ...prev.tenantConfigs, [tenantId]: newConfig },
        }));
        return newConfig;
      },

      toggleServiceStatus: (tenantId, serviceId, status, reason) => {
        const timestamp = new Date().toISOString();
        set((state) => {
          const currentTenant = state.tenantConfigs[tenantId] || createInitialTenantConfig(tenantId, INITIAL_TENANTS[tenantId] || tenantId);
          const updatedServices = currentTenant.services.map((srv) => {
            if (srv.id === serviceId) {
              const nextStatus = status || (srv.status === "OPEN" ? "CLOSED" : "OPEN");
              return {
                ...srv,
                status: nextStatus,
                maintenanceReason: nextStatus === "CLOSED" ? reason || srv.maintenanceReason || "Service disabled by Super Admin" : undefined,
                updatedAt: timestamp,
                updatedBy: "Super Admin",
              };
            }
            return srv;
          });

          // Compute tenant operational status based on closed services count
          const closedCount = updatedServices.filter((s) => s.status === "CLOSED").length;
          let operationalStatus: TenantOperationalStatus = currentTenant.operationalStatus;
          if (currentTenant.operationalStatus !== "SUSPENDED_KILL_SWITCH") {
            if (closedCount === 0) operationalStatus = "FULL_OPERATIONAL";
            else if (closedCount >= updatedServices.length - 2) operationalStatus = "EMERGENCY_ONLY";
            else operationalStatus = "PARTIAL_SERVICES";
          }

          return {
            tenantConfigs: {
              ...state.tenantConfigs,
              [tenantId]: {
                ...currentTenant,
                operationalStatus,
                lastUpdated: timestamp,
                services: updatedServices,
              },
            },
          };
        });
      },

      setTenantOperationalStatus: (tenantId, status, reason) => {
        const timestamp = new Date().toISOString();
        set((state) => {
          const currentTenant = state.tenantConfigs[tenantId] || createInitialTenantConfig(tenantId, INITIAL_TENANTS[tenantId] || tenantId);
          let updatedServices = currentTenant.services;

          if (status === "SUSPENDED_KILL_SWITCH") {
            // Close all services when emergency kill switch is activated
            updatedServices = currentTenant.services.map((s) => ({
              ...s,
              status: "CLOSED",
              maintenanceReason: reason || "Hospital Operations Suspended by Super Admin Kill Switch",
              updatedAt: timestamp,
              updatedBy: "Super Admin (Kill Switch)",
            }));
          } else if (status === "FULL_OPERATIONAL") {
            // Re-open all services
            updatedServices = currentTenant.services.map((s) => ({
              ...s,
              status: "OPEN",
              maintenanceReason: undefined,
              updatedAt: timestamp,
              updatedBy: "Super Admin",
            }));
          }

          return {
            tenantConfigs: {
              ...state.tenantConfigs,
              [tenantId]: {
                ...currentTenant,
                operationalStatus: status,
                suspensionReason: status === "SUSPENDED_KILL_SWITCH" || status === "MAINTENANCE" ? reason : undefined,
                lastUpdated: timestamp,
                services: updatedServices,
              },
            },
          };
        });
      },

      bulkToggleCategoryServices: (tenantId, category, status) => {
        const timestamp = new Date().toISOString();
        set((state) => {
          const currentTenant = state.tenantConfigs[tenantId] || createInitialTenantConfig(tenantId, INITIAL_TENANTS[tenantId] || tenantId);
          const updatedServices = currentTenant.services.map((srv) => {
            if (srv.category === category) {
              return {
                ...srv,
                status,
                maintenanceReason: status === "CLOSED" ? `All ${category} services disabled by Super Admin` : undefined,
                updatedAt: timestamp,
                updatedBy: "Super Admin",
              };
            }
            return srv;
          });

          return {
            tenantConfigs: {
              ...state.tenantConfigs,
              [tenantId]: {
                ...currentTenant,
                lastUpdated: timestamp,
                services: updatedServices,
              },
            },
          };
        });
      },

      resetTenantToDefaults: (tenantId) => {
        set((state) => ({
          tenantConfigs: {
            ...state.tenantConfigs,
            [tenantId]: createInitialTenantConfig(tenantId, INITIAL_TENANTS[tenantId] || tenantId),
          },
        }));
      },
    }),
    {
      name: "hms_super_hospital_services",
    }
  )
);
