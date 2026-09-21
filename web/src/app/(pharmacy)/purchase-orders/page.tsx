"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, message, Drawer } from "antd";
import { ShoppingCart, Plus, ArrowLeft, FileCheck, AlertCircle, Building2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { usePharmacyStore, PurchaseOrder } from "../_pharmacy_stores/pharmacy_store";

function PurchaseOrdersContent() {
  const { purchaseOrders, vendors, inventory, createPurchaseOrder } = usePharmacyStore();
  const searchParams = useSearchParams();
  const initialDrug = searchParams ? searchParams.get("drug") : null;

  const [drawerOpen, setDrawerOpen] = useState(!!initialDrug);
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialDrug) {
      const match = inventory.find((i) => (i.drugName || i.name).toLowerCase().includes(initialDrug.toLowerCase()));
      form.setFieldsValue({
        drugName: match ? (match.drugName || match.name) : initialDrug,
        orderQty: 200,
        estimatedCost: match ? match.unitPrice * 200 : 5000,
      });
      setDrawerOpen(true);
    }
  }, [initialDrug, inventory, form]);

  const handleCreatePO = (values: {
    vendorName: string;
    drugName: string;
    orderQty: number;
    estimatedCost: number;
    notes?: string;
  }) => {
    const newPo = createPurchaseOrder({
      vendorName: values.vendorName,
      drugName: values.drugName,
      orderQty: values.orderQty,
      estimatedCost: values.estimatedCost,
    });
    message.success(`Purchase Order ${newPo.poNumber} created for ${values.drugName}!`);
    setDrawerOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "PO Number",
      dataIndex: "poNumber",
      key: "poNumber",
      render: (num: string) => <span className="font-mono font-bold text-purple-700">{num}</span>,
    },
    {
      title: "Vendor / Supplier",
      dataIndex: "vendorName",
      key: "vendorName",
      render: (v: string) => <span className="font-bold text-slate-800">{v}</span>,
    },
    {
      title: "Drug Item & Order Qty",
      key: "drug",
      render: (_: unknown, record: PurchaseOrder) => (
        <div>
          <span className="font-semibold text-slate-900 block">{record.drugName}</span>
          <span className="text-xs text-slate-500 font-mono">Qty Ordered: {record.orderQty} units</span>
        </div>
      ),
    },
    {
      title: "Estimated Cost",
      dataIndex: "estimatedCost",
      key: "estimatedCost",
      render: (amt: number) => <span className="font-bold text-emerald-700 font-mono">₹{amt.toLocaleString()}</span>,
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (dt: string) => <span className="text-xs text-slate-500">{new Date(dt).toLocaleDateString()}</span>,
    },
    {
      title: "PO Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "PENDING_APPROVAL" ? "gold" : status === "APPROVED" ? "blue" : status === "RECEIVED" ? "green" : "volcano"}>
          {status.replace("_", " ")}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/pharmacy" className="text-slate-500 hover:text-slate-700 text-xs flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Pharmacy
            </Link>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-1">
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            Purchase Order Management
          </h1>
          <p className="text-xs text-slate-500">Raise purchase requisitions for low-stock drugs and track vendor fulfillment.</p>
        </div>
        <HmsButton
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setDrawerOpen(true)}
        >
          Create Purchase Order
        </HmsButton>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <Table columns={columns} dataSource={purchaseOrders} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Create PO Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2 text-purple-700 font-bold">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            <span>Generate Drug Purchase Order</span>
          </div>
        }
        placement="right"
        width={480}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePO} className="space-y-3 text-xs">
          <Form.Item label="Select Target Vendor" name="vendorName" rules={[{ required: true }]}>
            <Select placeholder="Choose vendor...">
              {vendors.map((v) => (
                <Select.Option key={v.id} value={v.vendorName}>
                  {v.vendorName} ({v.supplierCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Drug / Medication Name" name="drugName" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Search drug from inventory..."
              options={inventory.map((i) => ({ label: `${i.drugName || i.name} (Current Stock: ${i.stockQuantity})`, value: i.drugName || i.name }))}
              onChange={(val) => {
                const match = inventory.find((i) => (i.drugName || i.name) === val);
                if (match) {
                  form.setFieldsValue({ estimatedCost: match.unitPrice * 200 });
                }
              }}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Order Quantity" name="orderQty" rules={[{ required: true }]} initialValue={200}>
              <InputNumber className="w-full" min={1} onChange={(qty) => {
                const drugName = form.getFieldValue("drugName");
                const match = inventory.find((i) => (i.drugName || i.name) === drugName);
                if (match && qty) {
                  form.setFieldsValue({ estimatedCost: match.unitPrice * Number(qty) });
                }
              }} />
            </Form.Item>
            <Form.Item label="Estimated Cost (₹)" name="estimatedCost" rules={[{ required: true }]} initialValue={5000}>
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </div>

          <Form.Item label="Purchase Notes / Justification" name="notes">
            <Input.TextArea rows={3} placeholder="e.g., Low stock alert triggered during OPD morning shift." />
          </Form.Item>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Upon submission, PO will be sent to vendor for dispatch and logged for GRN inwards verification.</span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Submit PO
            </button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}

/**
 * `useSearchParams()` (used to pre-fill a purchase order from `?drug=…`)
 * opts the page into client-side rendering and must be wrapped in a Suspense
 * boundary for static prerendering to succeed.
 */
export default function PurchaseOrdersPage() {
  return (
    <HmsAppShell title="Pharmacy Purchase Orders" subtitle="Create, approve & track POs for drug inventory replenishment">
      <Suspense
        fallback={
          <div className="p-6 max-w-7xl mx-auto">
            <p className="text-sm font-medium text-slate-500">Loading purchase orders…</p>
          </div>
        }
      >
        <PurchaseOrdersContent />
      </Suspense>
    </HmsAppShell>
  );
}
