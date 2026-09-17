"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, InputNumber, Select, message } from "antd";
import { HeartPulse, Plus, AlertTriangle, CheckCircle2, Search, Activity, User, Clock } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useNurseVitalsStore, NurseVitalsRecord } from "../../_nurse_stores/nurse_vitals_store";

export const NurseVitalsEntryConsole: React.FC = () => {
  const { vitalsLogs, addVitalsRecord } = useNurseVitalsStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const payload = {
      ipdId: values.ipdId as string,
      uhid: values.uhid as string,
      patientName: values.patientName as string,
      bedNumber: values.bedNumber as string,
      bpSystolic: Number(values.bpSystolic) || 120,
      bpDiastolic: Number(values.bpDiastolic) || 80,
      pulseRate: Number(values.pulseRate) || 72,
      spO2Percent: Number(values.spO2Percent) || 98,
      temperatureFahrenheit: Number(values.temperatureFahrenheit) || 98.6,
      respirationRate: Number(values.respirationRate) || 16,
      painScore: Number(values.painScore) || 0,
      recordedAt: new Date().toLocaleString(),
      recordedBy: "Nurse Duty Station",
    };

    addVitalsRecord(payload);
    message.success(`Vitals recorded for ${payload.patientName} (${payload.bedNumber})`);
    setModalOpen(false);
  };

  const filteredLogs = vitalsLogs.filter(
    (v) =>
      v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.uhid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Bed & Patient",
      key: "patient",
      render: (_: unknown, record: NurseVitalsRecord) => (
        <div>
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {record.bedNumber}
          </span>
          <h4 className="font-bold text-slate-900 text-sm mt-1">{record.patientName}</h4>
          <p className="text-3xs text-slate-400 font-mono">UHID: {record.uhid} | {record.ipdId}</p>
        </div>
      ),
    },
    {
      title: "Blood Pressure (BP)",
      key: "bp",
      render: (_: unknown, record: NurseVitalsRecord) => {
        const isHigh = record.bpSystolic > 140;
        return (
          <span className={`font-mono text-xs font-bold ${isHigh ? "text-rose-600" : "text-slate-800"}`}>
            {record.bpSystolic} / {record.bpDiastolic} mmHg
          </span>
        );
      },
    },
    {
      title: "Pulse Rate",
      dataIndex: "pulseRate",
      key: "pulseRate",
      render: (pr: number) => <span className="font-mono text-xs font-semibold">{pr} bpm</span>,
    },
    {
      title: "SpO2 Oxygen %",
      dataIndex: "spO2Percent",
      key: "spO2Percent",
      render: (sp: number) => (
        <span className={`font-mono text-xs font-bold ${sp < 95 ? "text-rose-600" : "text-emerald-700"}`}>
          {sp}%
        </span>
      ),
    },
    {
      title: "Body Temp (°F)",
      dataIndex: "temperatureFahrenheit",
      key: "temperatureFahrenheit",
      render: (temp: number) => (
        <span className={`font-mono text-xs font-semibold ${temp > 100.4 ? "text-rose-600" : "text-slate-800"}`}>
          {temp} °F
        </span>
      ),
    },
    {
      title: "Recorded At & By",
      key: "recorded",
      render: (_: unknown, record: NurseVitalsRecord) => (
        <div className="text-3xs text-slate-500 font-mono space-y-0.5">
          <div><Clock className="w-3 h-3 inline text-slate-400 mr-1" />{record.recordedAt}</div>
          <div><User className="w-3 h-3 inline text-slate-400 mr-1" />{record.recordedBy}</div>
        </div>
      ),
    },
    {
      title: "Safety Alert Status",
      key: "status",
      render: (_: unknown, record: NurseVitalsRecord) => {
        if (record.isAbnormal) {
          return (
            <Tag color="rose" className="font-bold text-3xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> ABNORMAL WARNING
            </Tag>
          );
        }
        return <Tag color="emerald" className="font-bold text-3xs">NORMAL VITALS</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-teal-600" /> Patient Vitals Entry & Safety Charting Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log bedside vitals for inpatient ward beds. Automatic warning flags trigger for abnormal BP or oxygen drops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search bed # or patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Record Vitals
          </HmsButton>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={filteredLogs} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Record Vitals Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <HeartPulse className="w-5 h-5 text-teal-600" />
            <span>Record Bedside Patient Vitals</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Patient Name" name="patientName" rules={[{ required: true }]}>
              <Select placeholder="Select Inpatient" size="large">
                <Select.Option value="Sunil Verma">Sunil Verma (ICU-BED-01)</Select.Option>
                <Select.Option value="Anita Roy">Anita Roy (WARD-3B-04)</Select.Option>
                <Select.Option value="Rajesh Kulkarni">Rajesh Kulkarni (DELUXE-402)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Bed Number" name="bedNumber" rules={[{ required: true }]}>
              <Input placeholder="ICU-BED-01" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="UHID" name="uhid" initialValue="P-2026-9912">
              <Input />
            </Form.Item>
            <Form.Item label="IPD Admission #" name="ipdId" initialValue="IPD-2026-0881">
              <Input />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="BP Systolic (mmHg)" name="bpSystolic" rules={[{ required: true }]}>
              <InputNumber min={60} max={250} className="w-full" size="large" />
            </Form.Item>

            <Form.Item label="BP Diastolic (mmHg)" name="bpDiastolic" rules={[{ required: true }]}>
              <InputNumber min={40} max={160} className="w-full" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item label="Pulse Rate (bpm)" name="pulseRate" rules={[{ required: true }]}>
              <InputNumber min={30} max={220} className="w-full" size="large" />
            </Form.Item>

            <Form.Item label="SpO2 Oxygen (%)" name="spO2Percent" rules={[{ required: true }]}>
              <InputNumber min={50} max={100} className="w-full" size="large" />
            </Form.Item>

            <Form.Item label="Temp (°F)" name="temperatureFahrenheit" rules={[{ required: true }]}>
              <InputNumber min={90} max={108} step={0.1} className="w-full" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Respiration Rate (/min)" name="respirationRate" initialValue={16}>
              <InputNumber min={8} max={40} className="w-full" />
            </Form.Item>

            <Form.Item label="Pain Score (0-10)" name="painScore" initialValue={2}>
              <InputNumber min={0} max={10} className="w-full" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit">
              Save Vitals Log
            </HmsButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
