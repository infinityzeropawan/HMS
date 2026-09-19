"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, DatePicker, message } from "antd";
import { FileCheck, Plus, ArrowLeft, Building2, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { usePharmacyStore, GRNRecord } from "../_pharmacy_stores/pharmacy_store";

export default function GRNPage() {
  const { grnRecords, vendors, inventory, addGRNRecord } = usePharmacyStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateGRN = (values: {
    grnNumber?: string;
    invoiceNo: string;
    vendorName: string;
    drugName: string;
    batchNo: string;
    expiryDate: unknown;
    receivedQty: number;
    purchaseRate: number;
    mrp: number;
    taxPercent: number;
  }) => {
    const expStr = values.expiryDate ? (values.expiryDate as { format: (f: string) => string }).format("YYYY-MM-DD") : "2028-12-31";
    addGRNRecord({
      grnNumber: values.grnNumber || `GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNo: values.invoiceNo,
      vendorName: values.vendorName,
      drugName: values.drugName,
      batchNo: values.batchNo,
      expiryDate: expStr,
      receivedQty: values.receivedQty,
      purchaseRate: values.purchaseRate,
      mrp: values.mrp,
      taxPercent: values.taxPercent,
    });
    message.success(`GRN inward entry created! ${values.receivedQty} units of ${values.drugName} added to inventory stock.`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "GRN Number",
      dataIndex: "grnNumber",
      key: "grnNumber",
      render: (num: string) => <span className="font-mono font-bold text-purple-700">{num}</span>,
    },
    {
      title: "Vendor & Invoice No",
      key: "vendor",
      render: (_: unknown, record: GRNRecord) => (
        <div>
          <span className="font-bold text-slate-900 block">{record.vendorName}</span>
          <span className="text-xs font-mono text-slate-500">Inv: {record.invoiceNo}</span>
        </div>
      ),
    },
    {
      title: "Drug Item & Batch",
      key: "drug",
      render: (_: unknown, record: GRNRecord) => (
        <div>
          <span className="font-semibold text-slate-900 block">{record.drugName}</span>
          <span className="text-xs font-mono text-purple-600">Batch: {record.batchNo} | Exp: {record.expiryDate}</span>
        </div>
      ),
    },
    {
      title: "Received Qty",
      dataIndex: "receivedQty",
      key: "receivedQty",
      render: (qty: number) => <span className="font-bold text-slate-900 font-mono">+{qty} units</span>,
    },
    {
      title: "Rates & Tax",
      key: "rates",
      render: (_: unknown, record: GRNRecord) => (
        <div className="text-xs">
          <p>Pur Rate: <span className="font-mono font-semibold">₹{record.purchaseRate}</span></p>
          <p>MRP: <span className="font-mono font-bold text-emerald-700">₹{record.mrp}</span> ({record.taxPercent}% GST)</p>
        </div>
      ),
    },
    {
      title: "Inward Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color="green">{status}</Tag>,
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
            <FileCheck className="w-6 h-6 text-purple-600" />
            Goods Received Note (GRN) Inward Entry
          </h1>
          <p className="text-xs text-slate-500">Record stock entry against supplier invoices, batch numbers, MRP and GST taxes.</p>
        </div>
        <HmsButton
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Inward GRN
        </HmsButton>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table columns={columns} dataSource={grnRecords} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Create GRN Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-purple-700 font-bold border-b pb-3 pr-6">
            <Package className="w-5 h-5 text-purple-600" />
            <span>New Goods Received Note (GRN) Stock Inward</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={650}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateGRN} className="pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Supplier Invoice Number" name="invoiceNo" rules={[{ required: true }]}>
              <Input placeholder="INV-2026-9901" className="font-mono" />
            </Form.Item>
            <Form.Item label="Vendor" name="vendorName" rules={[{ required: true }]}>
              <Select placeholder="Select Supplier...">
                {vendors.map((v) => (
                  <Select.Option key={v.id} value={v.vendorName}>{v.vendorName}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Drug Item" name="drugName" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Search or select drug item..."
              options={inventory.map((i) => ({ label: `${i.drugName || i.name} (Current Stock: ${i.stockQuantity})`, value: i.drugName || i.name }))}
            />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item label="Batch Number" name="batchNo" rules={[{ required: true }]}>
              <Input placeholder="BT-PCM-88" className="font-mono uppercase" />
            </Form.Item>
            <Form.Item label="Expiry Date" name="expiryDate" rules={[{ required: true }]}>
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item label="Received Quantity" name="receivedQty" rules={[{ required: true }]} initialValue={500}>
              <InputNumber className="w-full" min={1} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item label="Purchase Rate (₹)" name="purchaseRate" rules={[{ required: true }]} initialValue={10}>
              <InputNumber className="w-full" min={0} precision={2} />
            </Form.Item>
            <Form.Item label="MRP per Unit (₹)" name="mrp" rules={[{ required: true }]} initialValue={15}>
              <InputNumber className="w-full" min={0} precision={2} />
            </Form.Item>
            <Form.Item label="GST Tax %" name="taxPercent" initialValue={12}>
              <Select>
                <Select.Option value={0}>0% (Exempt)</Select.Option>
                <Select.Option value={5}>5%</Select.Option>
                <Select.Option value={12}>12% (Pharma Standard)</Select.Option>
                <Select.Option value={18}>18%</Select.Option>
              </Select>
            </Form.Item>
          </div>

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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Post GRN Inward
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
