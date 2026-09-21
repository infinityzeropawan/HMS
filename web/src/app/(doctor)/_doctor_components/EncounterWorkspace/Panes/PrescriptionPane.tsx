"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, Alert, message, Modal, Select, Form, Input, Tag } from "antd";
import { Pill, Printer, CheckCircle, ShieldAlert, Plus, Send, Trash2, AlertTriangle, Info, ShieldCheck, Package } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";
import { PrescriptionItem } from "../../../_doctor_types/encounter_types";
import { EncounterService } from "../../../_doctor_services/encounter_service";
import { DoctorWorkspaceService } from "../../../_doctor_services/doctor_workspace_service";
import { useEncounterStore } from "../../../_doctor_stores/encounter_store";
import { PatientProfileService } from "@/app/(patient)/_patient_services/patient_profile_service";
import { CdssService } from "@/app/(cdss)/_cdss_services/cdss_service";
import { useCdssStore } from "@/app/(cdss)/_cdss_stores/cdss_store";
import { ClinicalAlert } from "@/app/(cdss)/_cdss_types/cdss_types";
import { MedicationHistoryItem } from "@/app/(patient)/_patient_types/emr_types";
import { usePharmacyStore } from "@/app/(pharmacy)/_pharmacy_stores/pharmacy_store";

const DRUG_CATALOG = [
  { value: "DRUG-001", label: "Tab Sorbitrate 5mg (Isosorbide Dinitrate)" },
  { value: "DRUG-002", label: "Tab Ecosprin 75mg (Aspirin)" },
  { value: "DRUG-003", label: "Tab Amlodipine 5mg" },
  { value: "DRUG-004", label: "Tab Metoprolol 25mg" },
  { value: "DRUG-005", label: "Inj Pantocid 40mg IV" },
  { value: "DRUG-006", label: "Tab Amoxicillin 500mg" },
  { value: "DRUG-007", label: "Cap Omeprazole 20mg" },
  { value: "DRUG-008", label: "Tab Paracetamol 650mg" },
  { value: "DRUG-009", label: "Tab Metformin 500mg" },
  { value: "DRUG-010", label: "Tab Atorvastatin 20mg" },
  { value: "DRUG-011", label: "Tab Warfarin 5mg" },
  { value: "DRUG-012", label: "Tab Sildenafil 50mg" },
];

const FREQ_OPTIONS = ["1-0-0","0-1-0","0-0-1","1-0-1","1-1-0","0-1-1","1-1-1","SOS","BD","TDS","QID"];
const DURATION_OPTIONS = [1,2,3,5,7,10,14,21,30,60,90];

export interface PharmacyStockValidation {
  status: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK" | "EXPIRED ONLY";
  availableQuantity: number;
  fefoBatchNumber?: string;
  fefoExpiryDate?: string;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isExpiredOnly: boolean;
  warningMessage?: string;
}

