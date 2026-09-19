"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Tag, Input, Modal, message } from "antd";
import { Receipt, ShieldCheck, DollarSign, CreditCard, Search, Plus, TrendingUp, SlidersHorizontal, FileText, CheckCircle2 } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useBillingStore } from "../_billing_stores/billing_store";

interface InvoiceSummary {
  key: string;
  invoiceNo: string;
  patientName: string;
  uhid: string;
  serviceType: string;
  amount: number;
  gstAmount: number;
  paymentMode: string;
  status: "PAID" | "PENDING" | "CLAIM_SUBMITTED";
  date: string;
}

const INITIAL_INVOICES: InvoiceSummary[] = [
  { key: "1", invoiceNo: "INV-2026-01049", patientName: "Sunil Verma", uhid: "P-2026-1049", serviceType: "OPD Consultation & ECG", amount: 1250, gstAmount: 54, paymentMode: "UPI", status: "PAID", date: "2026-09-17 10:15 AM" },
  { key: "2", invoiceNo: "INV-2026-01052", patientName: "Anjali Gupta", uhid: "P-2026-1052", serviceType: "Pediatric Pharmacy & Lab", amount: 870, gstAmount: 42, paymentMode: "CASH", status: "PAID", date: "2026-09-17 10:45 AM" },
  { key: "3", invoiceNo: "INV-2026-01058", patientName: "Ramesh Kumar", uhid: "P-2026-1058", serviceType: "IPD Advance Deposit", amount: 25000, gstAmount: 0, paymentMode: "INSURANCE_TPA", status: "CLAIM_SUBMITTED", date: "2026-09-17 11:00 AM" },
  { key: "4", invoiceNo: "INV-2026-01062", patientName: "Priya Sharma", uhid: "P-2026-1062", serviceType: "Pathology CBC & Lipid Profile", amount: 1450, gstAmount: 120, paymentMode: "CARD", status: "PAID", date: "2026-09-16 04:20 PM" },
];

