"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, message } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { AnesthesiaClearanceForm } from "../PreOpClearance/AnesthesiaClearanceForm";
import { useOtStore, SurgeryRecord } from "../../_ot_stores/ot_store";
import { Scissors, Calendar, Clock, AlertTriangle, CheckCircle2, Play, Check } from "lucide-react";

export const SurgerySchedulerTable: React.FC = () => {
  const { surgeries, scheduleSurgery, startSurgery, completeSurgery, cancelSurgery, delaySurgery } = useOtStore();

  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedSurgeryId, setSelectedSurgeryId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleOpenClearance = (id: string) => {
    setSelectedSurgeryId(id);
    setClearanceModalOpen(true);
  };

  const handleScheduleSubmit = (values: {
    patientName: string;
    uhid: string;
    ipdId: string;
    procedureName: string;
    otRoom: string;
    surgeonName: string;
    anaesthetistName: string;
    scheduledTime: string;
    estimatedCost: number;
  }) => {
    scheduleSurgery({
      patientName: values.patientName,
      uhid: values.uhid,
      ipdId: values.ipdId,
      procedureName: values.procedureName,
      otRoom: values.otRoom,
      surgeonName: values.surgeonName,
      anaesthetistName: values.anaesthetistName,
      scheduledTime: values.scheduledTime,
      estimatedCost: Number(values.estimatedCost) || 50000,
    });
    message.success(`Surgery schedule created for ${values.patientName} (${values.procedureName})`);
    form.resetFields();
    setScheduleModalOpen(false);
  };

  const columns = [
    {
      title: "OT Suite & Code",
      key: "otRoom",
      render: (_: unknown, record: SurgeryRecord) => (
        <div>
          <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            {record.otRoom}
          </span>
          <p className="text-3xs text-slate-400 font-mono mt-1">{record.surgeryCode}</p>
        </div>
      ),
    },
    {
      title: "Patient & Procedure",
      key: "procedure",
      render: (_: unknown, record: SurgeryRecord) => (
        <div>
          <span className="font-bold text-slate-900">{record.patientName}</span>
          <p className="text-xs text-slate-500">
            UHID: <span className="font-mono text-slate-700">{record.uhid}</span> | IPD: <span className="font-mono text-slate-700">{record.ipdId || "N/A"}</span>
          </p>
          <p className="text-xs font-semibold text-purple-900 mt-0.5">{record.procedureName}</p>
        </div>
      ),
    },
    {
      title: "Surgical Roster",
      key: "roster",
      render: (_: unknown, record: SurgeryRecord) => (
        <div className="text-xs space-y-0.5 text-slate-700">
          <div>Surgeon: <strong>{record.surgeonName}</strong></div>
          <div className="text-slate-500">Anaesthetist: {record.anaesthetistName}</div>
          <div className="text-3xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> {record.scheduledTime}
          </div>
        </div>
      ),
    },
    {
      title: "Pre-Op Clearances",
      key: "clearances",
      render: (_: unknown, record: SurgeryRecord) => (
        <div className="space-y-1 text-3xs">
          <Tag color={record.pacClearance === "CLEARED" ? "emerald" : "volcano"}>
            PAC: {record.pacClearance}
          </Tag>
          <Tag color={record.consentStatus === "OBTAINED" ? "emerald" : "gold"}>
            Consent: {record.consentStatus || "PENDING"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: SurgeryRecord["status"]) => {
        let color = "blue";
        if (status === "IN_PROGRESS") color = "gold";
        if (status === "COMPLETED") color = "emerald";
        if (status === "CANCELLED") color = "red";
        if (status === "DELAYED") color = "volcano";
        return <Tag color={color} className="font-bold">{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_: unknown, record: SurgeryRecord) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {record.status === "SCHEDULED" && (
            <>
              <HmsButton
                size="sm"
                variant={record.pacClearance === "CLEARED" ? "secondary" : "primary"}
                onClick={() => handleOpenClearance(record.id)}
              >
                {record.pacClearance === "CLEARED" ? "Review PAC" : "Pre-Op Clear"}
              </HmsButton>
              <HmsButton
                size="sm"
                variant="emerald"
                icon={<Play className="w-3.5 h-3.5" />}
                onClick={() => {
                  startSurgery(record.id);
                  message.info(`Surgery started for ${record.patientName}`);
                }}
              >
                Start
              </HmsButton>
              <HmsButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  delaySurgery(record.id, "OT suite delay / schedule overrun");
                  message.warning(`Critical delay alert dispatched for ${record.patientName}`);
                }}
              >
                Delay
              </HmsButton>
            </>
          )}

          {record.status === "IN_PROGRESS" && (
            <HmsButton
              size="sm"
              variant="emerald"
              icon={<Check className="w-3.5 h-3.5" />}
              onClick={() => {
                completeSurgery(record.id);
                message.success(`Surgery completed for ${record.patientName}! Post-op note & billing invoice posted.`);
              }}
            >
              Complete & Bill
            </HmsButton>
          )}

          {record.status === "COMPLETED" && (
            <Tag color="emerald" className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Post-Op Notes Logged
            </Tag>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Scissors className="w-4 h-4 text-purple-600" /> Today&apos;s OT Surgical Roster & Clearance Matrix
        </h3>
        <HmsButton variant="primary" icon={<Calendar className="w-4 h-4" />} onClick={() => setScheduleModalOpen(true)}>
          Schedule New Surgery
        </HmsButton>
      </div>

      <Table columns={columns} dataSource={surgeries} rowKey="id" pagination={false} />

      {/* Clearance Modal */}
      <Modal
        title="Pre-Anaesthesia & Surgical Clearance Assessment"
        open={clearanceModalOpen}
        onCancel={() => setClearanceModalOpen(false)}
        footer={null}
        width={640}
      >
        <AnesthesiaClearanceForm
          surgeryId={selectedSurgeryId || undefined}
          onClose={() => setClearanceModalOpen(false)}
        />
      </Modal>

      {/* Schedule Surgery Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-purple-900">
            <Scissors className="w-5 h-5 text-purple-600" />
            <span>Schedule New Surgical Procedure</span>
          </div>
        }
        open={scheduleModalOpen}
        onCancel={() => setScheduleModalOpen(false)}
        footer={null}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleScheduleSubmit} className="pt-2">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Patient Name" name="patientName" rules={[{ required: true }]}>
              <Input placeholder="e.g. Sunil Verma" />
            </Form.Item>
            <Form.Item label="Patient UHID" name="uhid" rules={[{ required: true }]}>
              <Input placeholder="e.g. P-2026-9912" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Inpatient ID (IPD)" name="ipdId" initialValue="IPD-2026-0881">
              <Input placeholder="e.g. IPD-2026-0881" />
            </Form.Item>
            <Form.Item label="Surgical Suite (OT Room)" name="otRoom" initialValue="Operation Theatre OT-01">
              <Select>
                <Select.Option value="Operation Theatre OT-01">Operation Theatre OT-01 (Major)</Select.Option>
                <Select.Option value="Cath Lab OT-02">Cath Lab OT-02 (Cardiac)</Select.Option>
                <Select.Option value="Operation Theatre OT-03">Operation Theatre OT-03 (Laparoscopic)</Select.Option>
                <Select.Option value="Emergency OT-04">Emergency OT-04</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Procedure Name" name="procedureName" rules={[{ required: true }]}>
            <Input placeholder="e.g. Laparoscopic Appendectomy" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Lead Surgeon" name="surgeonName" initialValue="Dr. Manoj Patil (MS Ortho)">
              <Input />
            </Form.Item>
            <Form.Item label="Anesthetist" name="anaesthetistName" initialValue="Dr. Priya Nair (MD)">
              <Input />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Scheduled Time Roster" name="scheduledTime" initialValue="02:00 PM - 04:00 PM">
              <Input />
            </Form.Item>
            <Form.Item label="Estimated Cost (₹)" name="estimatedCost" initialValue={55000}>
              <Input type="number" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton type="primary" variant="emerald" htmlType="submit" icon={<Scissors className="w-4 h-4" />}>
              Schedule Surgery Roster
            </HmsButton>
          </div>
        </Form>
      </Modal>
    </>
  );
};
