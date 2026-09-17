"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, message } from "antd";
import { Microscope, Barcode, CheckCircle2, Plus, AlertTriangle, RefreshCw, Calendar, TestTube } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useLabStore, SpecimenRecord } from "../../_lab_stores/lab_store";

export const SpecimenCollectionQueue: React.FC = () => {
  const { specimens, updateSpecimenStatus, addSpecimen, resetToDefaults } = useLabStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const payload = {
      patientName: values.patientName as string,
      uhid: (values.uhid as string) || "P-2026-9900",
      testName: values.testName as string,
      containerType: values.containerType as SpecimenRecord["containerType"],
      collectionTime: new Date().toLocaleString(),
      collectedBy: "Phlebotomist Duty Desk",
      status: "COLLECTED_DISPATCHED" as const,
    };

    addSpecimen(payload);
    message.success(`Sample barcode generated and collected for ${payload.patientName}`);
    setModalOpen(false);
  };

  const columns = [
    {
      title: "Sample Barcode",
      dataIndex: "sampleBarcode",
      key: "sampleBarcode",
      render: (code: string) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded border border-purple-100">
          <Barcode className="w-4 h-4 text-purple-600" /> {code}
        </div>
      ),
    },
    {
      title: "Patient Details",
      key: "patient",
      render: (_: unknown, record: SpecimenRecord) => (
        <div>
          <span className="font-bold text-slate-900">{record.patientName}</span>
          <p className="text-xs text-slate-500">UHID: <span className="font-mono">{record.uhid}</span></p>
        </div>
      ),
    },
    {
      title: "Test & Container Tube",
      key: "test",
      render: (_: unknown, record: SpecimenRecord) => {
        let tubeColor = "purple";
        if (record.containerType === "SERUM_RED") tubeColor = "red";
        if (record.containerType === "CITRATE_BLUE") tubeColor = "blue";
        if (record.containerType === "URINE_CONTAINER") tubeColor = "gold";

        return (
          <div>
            <span className="font-semibold text-xs text-slate-900">{record.testName}</span>
            <div className="mt-1">
              <Tag color={tubeColor} className="font-bold text-3xs flex items-center gap-1 inline-flex">
                <TestTube className="w-3 h-3" /> {record.containerType.replace("_", " ")}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: "Collection Time & Tech",
      key: "time",
      render: (_: unknown, record: SpecimenRecord) => (
        <div className="text-3xs font-mono text-slate-500">
          <div>{record.collectionTime}</div>
          <div className="text-slate-700 font-semibold">{record.collectedBy}</div>
        </div>
      ),
    },
    {
      title: "Sample Status",
      dataIndex: "status",
      key: "status",
      render: (s: SpecimenRecord["status"], record: SpecimenRecord) => {
        return (
          <Select
            value={s}
            onChange={(val) => updateSpecimenStatus(record.id, val)}
            className="w-44"
            size="small"
          >
            <Select.Option value="PENDING_COLLECTION">PENDING COLLECTION</Select.Option>
            <Select.Option value="COLLECTED_DISPATCHED">COLLECTED & DISPATCHED</Select.Option>
            <Select.Option value="ANALYZER_RUNNING">ANALYZER RUNNING</Select.Option>
            <Select.Option value="REJECTED">REJECTED (HEMOLYZED)</Select.Option>
          </Select>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Samples Collected Today</p>
              <h3 className="text-2xl font-bold text-purple-800 mt-1">{specimens.length} Specimens</h3>
            </div>
            <TestTube className="w-8 h-8 text-purple-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Analyzer Auto-Comm</p>
              <h3 className="text-2xl font-bold text-teal-700 mt-1">
                {specimens.filter((s) => s.status === "ANALYZER_RUNNING").length} Active Runs
              </h3>
            </div>
            <Microscope className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Barcodes Scanned</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">100% Barcoded</h3>
            </div>
            <Barcode className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>
      </div>

      {/* Control Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-purple-600" /> Phlebotomy Sample Collection & Barcoding Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate tube barcode labels (EDTA / Serum), track specimen collection, and dispatch to automated analyzers.
          </p>
        </div>

        <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Collect New Sample
        </HmsButton>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={specimens} rowKey="id" pagination={false} />
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-purple-700">
            <Barcode className="w-5 h-5 text-purple-600" />
            <span>Phlebotomy Sample Collection & Barcoding</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <Form.Item label="Patient Name" name="patientName" rules={[{ required: true }]}>
            <Input placeholder="Sunil Verma" size="large" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="UHID" name="uhid" initialValue="P-2026-9912">
              <Input />
            </Form.Item>

            <Form.Item label="Test Name" name="testName" rules={[{ required: true }]}>
              <Input placeholder="e.g. Complete Blood Count (CBC)" size="large" />
            </Form.Item>
          </div>

          <Form.Item label="Container Tube Type" name="containerType" rules={[{ required: true }]}>
            <Select size="large">
              <Select.Option value="EDTA_PURPLE">EDTA Purple Top (Hematology / CBC)</Select.Option>
              <Select.Option value="SERUM_RED">Serum Red Top (Biochemistry / K+)</Select.Option>
              <Select.Option value="URINE_CONTAINER">Sterile Urine Container</Select.Option>
              <Select.Option value="CITRATE_BLUE">Sodium Citrate Blue Top (Coagulation / PT-INR)</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit">
              Print Barcode & Collect Sample
            </HmsButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