export function checkPharmacyInventory(drugIdOrName: string): PharmacyStockValidation {
  if (!drugIdOrName) {
    return {
      status: "IN STOCK",
      availableQuantity: 0,
      isLowStock: false,
      isOutOfStock: false,
      isExpiredOnly: false,
    };
  }

  const inventory = usePharmacyStore.getState().inventory || [];
  const todayStr = new Date().toISOString().split("T")[0];
  const search = drugIdOrName.toLowerCase();

  const matches = inventory.filter((item) => {
    return (
      item.drugCode?.toLowerCase() === search ||
      item.id?.toLowerCase() === search ||
      item.name?.toLowerCase().includes(search) ||
      (item.genericName && search.includes(item.genericName.toLowerCase())) ||
      (item.genericName && item.genericName.toLowerCase().includes(search)) ||
      (item.drugName && item.drugName.toLowerCase().includes(search))
    );
  });

  if (matches.length === 0) {
    return {
      status: "OUT OF STOCK",
      availableQuantity: 0,
      isLowStock: false,
      isOutOfStock: true,
      isExpiredOnly: false,
      warningMessage: "Pharmacy Warning: Selected medication is currently OUT OF STOCK in Central Pharmacy.",
    };
  }

  const expiredStock = matches.filter((item) => item.expiryDate <= todayStr || item.status === "EXPIRED");
  const validStock = matches.filter((item) => item.expiryDate > todayStr && item.stockQuantity > 0);

  const totalAvailable = validStock.reduce((sum, item) => sum + item.stockQuantity, 0);

  if (validStock.length === 0) {
    const hasExpiredEntries = expiredStock.some((item) => item.stockQuantity > 0 || item.status === "EXPIRED");
    if (hasExpiredEntries) {
      const nearestExpired = [...expiredStock].sort((a, b) => b.expiryDate.localeCompare(a.expiryDate))[0];
      return {
        status: "EXPIRED ONLY",
        availableQuantity: 0,
        fefoBatchNumber: nearestExpired?.batchNumber,
        fefoExpiryDate: nearestExpired?.expiryDate,
        isLowStock: false,
        isOutOfStock: false,
        isExpiredOnly: true,
        warningMessage: `Pharmacy Alert: All available batches in store are EXPIRED (Batch ${nearestExpired?.batchNumber || "N/A"}, Expired: ${nearestExpired?.expiryDate}). Prescribing permitted.`,
      };
    }
    return {
      status: "OUT OF STOCK",
      availableQuantity: 0,
      isLowStock: false,
      isOutOfStock: true,
      isExpiredOnly: false,
      warningMessage: "Pharmacy Warning: Selected medication is currently OUT OF STOCK in Central Pharmacy. Prescribing permitted (backorder created).",
    };
  }

  const fefoItem = [...validStock].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))[0];
  const reorderThreshold = fefoItem.reorderLevel || 50;
  const isLow = totalAvailable <= reorderThreshold;

  if (isLow) {
    return {
      status: "LOW STOCK",
      availableQuantity: totalAvailable,
      fefoBatchNumber: fefoItem.batchNumber,
      fefoExpiryDate: fefoItem.expiryDate,
      isLowStock: true,
      isOutOfStock: false,
      isExpiredOnly: false,
      warningMessage: `Pharmacy Warning: Stock is LOW (${totalAvailable} units remaining). FEFO Batch: ${fefoItem.batchNumber} (Exp: ${fefoItem.expiryDate}).`,
    };
  }

  return {
    status: "IN STOCK",
    availableQuantity: totalAvailable,
    fefoBatchNumber: fefoItem.batchNumber,
    fefoExpiryDate: fefoItem.expiryDate,
    isLowStock: false,
    isOutOfStock: false,
    isExpiredOnly: false,
  };
}

interface PrescriptionPaneProps {
  patientUhid?: string;
}

