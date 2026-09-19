"use client";

import React, { useState } from "react";
import { Form, Input, Select, Modal, message, Tag } from "antd";
import { Receipt, Plus, CreditCard, ShieldCheck } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { LineItemsTable } from "./LineItemsTable";
import { InvoiceItem, InvoiceSchema } from "../../_billing_schemas/invoice_schema";
import { TariffService } from "@/app/(admin)/_admin_services/tariff_service";
import { useBillingStore } from "../../_billing_stores/billing_store";

export const GstInvoiceForm: React.FC = () => {
  // Initialize line items resolved from Tariff Master (Single Source of Truth)
  const initialOpd = TariffService.resolveLineItemPrice("SRV-CONS-OPD");
  const initialEcg = TariffService.resolveLineItemPrice("SRV-DIAG-ECG");

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      itemId: "item-1",
      description: `[${initialOpd.serviceCode}] ${initialOpd.serviceName}`,
      hsnSacCode: initialOpd.hsnSacCode,
      quantity: 1,
      unitPrice: initialOpd.baseRate,
      gstRate: initialOpd.gstRate,
    },
    {
      itemId: "item-2",
      description: `[${initialEcg.serviceCode}] ${initialEcg.serviceName}`,
      hsnSacCode: initialEcg.hsnSacCode,
      quantity: 1,
      unitPrice: initialEcg.baseRate,
      gstRate: initialEcg.gstRate,
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTariffCode, setSelectedTariffCode] = useState<string>("");

  const activeTariffs = TariffService.getActiveTariffs();

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const cgst = items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.gstRate) / 100) / 2, 0);
  const sgst = items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.gstRate) / 100) / 2, 0);
  const totalAmount = subtotal + cgst + sgst;

  const handleConfirmAddItem = () => {
    if (!selectedTariffCode) {
      message.error("Please select a tariff item from Tariff Master.");
      return;
    }

    const resolved = TariffService.resolveLineItemPrice(selectedTariffCode);
    const newItem: InvoiceItem = {
      itemId: `item-${Date.now()}`,
      description: `[${resolved.serviceCode}] ${resolved.serviceName}`,
      hsnSacCode: resolved.hsnSacCode,
      quantity: 1,
      unitPrice: resolved.baseRate,
      gstRate: resolved.gstRate,
    };

    setItems((prev) => [...prev, newItem]);
    setIsAddModalOpen(false);
    setSelectedTariffCode("");
    message.success(`Added charge item: ${resolved.serviceName} @ ₹${resolved.baseRate} from Tariff Master`);
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
        category: "OPD" as const,
        items,
        paymentMode: (values.paymentMode as "UPI" | "CASH" | "CARD" | "INSURANCE_TPA") || "UPI",
        subtotal,
        cgstAmount: cgst,
        sgstAmount: sgst,
        totalAmount,
      };
      InvoiceSchema.parse({ ...payload, createdAt: new Date().toISOString() });

      // Save via useBillingStore
      useBillingStore.getState().addInvoice(payload);

      message.success(`GST Invoice ${payload.invoiceNumber} created & saved for ₹${totalAmount.toFixed(2)}!`);
    } catch {
      message.error("Invoice creation failed. Please check form parameters.");
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" /> Tax Invoice & Billing Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>GSTIN: 27AAAAA0000A1Z5</span> &bull;
            <span className="flex items-center gap-1 text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
              <ShieldCheck className="w-3.5 h-3.5" /> Tariff Master Single Source of Truth
            </span>
          </p>
        </div>
        <HmsButton onClick={() => setIsAddModalOpen(true)} icon={<Plus className="w-4 h-4" />} variant="secondary" size="sm">
          Add Tariff Item
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

      {/* Select Tariff Item Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <Receipt className="w-5 h-5 text-teal-600" />
            <span>Select Tariff Master Charge Item</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          setSelectedTariffCode("");
        }}
        onOk={handleConfirmAddItem}
        okText="Add Item to Invoice"
        width={560}
      >
        <div className="py-3 space-y-4">
          <p className="text-xs text-slate-500">
            Select an official hospital service from Tariff Master. Rate, SAC code, and GST tax percentage are automatically enforced.
          </p>

          <Select
            showSearch
            className="w-full"
            placeholder="Search by code, service name, or category..."
            value={selectedTariffCode || undefined}
            onChange={(val) => setSelectedTariffCode(val)}
            filterOption={(input, option) =>
              (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
            }
            options={activeTariffs.map((t) => ({
              value: t.serviceCode,
              label: `[${t.serviceCode}] ${t.serviceName} - ₹${t.baseRate} (GST ${t.gstRate}%)`,
            }))}
          />

          {selectedTariffCode && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              {(() => {
                const details = TariffService.resolveLineItemPrice(selectedTariffCode);
                return (
                  <>
                    <div className="font-semibold text-slate-800">{details.serviceName}</div>
                    <div className="text-slate-500">Service Code: <span className="font-mono text-slate-800">{details.serviceCode}</span> | Billing Code: <span className="font-mono text-slate-800">{details.billingCode}</span></div>
                    <div className="text-slate-500">Category: <Tag color="blue">{details.category}</Tag> | HSN/SAC: <span className="font-mono text-slate-800">{details.hsnSacCode}</span></div>
                    <div className="text-slate-500">Base Unit Rate: <span className="font-bold text-teal-700">₹{details.baseRate}</span> | GST Rate: <span className="font-bold text-amber-700">{details.gstRate}%</span></div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
