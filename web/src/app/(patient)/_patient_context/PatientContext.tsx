"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  UnifiedPatientProfile,
  Patient360Summary,
  PatientClinicalFlags,
  PatientRelationship,
  PatientDocumentItem,
} from "../_patient_types/patient_profile_types";
import { PatientProfileService } from "../_patient_services/patient_profile_service";
import { usePatientStore } from "../_patient_stores/patient_store";

interface PatientContextType {
  activeUhid: string;
  profile: UnifiedPatientProfile;
  patient360: Patient360Summary;
  flags: PatientClinicalFlags;
  relationships: PatientRelationship[];
  documents: PatientDocumentItem[];
  loading: boolean;
  setActivePatientUhid: (uhid: string) => void;
  updatePatientFlags: (flags: Partial<PatientClinicalFlags>) => void;
  refreshPatient360: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientContextProvider({
  children,
  initialUhid = "P-2026-1049",
}: {
  children: ReactNode;
  initialUhid?: string;
}) {
  const storeActiveUhid = usePatientStore((s) => s.activeUhid);
  const [activeUhid, setActiveUhidState] = useState<string>(initialUhid || storeActiveUhid || "P-2026-1049");
  const [loading, setLoading] = useState<boolean>(false);
  const [patient360, setPatient360] = useState<Patient360Summary>(() =>
    PatientProfileService.getPatient360(activeUhid)
  );

  const loadPatientData = useCallback((uhid: string) => {
    setLoading(true);
    try {
      const summary = PatientProfileService.getPatient360(uhid);
      setPatient360(summary);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatientData(activeUhid);
  }, [activeUhid, loadPatientData]);

  const setActivePatientUhid = (uhid: string) => {
    setActiveUhidState(uhid);
    usePatientStore.getState().setActiveUhid(uhid);
    loadPatientData(uhid);
  };

  const updatePatientFlags = (flagUpdates: Partial<PatientClinicalFlags>) => {
    usePatientStore.getState().updatePatientFlags(activeUhid, flagUpdates);
    loadPatientData(activeUhid);
  };

  const refreshPatient360 = () => {
    loadPatientData(activeUhid);
  };

  return (
    <PatientContext.Provider
      value={{
        activeUhid,
        profile: patient360.profile,
        patient360,
        flags: patient360.flags,
        relationships: patient360.relationships,
        documents: patient360.documents,
        loading,
        setActivePatientUhid,
        updatePatientFlags,
        refreshPatient360,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

/**
 * Custom hook for Doctor, Nurse, Lab, Billing, Pharmacy, and IPD modules to consume Patient Context
 */
export function usePatientContext(): PatientContextType {
  const context = useContext(PatientContext);
  if (!context) {
    // Return fallback context if consumed outside provider
    const activeUhid = "P-2026-1049";
    const patient360 = PatientProfileService.getPatient360(activeUhid);
    return {
      activeUhid,
      profile: patient360.profile,
      patient360,
      flags: patient360.flags,
      relationships: patient360.relationships,
      documents: patient360.documents,
      loading: false,
      setActivePatientUhid: () => {},
      updatePatientFlags: () => {},
      refreshPatient360: () => {},
    };
  }
  return context;
}
