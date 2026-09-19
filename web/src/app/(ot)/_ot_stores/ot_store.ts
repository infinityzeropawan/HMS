"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useBillingStore } from "@/app/(billing)/_billing_stores/billing_store";
import { useNotificationStore } from "@/lib/notification_store/notification.store";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";

export interface SurgeryRecord {
  id: string;
  surgeryCode: string;
  patientName: string;
  uhid: string;
  ipdId?: string;
  procedureName: string;
  otRoom: string;
  surgeonName: string;
  anaesthetistName: string;
  scheduledTime: string;
  scheduledDate?: string;
  pacClearance: "CLEARED" | "PENDING" | "REJECTED";
  consentStatus?: "OBTAINED" | "PENDING" | "REFUSED";
  labClearance?: "CLEARED" | "PENDING";
  radClearance?: "CLEARED" | "PENDING";
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DELAYED";
  safetyChecklistDone: boolean;
  startTime?: string;
  endTime?: string;
  procedureNotes?: string;
  outcome?: string;
  estimatedCost?: number;
}

interface OtStoreState {
  surgeries: SurgeryRecord[];
  scheduleSurgery: (
    input: Partial<SurgeryRecord> & { patientName: string; uhid: string; procedureName: string }
  ) => SurgeryRecord;
  updatePreOpClearance: (
    id: string,
    clearance: {
      pacClearance?: SurgeryRecord["pacClearance"];
      consentStatus?: SurgeryRecord["consentStatus"];
      labClearance?: SurgeryRecord["labClearance"];
      radClearance?: SurgeryRecord["radClearance"];
    }
  ) => void;
  startSurgery: (id: string) => void;
  completeSurgery: (
    id: string,
    intraOpData?: {
      surgeonName?: string;
      anaesthetistName?: string;
      startTime?: string;
      endTime?: string;
      procedureNotes?: string;
      outcome?: string;
      chargesAmount?: number;
    }
  ) => void;
  cancelSurgery: (id: string, reason?: string) => void;
  delaySurgery: (id: string, reason?: string) => void;
  reportPostOpComplication: (id: string, complicationDetails: string) => void;
  updateSurgeryStatus: (id: string, status: SurgeryRecord["status"]) => void;
  toggleSafetyChecklist: (id: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SURGERIES: SurgeryRecord[] = [
  {
    id: "surg-1",
    surgeryCode: "OT-2026-081",
    patientName: "Anita Roy",
    uhid: "P-2026-9944",
    ipdId: "IPD-2026-0895",
    procedureName: "Total Knee Arthroplasty (Right TKA)",
    otRoom: "Operation Theatre OT-01",
    surgeonName: "Dr. Manoj Patil (MS Ortho)",
    anaesthetistName: "Dr. Priya Nair (MD Anaesthesia)",
    scheduledTime: "08:30 AM - 11:30 AM",
    scheduledDate: "2026-09-19",
    pacClearance: "CLEARED",
    consentStatus: "OBTAINED",
    labClearance: "CLEARED",
    radClearance: "CLEARED",
    status: "COMPLETED",
    safetyChecklistDone: true,
    startTime: "08:35 AM",
    endTime: "11:20 AM",
    procedureNotes: "Unremarkable intra-op course. Prosthesis fitted securely. Excellent alignment achieved.",
    outcome: "SUCCESSFUL_STABLE",
    estimatedCost: 85000,
  },
  {
    id: "surg-2",
    surgeryCode: "OT-2026-084",
    patientName: "Sunil Verma",
    uhid: "P-2026-9912",
    ipdId: "IPD-2026-0881",
    procedureName: "Primary Percutaneous Coronary Intervention (PTCA)",
    otRoom: "Cath Lab OT-02",
    surgeonName: "Dr. Rajesh Sharma (DM Cardio)",
    anaesthetistName: "Dr. Vikram Sethi (MD)",
    scheduledTime: "12:00 PM - 02:30 PM",
    scheduledDate: "2026-09-19",
    pacClearance: "CLEARED",
    consentStatus: "OBTAINED",
    labClearance: "CLEARED",
    radClearance: "CLEARED",
    status: "IN_PROGRESS",
    safetyChecklistDone: true,
    startTime: "12:05 PM",
    estimatedCost: 120000,
  },
  {
    id: "surg-3",
    surgeryCode: "OT-2026-089",
    patientName: "Ramesh Pawar",
    uhid: "P-2026-9990",
    ipdId: "IPD-2026-0902",
    procedureName: "Laparoscopic Cholecystectomy",
    otRoom: "Operation Theatre OT-03",
    surgeonName: "Dr. Ananya Roy (MCh)",
    anaesthetistName: "Dr. Priya Nair (MD)",
    scheduledTime: "03:00 PM - 05:00 PM",
    scheduledDate: "2026-09-19",
    pacClearance: "CLEARED",
    consentStatus: "OBTAINED",
    labClearance: "CLEARED",
    radClearance: "CLEARED",
    status: "SCHEDULED",
    safetyChecklistDone: false,
    estimatedCost: 45000,
  },
];

export const useOtStore = create<OtStoreState>()(
  persist(
    (set, get) => ({
      surgeries: DEFAULT_SURGERIES,

      scheduleSurgery: (input) => {
        const id = `surg-${Date.now()}`;
        const surgeryCode = `OT-2026-${Math.floor(100 + Math.random() * 900)}`;
        const newSurgery: SurgeryRecord = {
          id,
          surgeryCode,
          patientName: input.patientName,
          uhid: input.uhid,
          ipdId: input.ipdId || "IPD-2026-0881",
          procedureName: input.procedureName,
          otRoom: input.otRoom || "Operation Theatre OT-01",
          surgeonName: input.surgeonName || "Dr. Manoj Patil (MS Ortho)",
          anaesthetistName: input.anaesthetistName || "Dr. Priya Nair (MD Anaesthesia)",
          scheduledTime: input.scheduledTime || "10:00 AM - 12:00 PM",
          scheduledDate: input.scheduledDate || new Date().toISOString().split("T")[0],
          pacClearance: input.pacClearance || "PENDING",
          consentStatus: input.consentStatus || "PENDING",
          labClearance: input.labClearance || "PENDING",
          radClearance: input.radClearance || "PENDING",
          status: "SCHEDULED",
          safetyChecklistDone: false,
          estimatedCost: input.estimatedCost || 50000,
        };

        set((state) => ({ surgeries: [newSurgery, ...state.surgeries] }));

        // Compliance audit event
        PlatformAuditService.recordAuditEvent({
          actor: newSurgery.surgeonName,
          actorRole: "SURGEON",
          entity: newSurgery.uhid,
          ipAddress: "127.0.0.1",
          action: "SURGERY_SCHEDULED",
          category: "COMPLIANCE_EVENT",
          details: `Surgery scheduled: ${input.procedureName} for ${input.patientName} (${input.uhid}) in ${newSurgery.otRoom}`,
          riskLevel: "INFO",
        });

        return newSurgery;
      },

      updatePreOpClearance: (id, clearance) => {
        set((state) => ({
          surgeries: state.surgeries.map((s) =>
            s.id === id
              ? {
                  ...s,
                  pacClearance: clearance.pacClearance !== undefined ? clearance.pacClearance : s.pacClearance,
                  consentStatus: clearance.consentStatus !== undefined ? clearance.consentStatus : s.consentStatus,
                  labClearance: clearance.labClearance !== undefined ? clearance.labClearance : s.labClearance,
                  radClearance: clearance.radClearance !== undefined ? clearance.radClearance : s.radClearance,
                }
              : s
          ),
        }));

        const target = get().surgeries.find((s) => s.id === id);
        if (target) {
          PlatformAuditService.recordAuditEvent({
            actor: target.anaesthetistName,
            actorRole: "ANESTHETIST",
            entity: target.uhid,
            ipAddress: "127.0.0.1",
            action: "PREOP_CLEARANCE_UPDATED",
            category: "COMPLIANCE_EVENT",
            details: `Pre-Op clearances updated for ${target.procedureName} (PAC: ${target.pacClearance}, Consent: ${target.consentStatus})`,
            riskLevel: "INFO",
          });
        }
      },

      startSurgery: (id) => {
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        set((state) => ({
          surgeries: state.surgeries.map((s) =>
            s.id === id ? { ...s, status: "IN_PROGRESS", startTime: s.startTime || timestamp } : s
          ),
        }));

        const target = get().surgeries.find((s) => s.id === id);
        if (target) {
          useNotificationStore.getState().addNotification({
            title: `OT PROCEDURE STARTED: ${target.procedureName}`,
            body: `Procedure ${target.procedureName} for ${target.patientName} (${target.uhid}) commenced in ${target.otRoom} by ${target.surgeonName}`,
            channel: "system",
            category: "OT_START",
            priority: "normal",
            status: "unread",
            tenantId: "TNT-9014",
            hospitalId: "HOSP-01",
          });

          PlatformAuditService.recordAuditEvent({
            actor: target.surgeonName,
            actorRole: "SURGEON",
            entity: target.uhid,
            ipAddress: "127.0.0.1",
            action: "SURGERY_STARTED",
            category: "COMPLIANCE_EVENT",
            details: `Procedure started: ${target.procedureName} in ${target.otRoom} by ${target.surgeonName}`,
            riskLevel: "INFO",
          });
        }
      },

      completeSurgery: (id, intraOpData) => {
        const timestamp = new Date().toLocaleString();
        let targetSurgery: SurgeryRecord | undefined;

        set((state) => ({
          surgeries: state.surgeries.map((s) => {
            if (s.id === id) {
              const updated: SurgeryRecord = {
                ...s,
                status: "COMPLETED",
                surgeonName: intraOpData?.surgeonName || s.surgeonName,
                anaesthetistName: intraOpData?.anaesthetistName || s.anaesthetistName,
                startTime: intraOpData?.startTime || s.startTime || "10:00 AM",
                endTime: intraOpData?.endTime || s.endTime || "12:00 PM",
                procedureNotes: intraOpData?.procedureNotes || s.procedureNotes || "Procedure completed successfully without complications.",
                outcome: intraOpData?.outcome || s.outcome || "SUCCESSFUL_STABLE",
                safetyChecklistDone: true,
              };
              targetSurgery = updated;
              return updated;
            }
            return s;
          }),
        }));

        if (!targetSurgery) return;

        // TASK 4 — Post-Operative Notes via useIpdStore.addRoundNote()
        const admissions = useIpdStore.getState().admissions;
        const targetAdmission = admissions.find((a) => a.uhid === targetSurgery?.uhid || a.admissionNo === targetSurgery?.ipdId);
        const ipdId = targetAdmission?.admissionNo || targetSurgery?.ipdId || admissions[0]?.admissionNo || "IPD-2026-0881";
        const postOpNote = `[PROCEDURE COMPLETED] ${targetSurgery.procedureName} | Surgeon: ${targetSurgery.surgeonName} | Anaesthetist: ${targetSurgery.anaesthetistName} | Outcome: ${targetSurgery.outcome || "SUCCESSFUL_STABLE"} | Intra-Op Notes: ${targetSurgery.procedureNotes} | Timestamp: ${timestamp}`;

        try {
          useIpdStore.getState().addRoundNote(ipdId, postOpNote);
        } catch {
          /* fallback */
        }

        // TASK 5 — Billing Integration via useBillingStore.addInvoice()
        const invoiceNo = `INV-OT-${Math.floor(10000 + Math.random() * 90000)}`;
        const chargeAmount = intraOpData?.chargesAmount || targetSurgery.estimatedCost || 65000;

        try {
          useBillingStore.getState().addInvoice({
            invoiceNumber: invoiceNo,
            patientUhid: targetSurgery.uhid,
            patientName: targetSurgery.patientName,
            category: "IPD",
            paymentMode: "INSURANCE_TPA",
            subtotal: chargeAmount,
            cgstAmount: parseFloat((chargeAmount * 0.09).toFixed(2)),
            sgstAmount: parseFloat((chargeAmount * 0.09).toFixed(2)),
            totalAmount: chargeAmount,
            paidAmount: chargeAmount,
            status: "PAID",
            items: [
              {
                itemId: `ot-charge-${Date.now()}`,
                description: `[SURGERY & OT CHARGES] ${targetSurgery.procedureName} (${targetSurgery.surgeryCode})`,
                hsnSacCode: "999312",
                quantity: 1,
                unitPrice: chargeAmount,
                gstRate: 18,
              },
            ],
          });
        } catch {
          /* fallback */
        }

        // Compliance Audit Event
        PlatformAuditService.recordAuditEvent({
          actor: targetSurgery.surgeonName,
          actorRole: "SURGEON",
          entity: targetSurgery.uhid,
          ipAddress: "127.0.0.1",
          action: "SURGERY_COMPLETED",
          category: "COMPLIANCE_EVENT",
          details: `Surgery completed: ${targetSurgery.procedureName} | Surgeon: ${targetSurgery.surgeonName} | Billed Invoice: ${invoiceNo}`,
          riskLevel: "INFO",
        });
      },

      cancelSurgery: (id, reason) => {
        let target: SurgeryRecord | undefined;
        set((state) => ({
          surgeries: state.surgeries.map((s) => {
            if (s.id === id) {
              const updated: SurgeryRecord = { ...s, status: "CANCELLED" };
              target = updated;
              return updated;
            }
            return s;
          }),
        }));

        if (target) {
          // TASK 7 — Critical Alert: Cancelled Procedure
          useNotificationStore.getState().addNotification({
            title: `CRITICAL OT ALERT: Surgery Cancelled`,
            body: `Procedure ${target.procedureName} for ${target.patientName} (${target.uhid}) in ${target.otRoom} was CANCELLED. Reason: ${reason || "Medical/Clinical unfitness"}`,
            channel: "system",
            category: "ESCALATION",
            priority: "critical",
            status: "unread",
            tenantId: "TNT-9014",
            hospitalId: "HOSP-01",
          });

          PlatformAuditService.recordAuditEvent({
            actor: target.surgeonName,
            actorRole: "SURGEON",
            entity: target.uhid,
            ipAddress: "127.0.0.1",
            action: "SURGERY_CANCELLED",
            category: "COMPLIANCE_EVENT",
            details: `Surgery cancelled: ${target.procedureName} (${target.uhid}) | Reason: ${reason || "Clinical decision"}`,
            riskLevel: "WARNING",
          });
        }
      },

      delaySurgery: (id, reason) => {
        let target: SurgeryRecord | undefined;
        set((state) => ({
          surgeries: state.surgeries.map((s) => {
            if (s.id === id) {
              const updated: SurgeryRecord = { ...s, status: "DELAYED" };
              target = updated;
              return updated;
            }
            return s;
          }),
        }));

        if (target) {
          // TASK 7 — Critical Alert: Surgery Delay
          useNotificationStore.getState().addNotification({
            title: `CRITICAL OT ALERT: Surgery Delayed`,
            body: `Procedure ${target.procedureName} for ${target.patientName} (${target.uhid}) in ${target.otRoom} is DELAYED. Reason: ${reason || "Emergency case overrun / OT suite busy"}`,
            channel: "system",
            category: "ESCALATION",
            priority: "critical",
            status: "unread",
            tenantId: "TNT-9014",
            hospitalId: "HOSP-01",
          });

          PlatformAuditService.recordAuditEvent({
            actor: target.surgeonName,
            actorRole: "SURGEON",
            entity: target.uhid,
            ipAddress: "127.0.0.1",
            action: "SURGERY_DELAYED",
            category: "COMPLIANCE_EVENT",
            details: `Surgery delayed: ${target.procedureName} (${target.uhid}) | Reason: ${reason || "OT schedule overrun"}`,
            riskLevel: "WARNING",
          });
        }
      },

      reportPostOpComplication: (id, complicationDetails) => {
        const target = get().surgeries.find((s) => s.id === id);
        if (target) {
          // TASK 7 — Critical Alert: Post-Op Complication
          useNotificationStore.getState().addNotification({
            title: `CRITICAL POST-OP COMPLICATION: ${target.patientName}`,
            body: `Post-operative complication flagged for ${target.procedureName} (UHID: ${target.uhid}): ${complicationDetails}. Immediate surgical review required!`,
            channel: "system",
            category: "ESCALATION",
            priority: "critical",
            status: "unread",
            tenantId: "TNT-9014",
            hospitalId: "HOSP-01",
          });

          PlatformAuditService.recordAuditEvent({
            actor: target.surgeonName,
            actorRole: "SURGEON",
            entity: target.uhid,
            ipAddress: "127.0.0.1",
            action: "POST_OP_COMPLICATION_FLAGGED",
            category: "COMPLIANCE_EVENT",
            details: `Post-op complication reported for ${target.patientName} (${target.uhid}): ${complicationDetails}`,
            riskLevel: "CRITICAL",
          });
        }
      },

      updateSurgeryStatus: (id, status) =>
        set((state) => ({
          surgeries: state.surgeries.map((s) => (s.id === id ? { ...s, status } : s)),
        })),

      toggleSafetyChecklist: (id) =>
        set((state) => ({
          surgeries: state.surgeries.map((s) =>
            s.id === id ? { ...s, safetyChecklistDone: !s.safetyChecklistDone } : s
          ),
        })),

      resetToDefaults: () => set({ surgeries: DEFAULT_SURGERIES }),
    }),
    {
      name: "hms_ot_surgery_store",
    }
  )
);
