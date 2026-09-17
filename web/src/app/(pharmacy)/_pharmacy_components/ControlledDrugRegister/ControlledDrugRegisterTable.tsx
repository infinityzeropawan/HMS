"use client";

import React, { useState, useEffect } from "react";
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Space, Table, Tag, Typography, message, Modal, Form, Input, Select, InputNumber } from "antd";
import type { ColumnsType } from "antd/es/table";

export interface ControlledDrugRecord {
  id: string;
  drugName: string;
  scheduleClass: "H" | "H1" | "X";
  patientName: string;
  uhid: string;
  prescriberRegNo: string;
  patientIdProof: string;
  quantityDispensed: number;
  unit: string;
  dispensedAt: string;
  dispensedBy: string;
  batchNumber: string;
}

const MOCK_CDR: ControlledDrugRecord[] = [
  {
    id: "cdr-001",
    drugName: "Alprazolam 0.5mg",
    scheduleClass: "H1",
    patientName: "Ramesh Kumar",
    uhid: "P-2026-1058",
    prescriberRegNo: "MH-NMC-12345",
    patientIdProof: "Aadhaar XXXX-XXXX-1234",
    quantityDispensed: 10,
    unit: "Tabs",
    dispensedAt: "2026-09-08T09:15:00Z",
    dispensedBy: "Pharm. Anjali Shah",
    batchNumber: "BT-ALP-001",
  },
  {
    id: "cdr-002",
    drugName: "Morphine Sulfate 10mg",
    scheduleClass: "X",
    patientName: "Priya Sharma",
    uhid: "P-2026-1062",
    prescriberRegNo: "MH-NMC-67890",
    patientIdProof: "Aadhaar XXXX-XXXX-5678",
    quantityDispensed: 5,
    unit: "Inj",
    dispensedAt: "2026-09-08T11:30:00Z",
    dispensedBy: "Pharm. Rohan Tiwari",
    batchNumber: "BT-MOR-002",
  },
  {
    id: "cdr-003",
    drugName: "Clonazepam 1mg",
    scheduleClass: "H",
    patientName: "Arjun Mehta",
    uhid: "P-2026-1070",
    prescriberRegNo: "MH-NMC-11223",
    patientIdProof: "Aadhaar XXXX-XXXX-9012",
    quantityDispensed: 30,
    unit: "Tabs",
    dispensedAt: "2026-09-07T16:45:00Z",
    dispensedBy: "Pharm. Anjali Shah",
    batchNumber: "BT-CLO-003",
  },
  {
    id: "cdr-004",
    drugName: "Fentanyl Patch 25mcg/hr",
    scheduleClass: "X",
    patientName: "Sunita Patel",
    uhid: "P-2026-1075",
    prescriberRegNo: "MH-NMC-44556",
    patientIdProof: "Aadhaar XXXX-XXXX-3456",
    quantityDispensed: 2,
    unit: "Patch",
    dispensedAt: "2026-09-07T10:00:00Z",
    dispensedBy: "Pharm. Rohan Tiwari",
    batchNumber: "BT-FEN-004",
  },
  {
    id: "cdr-005",
    drugName: "Diazepam 5mg",
    scheduleClass: "H",
    patientName: "Deepak Singh",
    uhid: "P-2026-1082",
    prescriberRegNo: "MH-NMC-77889",
    patientIdProof: "Aadhaar XXXX-XXXX-7890",
    quantityDispensed: 15,
    unit: "Tabs",
    dispensedAt: "2026-09-06T14:20:00Z",
    dispensedBy: "Pharm. Anjali Shah",
    batchNumber: "BT-DIA-005",
  },
];

const SCHEDULE_COLOR: Record<string, string> = {
  H: "warning",
  H1: "error",
  X: "error",
};

