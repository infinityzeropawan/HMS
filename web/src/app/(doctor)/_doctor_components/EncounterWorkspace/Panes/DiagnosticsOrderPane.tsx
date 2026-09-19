"use client";

import React, { useState } from "react";
import { Form, Select, Tag, Input, Alert, message, Modal } from "antd";
import { Microscope, Plus, Activity, Trash2, CheckCircle, ShieldAlert } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { LabOrderInput, RadiologyOrderInput } from "../../../_doctor_types/encounter_types";
import { EncounterService } from "../../../_doctor_services/encounter_service";
import { DoctorOrderService } from "../../../_doctor_services/doctor_order_service";

interface DiagnosticsOrderPaneProps {
  patientUhid: string;
}

const PATHOLOGY_TESTS = [
  { id: "PATH-001", name: "Cardiac Biomarkers (Troponin I / T)", category: "PATHOLOGY" },
  { id: "PATH-002", name: "Serum Electrolytes (Na+, K+, Cl-)", category: "PATHOLOGY" },
  { id: "PATH-003", name: "Complete Blood Count (CBC)", category: "HEMATOLOGY" },
  { id: "PATH-004", name: "Lipid Profile (Cholesterol, Triglycerides)", category: "BIOCHEMISTRY" },
  { id: "PATH-005", name: "Liver Function Test (LFT)", category: "BIOCHEMISTRY" },
  { id: "PATH-006", name: "Renal Function Test (KFT)", category: "BIOCHEMISTRY" },
  { id: "PATH-007", name: "HbA1c Glycated Hemoglobin", category: "BIOCHEMISTRY" },
];

const RADIOLOGY_TESTS = [
  { id: "RAD-001", modality: "XRAY", studyName: "Digital Chest X-Ray (PA View)", bodyPart: "Chest" },
  { id: "RAD-002", modality: "ECG", studyName: "12-Lead Electrocardiogram", bodyPart: "Heart" },
  { id: "RAD-003", modality: "MRI", studyName: "Brain MRI with Contrast", bodyPart: "Head" },
  { id: "RAD-004", modality: "ULTRASOUND", studyName: "Abdomen & Pelvis USG", bodyPart: "Abdomen" },
  { id: "RAD-005", modality: "CT", studyName: "High Resolution CT Chest", bodyPart: "Chest" },
];

