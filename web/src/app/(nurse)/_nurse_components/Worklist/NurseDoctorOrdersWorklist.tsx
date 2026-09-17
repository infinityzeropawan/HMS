"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Input, message } from "antd";
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, User, BedDouble, Check } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";

interface NursingTask {
  id: string;
  bedNumber: string;
  patientName: string;
  doctorName: string;
  orderText: string;
  priority: "URGENT_STAT" | "HIGH" | "ROUTINE";
  category: "MEDICATION" | "IV_DRIP" | "DRESSING" | "LAB_SPECIMEN" | "BLOOD_TRANSFUSION";
  orderedAt: string;
  status: "PENDING" | "EXECUTED";
  executedAt?: string;
  executedBy?: string;
}

export const NurseDoctorOrdersWorklist: React.FC = () => {
  const [tasks, setTasks] = useState<NursingTask[]>([
    {
      id: "task-101",
      bedNumber: "ICU-BED-01",
      patientName: "Sunil Verma",
      doctorName: "Dr. Rajesh Sharma",
      orderText: "Administer Inj. Heparin 5000 IU IV Bolus stat. Repeat ABG in 2 hours.",
      priority: "URGENT_STAT",
      category: "MEDICATION",
      orderedAt: "2026-09-16 09:30 AM",
      status: "PENDING",
    },
    {
      id: "task-102",
      bedNumber: "WARD-3B-04",
      patientName: "Anita Roy",
      doctorName: "Dr. Manoj Patil",
      orderText: "Perform sterile surgical dressing change on Right Knee operative wound.",
      priority: "HIGH",
      category: "DRESSING",
      orderedAt: "2026-09-16 10:15 AM",
      status: "PENDING",
    },
    {
      id: "task-103",
      bedNumber: "DELUXE-402",
      patientName: "Rajesh Kulkarni",
      doctorName: "Dr. Priya Nair",
      orderText: "Collect repeat Venous Blood Sample for Serum Potassium & Creatinine re-check.",
      priority: "URGENT_STAT",
      category: "LAB_SPECIMEN",
      orderedAt: "2026-09-16 08:45 AM",
      status: "EXECUTED",
      executedAt: "2026-09-16 09:00 AM",
      executedBy: "Nurse Sunita Deshmukh",
    },
  ]);

  const handleExecuteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "EXECUTED",
              executedAt: new Date().toLocaleTimeString(),
              executedBy: "Nurse Duty Station",
            }
          : t
      )
    );
    message.success("Doctor order task executed and signed off!");
  };

  const columns = [
    {
      title: "Bed & Patient",
      key: "patient",
      render: (_: unknown, record: NursingTask) => (
        <div>
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {record.bedNumber}
          </span>
          <h4 className="font-bold text-slate-900 text-sm mt-1">{record.patientName}</h4>
        </div>
      ),
    },
    {
      title: "Doctor Order",
      key: "order",
      render: (_: unknown, record: NursingTask) => (
        <div>
          <p className="font-semibold text-xs text-slate-900">{record.orderText}</p>
          <p className="text-3xs text-slate-400 font-mono mt-0.5">
            Ordered by: <strong className="text-slate-700">{record.doctorName}</strong> ({record.orderedAt})
          </p>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (p: NursingTask["priority"]) => {
        if (p === "URGENT_STAT")
          return <Tag color="rose" className="font-bold text-3xs"><AlertTriangle className="w-3 h-3 inline mr-1" /> URGENT STAT</Tag>;
        if (p === "HIGH") return <Tag color="gold" className="font-bold text-3xs">HIGH PRIORITY</Tag>;
        return <Tag color="blue" className="font-bold text-3xs">ROUTINE</Tag>;
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: NursingTask) => {
        if (record.status === "EXECUTED") {
          return (
            <div>
              <Tag color="emerald" className="font-bold text-3xs"><CheckCircle2 className="w-3 h-3 inline mr-1" /> EXECUTED</Tag>
              <p className="text-3xs text-slate-400 font-mono mt-0.5">{record.executedAt} by {record.executedBy}</p>
            </div>
          );
        }
        return <Tag color="orange" className="font-bold text-3xs">PENDING ACTION</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: NursingTask) => (
        record.status === "PENDING" ? (
          <HmsButton size="sm" variant="emerald" icon={<Check className="w-3.5 h-3.5" />} onClick={() => handleExecuteTask(record.id)}>
            Mark Executed
          </HmsButton>
        ) : (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Done
          </span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" /> Doctor Clinical Orders & Nursing Worklist
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized nursing task queue for executing doctor STAT orders, IV drip adjustments, and dressing changes.
          </p>
        </div>

        <Tag color="rose" className="font-bold px-3 py-1 text-xs">
          {tasks.filter((t) => t.status === "PENDING").length} Pending Tasks
        </Tag>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={tasks} rowKey="id" pagination={false} />
      </div>
    </div>
  );
};
