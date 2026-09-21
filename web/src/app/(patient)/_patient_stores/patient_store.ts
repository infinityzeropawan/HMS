"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  UnifiedPatientProfile,
  PatientClinicalFlags,
  PatientRelationship,
  PatientDocumentItem,
} from "../_patient_types/patient_profile_types";

import { PatientRegistryService } from "@/app/(reception)/_reception_services/patient_registry_service";

const SEED_PATIENTS: Record<string, UnifiedPatientProfile> = {
  "P-2026-1049": {
    uhid: "P-2026-1049",
    mrn: "MRN-2026-8801",
    abhaId: "sunil.verma@abdm",
    fullName: "Sunil Verma",
    gender: "MALE",
    dob: "1981-05-14",
    age: 45,
    bloodGroup: "O_POSITIVE",
    phone: "+91 98765 43210",
    email: "sunil.verma@example.com",
    address: "Flat 402, Sunshine Apts, Bandra West, Mumbai",
    emergencyContact: "+91 98765 43211",
    insuranceDetails: {
      providerName: "Star Health & Allied Insurance",
      policyNumber: "POL-STAR-2026-9901",
      tpaId: "TPA-9912",
      validTill: "2027-03-31",
      sumInsured: 500000,
    },
    registeredAt: "2026-09-01T09:00:00Z",
    status: "ACTIVE",
    relationships: [
      {
        id: "rel-101",
        relativeName: "Anita Verma",
        relationshipType: "SPOUSE",
        phone: "+91 98765 43211",
        address: "Flat 402, Sunshine Apts, Bandra West, Mumbai",
        isEmergencyContact: true,
      },
      {
        id: "rel-102",
        relativeName: "Ramesh Verma",
        relationshipType: "PARENT",
        phone: "+91 98765 43212",
        address: "Flat 402, Sunshine Apts, Bandra West, Mumbai",
      },
    ],
    flags: {
      highRisk: true,
      fallRisk: false,
      allergyAlert: true,
      vipPatient: false,
      medicoLegalCase: false,
      flagNotes: "High risk coronary artery disease patient with anaphylactic Penicillin allergy.",
    },
    documents: [
      {
        id: "doc-con-01",
        category: "CONSENT",
        title: "General OPD Medical & Telehealth Informed Consent",
        uploadedAt: "2026-09-01",
        provider: "HMS Front Desk",
      },
      {
        id: "doc-dis-01",
        category: "DISCHARGE_SUMMARY",
        title: "IPD Cardiology Ward Discharge Summary",
        uploadedAt: "2026-08-20",
        provider: "Dr. Rajesh Sharma",
      },
      {
        id: "doc-ins-01",
        category: "INSURANCE_DOCUMENT",
        title: "Star Health cashless pre-authorization copy",
        uploadedAt: "2026-09-01",
        provider: "Insurance Desk",
      },
    ],
  },
};

interface PatientStoreState {
  patients: Record<string, UnifiedPatientProfile>;
  activeUhid: string;

  getPatient: (uhid: string) => UnifiedPatientProfile;
  registerPatient: (profile: Partial<UnifiedPatientProfile>) => UnifiedPatientProfile;
  updatePatientProfile: (uhid: string, updates: Partial<UnifiedPatientProfile>) => void;
  updatePatientFlags: (uhid: string, flags: Partial<PatientClinicalFlags>) => void;
  addRelationship: (uhid: string, rel: Omit<PatientRelationship, "id">) => void;
  addDocument: (uhid: string, doc: Omit<PatientDocumentItem, "id">) => void;
  setActiveUhid: (uhid: string) => void;
  searchPatients: (query: string) => UnifiedPatientProfile[];
  resetToDefaults: () => void;
}