export default function BillingMainDashboard() {
  const { invoices: storeInvoices } = useBillingStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceSummary | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const mappedStoreInvoices: InvoiceSummary[] = storeInvoices.map((inv, idx) => ({
    key: inv.id || `inv-${idx}`,
    invoiceNo: inv.invoiceNumber,
    patientName: inv.patientName,
    uhid: inv.patientUhid,
    serviceType: inv.items?.[0]?.description || "Hospital Services & Line Items",
    amount: inv.totalAmount,
    gstAmount: (inv.cgstAmount || 0) + (inv.sgstAmount || 0),
    paymentMode: inv.paymentMode,
    status: inv.status === "CLAIM_SUBMITTED" ? "CLAIM_SUBMITTED" : inv.status === "PAID" ? "PAID" : "PENDING",
    date: inv.createdAt,
  }));

  const invoices = mappedStoreInvoices.length > 0 ? mappedStoreInvoices : INITIAL_INVOICES;

  const handleViewReceipt = (inv: InvoiceSummary) => {
    setSelectedInvoice(inv);
    setReceiptModalOpen(true);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.uhid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (val: string) => <span className="font-mono font-bold text-teal-700">{val}</span>,
    },
    {
      title: "Patient UHID & Name",
      key: "patient",
      render: (_: unknown, record: InvoiceSummary) => (
        <div>
          <strong className="text-slate-900 block">{record.patientName}</strong>
          <span className="text-xs font-mono text-slate-500">{record.uhid}</span>
        </div>
      ),
    },
    { title: "Service Particulars", dataIndex: "serviceType", key: "serviceType" },
    {
      title: "Gross Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => <span className="font-bold text-emerald-800 font-mono">₹{val.toLocaleString("en-IN")}</span>,
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
      render: (val: string) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={s === "PAID" ? "green" : s === "CLAIM_SUBMITTED" ? "purple" : "orange"}>
          {s.replace("_", " ")}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: InvoiceSummary) => (
        <HmsButton size="sm" variant="secondary" icon={<FileText className="w-3.5 h-3.5" />} onClick={() => handleViewReceipt(record)}>
          Receipt
        </HmsButton>
      ),
    },
  ];

  return (
    <HmsAppShell title="Billing & Financial Revenue Desk">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Receipt className="w-3.5 h-3.5" /> Central Billing & Cashier Desk
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Hospital Billing & Cashier Console
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                OPD/IPD Billing, GST Tax Invoices, TPA Pre-Authorization Cashless Clearances, and Tariffs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/invoices">
                <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />}>
                  Generate GST Invoice
                </HmsButton>
              </Link>
              <Link href="/claims">
                <HmsButton variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
                  TPA Insurance Claims
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Today&apos;s Collections</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">₹1,42,800</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">UPI / Cash / Card Verified</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">TPA Claims Active</p>
                <h3 className="text-2xl font-bold text-purple-800 mt-1">8 Pre-Auths</h3>
                <p className="text-3xs text-purple-600 font-semibold mt-0.5">₹3,27,000 In Process</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-purple-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Total GST Collected</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">₹14,520</h3>
                <p className="text-3xs text-slate-500 mt-0.5">CGST 9% + SGST 9%</p>
              </div>
              <Receipt className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Pending IPD Clearances</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">4 Unbilled</h3>
                <p className="text-3xs text-amber-600 font-semibold mt-0.5">Discharge Summary Ready</p>
              </div>
              <CreditCard className="w-8 h-8 text-amber-500" />
            </div>
          </HmsCard>
        </div>

        {/* Quick Workspaces Grid */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" /> Billing Modules & Financial Workspaces
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/invoices"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">GST Invoice Generator</h3>
                <p className="text-xs text-slate-500 mt-0.5">Itemized OPD/IPD bill creation & SAC tax codes.</p>
              </div>
            </Link>

            <Link
              href="/claims"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">TPA & Insurance Claims</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pre-authorization cashless claim settlements.</p>
              </div>
            </Link>

            <Link
              href="/billing/dues"
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Outstanding Dues Recovery</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track overdue accounts & collect partial dues.</p>
              </div>
            </Link>

            <Link
              href="/billing/deposit-ledger"
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-teal-100 text-teal-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">IPD Deposit Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">Advance deposit tracking & charge deduction.</p>
              </div>
            </Link>

            <Link
              href="/billing/refunds"
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Credit Notes & Refunds</h3>
                <p className="text-xs text-slate-500 mt-0.5">Supervisor-approved refund vouchers.</p>
              </div>
            </Link>

            <Link
              href="/tariffs"
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Service Tariff Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">OPD rates, bed charges & procedure master.</p>
              </div>
            </Link>

            <Link
              href="/revenue"
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200 group flex items-start gap-3"
            >
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Revenue Analytics</h3>
                <p className="text-xs text-slate-500 mt-0.5">Daily collections & doctor payout summaries.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Invoices Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" /> Recent Billing Transactions & Cash Receipts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Live register of patient billing transactions.</p>
            </div>
            <Input
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              placeholder="Search Invoice #, Patient Name, UHID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72"
              allowClear
            />
          </div>

          <Table columns={columns} dataSource={filteredInvoices} pagination={{ pageSize: 8 }} />
        </div>

        {/* Invoice Receipt Modal */}
        {selectedInvoice && (
          <Modal
            title={
              <div className="flex items-center gap-2 text-teal-700 font-bold border-b pb-2">
                <Receipt className="w-5 h-5 text-teal-600" />
                <span>GST Tax Invoice Receipt ({selectedInvoice.invoiceNo})</span>
              </div>
            }
            open={receiptModalOpen}
            onCancel={() => setReceiptModalOpen(false)}
            footer={[
              <button
                key="close"
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer mr-2"
              >
                Close
              </button>,
              <button
                key="print"
                onClick={() => {
                  message.success(`Invoice ${selectedInvoice.invoiceNo} sent to printer!`);
                  setReceiptModalOpen(false);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                🖨 Print Invoice PDF
              </button>,
            ]}
            width={480}
          >
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl my-3 space-y-3 font-mono text-xs">
              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5">
                <h3 className="font-bold text-slate-900 text-sm uppercase">HMS MEDICAL CENTER</h3>
                <p className="text-[11px] text-slate-500">GSTIN: 27AAAAA0000A1Z5 &bull; TAX INVOICE</p>
                <p className="text-[10px] text-slate-400">{selectedInvoice.date}</p>
              </div>

              <div className="space-y-1 text-slate-700 pt-1">
                <div className="flex justify-between">
                  <span>Invoice No:</span>
                  <strong className="text-slate-900">{selectedInvoice.invoiceNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Patient Name:</span>
                  <strong className="text-slate-900">{selectedInvoice.patientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Patient UHID:</span>
                  <span>{selectedInvoice.uhid}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Rendered:</span>
                  <span className="text-slate-800">{selectedInvoice.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-teal-700">{selectedInvoice.paymentMode}</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 space-y-1 text-emerald-900">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>₹{(selectedInvoice.amount - selectedInvoice.gstAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (CGST+SGST):</span>
                  <span>₹{selectedInvoice.gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-emerald-300 pt-1">
                  <span>Total Amount Paid:</span>
                  <span>₹{selectedInvoice.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 border-t border-dashed border-slate-300 pt-2 font-sans">
                Thank you. Computer generated invoice — no physical signature required.
              </div>
            </div>
          </Modal>
        )}
      </div>
    </HmsAppShell>
  );
}
