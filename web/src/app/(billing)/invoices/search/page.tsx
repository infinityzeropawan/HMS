"use client";

import React, { useEffect, useState } from "react";
import { Input, Select, Table, Tag, Modal, message } from "antd";
import { Search, Receipt, Printer, User, Calendar } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface InvoiceRecord {
  invoiceNumber: string;
  patientUhid: string;
  patientName: string;
  paymentMode: "UPI" | "CASH" | "CARD" | "INSURANCE_TPA";
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  createdAt: string;
}

const MOCK_INVOICES: InvoiceRecord[] = [
  {
    invoiceNumber: "INV-2026-01001",
    patientUhid: "P-2026-1049",
    patientName: "Sunil Verma",
    paymentMode: "UPI",
    subtotal: 1250,
    cgstAmount: 27,
    sgstAmount: 27,
    totalAmount: 1304,
    createdAt: "2026-09-11T10:30:00Z",
  },
  {
    invoiceNumber: "INV-2026-01002",
    patientUhid: "P-2026-1052",
    patientName: "Anjali Gupta",
    paymentMode: "CARD",
    subtotal: 3500,
    cgstAmount: 210,
    sgstAmount: 210,
    totalAmount: 3920,
    createdAt: "2026-09-11T11:45:00Z",
  },
  {
    invoiceNumber: "INV-2026-01003",
    patientUhid: "P-2026-1058",
    patientName: "Ramesh Kumar",
    paymentMode: "INSURANCE_TPA",
    subtotal: 8200,
    cgstAmount: 492,
    sgstAmount: 492,
    totalAmount: 9184,
    createdAt: "2026-09-10T16:15:00Z",
  },
];

export default function InvoiceSearchPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(MOCK_INVOICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_invoices");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.length > 0) {
            setInvoices([...list, ...MOCK_INVOICES]);
          }
        } catch { /* use mock */ }
      }
    }
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.patientUhid.toLowerCase().includes(q);
    const matchesMode = paymentModeFilter === "ALL" || inv.paymentMode === paymentModeFilter;
    return matchesSearch && matchesMode;
  });

  const handlePrint = (inv: InvoiceRecord) => {
    message.info(`Printing GST Invoice ${inv.invoiceNumber}...`);
    window.print();
  };

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (num: string) => <span className="font-mono font-bold text-emerald-700">{num}</span>,
    },
    {
      title: "Patient UHID",
      dataIndex: "patientUhid",
      key: "patientUhid",
      render: (uhid: string) => <span className="font-mono text-xs text-slate-500">{uhid}</span>,
    },
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
      render: (name: string) => <span className="font-semibold text-slate-800">{name}</span>,
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
      render: (mode: string) => (
        <Tag color={mode === "UPI" ? "cyan" : mode === "CARD" ? "blue" : mode === "INSURANCE_TPA" ? "purple" : "gold"}>
          {mode}
        </Tag>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amt: number) => <span className="font-bold text-slate-900">₹{amt.toFixed(2)}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, rec: InvoiceRecord) => (
        <div className="flex gap-2">
          <HmsButton size="sm" variant="secondary" onClick={() => setSelectedInvoice(rec)}>
            View
          </HmsButton>
          <HmsButton size="sm" variant="emerald" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => handlePrint(rec)}>
            Reprint
          </HmsButton>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6 safe-area-padding safe-area-bottom">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                Tax Invoice Search & Reprint
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                GSTIN: 27AAAAA0000A1Z5 &bull; Historical Invoices & Receipts
              </p>
            </div>
          </div>
        </header>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by Invoice #, UHID, Name..."
            prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="large"
            className="sm:col-span-2"
          />
          <Select value={paymentModeFilter} onChange={setPaymentModeFilter} size="large" className="w-full">
            <Select.Option value="ALL">All Payment Modes</Select.Option>
            <Select.Option value="UPI">UPI / QR Code</Select.Option>
            <Select.Option value="CASH">Cash</Select.Option>
            <Select.Option value="CARD">Credit/Debit Card</Select.Option>
            <Select.Option value="INSURANCE_TPA">TPA Insurance Claim</Select.Option>
          </Select>
        </div>

        {/* Mobile Smartphone Card View */}
        <div className="block sm:hidden space-y-3">
          {filteredInvoices.map((inv) => (
            <div key={inv.invoiceNumber} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-700 text-sm">{inv.invoiceNumber}</span>
                <Tag color={inv.paymentMode === "UPI" ? "cyan" : "blue"}>{inv.paymentMode}</Tag>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> {inv.patientName} ({inv.patientUhid})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(inv.createdAt).toLocaleDateString()}
                </span>
                <span className="text-sm font-bold text-slate-900">₹{inv.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <HmsButton size="lg" fullWidth variant="secondary" onClick={() => setSelectedInvoice(inv)}>
                  Details
                </HmsButton>
                <HmsButton size="lg" fullWidth variant="emerald" icon={<Printer className="w-4 h-4" />} onClick={() => handlePrint(inv)}>
                  Reprint
                </HmsButton>
              </div>
            </div>
          ))}
          {filteredInvoices.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
              No matching GST invoices found
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <Table columns={columns} dataSource={filteredInvoices} rowKey="invoiceNumber" pagination={{ pageSize: 10 }} />
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Modal
          title={`GST Tax Invoice: ${selectedInvoice.invoiceNumber}`}
          open={!!selectedInvoice}
          onCancel={() => setSelectedInvoice(null)}
          footer={null}
          width={520}
          centered
        >
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between"><span>UHID: <strong>{selectedInvoice.patientUhid}</strong></span><span>Mode: <strong>{selectedInvoice.paymentMode}</strong></span></div>
              <div>Patient: <strong>{selectedInvoice.patientName}</strong></div>
              <div>Date: {new Date(selectedInvoice.createdAt).toLocaleString()}</div>
            </div>
            <div className="space-y-1 text-sm border-t border-b border-slate-100 py-3">
              <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span>₹{selectedInvoice.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-600"><span>CGST (9%):</span><span>₹{selectedInvoice.cgstAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-600"><span>SGST (9%):</span><span>₹{selectedInvoice.sgstAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-100">
                <span>Grand Total:</span><span className="text-emerald-700">₹{selectedInvoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <HmsButton size="lg" fullWidth variant="emerald" icon={<Printer className="w-4 h-4" />} onClick={() => handlePrint(selectedInvoice)}>
              Print Official Tax Receipt
            </HmsButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
