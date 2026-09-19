"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, DatePicker, message, Progress } from "antd";
import { Award, ShieldCheck, Plus, CheckCircle2, AlertTriangle, Calendar, FileText, Download } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";

interface AccreditationRecord {
  id: string;
  type: "NABH" | "NABL" | "ISO" | "AERB" | "FIRE_SAFETY" | "JCI";
  title: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: "VALID" | "EXPIRING_SOON" | "EXPIRED";
  auditScorePercent: number;
}

export const AccreditationComplianceManager: React.FC = () => {
  const [accreditations, setAccreditations] = useState<AccreditationRecord[]>([
    {
      id: "acc-1",
      type: "NABH",
      title: "NABH Full Hospital Accreditation (5th Edition)",
      certificateNumber: "NABH-HOSP-2024-0182",
      issuingAuthority: "National Accreditation Board for Hospitals & Healthcare Providers",
      issueDate: "2024-04-01",
      expiryDate: "2028-03-31",
      status: "VALID",
      auditScorePercent: 96,
    },
    {
      id: "acc-2",
      type: "NABL",
      title: "NABL Medical Laboratory Standard ISO 15189",
      certificateNumber: "NABL-LAB-2025-9921",
      issuingAuthority: "National Accreditation Board for Testing & Calibration Labs",
      issueDate: "2025-01-15",
      expiryDate: "2027-01-14",
      status: "VALID",
      auditScorePercent: 94,
    },
    {
      id: "acc-3",
      type: "AERB",
      title: "AERB Diagnostic Radiology & CT Clearance",
      certificateNumber: "AERB-RAD-2023-4410",
      issuingAuthority: "Atomic Energy Regulatory Board India",
      issueDate: "2023-06-01",
      expiryDate: "2026-11-30",
      status: "EXPIRING_SOON",
      auditScorePercent: 88,
    },
    {
      id: "acc-4",
      type: "FIRE_SAFETY",
      title: "No Objection Certificate (NOC) Fire Safety",
      certificateNumber: "MC-FIRE-NOC-2026-11",
      issuingAuthority: "Municipal Corporation Fire Department",
      issueDate: "2026-01-01",
      expiryDate: "2026-12-31",
      status: "VALID",
      auditScorePercent: 100,
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const newRecord: AccreditationRecord = {
      id: `acc-${Date.now()}`,
      type: values.type as AccreditationRecord["type"],
      title: values.title as string,
      certificateNumber: values.certificateNumber as string,
      issuingAuthority: values.issuingAuthority as string,
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: values.expiryDate ? (values.expiryDate as { format: (f: string) => string }).format("YYYY-MM-DD") : "2028-12-31",
      status: "VALID",
      auditScorePercent: 95,
    };
    setAccreditations((prev) => [newRecord, ...prev]);
    message.success(`Accreditation ${newRecord.title} recorded successfully!`);
    setModalOpen(false);
  };

  const columns = [
    {
      title: "Accreditation Type & Title",
      key: "title",
      render: (_: unknown, record: AccreditationRecord) => (
        <div>
          <div className="flex items-center gap-2">
            <Tag color="purple">{record.type}</Tag>
            <span className="font-bold text-slate-900">{record.title}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{record.issuingAuthority}</p>
        </div>
      ),
    },
    {
      title: "Certificate #",
      dataIndex: "certificateNumber",
      key: "certificateNumber",
      render: (cert: string) => <span className="font-mono text-xs font-semibold text-slate-700">{cert}</span>,
    },
    {
      title: "Validity Period",
      key: "validity",
      render: (_: unknown, record: AccreditationRecord) => (
        <div className="text-xs space-y-0.5 font-mono">
          <div className="flex items-center gap-1 text-slate-600">
            <Calendar className="w-3 h-3 text-slate-400" /> Issued: {record.issueDate}
          </div>
          <div className="flex items-center gap-1 text-slate-800 font-bold">
            Expires: {record.expiryDate}
          </div>
        </div>
      ),
    },
    {
      title: "Compliance Score",
      dataIndex: "auditScorePercent",
      key: "auditScorePercent",
      render: (score: number) => (
        <div className="w-32">
          <Progress percent={score} size="small" status={score >= 90 ? "success" : "active"} />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: AccreditationRecord["status"]) => {
        if (s === "VALID") return <Tag color="emerald" className="font-bold"><CheckCircle2 className="w-3 h-3 inline mr-1" /> VALID</Tag>;
        if (s === "EXPIRING_SOON") return <Tag color="gold" className="font-bold"><AlertTriangle className="w-3 h-3 inline mr-1" /> EXPIRING SOON</Tag>;
        return <Tag color="rose" className="font-bold">EXPIRED</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-purple-600">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Accreditations</p>
              <h3 className="text-2xl font-bold text-purple-800 mt-1">{accreditations.length} Certificates</h3>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">NABH Quality Score</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">96% Compliant</h3>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Renewals Pending</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {accreditations.filter((a) => a.status === "EXPIRING_SOON").length} Due Soon
              </h3>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
        </HmsCard>
      </div>

      {/* Main Table Container */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" /> NABH / NABL / ISO Accreditation Records
          </h3>

          <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)} className="w-full sm:w-auto">
            Add Accreditation
          </HmsButton>
        </div>

        <div className="w-full overflow-x-auto">
          <Table columns={columns} dataSource={accreditations} rowKey="id" pagination={false} scroll={{ x: "max-content" }} />
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-purple-700">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Add Accreditation / Quality Certificate</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <Form.Item label="Accreditation Category" name="type" rules={[{ required: true }]}>
            <Select size="large">
              <Select.Option value="NABH">NABH (National Accreditation Board for Hospitals)</Select.Option>
              <Select.Option value="NABL">NABL (National Accreditation Board for Testing Labs)</Select.Option>
              <Select.Option value="ISO">ISO 9001:2015 Quality Management</Select.Option>
              <Select.Option value="AERB">AERB Radiation & X-Ray Clearance</Select.Option>
              <Select.Option value="FIRE_SAFETY">Fire Safety NOC Clearance</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Accreditation / Certificate Title" name="title" rules={[{ required: true }]}>
            <Input placeholder="e.g. NABH Full Hospital Accreditation" size="large" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Certificate Registration #" name="certificateNumber" rules={[{ required: true }]}>
              <Input placeholder="NABH-HOSP-2026-99" />
            </Form.Item>

            <Form.Item label="Issuing Authority Body" name="issuingAuthority" rules={[{ required: true }]}>
              <Input placeholder="NABH Secretariat New Delhi" />
            </Form.Item>
          </div>

          <Form.Item label="Certificate Expiry Date" name="expiryDate">
            <DatePicker className="w-full" size="large" />
          </Form.Item>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit" className="w-full sm:w-auto">
              Save Certificate
            </HmsButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
