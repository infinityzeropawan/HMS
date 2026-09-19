"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, message } from "antd";
import { DollarSign, Search, ArrowLeft, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useBillingStore, OutstandingDueRecord } from "../../_billing_stores/billing_store";

export default function OutstandingDuesPage() {
  const { outstandingDues, collectOutstandingDue } = useBillingStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDue, setActiveDue] = useState<OutstandingDueRecord | null>(null);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCollectPayment = (values: { amount: number; paymentMode: "UPI" | "CASH" | "CARD" }) => {
    if (!activeDue) return;
    collectOutstandingDue(activeDue.invoiceNumber, values.amount, values.paymentMode);
    message.success(`Collected ₹${values.amount} for ${activeDue.patientName} (${activeDue.invoiceNumber}) via ${values.paymentMode}!`);
    setIsCollectModalOpen(false);
    setActiveDue(null);
    form.resetFields();
  };

  const filteredDues = outstandingDues.filter(
    (due) =>
      due.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      due.patientUhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      due.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstanding = outstandingDues.reduce((sum, item) => sum + item.outstandingBalance, 0);

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (num: string) => <span className="font-mono font-bold text-teal-700">{num}</span>,
    },
    {
      title: "Patient UHID & Name",
      key: "patient",
      render: (_: unknown, record: OutstandingDueRecord) => (
        <div>
          <span className="font-bold text-slate-900 block">{record.patientName}</span>
          <span className="text-xs font-mono text-slate-500">{record.patientUhid}</span>
        </div>
      ),
    },
    {
      title: "Department & Phone",
      key: "dept",
      render: (_: unknown, record: OutstandingDueRecord) => (
        <div className="text-xs">
          <span className="text-slate-800 font-semibold block">{record.department}</span>
          <span className="text-slate-500 font-mono">{record.phone}</span>
        </div>
      ),
    },
    {
      title: "Total Bill",
      dataIndex: "totalBillAmount",
      key: "totalBillAmount",
      render: (amt: number) => <span className="font-mono text-slate-700">₹{amt.toLocaleString()}</span>,
    },
    {
      title: "Paid Amount",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (amt: number) => <span className="font-mono text-emerald-700">₹{amt.toLocaleString()}</span>,
    },
    {
      title: "Outstanding Balance",
      dataIndex: "outstandingBalance",
      key: "outstandingBalance",
      render: (amt: number) => <span className="font-mono font-bold text-rose-700 text-sm">₹{amt.toLocaleString()}</span>,
    },
    {
      title: "Due Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "OVERDUE" ? "volcano" : "gold"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: OutstandingDueRecord) => (
        <HmsButton
          size="sm"
          type="primary"
          icon={<CreditCard className="w-3.5 h-3.5" />}
          onClick={() => {
            setActiveDue(record);
            form.setFieldsValue({ amount: record.outstandingBalance });
            setIsCollectModalOpen(true);
          }}
        >
          Collect Dues
        </HmsButton>
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
            <DollarSign className="w-6 h-6 text-rose-600" />
            Patient Outstanding Dues Recovery Desk
          </h1>
          <p className="text-xs text-slate-500">Track pending hospital bills, overdue accounts, and collect partial payments.</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-right">
          <span className="text-xs text-slate-500 font-semibold block">Total Outstanding Accounts Receivable</span>
          <span className="text-xl font-bold font-mono text-rose-700">₹{totalOutstanding.toLocaleString()}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
        <Input
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Search by Patient Name, UHID, or Invoice #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80"
          allowClear
        />
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          Pending Dues Accounts: {outstandingDues.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table columns={columns} dataSource={filteredDues} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Collect Dues Modal */}
      {activeDue && (
        <Modal
          title={
            <div className="flex items-center gap-2 text-slate-900 font-bold border-b pb-3 pr-6">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Collect Outstanding Dues ({activeDue.invoiceNumber})</span>
            </div>
          }
          open={isCollectModalOpen}
          onCancel={() => setIsCollectModalOpen(false)}
          footer={null}
          width={520}
        >
          <Form form={form} layout="vertical" onFinish={handleCollectPayment} className="pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 mb-4">
              <p className="font-bold text-slate-900 text-sm">{activeDue.patientName} ({activeDue.patientUhid})</p>
              <p className="text-slate-600">Department: {activeDue.department} | Phone: {activeDue.phone}</p>
              <div className="flex justify-between pt-2 border-t text-xs">
                <span>Total Bill: <strong>₹{activeDue.totalBillAmount}</strong></span>
                <span>Already Paid: <strong className="text-emerald-700">₹{activeDue.paidAmount}</strong></span>
                <span>Balance Due: <strong className="text-rose-700">₹{activeDue.outstandingBalance}</strong></span>
              </div>
            </div>

            <Form.Item label="Amount to Collect (₹)" name="amount" rules={[{ required: true }]}>
              <InputNumber className="w-full" min={1} max={activeDue.outstandingBalance} size="large" />
            </Form.Item>

            <Form.Item label="Payment Tender Mode" name="paymentMode" rules={[{ required: true }]} initialValue="UPI">
              <Select size="large">
                <Select.Option value="UPI">UPI / Dynamic QR Code</Select.Option>
                <Select.Option value="CASH">Cash Counter</Select.Option>
                <Select.Option value="CARD">Credit / Debit Card POS</Select.Option>
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsCollectModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Issue Payment Receipt
              </button>
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
}
