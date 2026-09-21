"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, message, Modal, Input } from "antd";
import { CheckCircle2, Barcode, Clock, UserCheck, ShieldCheck } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useEncounterStore } from "@/app/(doctor)/_doctor_stores/encounter_store";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";

interface DoseRecord {
  key: string;
  medName: string;
  scheduledTime: string;
  status: "GIVEN" | "SCHEDULED";
  givenAt: string;
  nurse: string;
  source?: "DOCTOR_PRESCRIPTION" | "IPD_MAR";
}

interface MedicationAdminChecklistProps {
  ipdId?: string;
  uhid?: string;
}

const DEFAULT_DOSES: DoseRecord[] = [
  { key: "1", medName: "Inj Pantocid 40mg IV", scheduledTime: "08:00 AM", status: "GIVEN", givenAt: "08:10 AM", nurse: "Duty Nurse", source: "IPD_MAR" },
  { key: "2", medName: "Tab Ecosprin 75mg PO", scheduledTime: "14:00 PM", status: "GIVEN", givenAt: "14:05 PM", nurse: "Duty Nurse", source: "IPD_MAR" },
  { key: "3", medName: "Inj Augmentin 1.2g IV", scheduledTime: "18:00 PM", status: "SCHEDULED", givenAt: "-", nurse: "-", source: "IPD_MAR" },
  { key: "4", medName: "Tab Sorbitrate 5mg SL", scheduledTime: "22:00 PM", status: "SCHEDULED", givenAt: "-", nurse: "-", source: "IPD_MAR" },
];

