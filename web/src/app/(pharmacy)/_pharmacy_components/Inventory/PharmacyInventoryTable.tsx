"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, InputNumber, Select, DatePicker, message, Tooltip } from "antd";
import { Pill, Plus, Search, AlertTriangle, CheckCircle2, RefreshCw, Calendar, Package, DollarSign } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { usePharmacyStore, DrugStockItem } from "../../_pharmacy_stores/pharmacy_store";

export const PharmacyInventoryTable: React.FC = () => {
  const { inventory, addStockItem, resetToDefaults } = usePharmacyStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const payload = {
      drugCode: (values.drugCode as string) || `DRG-${Math.floor(Math.random() * 900 + 100)}`,
      name: values.name as string,
      genericName: values.genericName as string,
      category: values.category as DrugStockItem["category"],
      batchNumber: (values.batchNumber as string) || "BT-2026-001",
      expiryDate: values.expiryDate
        ? (values.expiryDate as { format: (f: string) => string }).format("YYYY-MM-DD")
        : "2028-12-31",
      stockQuantity: Number(values.stockQuantity) || 100,
      unitPrice: Number(values.unitPrice) || 10,
      reorderLevel: Number(values.reorderLevel) || 50,
      manufacturer: (values.manufacturer as string) || "Generic Pharma",
    };

    addStockItem(payload);
    message.success(`Drug item ${payload.name} added to pharmacy inventory.`);
    setModalOpen(false);
  };

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.drugCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Drug Code & Name",
      key: "name",
      render: (_: unknown, record: DrugStockItem) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{record.name}</span>
            <span className="font-mono text-3xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              {record.drugCode}
            </span>
          </div>
          <p className="text-xs text-slate-500">Generic: {record.genericName}</p>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: DrugStockItem["category"]) => {
        let color = "blue";
        if (cat === "INJECTION") color = "purple";
        if (cat === "CONTROLLED_H1") color = "volcano";
        return <Tag color={color}>{cat}</Tag>;
      },
    },
    {
      title: "Batch & Expiry",
      key: "batch",
      render: (_: unknown, record: DrugStockItem) => (
        <div className="text-xs font-mono">
          <div className="text-slate-800">Batch: {record.batchNumber}</div>
          <div className="text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" /> Exp: {record.expiryDate}
          </div>
        </div>
      ),
    },
    {
      title: "Stock & Reorder",
      key: "stock",
      render: (_: unknown, record: DrugStockItem) => (
        <div className="text-xs font-mono">
          <div className="font-bold text-slate-900">{record.stockQuantity} Units</div>
          <div className="text-3xs text-slate-400">Reorder Level: {record.reorderLevel}</div>
        </div>
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (p: number) => <span className="font-mono text-xs font-bold text-emerald-800">₹ {p.toFixed(2)}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: DrugStockItem["status"]) => {
        if (s === "FEFO_ALERT") return <Tag color="orange" className="font-bold text-3xs">FEFO EXPIRY SOON</Tag>;
        if (s === "LOW_STOCK") return <Tag color="rose" className="font-bold text-3xs">LOW STOCK</Tag>;
        return <Tag color="emerald" className="font-bold text-3xs">IN STOCK</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Inventory Items</p>
              <h3 className="text-2xl font-bold text-teal-800 mt-1">{inventory.length} SKU Items</h3>
            </div>
            <Package className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-rose-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">
                {inventory.filter((i) => i.status === "LOW_STOCK").length} Reorder Due
              </h3>
            </div>
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">FEFO Expiry Warnings</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {inventory.filter((i) => i.status === "FEFO_ALERT").length} Batches
              </h3>
            </div>
            <Calendar className="w-8 h-8 text-amber-500" />
          </div>
        </HmsCard>
      </div>

      {/* Control Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" /> Pharmacy Drug Stock & Inventory FEFO Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor drug batches, expiration dates, FEFO picking priority, and reorder levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search drug name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Add Drug Stock
          </HmsButton>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={filteredInventory} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <Pill className="w-5 h-5 text-teal-600" />
            <span>Add Drug Stock SKU Item</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Drug Code" name="drugCode">
              <Input placeholder="DRG-PARA-650" size="large" />
            </Form.Item>

            <Form.Item label="Brand Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="Paracetamol 650mg" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Generic Name" name="genericName" rules={[{ required: true }]}>
              <Input placeholder="Paracetamol" />
            </Form.Item>

            <Form.Item label="Category" name="category" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="TABLET">Tablet / Capsule</Select.Option>
                <Select.Option value="INJECTION">Injection / Vial</Select.Option>
                <Select.Option value="SYRUP">Syrup / Liquid</Select.Option>
                <Select.Option value="OINTMENT">Ointment / Cream</Select.Option>
                <Select.Option value="CONTROLLED_H1">Schedule H1 Narcotic</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item label="Batch #" name="batchNumber" rules={[{ required: true }]}>
              <Input placeholder="BT-2026-01" />
            </Form.Item>

            <Form.Item label="Stock Quantity" name="stockQuantity" rules={[{ required: true }]}>
              <InputNumber min={1} max={10000} className="w-full" />
            </Form.Item>

            <Form.Item label="Unit Price (₹)" name="unitPrice" rules={[{ required: true }]}>
              <InputNumber min={0.5} max={5000} className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Expiry Date" name="expiryDate">
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item label="Reorder Threshold" name="reorderLevel" initialValue={50}>
              <InputNumber min={5} max={1000} className="w-full" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit">
              Save Drug Stock
            </HmsButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