export const DiagnosticsOrderPane: React.FC<DiagnosticsOrderPaneProps> = ({ patientUhid }) => {
  const [labOrders, setLabOrders] = useState<LabOrderInput[]>([
    { testId: "PATH-001", testName: "Cardiac Biomarkers (Troponin I)", category: "PATHOLOGY", urgency: "URGENT", clinicalNotes: "Rule out acute myocardial infarction" },
  ]);

  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyOrderInput[]>([
    { orderId: "RAD-002", modality: "ECG", studyName: "12-Lead Electrocardiogram", bodyPart: "Heart", urgency: "URGENT", clinicalNotes: "ST-segment elevation check" },
  ]);

  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isRadModalOpen, setIsRadModalOpen] = useState(false);
  const [formLab] = Form.useForm();
  const [formRad] = Form.useForm();

  const handleAddLab = (values: { testId: string; urgency: "ROUTINE" | "URGENT" | "STAT"; notes?: string }) => {
    const test = PATHOLOGY_TESTS.find((t) => t.id === values.testId);
    if (!test) return;
    const newOrder: LabOrderInput = {
      testId: test.id,
      testName: test.name,
      category: test.category as LabOrderInput["category"],
      urgency: values.urgency,
      clinicalNotes: values.notes || "",
    };
    setLabOrders((prev) => [...prev, newOrder]);
    EncounterService.addLabOrder(patientUhid, newOrder);

    // Call DoctorOrderService to dispatch lab store, create billing draft, and sync timeline
    DoctorOrderService.createLabOrder(patientUhid, {
      testName: test.name,
      category: test.category,
      urgency: values.urgency,
      clinicalNotes: values.notes,
    });

    setIsLabModalOpen(false);
    formLab.resetFields();
    message.success(`${test.name} order added and dispatched to Lab & Billing.`);
  };

  const handleAddRad = (values: { radId: string; urgency: "ROUTINE" | "URGENT" | "STAT"; notes?: string }) => {
    const test = RADIOLOGY_TESTS.find((t) => t.id === values.radId);
    if (!test) return;
    const newOrder: RadiologyOrderInput = {
      orderId: test.id,
      modality: test.modality as RadiologyOrderInput["modality"],
      studyName: test.studyName,
      bodyPart: test.bodyPart,
      urgency: values.urgency,
      clinicalNotes: values.notes || "",
    };
    setRadiologyOrders((prev) => [...prev, newOrder]);
    EncounterService.addRadiologyOrder(patientUhid, newOrder);

    // Call DoctorOrderService to dispatch PACS store, create billing draft, and sync timeline
    DoctorOrderService.createRadiologyOrder(patientUhid, {
      modality: test.modality,
      studyName: test.studyName,
      bodyPart: test.bodyPart,
      urgency: values.urgency,
      clinicalNotes: values.notes,
    });

    setIsRadModalOpen(false);
    formRad.resetFields();
    message.success(`${test.studyName} radiology order added and dispatched to PACS & Billing.`);
  };

  const handleRemoveLab = (testId: string) => {
    setLabOrders((prev) => prev.filter((l) => l.testId !== testId));
  };

  const handleRemoveRad = (orderId: string) => {
    setRadiologyOrders((prev) => prev.filter((r) => r.orderId !== orderId));
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-y-auto space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Microscope className="w-4 h-4 text-teal-600" /> Diagnostics & Investigation Orders
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLabModalOpen(true)}
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200"
          >
            <Plus className="w-3 h-3" /> Add Lab Order
          </button>
          <button
            onClick={() => setIsRadModalOpen(true)}
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <Plus className="w-3 h-3" /> Add Radiology Scan
          </button>
        </div>
      </div>

      {/* Pathology Lab Orders List */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-teal-600" /> Pathology & Lab Orders ({labOrders.length})
        </h4>
        <div className="space-y-2">
          {labOrders.map((lab) => (
            <div key={lab.testId} className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900 block font-semibold">{lab.testName}</strong>
                <span className="text-[11px] text-slate-500">{lab.category} {lab.clinicalNotes && `• ${lab.clinicalNotes}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag color={lab.urgency === "STAT" ? "red" : lab.urgency === "URGENT" ? "orange" : "blue"}>{lab.urgency}</Tag>
                <button onClick={() => handleRemoveLab(lab.testId)} className="text-rose-500 hover:text-rose-700 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {labOrders.length === 0 && <p className="text-xs text-slate-400 italic">No pathology lab orders added.</p>}
        </div>
      </div>

      {/* Radiology Scan Orders List */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Microscope className="w-3.5 h-3.5 text-purple-600" /> Radiology & Imaging Orders ({radiologyOrders.length})
        </h4>
        <div className="space-y-2">
          {radiologyOrders.map((rad) => (
            <div key={rad.orderId} className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900 block font-semibold">{rad.studyName}</strong>
                <span className="text-[11px] text-slate-500">{rad.modality} ({rad.bodyPart}) {rad.clinicalNotes && `• ${rad.clinicalNotes}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag color={rad.urgency === "STAT" ? "red" : rad.urgency === "URGENT" ? "orange" : "purple"}>{rad.urgency}</Tag>
                <button onClick={() => handleRemoveRad(rad.orderId)} className="text-rose-500 hover:text-rose-700 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {radiologyOrders.length === 0 && <p className="text-xs text-slate-400 italic">No radiology scan orders added.</p>}
        </div>
      </div>

      {/* Add Lab Modal */}
      <Modal title="Order Laboratory Test" open={isLabModalOpen} onCancel={() => setIsLabModalOpen(false)} footer={null}>
        <Form form={formLab} layout="vertical" onFinish={handleAddLab} initialValues={{ urgency: "ROUTINE" }}>
          <Form.Item label="Select Lab Test" name="testId" rules={[{ required: true }]}>
            <Select showSearch options={PATHOLOGY_TESTS.map((t) => ({ value: t.id, label: `${t.name} (${t.category})` }))} size="large" />
          </Form.Item>
          <Form.Item label="Order Priority / Urgency" name="urgency" rules={[{ required: true }]}>
            <Select options={[{ value: "ROUTINE", label: "Routine" }, { value: "URGENT", label: "Urgent" }, { value: "STAT", label: "STAT (Emergency)" }]} size="large" />
          </Form.Item>
          <Form.Item label="Clinical Indications / Notes" name="notes">
            <Input.TextArea rows={2} placeholder="e.g. Patient reporting acute chest pain, check Troponin I" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <HmsButton variant="secondary" onClick={() => setIsLabModalOpen(false)}>Cancel</HmsButton>
            <HmsButton type="primary" htmlType="submit" variant="primary">Add Lab Order</HmsButton>
          </div>
        </Form>
      </Modal>

      {/* Add Radiology Modal */}
      <Modal title="Order Radiology & PACS Scan" open={isRadModalOpen} onCancel={() => setIsRadModalOpen(false)} footer={null}>
        <Form form={formRad} layout="vertical" onFinish={handleAddRad} initialValues={{ urgency: "ROUTINE" }}>
          <Form.Item label="Select Radiology Scan" name="radId" rules={[{ required: true }]}>
            <Select showSearch options={RADIOLOGY_TESTS.map((r) => ({ value: r.id, label: `${r.studyName} [${r.modality}]` }))} size="large" />
          </Form.Item>
          <Form.Item label="Order Priority / Urgency" name="urgency" rules={[{ required: true }]}>
            <Select options={[{ value: "ROUTINE", label: "Routine" }, { value: "URGENT", label: "Urgent" }, { value: "STAT", label: "STAT (Emergency)" }]} size="large" />
          </Form.Item>
          <Form.Item label="Clinical Indications / Notes" name="notes">
            <Input.TextArea rows={2} placeholder="e.g. Evaluate for cardiac enlargement or pleural effusion" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <HmsButton variant="secondary" onClick={() => setIsRadModalOpen(false)}>Cancel</HmsButton>
            <HmsButton type="primary" htmlType="submit" variant="primary">Add Radiology Order</HmsButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
