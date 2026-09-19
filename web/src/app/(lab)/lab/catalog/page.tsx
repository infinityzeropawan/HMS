"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, Switch, message } from "antd";
import { Microscope, Plus, ArrowLeft, ShieldCheck, Search, TestTube } from "lucide-react";
import Link from "next/link";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useLabStore, LabTestCatalogItem } from "../../_lab_stores/lab_store";

export default function LabCatalogPage() {
  const { testCatalog, addTestCatalogItem } = useLabStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAddCatalogItem = (values: {
    testCode: string;
    testName: string;
    category: LabTestCatalogItem["category"];
    containerType: LabTestCatalogItem["containerType"];
    normalRange: string;
    unit: string;
    unitPrice: number;
    tatHours: number;
    nablAccredited: boolean;
  }) => {
    addTestCatalogItem({
      ...values,
      nablAccredited: values.nablAccredited ?? true,
    });
    message.success(`Test ${values.testName} (${values.testCode}) added to Master Test Catalog!`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const filteredCatalog = testCatalog.filter(
    (item) =>
      item.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.testCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      title: "Test Code",
      dataIndex: "testCode",
      key: "testCode",
      render: (code: string) => <span className="font-mono font-bold text-purple-700">{code}</span>,
    },
    {
      title: "Test Name & Category",
      key: "testName",
      render: (_: unknown, record: LabTestCatalogItem) => (
        <div>
          <span className="font-bold text-slate-900 block">{record.testName}</span>
          <Tag color="purple" className="text-[11px] mt-0.5">{record.category}</Tag>
        </div>
      ),
    },
    {
      title: "Container Tube",
      dataIndex: "containerType",
      key: "containerType",
      render: (tube: string) => (
        <Tag color={tube === "EDTA_PURPLE" ? "purple" : tube === "SERUM_RED" ? "red" : "blue"} className="font-bold text-xs">
          {tube.replace("_", " ")}
        </Tag>
      ),
    },
    {
      title: "Reference Normal Range",
      dataIndex: "normalRange",
      key: "normalRange",
      render: (range: string) => <span className="text-xs text-slate-700 font-medium">{range}</span>,
    },
    {
      title: "Unit Tariff (₹)",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => <span className="font-bold text-emerald-800 font-mono">₹{price}</span>,
    },
    {
      title: "TAT (Hours)",
      dataIndex: "tatHours",
      key: "tatHours",
      render: (tat: number) => <span className="text-xs font-mono font-semibold">{tat} hrs</span>,
    },
    {
      title: "NABL Verified",
      dataIndex: "nablAccredited",
      key: "nablAccredited",
      render: (nabl: boolean) => (
        <Tag icon={<ShieldCheck className="w-3 h-3" />} color={nabl ? "green" : "default"}>
          {nabl ? "ISO 15189" : "Standard"}
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
            <Microscope className="w-6 h-6 text-purple-600" />
            Master Pathology Test Catalog
          </h1>
          <p className="text-xs text-slate-500">Configure lab test parameters, reference ranges, specimen container tubes, and NABL accreditation status.</p>
        </div>
        <HmsButton
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Diagnostic Test
        </HmsButton>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
        <Input
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Search by test name, test code, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80"
          allowClear
        />
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          Total Configured Tests: {testCatalog.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table columns={columns} dataSource={filteredCatalog} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Add Test Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-purple-700 font-bold border-b pb-3 pr-6">
            <Microscope className="w-5 h-5 text-purple-600" />
            <span>Configure Master Lab Test</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddCatalogItem} className="pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Test Code" name="testCode" rules={[{ required: true }]} initialValue={`LAB-TST-${Math.floor(10 + Math.random() * 90)}`}>
              <Input className="font-mono uppercase" />
            </Form.Item>

            <Form.Item label="Test Name" name="testName" rules={[{ required: true }]}>
              <Input placeholder="e.g. Thyroid Profile (T3, T4, TSH)" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item label="Department Category" name="category" rules={[{ required: true }]} initialValue="HAEMATOLOGY">
              <Select>
                <Select.Option value="HAEMATOLOGY">Haematology</Select.Option>
                <Select.Option value="BIOCHEMISTRY">Biochemistry</Select.Option>
                <Select.Option value="MICROBIOLOGY">Microbiology</Select.Option>
                <Select.Option value="SEROLOGY">Serology</Select.Option>
                <Select.Option value="HISTOPATHOLOGY">Histopathology</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Specimen Tube Container" name="containerType" rules={[{ required: true }]} initialValue="EDTA_PURPLE">
              <Select>
                <Select.Option value="EDTA_PURPLE">EDTA Purple Tube</Select.Option>
                <Select.Option value="SERUM_RED">Serum Red Top Tube</Select.Option>
                <Select.Option value="CITRATE_BLUE">Sodium Citrate Blue Tube</Select.Option>
                <Select.Option value="URINE_CONTAINER">Sterile Urine Container</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Reference Normal Range" name="normalRange" rules={[{ required: true }]}>
            <Input placeholder="e.g. TSH: 0.4 - 4.2 µIU/mL" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item label="Unit Tariff Rate (₹)" name="unitPrice" rules={[{ required: true }]} initialValue={450}>
              <InputNumber className="w-full" min={0} />
            </Form.Item>

            <Form.Item label="TAT (Hours)" name="tatHours" rules={[{ required: true }]} initialValue={4}>
              <InputNumber className="w-full" min={1} max={168} />
            </Form.Item>

            <Form.Item label="NABL Accredited Test" name="nablAccredited" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="ISO 15189" unCheckedChildren="No" />
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
              Save Test to Catalog
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