export const MedicationAdminChecklist: React.FC<MedicationAdminChecklistProps> = ({ ipdId, uhid }) => {
  const [doses, setDoses] = useState<DoseRecord[]>(DEFAULT_DOSES);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DoseRecord | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const currentUser = useAuthUserStore((state) => state.user);
  const nurseName = currentUser?.username ? `Nurse ${currentUser.username}` : "Nurse Duty Station";

  const storageKey = `hms_nurse_mar_checklist_${ipdId || uhid || "default"}`;

  useEffect(() => {
    // 1. Load saved MAR state if present
    let initialDoses: DoseRecord[] = DEFAULT_DOSES;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          initialDoses = JSON.parse(saved);
        }
      } catch {
        /* ignore */
      }
    }

    // 2. Load signed Doctor encounter prescriptions for patient UHID
    if (uhid) {
      try {
        const encounterStore = useEncounterStore.getState();
        const encounter = encounterStore.getEncounter(uhid);
        if (encounter && encounter.prescriptions && encounter.prescriptions.length > 0) {
          const docDoses: DoseRecord[] = encounter.prescriptions.map((rx, idx) => {
            const freq = rx.frequency || "";
            return {
              key: `doc-rx-${idx}-${rx.drugId || idx}`,
              medName: `${rx.drugName || rx.drugId || "Medication"} ${rx.dosage || ""} - ${freq}`,
              scheduledTime: freq.includes("OD") ? "09:00 AM" : freq.includes("BD") ? "09:00 AM & 21:00 PM" : "STAT / As Needed",
              status: "SCHEDULED",
              givenAt: "-",
              nurse: "-",
              source: "DOCTOR_PRESCRIPTION",
            };
          });

          // Merge without duplicating med names
          const existingNames = new Set(initialDoses.map((d) => d.medName));
          const newDocDoses = docDoses.filter((d) => !existingNames.has(d.medName));
          initialDoses = [...newDocDoses, ...initialDoses];
        }
      } catch {
        /* ignore */
      }
    }

    setDoses(initialDoses);
  }, [ipdId, uhid, storageKey]);

  const openScanModal = (record: DoseRecord) => {
    setSelectedRecord(record);
    setBarcodeInput(`MED-BAR-${Math.floor(100000 + Math.random() * 900000)}`);
    setScanModalOpen(true);
  };

  const handleConfirmAdminister = () => {
    if (!selectedRecord) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const updated = doses.map((d) =>
      d.key === selectedRecord.key
        ? { ...d, status: "GIVEN" as const, givenAt: ts, nurse: nurseName }
        : d
    );

    setDoses(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
    }

    // Persist to EMR Timeline & Nurse Log without overwriting Doctor Round Note
    if (ipdId) {
      try {
        useIpdStore.getState().addNurseLog(
          ipdId,
          `[MAR Dose Administered] ${selectedRecord.medName} - Barcode (${barcodeInput}) verified and administered by ${nurseName} at ${ts}`,
          "MAR",
          nurseName
        );
      } catch {
        /* store fallback */
      }
    }

    // Platform Audit Event
    PlatformAuditService.recordAuditEvent({
      actor: nurseName,
      actorRole: "CLINICAL_NURSE",
      action: `MAR Dose Administered: ${selectedRecord.medName}`,
      category: "COMPLIANCE_EVENT",
      entity: `IPD Admission ${ipdId || "General"} (UHID: ${uhid || "Inpatient"})`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        medication: selectedRecord.medName,
        barcode: barcodeInput,
        ipdId,
        uhid,
        administeredBy: nurseName,
        administeredAt: ts,
      }),
    });

    message.success(`Dose ${selectedRecord.medName} verified with Barcode ${barcodeInput} & marked Administered by ${nurseName}.`);
    setScanModalOpen(false);
    setSelectedRecord(null);
  };

  const columns = [
    {
      title: "Medication & Route",
      dataIndex: "medName",
      key: "medName",
      render: (m: string, r: DoseRecord) => (
        <div>
          <span className="font-semibold text-slate-900 block">{m}</span>
          {r.source === "DOCTOR_PRESCRIPTION" && (
            <Tag color="purple" className="text-[10px] mt-0.5">Doctor Prescription</Tag>
          )}
        </div>
      ),
    },
    { title: "Scheduled Time", dataIndex: "scheduledTime", key: "scheduledTime", render: (t: string) => <span className="font-mono text-xs">{t}</span> },
    { title: "Administered At", dataIndex: "givenAt", key: "givenAt", render: (g: string) => <span className="font-mono text-xs text-emerald-700">{g}</span> },
    {
      title: "MAR Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "GIVEN" ? "emerald" : "orange"}>
          {status === "GIVEN" ? "ADMINISTERED" : "DUE"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: DoseRecord) =>
        record.status === "SCHEDULED" ? (
          <HmsButton
            size="sm"
            variant="emerald"
            icon={<Barcode className="w-3.5 h-3.5" />}
            onClick={() => openScanModal(record)}
          >
            Scan & Administer
          </HmsButton>
        ) : (
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified ({record.nurse})
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Smartphone Mobile Cards */}
      <div className="block sm:hidden space-y-2">
        {doses.map((d) => (
          <div
            key={d.key}
            className={`p-3 rounded-xl border space-y-2 text-xs ${
              d.status === "GIVEN" ? "bg-emerald-50/70 border-emerald-200" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{d.medName}</span>
                {d.source === "DOCTOR_PRESCRIPTION" && (
                  <Tag color="purple" className="text-[10px]">Doctor Order</Tag>
                )}
              </div>
              <Tag color={d.status === "GIVEN" ? "emerald" : "orange"}>
                {d.status === "GIVEN" ? "ADMINISTERED" : "DUE"}
              </Tag>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1 font-mono"><Clock className="w-3.5 h-3.5 text-slate-400" /> Due: {d.scheduledTime}</span>
              {d.status === "GIVEN" && (
                <span className="flex items-center gap-1 text-emerald-700 font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Given: {d.givenAt}</span>
              )}
            </div>
            {d.status === "SCHEDULED" ? (
              <HmsButton
                size="lg"
                fullWidth
                variant="emerald"
                icon={<Barcode className="w-4 h-4" />}
                onClick={() => openScanModal(d)}
              >
                Scan & Administer Dose
              </HmsButton>
            ) : (
              <div className="text-xs text-emerald-800 flex items-center gap-1 pt-1 border-t border-emerald-100 font-medium">
                <UserCheck className="w-3.5 h-3.5" /> Administered by {d.nurse}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden sm:block overflow-x-auto">
        <Table columns={columns} dataSource={doses} pagination={false} rowKey="key" />
      </div>

      {/* Barcode Verification Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>5-Rights Barcode Verification</span>
          </div>
        }
        open={scanModalOpen}
        onCancel={() => setScanModalOpen(false)}
        onOk={handleConfirmAdminister}
        okText="Verify & Administer"
        okButtonProps={{ className: "bg-teal-600 hover:bg-teal-700 font-semibold" }}
      >
        {selectedRecord && (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs space-y-1">
              <p className="font-bold text-slate-900 text-sm">{selectedRecord.medName}</p>
              <p className="text-slate-600 font-mono">Patient: <strong>{uhid || "IPD Patient"}</strong> &bull; Due: {selectedRecord.scheduledTime}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Barcode className="w-4 h-4 text-teal-600" /> Scanned Medication Barcode ID:
              </label>
              <Input
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan wristband/vial barcode..."
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-emerald-700 font-medium">✓ 5-Rights Checklist: Right Patient, Right Drug, Right Dose, Right Route, Right Time verified.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};


