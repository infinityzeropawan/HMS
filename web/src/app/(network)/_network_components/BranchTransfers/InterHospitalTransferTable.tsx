"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag, message, Modal, Form, Input, Select, Radio } from "antd";
import { SearchOutlined, PlusOutlined, CheckCircleOutlined, SendOutlined } from "@ant-design/icons";
import { CheckCircle2, Building2, Truck, UserCheck, ShieldAlert } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export interface InterHospitalTransferRecord {
  key: string;
  transferId: string;
  type: "PATIENT_TRANSFER" | "PHARMACY_STOCK" | "BLOOD_BANK" | "MEDICAL_EQUIPMENT";
  originBranch: string;
  targetBranch: string;
  item: string;
  uhid?: string;
  vehicleNo: string;
  paramedic: string;
  priority: "EMERGENCY_RED" | "HIGH_YELLOW" | "ROUTINE_GREEN";
  status: "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
  dispatchedAt: string;
  completedAt?: string;
}

const INITIAL_TRANSFERS: InterHospitalTransferRecord[] = [
  {
    key: "1",
    transferId: "TRF-8801",
    type: "PATIENT_TRANSFER",
    originBranch: "HMS Main Hospital (Colaba)",
    targetBranch: "HMS Cardiac Institute (Bandra)",
    item: "Sunil Verma (Post-Op Angioplasty ICU Care)",
    uhid: "P-2026-1049",
    vehicleNo: "MH-01-AMB-8801 (ALS Cardiac Ambulance)",
    paramedic: "Paramedic Vikram R. & Dr. Alok",
    priority: "EMERGENCY_RED",
    status: "IN_TRANSIT",
    dispatchedAt: "2026-09-17T09:30:00Z",
  },
  {
    key: "2",
    transferId: "TRF-8805",
    type: "PHARMACY_STOCK",
    originBranch: "Central Pharma Warehouse",
    targetBranch: "HMS Main Hospital (Colaba)",
    item: "Tab Sorbitrate 5mg & Inj Morphine (1,500 Units)",
    vehicleNo: "MH-01-LOG-102 (Cold-Chain Van)",
    paramedic: "Logistics Officer Rajesh",
    priority: "HIGH_YELLOW",
    status: "COMPLETED",
    dispatchedAt: "2026-09-17T08:00:00Z",
    completedAt: "2026-09-17T09:15:00Z",
  },
  {
    key: "3",
    transferId: "TRF-8809",
    type: "BLOOD_BANK",
    originBranch: "HMS Main Hospital Blood Vault",
    targetBranch: "HMS City OPD Clinic (Thane)",
    item: "O-Negative Packed Red Blood Cells (4 Units)",
    uhid: "P-2026-1065",
    vehicleNo: "MH-01-AMB-9902 (Rapid Response)",
    paramedic: "Blood Bank Officer Sneha",
    priority: "EMERGENCY_RED",
    status: "IN_TRANSIT",
    dispatchedAt: "2026-09-17T10:10:00Z",
  },
  {
    key: "4",
    transferId: "TRF-8812",
    type: "PATIENT_TRANSFER",
    originBranch: "HMS City OPD Clinic (Thane)",
    targetBranch: "HMS Main Hospital (Colaba)",
    item: "Anjali Gupta (Pediatric Emergency Ward)",
    uhid: "P-2026-1052",
    vehicleNo: "MH-01-AMB-7703 (BLS Ambulance)",
    paramedic: "Paramedic Suman S.",
    priority: "HIGH_YELLOW",
    status: "IN_TRANSIT",
    dispatchedAt: "2026-09-17T10:25:00Z",
  },
  {
    key: "5",
    transferId: "TRF-8815",
    type: "MEDICAL_EQUIPMENT",
    originBranch: "HMS Main Hospital (Colaba)",
    targetBranch: "HMS Cardiac Institute (Bandra)",
    item: "Draeger Evita V800 ICU Ventilator Unit",
    vehicleNo: "MH-01-LOG-505 (BioMed Logistics)",
    paramedic: "Eng. Suresh Patil",
    priority: "ROUTINE_GREEN",
    status: "COMPLETED",
    dispatchedAt: "2026-09-16T15:00:00Z",
    completedAt: "2026-09-16T16:30:00Z",
  },
];

