"use client";

import React, { useState } from "react";
import { Form, Input, Select, message } from "antd";
import { Receipt, Plus, CreditCard } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { LineItemsTable } from "./LineItemsTable";
import { InvoiceItem, InvoiceSchema } from "../../_billing_schemas/invoice_schema";

export const GstInvoiceForm: React.FC = () => {
  const [items, setItems] = useState<InvoiceItem[]>([
    { itemId: "1", description: "OPD Specialist Consultation (SAC 999312 - Healthcare Exempt)", hsnSacCode: "999312", quantity: 1, unitPrice: 800, gstRate: 0 },
    { itemId: "2", description: "ECG 12-Lead Diagnostic Test", hsnSacCode: "999313", quantity: 1, unitPrice: 450, gstRate: 12 },
  ]);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const cgst = items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.gstRate) / 100) / 2, 0);
  const sgst = items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.gstRate) / 100) / 2, 0);
  const totalAmount = subtotal + cgst + sgst;

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      itemId: Date.now().toString(),
      description: "Laboratory Blood Test / CBC",
      hsnSacCode: "999313",
      quantity: 1,
      unitPrice: 350,
      gstRate: 18,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.itemId !== id));
  };

  const handleCreateInvoice = (values: Record<string, unknown>) => {
    try {
      let nextSeq = 1001;
      if (typeof window !== "undefined") {
        const last = localStorage.getItem("hms_last_invoice_seq");
        nextSeq = last ? parseInt(last, 10) + 1 : 1001;
        localStorage.setItem("hms_last_invoice_seq", nextSeq.toString());
      }
      const invoiceNumber = `INV-2026-${String(nextSeq).padStart(5, "0")}`;

      const payload = {
        invoiceNumber,
        patientUhid: (values.patientUhid as string) || "P-2026-1049",
        patientName: (values.patientName as string) || "Sunil Verma",
        items,
        paymentMode: (values.paymentMode as "UPI" | "CASH" | "CARD" | "INSURANCE_TPA") || "UPI",
        subtotal,
        cgstAmount: cgst,
        sgstAmount: sgst,
        totalAmount,
        createdAt: new Date().toISOString(),
      };
      InvoiceSchema.parse(payload);

      if (typeof window !== "undefined") {
        const saved = JSON.parse(localStorage.getItem("hms_invoices") || "[]");
        saved.unshift(payload);
        localStorage.setItem("hms_invoices", JSON.stringify(saved));
      }

      message.success(`GST Invoice ${payload.invoiceNumber} created & saved for ₹${totalAmount.toFixed(2)}!`);
    } catch {
      message.error("Invoice creation failed. Please check form parameters.");
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" /> Tax Invoice & Billing Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1">GSTIN: 27AAAAA0000A1Z5 &bull; HSN/SAC Compliant</p>
        </div>
        <HmsButton onClick={handleAddItem} icon={<Plus className="w-4 h-4" />} variant="secondary" fullWidth size="sm">
          Add Charge Item
        </HmsButton>
      </div>

      <Form layout="vertical" onFinish={handleCreateInvoice} initialValues={{ paymentMode: "UPI" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Form.Item label="Patient UHID" name="patientUhid" initialValue="P-2026-1049">
            <Input placeholder="Enter UHID" size="large" />
          </Form.Item>
          <Form.Item label="Payment Mode" name="paymentMode">
            <Select size="large">
              <Select.Option value="UPI">UPI / QR Code</Select.Option>
              <Select.Option value="CASH">Cash</Select.Option>
              <Select.Option value="CARD">Credit/Debit Card</Select.Option>
              <Select.Option value="INSURANCE_TPA">TPA Cashless Claim</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div className="mb-6 overflow-x-auto">
          <LineItemsTable items={items} onRemoveItem={handleRemoveItem} />
        </div>

        <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 flex flex-col gap-1 items-end mb-6 text-sm">
          <div>Subtotal: <strong>₹{subtotal.toFixed(2)}</strong></div>
          <div>CGST (9%): <strong>₹{cgst.toFixed(2)}</strong></div>
          <div>SGST (9%): <strong>₹{sgst.toFixed(2)}</strong></div>
          <div className="text-lg font-bold text-teal-800 pt-2 border-t border-slate-200 w-full text-right">
            Grand Total: ₹{totalAmount.toFixed(2)}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <HmsButton type="primary" variant="emerald" htmlType="submit" size="lg" icon={<CreditCard className="w-4 h-4" />} fullWidth>
            Generate & Collect Payment
          </HmsButton>
        </div>
      </Form>
    </div>
  );
};
