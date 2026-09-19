"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, message } from "antd";
import { Receipt, Plus, ArrowLeft, ShieldCheck, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useBillingStore, CreditNoteRecord } from "../../_billing_stores/billing_store";

export default function RefundVouchersPage() {
  const { creditNotes, invoices, issueCreditNote } = useBillingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCn, setActiveCn] = useState<CreditNoteRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleIssueCreditNote = (values: {
    invoiceNumber: string;
    refundAmount: number;
    reason: string;
    approvedBy: string;
    refundMode: "CASH" | "UPI" | "BANK_TRANSFER";
  }) => {
    const invMatch = invoices.find((i) => i.invoiceNumber === values.invoiceNumber);
    const newCn = issueCreditNote({
      invoiceNumber: values.invoiceNumber,
      patientUhid: invMatch ? invMatch.patientUhid : "P-REFUND",
      patientName: invMatch ? invMatch.patientName : "Patient Refund",
      refundAmount: values.refundAmount,
      reason: values.reason,
      approvedBy: values.approvedBy,
      refundMode: values.refundMode,
    });
    message.success(`Credit Note ${newCn.creditNoteNo} issued! Refund of ₹${values.refundAmount} processed.`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "Credit Note #",
      dataIndex: "creditNoteNo",
      key: "creditNoteNo",
      render: (num: string) => <span className="font-mono font-bold text-rose-700">{num}</span>,
    },
    {
      title: "Original Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (num: string) => <span className="font-mono text-teal-700">{num}</span>,
    },
    {
      title: "Patient UHID & Name",
      key: "patient",
      render: (_: unknown, record: CreditNoteRecord) => (
        <div>
          <span className="font-bold text-slate-900 block">{record.patientName}</span>
          <span className="text-xs font-mono text-slate-500">{record.patientUhid}</span>
        </div>
      ),
    },
    {
      title: "Refund Amount",
      dataIndex: "refundAmount",
      key: "refundAmount",
      render: (amt: number) => <span className="font-bold text-rose-700 font-mono">₹{amt.toLocaleString()}</span>,
    },
    {
      title: "Reason & Approver",
      key: "reason",
      render: (_: unknown, record: CreditNoteRecord) => (
        <div className="text-xs max-w-xs truncate">
          <p className="font-medium text-slate-800">{record.reason}</p>
          <p className="text-slate-500">Approved by: <span className="font-semibold text-slate-700">{record.approvedBy}</span></p>
        </div>
      ),
    },
    {
      title: "Refund Mode",
      dataIndex: "refundMode",
      key: "refundMode",
      render: (mode: string) => <Tag color="purple">{mode}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color="green">{status}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: CreditNoteRecord) => (
        <HmsButton
          size="sm"
          variant="secondary"
          icon={<FileText className="w-3.5 h-3.5" />}
          onClick={() => {
            setActiveCn(record);
            setViewModalOpen(true);
          }}
        >
          View Voucher
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
            <Receipt className="w-6 h-6 text-rose-600" />
            Credit Notes & Refund Vouchers Desk
          </h1>
          <p className="text-xs text-slate-500">Issue supervisor-approved credit notes and refund vouchers for cancelled hospital services.</p>
        </div>
        <HmsButton
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Issue Credit Note Refund
        </HmsButton>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table columns={columns} dataSource={creditNotes} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Create Credit Note Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-700 font-bold border-b pb-3 pr-6">
            <Receipt className="w-5 h-5 text-rose-600" />
            <span>Issue Credit Note & Refund Voucher</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleIssueCreditNote} className="pt-2 text-xs">
          <Form.Item label="Target Invoice Number" name="invoiceNumber" rules={[{ required: true }]}>
            <Select placeholder="Select paid invoice...">
              {invoices.map((inv) => (
                <Select.Option key={inv.id} value={inv.invoiceNumber}>
                  {inv.invoiceNumber} - {inv.patientName} (₹{inv.totalAmount})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Refund Amount (₹)" name="refundAmount" rules={[{ required: true }]} initialValue={500}>
              <InputNumber className="w-full" min={1} size="large" />
            </Form.Item>
            <Form.Item label="Refund Mode" name="refundMode" rules={[{ required: true }]} initialValue="CASH">
              <Select size="large">
                <Select.Option value="CASH">Cash Counter Refund</Select.Option>
                <Select.Option value="UPI">UPI Reverse Transfer</Select.Option>
                <Select.Option value="BANK_TRANSFER">Direct Bank Transfer</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Reason for Refund / Cancellation" name="reason" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="e.g., Duplicate ECG test billed by mistake / Patient discharged early." />
          </Form.Item>

          <Form.Item label="Approval Supervisor Name" name="approvedBy" rules={[{ required: true }]} initialValue="Dr. Rajesh Sharma (Medical Supt.)">
            <Input />
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Issue Credit Note
            </button>
          </div>
        </Form>
      </Modal>

      {/* View Credit Note Voucher Modal */}
      {activeCn && (
        <Modal
          title={
            <div className="flex items-center gap-2 text-rose-700 font-bold border-b pb-2">
              <Receipt className="w-5 h-5 text-rose-600" />
              <span>OFFICIAL CREDIT NOTE VOUCHER ({activeCn.creditNoteNo})</span>
            </div>
          }
          open={viewModalOpen}
          onCancel={() => setViewModalOpen(false)}
          footer={[
            <button
              key="close"
              onClick={() => setViewModalOpen(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer mr-2"
            >
              Close
            </button>,
            <button
              key="print"
              onClick={() => {
                message.success(`Credit Note Voucher ${activeCn.creditNoteNo} sent to printer!`);
                setViewModalOpen(false);
              }}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer"
            >
              🖨 Print Refund Voucher PDF
            </button>,
          ]}
          width={480}
        >
          <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl my-3 space-y-3 font-mono text-xs">
            <div className="text-center border-b border-dashed border-rose-300 pb-3 space-y-0.5">
              <h3 className="font-bold text-rose-900 text-sm uppercase">HMS MEDICAL CENTER</h3>
              <p className="text-[11px] text-rose-700 font-bold">CREDIT NOTE / REFUND VOUCHER</p>
              <p className="text-[10px] text-slate-500">{activeCn.createdAt}</p>
            </div>

            <div className="space-y-1 text-slate-700 pt-1">
              <div className="flex justify-between">
                <span>Credit Note No:</span>
                <strong className="text-rose-700">{activeCn.creditNoteNo}</strong>
              </div>
              <div className="flex justify-between">
                <span>Original Invoice:</span>
                <strong className="text-slate-900">{activeCn.invoiceNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Patient UHID & Name:</span>
                <strong className="text-slate-900">{activeCn.patientName} ({activeCn.patientUhid})</strong>
              </div>
              <div className="flex justify-between">
                <span>Refund Mode:</span>
                <span className="font-bold text-slate-800">{activeCn.refundMode}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-rose-200 text-xs space-y-1">
              <p><strong>Reason:</strong> {activeCn.reason}</p>
              <p className="text-slate-500 mt-1"><strong>Approved By:</strong> {activeCn.approvedBy}</p>
            </div>

            <div className="flex justify-between font-bold text-sm text-rose-800 border-t border-rose-300 pt-2">
              <span>Total Refund Amount Paid:</span>
              <span className="text-base">₹{activeCn.refundAmount.toLocaleString()}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
