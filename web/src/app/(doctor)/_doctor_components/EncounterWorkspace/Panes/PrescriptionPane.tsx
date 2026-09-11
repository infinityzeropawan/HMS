"use client";

import React, { useState } from "react";
import { Table, Alert, message, Modal, Select, Form } from "antd";
import { Pill, Printer, CheckCircle, ShieldAlert, Plus, Send, Trash2 } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";
import { PrescriptionItem } from "../../../_doctor_schemas/encounter_schema";

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
];

const FREQ_OPTIONS = ["1-0-0","0-1-0","0-0-1","1-0-1","1-1-0","0-1-1","1-1-1","SOS","BD","TDS","QID"];
const DURATION_OPTIONS = [1,2,3,5,7,10,14,21,30,60,90];

export const PrescriptionPane: React.FC = () => {
  const [isSigned, setIsSigned] = useState(false);
  const [sentToPharmacy, setSentToPharmacy] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [form] = Form.useForm();

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { drugId: "DRUG-001", drugName: "Tab Sorbitrate 5mg",  dosage: "5mg",  frequency: "1-0-1", durationDays: 5,  instructions: "Sublingual after meals"       },
    { drugId: "DRUG-002", drugName: "Tab Ecosprin 75mg",   dosage: "75mg", frequency: "0-0-1", durationDays: 30, instructions: "At bedtime with water"         },
    { drugId: "DRUG-003", drugName: "Tab Amlodipine 5mg",  dosage: "5mg",  frequency: "1-0-0", durationDays: 30, instructions: "In the morning before meals"   },
  ]);

  const handleSign = () => {
    setIsSigned(true);
    // persist signed encounter
    const ts = new Date().toISOString();
    localStorage.setItem("hms_encounter_signed", JSON.stringify({ signedAt: ts, prescriptions }));
    message.success("Encounter signed & locked. e-Prescription authorised for print & pharmacy.");
  };

  const handlePrint = () => {
    if (!isSigned) { message.error("Cannot print: prescription not yet signed by physician."); return; }
    window.print();
  };

  const handleSendToPharmacy = () => {
    if (!isSigned) { message.error("Sign the encounter first before sending to pharmacy."); return; }
    const rxId = `RX-${Math.floor(9000 + Math.random() * 1000)}`;
    const existing = JSON.parse(localStorage.getItem("hms_pharmacy_queue") || "[]");
    existing.unshift({
      rxId,
      uhid: "P-2026-1049",
      patientName: "Sunil Verma",
      meds: prescriptions.map(p => p.drugName).join(", "),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("hms_pharmacy_queue", JSON.stringify(existing));
    setSentToPharmacy(true);
    message.success(`e-Prescription ${rxId} sent to Pharmacy Queue!`);
  };

  const handleAddDrug = (values: { drugId: string; frequency: string; durationDays: number; instructions?: string }) => {
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
    setPrescriptions(prev => [...prev, newRx]);
    setAddModal(false);
    form.resetFields();
    message.success(`${newRx.drugName} added to prescription`);
  };

  const handleRemoveDrug = (id: string) => {
    if (isSigned) { message.error("Cannot modify a signed prescription."); return; }
    setPrescriptions(prev => prev.filter(p => p.drugId !== id));
  };

  const columns = [
    { title: "Medication",  dataIndex: "drugName",     key: "drugName",  render: (v: string) => <span className="font-medium text-slate-800">{v}</span> },
    { title: "Dose",        dataIndex: "dosage",        key: "dosage"     },
    { title: "Frequency",   dataIndex: "frequency",     key: "frequency"  },
    { title: "Days",        dataIndex: "durationDays",  key: "durationDays", render: (v: number) => `${v}d` },
    { title: "Instructions",dataIndex: "instructions",  key: "instructions", render: (v: string) => <span className="text-xs text-slate-500">{v}</span> },
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
          <Pill className="w-4 h-4 text-purple-600" /> e-Prescription
        </h3>
        <div className="flex items-center gap-2">
          <HmsAiGeneratedBadge label="AI Dose Check" />
          {!isSigned && (
            <button onClick={() => setAddModal(true)}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200">
              <Plus className="w-3 h-3" /> Add Drug
            </button>
          )}
        </div>
      </div>

      {/* Allergy / interaction banner */}
      <Alert
        message="Drug Interaction Check: No severe interactions detected"
        description="Aspirin + Sorbitrate: safe combination. Amlodipine added — monitor BP."
        type="success" showIcon className="mb-3 text-xs"
      />

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
          <HmsButton onClick={handlePrint}           disabled={!isSigned}    variant="secondary"   icon={<Printer     className="w-4 h-4" />} size="sm">Print</HmsButton>
          <HmsButton onClick={handleSendToPharmacy}  disabled={!isSigned || sentToPharmacy} variant="primary" icon={<Send className="w-4 h-4" />} size="sm">
            {sentToPharmacy ? "Sent to Pharmacy" : "Send to Pharmacy"}
          </HmsButton>
          <HmsButton onClick={handleSign} disabled={isSigned} variant="emerald" icon={<CheckCircle className="w-4 h-4" />} size="sm">
            {isSigned ? "Encounter Signed" : "Sign & Authorise"}
          </HmsButton>
        </div>
      </div>

      {/* Add Drug Modal */}
      <Modal title="Add Medication to Prescription" open={addModal} onCancel={() => setAddModal(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleAddDrug}>
          <Form.Item label="Drug / Medication" name="drugId" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={DRUG_CATALOG} placeholder="Search or select drug" size="large" />
          </Form.Item>
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
    </div>
  );
};