function getColumns(): ColumnsType<ControlledDrugRecord> {
  return [
    {
      title: "Drug Name",
      dataIndex: "drugName",
      key: "drugName",
      render: (val, rec) => (
        <Space>
          <Tag color={SCHEDULE_COLOR[rec.scheduleClass]}>
            SCHEDULE-{rec.scheduleClass}
          </Tag>
          <Typography.Text strong>{val}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Patient",
      key: "patient",
      render: (_, rec) => (
        <div>
          <Typography.Text>{rec.patientName}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {rec.uhid}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "ID Proof",
      dataIndex: "patientIdProof",
      key: "patientIdProof",
      render: (val) => <Typography.Text type="secondary">{val}</Typography.Text>,
    },
    {
      title: "Prescriber NMC",
      dataIndex: "prescriberRegNo",
      key: "prescriberRegNo",
      render: (val) => <Typography.Text code>{val}</Typography.Text>,
    },
    {
      title: "Batch No.",
      dataIndex: "batchNumber",
      key: "batchNumber",
      render: (val) => <Typography.Text code>{val}</Typography.Text>,
    },
    {
      title: "Qty",
      key: "qty",
      render: (_, rec) => `${rec.quantityDispensed} ${rec.unit}`,
    },
    {
      title: "Dispensed By",
      dataIndex: "dispensedBy",
      key: "dispensedBy",
    },
    {
      title: "Date & Time",
      dataIndex: "dispensedAt",
      key: "dispensedAt",
      render: (val) =>
        new Date(val).toLocaleString("en-IN", {
          dateStyle: "short",
          timeStyle: "short",
        }),
      sorter: (a, b) =>
        new Date(a.dispensedAt).getTime() - new Date(b.dispensedAt).getTime(),
      defaultSortOrder: "descend",
    },
  ];
}

export function ControlledDrugRegisterTable() {
  const [records, setRecords] = useState<ControlledDrugRecord[]>(MOCK_CDR);
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_controlled_drugs");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.length > 0) {
            setRecords([...list, ...MOCK_CDR]);
          }
        } catch {
          /* use default mock */
        }
      }
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogNewEntry = (values: Record<string, any>) => {
    const newRecord: ControlledDrugRecord = {
      id: `cdr-${Date.now()}`,
      drugName: values.drugName,
      scheduleClass: values.scheduleClass,
      patientName: values.patientName,
      uhid: values.uhid,
      prescriberRegNo: values.prescriberRegNo,
      patientIdProof: values.patientIdProof,
      quantityDispensed: Number(values.quantityDispensed),
      unit: values.unit,
      dispensedAt: new Date().toISOString(),
      dispensedBy: values.dispensedBy || "Pharm. Anjali Shah",
      batchNumber: values.batchNumber,
    };

    const updated = [newRecord, ...records];
    setRecords(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("hms_controlled_drugs", JSON.stringify(updated));
    }

    message.success(`Schedule ${values.scheduleClass} entry logged for ${values.drugName}! Mandatory CDSCO audit record generated.`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDownloadReport = () => {
    message.success("Generating Monthly CDSCO Schedule H/H1/X Compliance Audit Report (PDF)...");
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.drugName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSchedule =
      scheduleFilter === "ALL" || rec.scheduleClass === scheduleFilter;
    return matchesSearch && matchesSchedule;
  });

  return (
    <div className="space-y-4">
      {/* Regulatory Warning Alert */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs gap-2">
        <Space>
          <ExclamationCircleOutlined style={{ color: "#d97706" }} />
          <Typography.Text type="warning" strong>
            Append-only register. Deletion or modification is prohibited under CDSCO Schedule H/H1/X regulations.
          </Typography.Text>
        </Space>
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-sm"
          >
            <PlusOutlined /> Log Schedule Drug Entry
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            📄 Monthly Audit PDF
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search Drug, Patient, UHID or Batch #"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72"
            allowClear
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Filter Schedule:</span>
          <Select
            value={scheduleFilter}
            onChange={(val) => setScheduleFilter(val)}
            className="w-40"
          >
            <Select.Option value="ALL">All Schedules</Select.Option>
            <Select.Option value="H">Schedule H (Prescription)</Select.Option>
            <Select.Option value="H1">Schedule H1 (Controlled)</Select.Option>
            <Select.Option value="X">Schedule X (Narcotics)</Select.Option>
          </Select>
        </div>
      </div>

      {/* Smartphone Mobile Cards Layout */}
      <div className="block sm:hidden space-y-3">
        {filteredRecords.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded-xl border space-y-2 text-xs ${
              rec.scheduleClass === "X"
                ? "bg-rose-50/70 border-rose-200"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{rec.drugName}</span>
              <Tag color={SCHEDULE_COLOR[rec.scheduleClass]}>SCHEDULE-{rec.scheduleClass}</Tag>
            </div>
            <div className="text-slate-600 bg-slate-50 p-2 rounded space-y-0.5">
              <div>
                Patient: <strong>{rec.patientName}</strong> ({rec.uhid})
              </div>
              <div>ID Proof: {rec.patientIdProof}</div>
              <div>
                NMC Reg: <span className="font-mono text-purple-700">{rec.prescriberRegNo}</span>
              </div>
            </div>
            <div className="flex justify-between text-slate-500 pt-1 font-mono">
              <span>Batch: {rec.batchNumber}</span>
              <span>
                Qty: <strong>{rec.quantityDispensed} {rec.unit}</strong>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-100 pt-1">
              <span>By: {rec.dispensedBy}</span>
              <span>{new Date(rec.dispensedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden sm:block overflow-x-auto">
        <Table<ControlledDrugRecord>
          id="controlled-drug-register-table"
          rowKey="id"
          columns={getColumns()}
          dataSource={filteredRecords}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} records` }}
          scroll={{ x: 1000 }}
          rowClassName={(rec) => (rec.scheduleClass === "X" ? "hms-row-critical" : "")}
        />
      </div>

      {/* Log Schedule H/H1/X Entry Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-700 font-bold">
            <SafetyCertificateOutlined className="text-lg" />
            <span>Log Controlled Drug Dispensation (Schedule H / H1 / X)</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogNewEntry}
          initialValues={{
            scheduleClass: "H1",
            unit: "Tabs",
            dispensedBy: "Pharm. Anjali Shah (Reg # 98142)",
            patientIdProof: "Aadhaar XXXX-XXXX-4589",
          }}
          className="mt-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Schedule Class" name="scheduleClass" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="H">Schedule H (Warning Tag Required)</Select.Option>
                <Select.Option value="H1">Schedule H1 (Register Entry Mandatory)</Select.Option>
                <Select.Option value="X">Schedule X (Narcotic / Vault Permit)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Drug Name & Strength" name="drugName" rules={[{ required: true }]}>
              <Input placeholder="e.g. Morphine 10mg / Alprazolam 0.5mg" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Patient Name" name="patientName" rules={[{ required: true }]}>
              <Input placeholder="Enter patient full name" size="large" />
            </Form.Item>
            <Form.Item label="Patient UHID" name="uhid" rules={[{ required: true }]}>
              <Input placeholder="e.g. P-2026-1049" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Prescribing Doctor NMC Reg #" name="prescriberRegNo" rules={[{ required: true }]}>
              <Input placeholder="e.g. MH-NMC-45891" size="large" />
            </Form.Item>
            <Form.Item label="Patient Aadhaar / Govt ID" name="patientIdProof" rules={[{ required: true }]}>
              <Input placeholder="Aadhaar / Driving License" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Form.Item label="Batch Number" name="batchNumber" rules={[{ required: true }]}>
              <Input placeholder="e.g. BT-MOR-902" size="large" />
            </Form.Item>
            <Form.Item label="Qty Dispensed" name="quantityDispensed" rules={[{ required: true }]}>
              <InputNumber min={1} max={100} className="w-full" size="large" />
            </Form.Item>
            <Form.Item label="Unit" name="unit" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="Tabs">Tabs</Select.Option>
                <Select.Option value="Inj">Inj</Select.Option>
                <Select.Option value="Patch">Patch</Select.Option>
                <Select.Option value="Syrup">Syrup</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Dispensing Pharmacist Sign-Off" name="dispensedBy" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            <strong>Legal Declaration:</strong> By submitting this entry, I confirm that the original hardcopy doctor prescription has been physically verified and signed.
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
            >
              Submit & Sign Entry
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
