"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, message } from "antd";
import { CreditCard, Plus, ArrowLeft, Building2, AlertTriangle, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useBillingStore, AdvanceDepositRecord } from "../../_billing_stores/billing_store";

export default function DepositLedgerPage() {
  const { advanceDeposits, recordAdvanceDeposit } = useBillingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateDeposit = (values: {
    patientUhid: string;
    patientName: string;
    roomBedNo: string;
    admissionDate: string;
    initialDeposit: number;
  }) => {
    recordAdvanceDeposit({
      depositNo: `DEP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientUhid: values.patientUhid,
      patientName: values.patientName,
      roomBedNo: values.roomBedNo,
      admissionDate: values.admissionDate || new Date().toISOString().split("T")[0],
      initialDeposit: values.initialDeposit,
      roomCharges: 0,
      nursingCharges: 0,
      labCharges: 0,
      pharmacyCharges: 0,
    });
    message.success(`Advance Deposit of ₹${values.initialDeposit} recorded for ${values.patientName}!`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "Deposit #",
      dataIndex: "depositNo",
      key: "depositNo",
      render: (num: string) => <span className="font-mono font-bold text-teal-700">{num}</span>,
    },
    {
      title: "Patient UHID & Name",
      key: "patient",
      render: (_: unknown, record: AdvanceDepositRecord) => (
        <div>
          <span className="font-bold text-slate-900 block">{record.patientName}</span>
          <span className="text-xs font-mono text-slate-500">{record.patientUhid} ({record.roomBedNo})</span>
        </div>
      ),
    },
    {
      title: "Initial Deposit",
      dataIndex: "initialDeposit",
      key: "initialDeposit",
      render: (amt: number) => <span className="font-bold text-emerald-800 font-mono">₹{amt.toLocaleString()}</span>,
    },
    {
      title: "Utilized Charges Ledger",
      key: "ledger",
      render: (_: unknown, record: AdvanceDepositRecord) => {
        const totalUtilized = record.roomCharges + record.nursingCharges + record.labCharges + record.pharmacyCharges;
        return (
          <div className="text-xs space-y-0.5">
            <p>Room: <span className="font-mono">₹{record.roomCharges}</span> | Nursing: <span className="font-mono">₹{record.nursingCharges}</span></p>
            <p>Lab: <span className="font-mono">₹{record.labCharges}</span> | Pharma: <span className="font-mono">₹{record.pharmacyCharges}</span></p>
            <p className="font-semibold text-slate-700 pt-0.5 border-t">Total Consumed: <span className="font-mono text-rose-700">₹{totalUtilized.toLocaleString()}</span></p>
          </div>
        );
      },
    },
    {
      title: "Current Remaining Balance",
      dataIndex: "currentBalance",
      key: "currentBalance",
      render: (bal: number) => (
        <span className={`font-mono font-bold text-base ${bal < 5000 ? "text-rose-600" : "text-emerald-700"}`}>
          ₹{bal.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/billing" className="text-slate-500 hover:text-slate-700 text-xs flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Billing Desk
          </Link>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-teal-600" />
            IPD Patient Advance Deposit & Running Ledger Desk
          </h1>
          <p className="text-xs text-slate-500">Track advance deposits collected during admission and auto-deduct daily IPD charges.</p>
        </div>
        <HmsButton
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Collect IPD Advance Deposit
        </HmsButton>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table columns={columns} dataSource={advanceDeposits} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Deposit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b pb-3 pr-6">
            <CreditCard className="w-5 h-5 text-teal-600" />
            <span>Record IPD Patient Advance Deposit</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateDeposit} className="pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Patient UHID" name="patientUhid" rules={[{ required: true }]}>
              <Input placeholder="P-2026-1058" className="font-mono uppercase" />
            </Form.Item>
            <Form.Item label="Patient Name" name="patientName" rules={[{ required: true }]}>
              <Input placeholder="Ramesh Kumar" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Room / Bed Ward" name="roomBedNo" rules={[{ required: true }]} initialValue="ICU Bed-04">
              <Input placeholder="ICU Bed-04" />
            </Form.Item>
            <Form.Item label="Admission Date" name="admissionDate" initialValue="2026-09-18">
              <Input type="date" />
            </Form.Item>
          </div>

          <Form.Item label="Initial Advance Deposit Amount (₹)" name="initialDeposit" rules={[{ required: true }]} initialValue={25000}>
            <InputNumber className="w-full" min={1000} step={1000} size="large" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Collect Deposit & Issue Receipt
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