export const PrescriptionPane: React.FC<PrescriptionPaneProps> = ({ patientUhid = "P-2026-1049" }) => {
  const [isSigned, setIsSigned] = useState(false);
  const [sentToPharmacy, setSentToPharmacy] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [overrideModal, setOverrideModal] = useState(false);
  const [pendingDrugForm, setPendingDrugForm] = useState<{
    values: { drugId: string; frequency: string; durationDays: number; instructions?: string };
    rxItem: PrescriptionItem;
    alert: ClinicalAlert;
  } | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [form] = Form.useForm();

  const selectedDrugId = Form.useWatch("drugId", form);
  const selectedStockInfo = useMemo(() => checkPharmacyInventory(selectedDrugId), [selectedDrugId]);

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(() => {
    const enc = useEncounterStore.getState().getEncounter(patientUhid);
    return enc && enc.prescriptions.length > 0 ? enc.prescriptions : [];
  });

  useEffect(() => {
    const enc = useEncounterStore.getState().getEncounter(patientUhid);
    if (enc && enc.prescriptions.length > 0) {
      setPrescriptions(enc.prescriptions);
    }
  }, [patientUhid]);

  // Workspace context for safety checks
  const wsCtx = useMemo(() => {
    return DoctorWorkspaceService.getWorkspaceContext(patientUhid);
  }, [patientUhid]);

  // Real-time active drug interaction check across all current prescriptions + patient allergies + active meds
  const activeAlerts = useMemo(() => {
    const medHistoryItems: MedicationHistoryItem[] = prescriptions.map((p, idx) => ({
      id: `rx-${idx}`,
      drugName: p.drugName,
      dosage: p.dosage,
      frequency: p.frequency,
      durationDays: p.durationDays,
      prescribedDate: new Date().toISOString().split("T")[0],
      prescribedBy: "Dr. Rajesh Sharma",
      status: "ACTIVE",
    }));

    return CdssService.checkDrugInteractions(
      [...wsCtx.snapshot.currentMedications, ...medHistoryItems],
      wsCtx.snapshot.allergies
    );
  }, [prescriptions, wsCtx]);

  const criticalAlertCount = activeAlerts.filter((a) => a.severity === "CRITICAL").length;
  const warningAlertCount = activeAlerts.filter((a) => a.severity === "HIGH" || a.severity === "WARNING").length;

  const handleSign = () => {
    if (criticalAlertCount > 0) {
      message.error("Cannot sign encounter: Unresolved CRITICAL drug safety alert requires physician override.");
      return;
    }
    setIsSigned(true);
    const result = DoctorWorkspaceService.signAndLockEncounter(patientUhid);
    if (result.success) {
      setSentToPharmacy(true);
      message.success(result.message);
    } else {
      message.error(result.message);
    }
  };

  const handlePrint = () => {
    if (!isSigned) { message.error("Cannot print: prescription not yet signed by physician."); return; }
    window.print();
  };

  const handleSendToPharmacy = () => {
    if (!isSigned) { message.error("Sign the encounter first before sending to pharmacy."); return; }
    const rxId = `RX-${Math.floor(9000 + Math.random() * 1000)}`;
    const profile = PatientProfileService.getPatientProfile(patientUhid);
    const existing = JSON.parse(localStorage.getItem("hms_pharmacy_dispense") || "[]");
    existing.unshift({
      rxId,
      uhid: patientUhid,
      patientName: profile.fullName || "Patient",
      meds: prescriptions.map(p => p.drugName).join(", "),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("hms_pharmacy_dispense", JSON.stringify(existing));
    setSentToPharmacy(true);
    message.success(`e-Prescription ${rxId} sent to Pharmacy Dispensing Desk!`);
  };

  // Prescription Safety Interceptor pre-check + Pharmacy Inventory Validation
  const handleAddDrugSubmit = (values: { drugId: string; frequency: string; durationDays: number; instructions?: string }) => {
    const drug = DRUG_CATALOG.find(d => d.value === values.drugId);
    if (!drug) return;
    const parts = drug.label.split(" ");
    const dosage = parts[2] || "";
    const newRx: PrescriptionItem = {
      drugId: values.drugId + "_" + Date.now(),
      drugName: drug.label.split("(")[0].trim(),
      dosage,
      frequency: values.frequency as PrescriptionItem["frequency"],
      durationDays: values.durationDays,
      instructions: values.instructions || "",
    };

    // Pharmacy Stock Toast Notice (Non-blocking)
    const stockVal = checkPharmacyInventory(values.drugId);
    if (stockVal.status === "OUT OF STOCK") {
      message.warning(`Pharmacy Notice: ${newRx.drugName} is OUT OF STOCK. Prescribing permitted (backorder created).`);
    } else if (stockVal.status === "EXPIRED ONLY") {
      message.warning(`Pharmacy Notice: ${newRx.drugName} stock is EXPIRED. Prescribing permitted (urgent batch order required).`);
    } else if (stockVal.status === "LOW STOCK") {
      message.info(`Pharmacy Info: ${newRx.drugName} stock is LOW (${stockVal.availableQuantity} units left).`);
    }

    // Candidate medication list
    const candidateMeds: MedicationHistoryItem[] = [
      ...wsCtx.snapshot.currentMedications,
      ...prescriptions.map((p, idx) => ({
        id: `rx-${idx}`,
        drugName: p.drugName,
        dosage: p.dosage,
        frequency: p.frequency,
        durationDays: p.durationDays,
        prescribedDate: new Date().toISOString().split("T")[0],
        prescribedBy: "Dr. Rajesh Sharma",
        status: "ACTIVE" as const,
      })),
      {
        id: `candidate-${Date.now()}`,
        drugName: newRx.drugName,
        dosage: newRx.dosage,
        frequency: newRx.frequency,
        durationDays: newRx.durationDays,
        prescribedDate: new Date().toISOString().split("T")[0],
        prescribedBy: "Dr. Rajesh Sharma",
        status: "ACTIVE" as const,
      },
    ];

    // Check drug interactions against Patient360 & EMR allergies
    const candidateAlerts = CdssService.checkDrugInteractions(
      candidateMeds,
      wsCtx.snapshot.allergies
    );

    const criticalAlert = candidateAlerts.find((a) => a.severity === "CRITICAL");

    if (criticalAlert) {
      // Require override reason for CRITICAL alert
      setPendingDrugForm({ values, rxItem: newRx, alert: criticalAlert });
      setOverrideReason("");
      setOverrideModal(true);
      return;
    }

    const warningAlert = candidateAlerts.find((a) => a.severity === "HIGH" || a.severity === "WARNING");
    if (warningAlert) {
      message.warning(`SAFETY WARNING: ${warningAlert.title}. Prescription added with clinical warning tag.`);
    } else if (stockVal.status === "IN STOCK") {
      message.success(`${newRx.drugName} safety verified ✓ Added to prescription.`);
    }

    setPrescriptions(prev => [...prev, newRx]);
    setAddModal(false);
    form.resetFields();
  };

  const handleConfirmOverride = () => {
    if (!pendingDrugForm) return;
    if (!overrideReason.trim()) {
      message.error("Physician override reason is strictly mandatory for CRITICAL safety alerts.");
      return;
    }

    // Log CDSS override
    useCdssStore.getState().logOverride({
      uhid: patientUhid,
      doctorName: "Dr. Rajesh Sharma (Cardiology)",
      alertId: pendingDrugForm.alert.id,
      overrideReason: overrideReason.trim(),
    });

    setPrescriptions(prev => [...prev, pendingDrugForm.rxItem]);
    message.warning(`CRITICAL Alert Overridden by Physician. Reason logged to CDSS audit trail.`);
    setOverrideModal(false);
    setAddModal(false);
    setPendingDrugForm(null);
    setOverrideReason("");
    form.resetFields();
  };

  const handleRemoveDrug = (id: string) => {
    if (isSigned) { message.error("Cannot modify a signed prescription."); return; }
    setPrescriptions(prev => prev.filter(p => p.drugId !== id));
  };

  const columns = [
    { title: "Medication", dataIndex: "drugName", key: "drugName", render: (v: string) => <span className="font-medium text-slate-800">{v}</span> },
    { title: "Dose", dataIndex: "dosage", key: "dosage" },
    { title: "Frequency", dataIndex: "frequency", key: "frequency" },
    { title: "Days", dataIndex: "durationDays", key: "durationDays", render: (v: number) => `${v}d` },
    {
      title: "Pharmacy Stock",
      key: "stock",
      render: (_: unknown, r: PrescriptionItem) => {
        const info = checkPharmacyInventory(r.drugName || r.drugId);
        let color = "green";
        if (info.status === "LOW STOCK") color = "warning";
        if (info.status === "OUT OF STOCK") color = "error";
        if (info.status === "EXPIRED ONLY") color = "magenta";

        return (
          <div className="flex flex-col">
            <Tag color={color} className="w-fit text-[10px] font-semibold px-1.5 py-0.5">
              {info.status}
            </Tag>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {info.status === "OUT OF STOCK" || info.status === "EXPIRED ONLY"
                ? "0 units avail"
                : `${info.availableQuantity} avail · FEFO: ${info.fefoExpiryDate || "N/A"}`}
            </span>
          </div>
        );
      },
    },
    { title: "Instructions", dataIndex: "instructions", key: "instructions", render: (v: string) => <span className="text-xs text-slate-500">{v}</span> },
    {
      title: "",
      key: "del",
      render: (_: unknown, r: PrescriptionItem) =>
        !isSigned
          ? <button onClick={() => handleRemoveDrug(r.drugId)} className="text-rose-400 hover:text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
          : null,
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Pill className="w-4 h-4 text-purple-600" /> e-Prescription Workspace
        </h3>
        <div className="flex items-center gap-2">
          <HmsAiGeneratedBadge label="CDSS & Pharmacy Verified" />
          {!isSigned && (
            <button onClick={() => setAddModal(true)}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200">
              <Plus className="w-3 h-3" /> Add Drug
            </button>
          )}
        </div>
      </div>

      {/* Dynamic CDSS Prescription Safety Interceptor Banner */}
      {criticalAlertCount > 0 ? (
        <Alert
          message="CRITICAL SAFETY ALERT: Drug Interaction / Contraindication Detected!"
          description={
            <div className="space-y-1 text-xs">
              {activeAlerts.map((alt) => (
                <div key={alt.id} className="font-semibold text-rose-900 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{alt.title}: {alt.detail}</span>
                </div>
              ))}
            </div>
          }
          type="error"
          showIcon
          className="mb-3 text-xs"
        />
      ) : warningAlertCount > 0 ? (
        <Alert
          message="CDSS WARNING: Moderate Drug Interaction Alert"
          description={
            <div className="space-y-1 text-xs">
              {activeAlerts.map((alt) => (
                <div key={alt.id} className="text-amber-900 font-medium">
                  • {alt.title} — {alt.recommendedAction}
                </div>
              ))}
            </div>
          }
          type="warning"
          showIcon
          className="mb-3 text-xs"
        />
      ) : (
        <Alert
          message="CDSS Safety Interceptor: All Prescribed Medications Verified Safe ✓"
          description="Patient360 & EMR allergy registry cross-referenced. Zero severe drug-allergy or drug-drug contraindications."
          type="success"
          showIcon
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          className="mb-3 text-xs"
        />
      )}

      {/* Drug table */}
      <div className="flex-1 mb-3 overflow-x-auto">
        <Table columns={columns} dataSource={prescriptions} pagination={false} rowKey="drugId" size="small" />
      </div>

      {/* Signature / send panel */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        {!isSigned && (
          <Alert
            message="Signature Required (Rule 7)"
            description="Print & Pharmacy dispatch locked until physician signs."
            type="warning" showIcon icon={<ShieldAlert className="w-4 h-4 text-amber-600" />}
          />
        )}
        {isSigned && !sentToPharmacy && (
          <Alert message="Encounter Signed ✓ — Send to Pharmacy when ready" type="info" showIcon icon={<CheckCircle className="w-4 h-4 text-emerald-600" />} />
        )}
        {sentToPharmacy && (
          <Alert message="e-Prescription dispatched to Pharmacy Queue ✓" type="success" showIcon />
        )}

        <div className="flex flex-wrap justify-end gap-2 mt-2">
          <HmsButton onClick={handlePrint} disabled={!isSigned} variant="secondary" icon={<Printer className="w-4 h-4" />} size="sm">Print</HmsButton>
          <HmsButton onClick={handleSendToPharmacy} disabled={!isSigned || sentToPharmacy} variant="primary" icon={<Send className="w-4 h-4" />} size="sm">
            {sentToPharmacy ? "Sent to Pharmacy" : "Send to Pharmacy"}
          </HmsButton>
          <HmsButton onClick={handleSign} disabled={isSigned} variant="emerald" icon={<CheckCircle className="w-4 h-4" />} size="sm">
            {isSigned ? "Encounter Signed" : "Sign & Authorise"}
          </HmsButton>
        </div>
      </div>

      {/* Add Drug Modal */}
      <Modal title="Add Medication to Prescription" open={addModal} onCancel={() => setAddModal(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleAddDrugSubmit}>
          <Form.Item label="Drug / Medication" name="drugId" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={DRUG_CATALOG} placeholder="Search or select drug" size="large" />
          </Form.Item>

          {/* Pharmacy Inventory Validation Info Banner inside Modal */}
          {selectedDrugId && (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-purple-600" /> Pharmacy Store Inventory Check
                </span>
                <Tag
                  color={
                    selectedStockInfo.status === "IN STOCK"
                      ? "green"
                      : selectedStockInfo.status === "LOW STOCK"
                      ? "warning"
                      : selectedStockInfo.status === "OUT OF STOCK"
                      ? "error"
                      : "magenta"
                  }
                  className="font-bold text-xs"
                >
                  {selectedStockInfo.status}
                </Tag>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <strong>Available Qty:</strong>{" "}
                  <span className={selectedStockInfo.availableQuantity === 0 ? "text-rose-600 font-bold" : "text-slate-800 font-semibold"}>
                    {selectedStockInfo.availableQuantity} units
                  </span>
                </div>
                <div>
                  <strong>FEFO Batch Expiry:</strong>{" "}
                  <span className="text-slate-800 font-semibold">
                    {selectedStockInfo.fefoExpiryDate
                      ? `${selectedStockInfo.fefoBatchNumber || "Batch"} (${selectedStockInfo.fefoExpiryDate})`
                      : "N/A"}
                  </span>
                </div>
              </div>

              {selectedStockInfo.warningMessage && (
                <Alert
                  message={selectedStockInfo.warningMessage}
                  type={selectedStockInfo.status === "LOW STOCK" ? "warning" : "error"}
                  showIcon
                  className="text-xs p-2 mt-1"
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Frequency" name="frequency" rules={[{ required: true }]} initialValue="1-0-1">
              <Select options={FREQ_OPTIONS.map(f => ({ value: f, label: f }))} size="large" />
            </Form.Item>
            <Form.Item label="Duration (days)" name="durationDays" rules={[{ required: true }]} initialValue={5}>
              <Select options={DURATION_OPTIONS.map(d => ({ value: d, label: `${d} day${d > 1 ? "s" : ""}` }))} size="large" />
            </Form.Item>
          </div>

          <Form.Item label="Special Instructions" name="instructions">
            <Select placeholder="e.g. After meals, Before meals, At bedtime" size="large" allowClear
              options={["After meals","Before meals","At bedtime","With water","Sublingual","Empty stomach","With milk"].map(v => ({ value: v, label: v }))}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-2">
            <HmsButton variant="secondary" onClick={() => setAddModal(false)}>Cancel</HmsButton>
            <HmsButton type="primary" htmlType="submit" variant="primary">Add to Prescription</HmsButton>
          </div>
        </Form>
      </Modal>

      {/* CRITICAL Safety Alert Override Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-700 font-bold">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>CRITICAL Safety Interceptor — Physician Override Required</span>
          </div>
        }
        open={overrideModal}
        onCancel={() => {
          setOverrideModal(false);
          setPendingDrugForm(null);
        }}
        footer={null}
        destroyOnClose
      >
        {pendingDrugForm && (
          <div className="space-y-4">
            <Alert
              message={pendingDrugForm.alert.title}
              description={
                <div className="space-y-1 text-xs">
                  <div><strong>Detail:</strong> {pendingDrugForm.alert.detail}</div>
                  <div><strong>Recommended Action:</strong> {pendingDrugForm.alert.recommendedAction}</div>
                </div>
              }
              type="error"
              showIcon
            />

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-900">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Clinical Safety Rule
              </div>
              <p>Prescribing a drug with a CRITICAL safety alert requires explicit medical justification. Your override reason will be permanently recorded in the CDSS Audit Log.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physician Override Rationale <span className="text-rose-500">*</span>
              </label>
              <Input.TextArea
                rows={3}
                placeholder="e.g. Patient evaluated in OPD; benefits outweigh risk under close cardiac monitoring..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <HmsButton
                variant="secondary"
                onClick={() => {
                  setOverrideModal(false);
                  setPendingDrugForm(null);
                }}
              >
                Cancel & Change Drug
              </HmsButton>
              <HmsButton
                variant="emerald"
                onClick={handleConfirmOverride}
                disabled={!overrideReason.trim()}
              >
                Confirm Override & Prescribe
              </HmsButton>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};


