"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, message } from "antd";
import { ArrowLeftRight, Plus, ArrowLeft, Building, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { usePharmacyStore, StockTransferRecord } from "../../_pharmacy_stores/pharmacy_store";

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
      render: (num: string) => <span className="font-mono font-bold text-purple-700">{num}</span>,
    },
    {
      title: "From Location → Target Dept",
      key: "loc",
      render: (_: unknown, record: StockTransferRecord) => (
        <div>
          <span className="font-semibold text-slate-800">{record.fromLocation}</span>
          <span className="text-purple-600 font-bold mx-1">→</span>
          <Tag color="blue" className="font-bold">{record.toDepartment}</Tag>
        </div>
      ),
    },
    {
      title: "Drug Item & Batch",
      key: "drug",
      render: (_: unknown, record: StockTransferRecord) => (
        <div>
          <span className="font-bold text-slate-900 block">{record.drugName}</span>
          <span className="text-xs font-mono text-slate-500">Batch: {record.batchNo}</span>
        </div>
      ),
    },
    {
      title: "Transferred Qty",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number) => <span className="font-bold text-slate-900 font-mono">{qty} units</span>,
    },
    {
      title: "Requested By",
      dataIndex: "requestedBy",
      key: "requestedBy",
      render: (req: string) => <span className="text-xs text-slate-600">{req}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={status === "COMPLETED" ? "green" : "gold"}>{status}</Tag>,
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
            <ArrowLeftRight className="w-6 h-6 text-purple-600" />
            Inter-Department Stock Transfers
          </h1>
          <p className="text-xs text-slate-500">Dispatch stock from Central Pharmacy to OT, ICU, Casualty, and Inpatient Wards.</p>
        </div>
        <HmsButton
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Stock Transfer
        </HmsButton>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table columns={columns} dataSource={stockTransfers} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-purple-700 font-bold border-b pb-3 pr-6">
            <ArrowLeftRight className="w-5 h-5 text-purple-600" />
            <span>Dispatch Inter-Department Stock Transfer</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTransfer} className="pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Source Pharmacy / Store" name="fromLocation" initialValue="Main Central Store">
              <Select>
                <Select.Option value="Main Central Store">Main Central Store</Select.Option>
                <Select.Option value="OPD Counter 1">OPD Counter 1</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Target Receiving Department" name="toDepartment" rules={[{ required: true }]} initialValue="OT Store">
              <Select>
                <Select.Option value="OT Store">Operation Theater (OT)</Select.Option>
                <Select.Option value="ICU Ward">ICU Ward</Select.Option>
                <Select.Option value="Casualty / ER">Casualty / Emergency</Select.Option>
                <Select.Option value="IPD Ward Pharmacy">IPD Ward Pharmacy</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Drug Item" name="drugName" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Select drug to transfer..."
              options={inventory.map((i: any) => ({ label: `${i.drugName || i.name} (Available: ${i.stockQuantity})`, value: i.drugName || i.name }))}
              onChange={(val) => {
                const match = inventory.find((i: any) => (i.drugName || i.name) === val);
                if (match) {
                  form.setFieldsValue({ batchNo: match.batchNo || match.batchNumber });
                }
              }}
            />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item label="Batch No" name="batchNo" rules={[{ required: true }]}>
              <Input placeholder="BT-SOR-09" className="font-mono uppercase" />
            </Form.Item>
            <Form.Item label="Transfer Quantity" name="quantity" rules={[{ required: true }]} initialValue={50}>
              <InputNumber className="w-full" min={1} />
            </Form.Item>
            <Form.Item label="Requested By Staff" name="requestedBy" rules={[{ required: true }]} initialValue="Nurse Incharge / Sr. Pharmacist">
              <Input />
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
              Confirm Transfer
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
