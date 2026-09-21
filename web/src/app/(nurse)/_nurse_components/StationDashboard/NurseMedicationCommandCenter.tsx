"use client";

import React, { useState } from "react";
import { Tag, Table, Progress } from "antd";
import { Pill, Clock, AlertOctagon, CheckCircle2, ShieldAlert } from "lucide-react";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { Patient360DrawerModal } from "../Patient360/Patient360DrawerModal";

interface MedScheduleRecord {
  key: string;
  uhid: string;
  ipdId: string;
  patientName: string;
  bedNumber: string;
  medication: string;
  route: string;
  scheduledTime: string;
  status: "DUE_NOW" | "DUE_30MIN" | "MISSED" | "STAT" | "CONTROLLED_H1";
}

export const NurseMedicationCommandCenter: React.FC = () => {
  const admissions = useIpdStore((state) => state.admissions);
  const [selectedUhid, setSelectedUhid] = useState<string | null>(null);

  const medSchedules: MedScheduleRecord[] = [
    {
      key: "m1",
      uhid: admissions[0]?.uhid || "P-2026-9912",
      ipdId: admissions[0]?.admissionNo || "IPD-2026-0881",
      patientName: admissions[0]?.patientName || "Sunil Verma",
      bedNumber: admissions[0]?.bedNumber || "ICU-BED-01",
      medication: "Inj Heparin 5000 IU IV Bolus",
      route: "IV Bolus",
      scheduledTime: "10:00 AM",
      status: "STAT",
    },
    {
      key: "m2",
      uhid: admissions[1]?.uhid || "P-2026-9944",
      ipdId: admissions[1]?.admissionNo || "IPD-2026-0895",
      patientName: admissions[1]?.patientName || "Anita Roy",
      bedNumber: admissions[1]?.bedNumber || "WARD-3B-04",
      medication: "Inj Augmentin 1.2g IV",
      route: "IV Infusion",
      scheduledTime: "10:15 AM",
      status: "DUE_NOW",
    },
    {
      key: "m3",
      uhid: admissions[2]?.uhid || "P-2026-9978",
      ipdId: admissions[2]?.admissionNo || "IPD-2026-0902",
      patientName: admissions[2]?.patientName || "Rajesh Kulkarni",
      bedNumber: admissions[2]?.bedNumber || "DELUXE-402",
      medication: "Tab Sorbitrate 5mg Sublingual",
      route: "Sublingual",
      scheduledTime: "10:30 AM",
      status: "DUE_30MIN",
    },
    {
      key: "m4",
      uhid: admissions[0]?.uhid || "P-2026-9912",
      ipdId: admissions[0]?.admissionNo || "IPD-2026-0881",
      patientName: admissions[0]?.patientName || "Sunil Verma",
      bedNumber: admissions[0]?.bedNumber || "ICU-BED-01",
      medication: "Inj Fentanyl 50mcg IV (Controlled H1)",
      route: "IV Push",
      scheduledTime: "09:30 AM",
      status: "CONTROLLED_H1",
    },
  ];

  const dueNowCount = medSchedules.filter((m) => m.status === "DUE_NOW" || m.status === "STAT").length;
  const due30MinCount = medSchedules.filter((m) => m.status === "DUE_30MIN").length;
  const statCount = medSchedules.filter((m) => m.status === "STAT").length;
  const controlledCount = medSchedules.filter((m) => m.status === "CONTROLLED_H1").length;

  const columns = [
    {
      title: "Bed & Patient",
      key: "patient",
      render: (_: unknown, record: MedScheduleRecord) => (
        <div
          onClick={() => setSelectedUhid(record.uhid)}
          className="cursor-pointer hover:underline"
        >
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
            {record.bedNumber}
          </span>
          <h4 className="font-bold text-slate-900 text-xs mt-0.5">{record.patientName}</h4>
        </div>
      ),
    },
    {
      title: "Medication & Route",
      key: "medication",
      render: (_: unknown, record: MedScheduleRecord) => (
        <div>
          <span className="font-semibold text-xs text-slate-900">{record.medication}</span>
          <span className="block text-3xs text-slate-400 font-mono">Route: {record.route}</span>
        </div>
      ),
    },
    {
      title: "Scheduled Time",
      dataIndex: "scheduledTime",
      key: "scheduledTime",
      render: (t: string) => <span className="font-mono text-xs text-purple-700 font-bold">{t}</span>,
    },
    {
      title: "Category / Priority",
      key: "status",
      render: (_: unknown, record: MedScheduleRecord) => {
        let color = "blue";
        let label: string = record.status;
        if (record.status === "STAT") {
          color = "error";
          label = "URGENT STAT";
        } else if (record.status === "DUE_NOW") {
          color = "warning";
          label = "DUE NOW";
        } else if (record.status === "CONTROLLED_H1") {
          color = "purple";
          label = "H1 CONTROLLED DRUG";
        } else if (record.status === "DUE_30MIN") {
          color = "cyan";
          label = "DUE IN 30M";
        }
        return <Tag color={color} className="text-3xs font-bold">{label}</Tag>;
      },
    },
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-600" /> Medication Command Center (MAR Surveillance)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Live MAR dose scheduling, STAT prescriptions, and H1 narcotics tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
          <span className="text-3xs font-bold text-purple-800 uppercase">Due Now</span>
          <h4 className="text-xl font-bold text-purple-900 mt-0.5">{dueNowCount} Doses</h4>
        </div>
        <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200 text-center">
          <span className="text-3xs font-bold text-cyan-800 uppercase">Due in 30 Mins</span>
          <h4 className="text-xl font-bold text-cyan-900 mt-0.5">{due30MinCount} Doses</h4>
        </div>
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
          <span className="text-3xs font-bold text-rose-800 uppercase">STAT Orders</span>
          <h4 className="text-xl font-bold text-rose-900 mt-0.5">{statCount} STAT</h4>
        </div>
        <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
          <span className="text-3xs font-bold text-indigo-800 uppercase">Controlled H1</span>
          <h4 className="text-xl font-bold text-indigo-900 mt-0.5">{controlledCount} Narcotics</h4>
        </div>
      </div>

      {/* Smartphone Mobile View */}
      <div className="block sm:hidden space-y-2">
        {medSchedules.map((m) => (
          <div
            key={m.key}
            onClick={() => setSelectedUhid(m.uhid)}
            className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5 cursor-pointer shadow-xs"
          >
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-900">{m.medication}</span>
              <Tag color={m.status === "STAT" ? "error" : m.status === "CONTROLLED_H1" ? "purple" : "warning"}>
                {m.status}
              </Tag>
            </div>
            <div className="flex justify-between text-slate-500 font-mono text-[11px]">
              <span>Bed: {m.bedNumber} ({m.patientName})</span>
              <span>Due: {m.scheduledTime}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden sm:block overflow-x-auto">
        <Table columns={columns} dataSource={medSchedules} pagination={false} size="small" rowKey="key" />
      </div>

      {selectedUhid && (
        <Patient360DrawerModal
          open={!!selectedUhid}
          onClose={() => setSelectedUhid(null)}
          uhid={selectedUhid}
        />
      )}
    </div>
  );
};
