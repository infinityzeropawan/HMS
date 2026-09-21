"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, message } from "antd";
import { Building2, Plus, Phone, Mail, FileText, CheckCircle, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { usePharmacyStore, PharmacyVendor } from "../_pharmacy_stores/pharmacy_store";

export default function PharmacyVendorsPage() {
  const { vendors, addVendor } = usePharmacyStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form] = Form.useForm();

  const handleAddVendor = (values: {
    vendorName: string;
    supplierCode: string;
    gstin: string;
    contactPerson: string;
    phone: string;
    email: string;
    category: "DISTRIBUTOR" | "MANUFACTURER" | "IMPORTER";
    paymentTerms: string;
    creditDays: number;
    address: string;
  }) => {
    addVendor({
      ...values,
      status: "ACTIVE",
    });
    message.success(`Vendor ${values.vendorName} added successfully!`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const filteredVendors = vendors.filter(
    (v) =>
      (v.vendorName || v.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.supplierCode || v.vendorCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.gstin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      title: "Supplier Code",
      key: "supplierCode",
      render: (_: unknown, record: PharmacyVendor) => (
        <span className="font-mono font-bold text-purple-700">{record.supplierCode || record.vendorCode}</span>
      ),
    },
    {
      title: "Vendor Name & Category",
      key: "vendorName",
      render: (_: unknown, record: PharmacyVendor) => (
        <div>
          <span className="font-bold text-slate-900 block">{record.vendorName || record.name}</span>
          <Tag color="blue" className="text-[11px] mt-0.5">{record.category}</Tag>
        </div>
      ),
    },
    {
      title: "GSTIN",
      dataIndex: "gstin",
      key: "gstin",
      render: (gst: string) => <span className="font-mono text-xs text-slate-700">{gst}</span>,
    },
    {
      title: "Contact Person & Phone",
      key: "contact",
      render: (_: unknown, record: PharmacyVendor) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{record.contactPerson}</p>
          <p className="text-slate-500 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-slate-400" /> {record.phone}
          </p>
        </div>
      ),
    },
    {
      title: "Credit Terms",
      key: "credit",
      render: (_: unknown, record: PharmacyVendor) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-700">{record.paymentTerms}</span>
          <span className="text-slate-500 block">({record.creditDays} days credit)</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  return (
    <HmsAppShell title="Supplier & Vendor Directory" subtitle="Manage GSTIN vendors, distributor terms & credit days">
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
            <Building2 className="w-6 h-6 text-purple-600" />
            Vendor & Supplier Master
          </h1>
          <p className="text-xs text-slate-500">Manage pharmaceutical distributors, GST registered suppliers, and credit terms.</p>
        </div>
        <HmsButton
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Vendor
        </HmsButton>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
        <Input
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Search by vendor name, supplier code, or GSTIN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80"
          allowClear
        />
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          Total Registered Vendors: {vendors.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <Table columns={columns} dataSource={filteredVendors} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-purple-700 border-b pb-3 pr-6">
            <Building2 className="w-5 h-5 text-purple-600" />
            <span>Register New Pharmaceutical Vendor</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={650}
      >
        <Form form={form} layout="vertical" onFinish={handleAddVendor} className="pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Vendor / Company Name" name="vendorName" rules={[{ required: true }]}>
              <Input placeholder="e.g., Sun Pharma Distributors" />
            </Form.Item>
            <Form.Item label="Supplier Code" name="supplierCode" initialValue={`VEND-${Math.floor(100 + Math.random() * 900)}`}>
              <Input className="font-mono" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="GSTIN Number" name="gstin" rules={[{ required: true }]}>
              <Input placeholder="27AAACB1234C1Z5" className="font-mono uppercase" />
            </Form.Item>
            <Form.Item label="Category" name="category" initialValue="DISTRIBUTOR">
              <Select>
                <Select.Option value="DISTRIBUTOR">Authorized Distributor</Select.Option>
                <Select.Option value="MANUFACTURER">Direct Manufacturer</Select.Option>
                <Select.Option value="IMPORTER">Importer / Stockist</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item label="Contact Person" name="contactPerson" rules={[{ required: true }]}>
              <Input placeholder="e.g., Rajesh Mehta" />
            </Form.Item>
            <Form.Item label="Phone Number" name="phone" rules={[{ required: true }]}>
              <Input placeholder="+91 98200 12345" />
            </Form.Item>
            <Form.Item label="Email Address" name="email" rules={[{ type: "email" }]}>
              <Input placeholder="sales@vendor.com" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Payment Terms" name="paymentTerms" initialValue="Net 30 Days">
              <Select>
                <Select.Option value="Net 15 Days">Net 15 Days</Select.Option>
                <Select.Option value="Net 30 Days">Net 30 Days</Select.Option>
                <Select.Option value="Net 45 Days">Net 45 Days</Select.Option>
                <Select.Option value="Immediate Cash">Immediate Cash</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Credit Days" name="creditDays" initialValue={30}>
              <InputNumber className="w-full" min={0} max={180} />
            </Form.Item>
          </div>

          <Form.Item label="Office / Warehouse Address" name="address">
            <Input.TextArea rows={2} placeholder="Building, Street, City, Pincode" />
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Save Vendor
            </button>
          </div>
        </Form>
      </Modal>
    </div>
    </HmsAppShell>
  );
}
