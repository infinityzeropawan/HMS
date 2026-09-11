"use client";
import React, { useState, useEffect } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";

interface ControlledDrugRecord {
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
    uhid: "UHID-2024-001",
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
    uhid: "UHID-2024-002",
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
    uhid: "UHID-2024-003",
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
    uhid: "UHID-2024-004",
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
    uhid: "UHID-2024-005",
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_controlled_drugs");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.length > 0) {
            setRecords([...list, ...MOCK_CDR]);
          }
        } catch { /* use mock */ }
      }
    }
  }, []);

  const handleDownloadReport = () => {
    message.success("Generating Monthly CDSCO Schedule H/H1/X Compliance Audit Report (PDF)...");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs">
        <Space>
          <ExclamationCircleOutlined style={{ color: "var(--hms-alert-crimson)" }} />
          <Typography.Text type="danger" strong>
            Append-only register. Editing or deletion is not permitted per CDSCO Schedule H/H1/X regulations.
          </Typography.Text>
        </Space>
        <button
          onClick={handleDownloadReport}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium transition-colors cursor-pointer shrink-0"
        >
          📄 Monthly PDF Report
        </button>
      </div>

      {/* Smartphone Mobile Cards Layout */}
      <div className="block sm:hidden space-y-3">
        {records.map((rec) => (
          <div key={rec.id} className={`p-4 rounded-xl border space-y-2 text-xs ${rec.scheduleClass === "X" ? "bg-rose-50/70 border-rose-200" : "bg-white border-slate-200"}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{rec.drugName}</span>
              <Tag color={SCHEDULE_COLOR[rec.scheduleClass]}>SCHEDULE-{rec.scheduleClass}</Tag>
            </div>
            <div className="text-slate-600 bg-slate-50 p-2 rounded space-y-0.5">
              <div>Patient: <strong>{rec.patientName}</strong> ({rec.uhid})</div>
              <div>ID Proof: {rec.patientIdProof}</div>
              <div>NMC Reg: <span className="font-mono text-purple-700">{rec.prescriberRegNo}</span></div>
            </div>
            <div className="flex justify-between text-slate-500 pt-1 font-mono">
              <span>Batch: {rec.batchNumber}</span>
              <span>Qty: <strong>{rec.quantityDispensed} {rec.unit}</strong></span>
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
          dataSource={records}
          pagination={{ pageSize: 15, showTotal: (t) => `${t} records` }}
          scroll={{ x: 1000 }}
          rowClassName={(rec) => rec.scheduleClass === "X" ? "hms-row-critical" : ""}
        />
      </div>
    </div>
  );
}

