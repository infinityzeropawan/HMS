"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, message } from "antd";
import { ArrowLeftRight, Plus, ArrowLeft, Building, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { usePharmacyStore, StockTransferRecord, DrugStockItem } from "../../_pharmacy_stores/pharmacy_store";

export default function StockTransfersPage() {
  const { stockTransfers, inventory, addStockTransfer } = usePharmacyStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateTransfer = (values: {
    fromLocation: string;
    toDepartment: string;
    drugName: string;
    batchNo: string;
    quantity: number;
    requestedBy: string;
  }) => {
    addStockTransfer({
      transferNo: `TRF-2026-${Math.floor(100 + Math.random() * 900)}`,
      fromLocation: values.fromLocation,
      toDepartment: values.toDepartment,
      drugName: values.drugName,
      batchNo: values.batchNo,
      quantity: values.quantity,
      requestedBy: values.requestedBy,
    });
    message.success(`Stock transfer of ${values.quantity} units of ${values.drugName} to ${values.toDepartment} recorded!`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "Transfer No",
      dataIndex: "transferNo",
      key: "transferNo",
      render: (no: string) => <span className="font-mono font-bold text-purple-700">{no}</span>,
    },
    {
      title: "From Location",
      dataIndex: "fromLocation",
      key: "fromLocation",
    },
    {
      title: "Target Department",
      dataIndex: "toDepartment",
      key: "toDepartment",
      render: (dept: string) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: "Drug & Batch",
      key: "drug",
      render: (_: unknown, record: StockTransferRecord) => (
        <div>
          <span className="font-bold text-slate-800 block">{record.drugName}</span>
          <span className="text-xs text-slate-500 font-mono">Batch: {record.batchNo}</span>
        </div>
      ),
    },
    {
      title: "Qty Transferred",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number) => <span className="font-bold font-mono">{qty}</span>,
    },
    {
      title: "Requested By",
      dataIndex: "requestedBy",
      key: "requestedBy",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (st: string) => <Tag color="green">{st || "COMPLETED"}</Tag>,
    },
  ];

  return (
    <HmsAppShell title="Inter-Departmental Stock Transfers" subtitle="Transfer stock to OT, ICU, Emergency & Wards">
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
              <ArrowLeftRight className="w-6 h-6 text-purple-600" />
              Department Stock Transfer Ledger
            </h1>
            <p className="text-xs text-slate-500">Reallocate inventory from Central Pharmacy to satellite stores (OT, ICU, ER).</p>
          </div>
          <HmsButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            New Stock Transfer
          </HmsButton>
        </div>

        {/* Transfers Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto p-4 space-y-3">
          <Table columns={columns} dataSource={stockTransfers} rowKey="id" pagination={{ pageSize: 8 }} />
        </div>

        {/* Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-purple-700 font-bold border-b pb-2">
              <ArrowLeftRight className="w-5 h-5 text-purple-600" />
              <span>INTER-DEPARTMENT STOCK TRANSFER</span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form layout="vertical" form={form} onFinish={handleCreateTransfer} className="mt-3 space-y-3">
            <Form.Item label="Source Location" name="fromLocation" initialValue="Central Pharmacy Vault">
              <Input disabled />
            </Form.Item>

            <Form.Item label="Destination Department" name="toDepartment" rules={[{ required: true, message: "Select target department" }]}>
              <Select placeholder="Select satellite department">
                <Select.Option value="Operation Theatre (OT)">Operation Theatre (OT)</Select.Option>
                <Select.Option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</Select.Option>
                <Select.Option value="Emergency & Trauma (ER)">Emergency & Trauma (ER)</Select.Option>
                <Select.Option value="General Inpatient Ward">General Inpatient Ward</Select.Option>
                <Select.Option value="Outpatient Clinic Satellite">Outpatient Clinic Satellite</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Select Drug Item" name="drugName" rules={[{ required: true, message: "Select drug item" }]}>
              <Select placeholder="Select medication SKU">
                {inventory.map((item: DrugStockItem) => (
                  <Select.Option key={item.id} value={item.drugName || item.name}>
                    {item.drugName || item.name} (Stock: {item.stockQuantity} &bull; Batch: {item.batchNumber})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item label="Batch No" name="batchNo" rules={[{ required: true }]}>
                <Input placeholder="BT-2026-X" />
              </Form.Item>
              <Form.Item label="Transfer Qty" name="quantity" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={1} max={1000} />
              </Form.Item>
            </div>

            <Form.Item label="Requested By / Indent Officer" name="requestedBy" initialValue="Sister-In-Charge OT">
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Confirm Transfer
              </button>
            </div>
          </Form>
        </Modal>
      </div>
    </HmsAppShell>
  );
}