const PRIORITY_TAG: Record<string, { color: string; label: string }> = {
  EMERGENCY_RED: { color: "error", label: "RED (Emergency)" },
  HIGH_YELLOW: { color: "warning", label: "YELLOW (High)" },
  ROUTINE_GREEN: { color: "success", label: "GREEN (Routine)" },
};

export const InterHospitalTransferTable: React.FC = () => {
  const [transfers, setTransfers] = useState<InterHospitalTransferRecord[]>(INITIAL_TRANSFERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_TRANSIT" | "COMPLETED">("IN_TRANSIT");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_network_transfers");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.length > 0) {
            setTransfers([...list, ...INITIAL_TRANSFERS]);
            return;
          }
        } catch { /* use initial */ }
      }
    }
  }, []);

  const updateAndSaveState = (updated: InterHospitalTransferRecord[]) => {
    setTransfers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_network_transfers", JSON.stringify(updated));
    }
  };

  const handleAcknowledge = (transferId: string) => {
    const updated = transfers.map((t) =>
      t.transferId === transferId
        ? { ...t, status: "COMPLETED" as const, completedAt: new Date().toISOString() }
        : t
    );
    updateAndSaveState(updated);
    message.success(`Transfer ${transferId} acknowledged and marked COMPLETED! Destination receiving log updated.`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDispatchNewTransfer = (values: Record<string, any>) => {
    const nextSeq = Date.now().toString().slice(-4);
    const newRecord: InterHospitalTransferRecord = {
      key: `trf-${Date.now()}`,
      transferId: `TRF-${nextSeq}`,
      type: values.type,
      originBranch: values.originBranch,
      targetBranch: values.targetBranch,
      item: values.item,
      uhid: values.uhid || undefined,
      vehicleNo: values.vehicleNo,
      paramedic: values.paramedic,
      priority: values.priority,
      status: "IN_TRANSIT",
      dispatchedAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...transfers];
    updateAndSaveState(updated);
    message.success(`Inter-branch transfer ${newRecord.transferId} dispatched! Ambulance transport notified.`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.transferId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.originBranch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.targetBranch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "Transfer ID",
      dataIndex: "transferId",
      key: "transferId",
      render: (val: string) => <span className="font-mono font-bold text-teal-700">{val}</span>,
    },
    {
      title: "Priority & Type",
      key: "type",
      render: (_: unknown, record: InterHospitalTransferRecord) => (
        <div className="space-y-1">
          <Tag color={record.type === "PATIENT_TRANSFER" ? "purple" : record.type === "BLOOD_BANK" ? "red" : "blue"}>
            {record.type.replace("_", " ")}
          </Tag>
          <Tag color={PRIORITY_TAG[record.priority]?.color}>
            {PRIORITY_TAG[record.priority]?.label}
          </Tag>
        </div>
      ),
    },
    {
      title: "Source Branch",
      dataIndex: "originBranch",
      key: "originBranch",
      render: (val: string) => <span className="text-xs font-semibold text-slate-800">{val}</span>,
    },
    {
      title: "Destination Branch",
      dataIndex: "targetBranch",
      key: "targetBranch",
      render: (val: string) => <span className="text-xs font-semibold text-purple-900">{val}</span>,
    },
    {
      title: "Patient / Item Description",
      key: "item",
      render: (_: unknown, record: InterHospitalTransferRecord) => (
        <div>
          <strong className="text-slate-900 block text-xs">{record.item}</strong>
          {record.uhid && <span className="text-[11px] font-mono text-slate-500">UHID: {record.uhid}</span>}
        </div>
      ),
    },
    {
      title: "Transport Vehicle & Paramedic",
      key: "transport",
      render: (_: unknown, record: InterHospitalTransferRecord) => (
        <div>
          <div className="flex items-center gap-1 text-xs font-mono text-emerald-800">
            <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{record.vehicleNo}</span>
          </div>
          <span className="text-[11px] text-slate-500 block">{record.paramedic}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={s === "COMPLETED" ? "emerald" : "orange"} className="font-semibold">
          {s.replace("_", " ")}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: InterHospitalTransferRecord) =>
        record.status === "IN_TRANSIT" ? (
          <HmsButton
            size="sm"
            type="primary"
            variant="emerald"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            onClick={() => handleAcknowledge(record.transferId)}
          >
            Acknowledge Receipt
          </HmsButton>
        ) : (
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Completed
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <Input
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search Transfer ID, Patient, Branch or Ambulance Vehicle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80"
          allowClear
        />

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Radio.Group
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="IN_TRANSIT">In Transit ({transfers.filter((t) => t.status === "IN_TRANSIT").length})</Radio.Button>
            <Radio.Button value="COMPLETED">Completed ({transfers.filter((t) => t.status === "COMPLETED").length})</Radio.Button>
            <Radio.Button value="ALL">All ({transfers.length})</Radio.Button>
          </Radio.Group>

          <HmsButton
            variant="emerald"
            icon={<SendOutlined />}
            onClick={() => setIsModalOpen(true)}
            size="md"
          >
            Dispatch Transfer
          </HmsButton>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <Table columns={columns} dataSource={filteredTransfers} rowKey="key" pagination={{ pageSize: 10 }} />
      </div>

      {/* Dispatch New Inter-Branch Referral / Transfer Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700 font-bold border-b pb-3">
            <Truck className="w-5 h-5 text-teal-600" />
            <span>Dispatch New Inter-Hospital Referral / Transfer</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={580}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleDispatchNewTransfer}
          initialValues={{
            type: "PATIENT_TRANSFER",
            originBranch: "HMS Main Hospital (Colaba)",
            targetBranch: "HMS Cardiac Institute (Bandra)",
            priority: "HIGH_YELLOW",
            vehicleNo: "MH-01-AMB-8801 (ALS ICU Ambulance)",
            paramedic: "Paramedic Vikram R. & Nurse Suman",
          }}
          className="mt-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Transfer Category" name="type" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="PATIENT_TRANSFER">Patient Referral / Transfer</Select.Option>
                <Select.Option value="PHARMACY_STOCK">Pharmacy Stock Transfer</Select.Option>
                <Select.Option value="BLOOD_BANK">Blood Bank Emergency Dispatch</Select.Option>
                <Select.Option value="MEDICAL_EQUIPMENT">Biomedical Equipment Relocation</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Priority Level" name="priority" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="EMERGENCY_RED">RED - Critical ICU Emergency</Select.Option>
                <Select.Option value="HIGH_YELLOW">YELLOW - High Priority Transfer</Select.Option>
                <Select.Option value="ROUTINE_GREEN">GREEN - Routine Scheduled Shift</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Origin Hospital / Branch" name="originBranch" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="HMS Main Hospital (Colaba)">HMS Main Hospital (Colaba)</Select.Option>
                <Select.Option value="HMS Cardiac Institute (Bandra)">HMS Cardiac Institute (Bandra)</Select.Option>
                <Select.Option value="HMS City OPD Clinic (Thane)">HMS City OPD Clinic (Thane)</Select.Option>
                <Select.Option value="Central Pharma Warehouse">Central Pharma Warehouse</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Destination Hospital / Branch" name="targetBranch" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="HMS Cardiac Institute (Bandra)">HMS Cardiac Institute (Bandra)</Select.Option>
                <Select.Option value="HMS Main Hospital (Colaba)">HMS Main Hospital (Colaba)</Select.Option>
                <Select.Option value="HMS City OPD Clinic (Thane)">HMS City OPD Clinic (Thane)</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Form.Item label="Item / Patient Name" name="item" rules={[{ required: true }]} className="col-span-2">
              <Input placeholder="e.g. Sunil Verma (ICU Transfer)" size="large" />
            </Form.Item>
            <Form.Item label="Patient UHID (Optional)" name="uhid">
              <Input placeholder="e.g. P-2026-1049" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Ambulance / Logistics Vehicle No." name="vehicleNo" rules={[{ required: true }]}>
              <Input placeholder="e.g. MH-01-AMB-8801" size="large" />
            </Form.Item>
            <Form.Item label="Attending Paramedic / Escort" name="paramedic" rules={[{ required: true }]}>
              <Input placeholder="Paramedic name" size="large" />
            </Form.Item>
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900">
            <strong>Network Sync:</strong> Submitting will instantly alert the destination branch receiving desk and dispatch transport fleet tracking.
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <SendOutlined /> Confirm & Dispatch Transfer
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
