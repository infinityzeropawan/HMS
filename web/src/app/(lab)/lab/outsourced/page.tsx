"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, message } from "antd";
import { Truck, Plus, ArrowLeft, Building2, TestTube, Barcode, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useLabStore, ReferralLabOrder } from "../../_lab_stores/lab_store";

export default function ReferralLabOutsourcedPage() {
  const { outsourcedOrders, dispatchOutsourcedOrder } = useLabStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleDispatchOrder = (values: {
    patientUhid: string;
    patientName: string;
    testName: string;
    referralLabName: ReferralLabOrder["referralLabName"];
    courierTrackingNo: string;
    coldChainTemp: string;
  }) => {
    dispatchOutsourcedOrder({
      patientUhid: values.patientUhid,
      patientName: values.patientName,
      testName: values.testName,
      referralLabName: values.referralLabName,
      dispatchDate: new Date().toLocaleString(),
      courierTrackingNo: values.courierTrackingNo || `AWB-${Math.floor(1000000 + Math.random() * 9000000)}`,
      coldChainTemp: values.coldChainTemp || "2 - 8 °C",
    });
    message.success(`Outsourced sample dispatched to ${values.referralLabName} for ${values.patientName}!`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "Referral Order #",
      dataIndex: "referralOrderNo",
      key: "referralOrderNo",
      render: (num: string) => <span className="font-mono font-bold text-purple-700">{num}</span>,
    },
    {
      title: "Patient UHID & Name",
      key: "patient",
      render: (_: unknown, record: ReferralLabOrder) => (
        <div>
          <span className="font-bold text-slate-900 block">{record.patientName}</span>
          <span className="text-xs font-mono text-slate-500">{record.patientUhid}</span>
        </div>
      ),
    },
    {
      title: "Specialized Test",
      dataIndex: "testName",
      key: "testName",
      render: (test: string) => <span className="font-semibold text-slate-800 text-xs">{test}</span>,
    },
    {
      title: "Target Reference Lab",
      dataIndex: "referralLabName",
      key: "referralLabName",
      render: (lab: string) => <Tag color="blue" className="font-bold">{lab}</Tag>,
    },
    {
      title: "Courier AWB & Cold Chain",
      key: "courier",
      render: (_: unknown, record: ReferralLabOrder) => (
        <div className="text-xs">
          <p className="font-mono font-semibold text-purple-700">{record.courierTrackingNo}</p>
          <p className="text-slate-500 text-[11px]">Temp: {record.coldChainTemp}</p>
        </div>
      ),
    },
    {
      title: "Dispatch Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "DISPATCHED" ? "orange" : status === "REPORT_RECEIVED" ? "green" : "purple"}>
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
          <Link href="/lab" className="text-slate-500 hover:text-slate-700 text-xs flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Pathology Console
          </Link>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-600" />
            Referral Lab & Outsourced Specimen Dispatch
          </h1>
          <p className="text-xs text-slate-500">Dispatch specialized biopsy and genetic testing samples to accredited external reference laboratories.</p>
        </div>
        <HmsButton
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Dispatch Sample to Referral Lab
        </HmsButton>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table columns={columns} dataSource={outsourcedOrders} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Dispatch Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-purple-700 font-bold border-b pb-3 pr-6">
            <Truck className="w-5 h-5 text-purple-600" />
            <span>Dispatch Specimen to External Reference Lab</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleDispatchOrder} className="pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Patient UHID" name="patientUhid" rules={[{ required: true }]}>
              <Input placeholder="P-2026-1049" className="font-mono uppercase" />
            </Form.Item>
            <Form.Item label="Patient Name" name="patientName" rules={[{ required: true }]}>
              <Input placeholder="Sunil Verma" />
            </Form.Item>
          </div>

          <Form.Item label="Specialized Diagnostic Test" name="testName" rules={[{ required: true }]} initialValue="HLA-B27 Genetic Marker / PCR">
            <Input />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Accredited Referral Lab" name="referralLabName" rules={[{ required: true }]} initialValue="Lal PathLabs">
              <Select>
                <Select.Option value="Lal PathLabs">Dr. Lal PathLabs</Select.Option>
                <Select.Option value="Metropolis Healthcare">Metropolis Healthcare</Select.Option>
                <Select.Option value="SRL Diagnostics">SRL Diagnostics</Select.Option>
                <Select.Option value="Thyrocare">Thyrocare Technologies</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Cold Chain Specimen Temp" name="coldChainTemp" initialValue="2 - 8 °C">
              <Select>
                <Select.Option value="2 - 8 °C">2 - 8 °C (Refrigerated)</Select.Option>
                <Select.Option value="-20 °C Frozen">-20 °C (Deep Frozen)</Select.Option>
                <Select.Option value="Ambient Room Temp">Ambient Room Temp</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Courier AWB Tracking Number" name="courierTrackingNo" initialValue={`AWB-${Math.floor(1000000 + Math.random() * 9000000)}`}>
            <Input className="font-mono uppercase" />
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
              Confirm Dispatch
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
