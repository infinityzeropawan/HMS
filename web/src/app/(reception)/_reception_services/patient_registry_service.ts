"use client";

import { DEMO_PATIENTS } from "@/lib/demo_seeder/hms_demo_seeder";
import { PatientRegInput } from "../_reception_schemas/patient_reg_schema";
import { ReceptionVitals, TriagePriority } from "../_reception_types/visit_types";

export const PATIENTS_STORAGE_KEY = "hms_patients";
export const UHID_SEQ_STORAGE_KEY = "hms_last_uhid_seq";
export const LAST_REGISTERED_UHID_KEY = "hms_last_registered_uhid";

/** Legacy placeholder the old registration form pre-filled for every patient. */
export const AADHAAR_PLACEHOLDER = "XXXX-XXXX-1234";

/** Patient record as persisted in the browser patient index (`hms_patients`). */
export interface PatientRecord {
  uhid: string;
  fullName: string;
  gender: string; // MALE | FEMALE | OTHER
  dob: string; // YYYY-MM-DD
  phone: string;
  email?: string;
  aadhaarNumber: string;
  address: string;
  emergencyContact: string;
  bloodGroup?: string;
  abhaId?: string;
  registeredAt: string;
  // Reception triage capture
  systolicBp?: number;
  diastolicBp?: number;
  pulseRate?: number;
  temperatureF?: number;
  weightKg?: number;
  spo2?: number;
  triagePriority?: TriagePriority;
  // Insurance / TPA
  insuranceProvider?: string;
  policyNumber?: string;
}

export interface PatientOption {
  uhid: string;
  mrn: string;
  name: string;
  phone: string;
  gender: string;
  age: number;
  ageGender: string;
}

export interface RegisterPatientResult {
  success: boolean;
  message: string;
  patient?: PatientRecord;
  duplicate?: PatientRecord;
}

/**
 * Single source of truth for the front-desk patient index.
 * Replaces the ad-hoc localStorage reads previously scattered across the registration
 * wizard and the appointment booking drawer.
 */
