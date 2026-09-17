"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, Switch, message } from "antd";
import { BedDouble, Plus, CheckCircle2, User, DollarSign, ShieldCheck, Building2, Calendar, Search } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useIpdStore, IpdAdmissionRecord } from "../../_ipd_stores/ipd_store";

export const IpdAdmissionDesk: React.FC = () => {
  const { admissions, addAdmission, resetToDefaults } = useIpdStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const payload = {
      uhid: (values.uhid as string) || "P-2026-9900",
      patientName: values.patientName as string,
      age: Number(values.age) || 45,
      gender: (values.gender as string) || "Male",
      admittedWard: values.admittedWard as string,
      bedNumber: values.bedNumber as string,
      attendingDoctor: values.attendingDoctor as string,
      admissionDate: new Date().toISOString().split("T")[0],
      initialDepositAmount: Number(values.initialDepositAmount) || 10000,
      tpaCashlessApproved: Boolean(values.tpaCashlessApproved),
    };

    addAdmission(payload);
    message.success(`Inpatient ${payload.patientName} admitted to ${payload.bedNumber}`);
    setModalOpen(false);
  };

  const filteredAdmissions = admissions.filter(
    (a) =>
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Admission # & Bed",
      key: "bed",
      render: (_: unknown, record: IpdAdmissionRecord) => (
        <div>
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {record.bedNumber}
          </span>
          <p className="text-3xs text-slate-400 font-mono mt-1">{record.admissionNo}</p>
        </div>
      ),
    },
    {
      title: "Patient Details",
      key: "patient",
      render: (_: unknown, record: IpdAdmissionRecord) => (
        <div>
          <span className="font-bold text-slate-900">{record.patientName}</span>
          <p className="text-xs text-slate-500">
            {record.age} Yrs / {record.gender} | UHID: <span className="font-mono">{record.uhid}</span>
          </p>
        </div>
      ),
    },
    {
      title: "Ward & Attending Doctor",
      key: "ward",
      render: (_: unknown, record: IpdAdmissionRecord) => (
        <div>
          <span className="font-semibold text-xs text-slate-900">{record.admittedWard}</span>
          <p className="text-3xs text-slate-500 mt-0.5">Doctor: <strong className="text-teal-800">{record.attendingDoctor}</strong></p>
        </div>
      ),
    },
    {
      title: "Admission Deposit & TPA",
      key: "deposit",
      render: (_: unknown, record: IpdAdmissionRecord) => (
        <div className="text-xs font-mono">
          <div className="font-bold text-emerald-800">Deposit: ₹ {record.initialDepositAmount.toLocaleString()}</div>
          <div className="text-3xs mt-0.5">
            {record.tpaCashlessApproved ? (
              <Tag color="purple" className="text-3xs font-bold">TPA CASHLESS APPROVED</Tag>
            ) : (
              <Tag color="blue" className="text-3xs">SELF PAY PATIENT</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: IpdAdmissionRecord["status"]) => {
        if (s === "DISCHARGE_PENDING") return <Tag color="orange" className="font-bold text-3xs">DISCHARGE PENDING</Tag>;
        if (s === "DISCHARGED") return <Tag color="blue" className="font-bold text-3xs">DISCHARGED</Tag>;
        return <Tag color="emerald" className="font-bold text-3xs">ADMITTED INPATIENT</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Inpatients</p>
              <h3 className="text-2xl font-bold text-teal-800 mt-1">{admissions.length} Admitted</h3>
            </div>
            <BedDouble className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">TPA Cashless Admissions</p>
              <h3 className="text-2xl font-bold text-purple-800 mt-1">
                {admissions.filter((a) => a.tpaCashlessApproved).length} Approved
              </h3>
            </div>
            <ShieldCheck className="w-8 h-8 text-purple-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Initial Deposits Collected</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                ₹ {admissions.reduce((acc, a) => acc + a.initialDepositAmount, 0).toLocaleString()}
              </h3>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>
      </div>

      {/* Control Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-teal-600" /> Inpatient Admission Desk & Bed Placement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new inpatient admissions, assign ward beds, record initial advance deposits, and verify TPA cashless approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search patient, bed # or admission..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Admit New Patient
          </HmsButton>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={filteredAdmissions} rowKey="id" pagination={false} />
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <BedDouble className="w-5 h-5 text-teal-600" />
            <span>New Inpatient Admission & Bed Allocation</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <Form.Item label="Patient Full Name" name="patientName" rules={[{ required: true }]}>
            <Input placeholder="e.g. Sunil Verma" size="large" />
          </Form.Item>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item label="UHID" name="uhid" initialValue="P-2026-9912">
              <Input />
            </Form.Item>

            <Form.Item label="Age (Years)" name="age" initialValue={42}>
              <InputNumber min={1} max={120} className="w-full" />
            </Form.Item>

            <Form.Item label="Gender" name="gender" initialValue="Male">
              <Select>
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Admitted Ward" name="admittedWard" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</Select.Option>
                <Select.Option value="Female Surgical Ward 3B">Female Surgical Ward 3B</Select.Option>
                <Select.Option value="Private Deluxe Wing 4th Floor">Private Deluxe Wing 4th Floor</Select.Option>
                <Select.Option value="General Male Ward 2A">General Male Ward 2A</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Assigned Bed #" name="bedNumber" rules={[{ required: true }]}>
              <Input placeholder="ICU-BED-01" size="large" />
            </Form.Item>
          </div>

          <Form.Item label="Attending Consultant Doctor" name="attendingDoctor" rules={[{ required: true }]}>
            <Select size="large">
              <Select.Option value="Dr. Rajesh Sharma (DM Cardio)">Dr. Rajesh Sharma (DM Cardio)</Select.Option>
              <Select.Option value="Dr. Manoj Patil (MS Ortho)">Dr. Manoj Patil (MS Ortho)</Select.Option>
              <Select.Option value="Dr. Priya Nair (MD)">Dr. Priya Nair (MD)</Select.Option>
              <Select.Option value="Dr. Sameer Khan (EM Physician)">Dr. Sameer Khan (EM Physician)</Select.Option>
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Initial Advance Deposit (₹)" name="initialDepositAmount" initialValue={20000}>
              <InputNumber min={0} max={500000} className="w-full" size="large" />
            </Form.Item>

            <Form.Item label="TPA Cashless Pre-Approval" name="tpaCashlessApproved" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit">
              Complete Admission & Assign Bed
            </HmsButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