export const usePatientStore = create<PatientStoreState>()(
  persist(
    (set, get) => ({
      patients: SEED_PATIENTS,
      activeUhid: "P-2026-1049",

      getPatient: (uhid) => {
        const state = get();
        if (state.patients[uhid]) return state.patients[uhid];

        // 1. Try resolving from PatientRegistryService (reception index)
        const registryRecord = PatientRegistryService.findByUhid(uhid);
        if (registryRecord) {
          const age = PatientRegistryService.computeAge(registryRecord.dob);
          const mappedProfile: UnifiedPatientProfile = {
            uhid: registryRecord.uhid,
            mrn: PatientRegistryService.mrnFor(registryRecord.uhid),
            abhaId: registryRecord.abhaId || `${registryRecord.fullName.toLowerCase().replace(/\s+/g, ".")}@abdm`,
            fullName: registryRecord.fullName,
            gender: (registryRecord.gender as "MALE" | "FEMALE" | "OTHER") || "OTHER",
            dob: registryRecord.dob,
            age: age > 0 ? age : 30,
            bloodGroup: (registryRecord.bloodGroup as any) || "O_POSITIVE",
            phone: registryRecord.phone,
            email: registryRecord.email,
            address: registryRecord.address,
            emergencyContact: registryRecord.emergencyContact || registryRecord.phone,
            insuranceDetails: registryRecord.insuranceProvider
              ? {
                  providerName: registryRecord.insuranceProvider,
                  policyNumber: registryRecord.policyNumber || "POL-2026-0000",
                }
              : undefined,
            registeredAt: registryRecord.registeredAt || new Date().toISOString(),
            status: "ACTIVE",
            relationships: [],
            flags: {
              highRisk: false,
              fallRisk: false,
              allergyAlert: false,
              vipPatient: false,
              medicoLegalCase: false,
            },
            documents: [],
          };
          set((s) => ({ patients: { ...s.patients, [uhid]: mappedProfile } }));
          return mappedProfile;
        }

        // 2. Clean fallback profile for unknown UHID (NEVER fall back to Sunil Verma)
        const dynamicProfile: UnifiedPatientProfile = {
          uhid,
          mrn: `MRN-${uhid.replace(/\D/g, "").slice(-4) || "0000"}`,
          fullName: `Patient ${uhid}`,
          gender: "OTHER",
          dob: "1996-01-01",
          age: 30,
          bloodGroup: "O_POSITIVE",
          phone: "+91 90000 00000",
          address: "Local Area",
          emergencyContact: "+91 90000 00000",
          registeredAt: new Date().toISOString(),
          status: "ACTIVE",
          relationships: [],
          flags: {
            highRisk: false,
            fallRisk: false,
            allergyAlert: false,
            vipPatient: false,
            medicoLegalCase: false,
          },
          documents: [],
        };
        return dynamicProfile;
      },

      registerPatient: (profileData) => {
        const uhid = profileData.uhid || `P-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const mrn = profileData.mrn || `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const newProfile: UnifiedPatientProfile = {
          uhid,
          mrn,
          abhaId: profileData.abhaId || `${(profileData.fullName || "patient").toLowerCase().replace(/\s+/g, ".")}@abdm`,
          fullName: profileData.fullName || "New Patient",
          gender: profileData.gender || "OTHER",
          dob: profileData.dob || "1990-01-01",
          age: profileData.age || 36,
          bloodGroup: profileData.bloodGroup || "O_POSITIVE",
          phone: profileData.phone || "+91 98765 00000",
          email: profileData.email,
          address: profileData.address || "Mumbai, India",
          emergencyContact: profileData.emergencyContact || profileData.phone || "+91 98765 00000",
          insuranceDetails: profileData.insuranceDetails,
          registeredAt: new Date().toISOString(),
          status: profileData.status || "ACTIVE",
          relationships: profileData.relationships || [],
          flags: profileData.flags || {
            highRisk: false,
            fallRisk: false,
            allergyAlert: false,
            vipPatient: false,
            medicoLegalCase: false,
          },
          documents: profileData.documents || [],
        };

        set((state) => ({
          patients: {
            ...state.patients,
            [uhid]: newProfile,
          },
          activeUhid: uhid,
        }));

        return newProfile;
      },

      updatePatientProfile: (uhid, updates) => {
        set((state) => {
          const current = state.patients[uhid] || SEED_PATIENTS["P-2026-1049"];
          return {
            patients: {
              ...state.patients,
              [uhid]: { ...current, ...updates },
            },
          };
        });
      },

      updatePatientFlags: (uhid, flagUpdates) => {
        set((state) => {
          const current = state.patients[uhid] || SEED_PATIENTS["P-2026-1049"];
          return {
            patients: {
              ...state.patients,
              [uhid]: {
                ...current,
                flags: {
                  ...current.flags,
                  ...flagUpdates,
                },
              },
            },
          };
        });
      },

      addRelationship: (uhid, relData) => {
        set((state) => {
          const current = state.patients[uhid] || SEED_PATIENTS["P-2026-1049"];
          const newRel: PatientRelationship = {
            ...relData,
            id: `rel-${Date.now()}`,
          };
          return {
            patients: {
              ...state.patients,
              [uhid]: {
                ...current,
                relationships: [...current.relationships, newRel],
              },
            },
          };
        });
      },

      addDocument: (uhid, docData) => {
        set((state) => {
          const current = state.patients[uhid] || SEED_PATIENTS["P-2026-1049"];
          const newDoc: PatientDocumentItem = {
            ...docData,
            id: `doc-${Date.now()}`,
          };
          return {
            patients: {
              ...state.patients,
              [uhid]: {
                ...current,
                documents: [...current.documents, newDoc],
              },
            },
          };
        });
      },

      setActiveUhid: (uhid) => set({ activeUhid: uhid }),

      searchPatients: (query) => {
        const state = get();
        const q = query.trim().toLowerCase();
        if (!q) return Object.values(state.patients);
        return Object.values(state.patients).filter(
          (p) =>
            p.fullName.toLowerCase().includes(q) ||
            p.uhid.toLowerCase().includes(q) ||
            p.mrn.toLowerCase().includes(q) ||
            p.phone.includes(q)
        );
      },

      resetToDefaults: () => set({ patients: SEED_PATIENTS, activeUhid: "P-2026-1049" }),
    }),
    {
      name: "hms_patient_master_store_v1",
    }
  )
);