export class PatientRegistryService {
  /** Raw records stored in this browser (never throws). */
  static getStoredPatients(): PatientRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(PATIENTS_STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? (parsed as PatientRecord[]) : [];
    } catch {
      return [];
    }
  }

  /** Stored records first, then seeded demo patients not already present. */
  static getPatients(): PatientRecord[] {
    const stored = this.getStoredPatients();
    const known = new Set(stored.map((p) => p.uhid));
    const demo = (DEMO_PATIENTS as PatientRecord[]).filter((p) => !known.has(p.uhid));
    return [...stored, ...demo];
  }

  static findByUhid(uhid: string): PatientRecord | undefined {
    if (!uhid) return undefined;
    return this.getPatients().find((p) => p.uhid.toLowerCase() === uhid.trim().toLowerCase());
  }

  static normalizePhone(phone?: string): string {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  static findByPhone(phone: string): PatientRecord | undefined {
    const target = this.normalizePhone(phone);
    if (target.length !== 10) return undefined;
    return this.getPatients().find((p) => this.normalizePhone(p.phone) === target);
  }

  /**
   * Duplicate detection on mobile number (primary key of the desk) and Aadhaar.
   * The legacy `XXXX-XXXX-1234` placeholder is ignored: it is not real identifying data.
   */
  static checkDuplicate(
    input: { phone?: string; aadhaarNumber?: string },
    excludeUhid?: string
  ): PatientRecord | undefined {
    const phone = this.normalizePhone(input.phone);
    const aadhaar = (input.aadhaarNumber || "").trim();
    const hasRealAadhaar = aadhaar !== "" && aadhaar !== AADHAAR_PLACEHOLDER;

    return this.getPatients().find((p) => {
      if (excludeUhid && p.uhid === excludeUhid) return false;
      if (phone.length === 10 && this.normalizePhone(p.phone) === phone) return true;
      if (hasRealAadhaar && (p.aadhaarNumber || "").trim() === aadhaar && p.aadhaarNumber !== AADHAAR_PLACEHOLDER) {
        return true;
      }
      return false;
    });
  }

  /** Allocates the next unused UHID, skipping every id already in the patient index. */
  static allocateUhid(): string {
    const used = new Set(this.getPatients().map((p) => p.uhid));

    let seq = 1060;
    if (typeof window !== "undefined") {
      const stored = parseInt(localStorage.getItem(UHID_SEQ_STORAGE_KEY) || "", 10);
      if (Number.isFinite(stored) && stored > seq) seq = stored;
    }

    let candidate = "";
    do {
      seq += 1;
      candidate = `P-2026-${seq}`;
      if (seq > 9999) {
        candidate = `P-2026-${Date.now().toString().slice(-6)}`;
        break;
      }
    } while (used.has(candidate));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(UHID_SEQ_STORAGE_KEY, String(seq));
      } catch {
        /* ignore quota errors */
      }
    }
    return candidate;
  }

  /** Persists full demographics + triage capture. Duplicates are rejected. */
  static registerPatient(input: PatientRegInput): RegisterPatientResult {
    const duplicate = this.checkDuplicate(input);
    if (duplicate) {
      const samePhone =
        this.normalizePhone(duplicate.phone) === this.normalizePhone(input.phone);
      return {
        success: false,
        message: `Patient already registered with this ${
          samePhone ? "mobile number" : "Aadhaar number"
        } — existing UHID ${duplicate.uhid} (${duplicate.fullName}).`,
        duplicate,
      };
    }

    if (typeof window === "undefined") {
      return { success: false, message: "Registration requires a browser session." };
    }

    const record: PatientRecord = {
      ...input,
      uhid: this.allocateUhid(),
      registeredAt: new Date().toISOString(),
    };

    try {
      const stored = this.getStoredPatients();
      stored.unshift(record);
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(stored));
      localStorage.setItem(LAST_REGISTERED_UHID_KEY, record.uhid);
    } catch {
      return { success: false, message: "Unable to write the patient record to browser storage." };
    }

    return {
      success: true,
      message: `Patient ${record.fullName} registered with UHID ${record.uhid}.`,
      patient: record,
    };
  }

  /** Stores triage vitals + priority against an existing registered patient. */
  static updateTriage(uhid: string, vitals: ReceptionVitals, triagePriority: TriagePriority): boolean {
    if (typeof window === "undefined") return false;
    const stored = this.getStoredPatients();
    const index = stored.findIndex((p) => p.uhid === uhid);
    if (index < 0) return false;

    stored[index] = { ...stored[index], ...vitals, triagePriority };
    try {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(stored));
      return true;
    } catch {
      return false;
    }
  }

  static computeAge(dob: string): number {
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDelta = today.getMonth() - birth.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;
    return age > 0 && age < 130 ? age : 0;
  }

  static genderLabel(gender: string): string {
    const normalized = (gender || "").toUpperCase();
    if (normalized === "MALE") return "Male";
    if (normalized === "FEMALE") return "Female";
    if (normalized === "OTHER") return "Other";
    return "Unknown";
  }

  /** Shared display format used by queue tables and the token slip ("45 / Male"). */
  static toAgeGender(record: PatientRecord): string {
    const age = this.computeAge(record.dob);
    return `${age > 0 ? age : "NA"} / ${this.genderLabel(record.gender)}`;
  }

  static mrnFor(uhid: string): string {
    return `MRN-${uhid.replace(/\D/g, "").slice(-4) || "0000"}`;
  }

  static toOption(record: PatientRecord): PatientOption {
    return {
      uhid: record.uhid,
      mrn: this.mrnFor(record.uhid),
      name: record.fullName,
      phone: record.phone,
      gender: this.genderLabel(record.gender),
      age: this.computeAge(record.dob),
      ageGender: this.toAgeGender(record),
    };
  }

  static getOptions(): PatientOption[] {
    return this.getPatients().map((p) => this.toOption(p));
  }

  static getLastRegisteredUhid(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(LAST_REGISTERED_UHID_KEY);
    } catch {
      return null;
    }
  }
}
