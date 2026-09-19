"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, message } from "antd";
import { Droplet, Plus, RefreshCw, Activity, ArrowUpRight, ArrowDownRight, Scale } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";

interface FluidEntry {
  id: string;
  patientName: string;
  bedNumber: string;
  timeSlot: string;
  intakeIvMl: number;
  intakeOralMl: number;
  outputUrineMl: number;
  outputDrainMl: number;
  recordedBy: string;
}

export const NurseFluidBalanceChart: React.FC = () => {
  const admissions = useIpdStore((state) => state.admissions);
  const currentUser = useAuthUserStore((state) => state.user);

  const [entries, setEntries] = useState<FluidEntry[]>([
    {
      id: "fl-1",
      patientName: admissions[0]?.patientName || "Sunil Verma",
      bedNumber: admissions[0]?.bedNumber || "ICU-BED-01",
      timeSlot: "08:00 AM - 12:00 PM",
      intakeIvMl: 500,
      intakeOralMl: 150,
      outputUrineMl: 400,
      outputDrainMl: 50,
      recordedBy: currentUser?.username ? `Nurse ${currentUser.username}` : "Nurse Duty Station",
    },
    {
      id: "fl-2",
      patientName: admissions[0]?.patientName || "Sunil Verma",
      bedNumber: admissions[0]?.bedNumber || "ICU-BED-01",
      timeSlot: "12:00 PM - 04:00 PM",
      intakeIvMl: 500,
      intakeOralMl: 200,
      outputUrineMl: 450,
      outputDrainMl: 30,
      recordedBy: currentUser?.username ? `Nurse ${currentUser.username}` : "Nurse Duty Station",
    },
    {
      id: "fl-3",
      patientName: admissions[1]?.patientName || "Rajesh Kulkarni",
      bedNumber: admissions[1]?.bedNumber || "DELUXE-402",
      timeSlot: "08:00 AM - 12:00 PM",
      intakeIvMl: 1000,
      intakeOralMl: 100,
      outputUrineMl: 300,
      outputDrainMl: 0,
      recordedBy: currentUser?.username ? `Nurse ${currentUser.username}` : "Nurse Duty Station",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const totalIntake = entries.reduce((acc, e) => acc + e.intakeIvMl + e.intakeOralMl, 0);
  const totalOutput = entries.reduce((acc, e) => acc + e.outputUrineMl + e.outputDrainMl, 0);
  const netBalance = totalIntake - totalOutput;

  const handlePatientSelect = (admissionNo: string) => {
    const found = admissions.find((a) => a.admissionNo === admissionNo || a.id === admissionNo);
    if (found) {
      form.setFieldsValue({
        patientName: found.patientName,
        bedNumber: found.bedNumber,
      });
    }
  };

  const handleFinish = (values: Record<string, unknown>) => {
    const nurseTitle = currentUser?.username ? `Nurse ${currentUser.username}` : "Nurse Duty Station";
    const inTotal = (Number(values.intakeIvMl) || 0) + (Number(values.intakeOralMl) || 0);
    const outTotal = (Number(values.outputUrineMl) || 0) + (Number(values.outputDrainMl) || 0);
    const net = inTotal - outTotal;

    const newEntry: FluidEntry = {
      id: `fl-${Date.now()}`,
      patientName: values.patientName as string,
      bedNumber: values.bedNumber as string,
      timeSlot: (values.timeSlot as string) || "Current 4-Hr Shift",
      intakeIvMl: Number(values.intakeIvMl) || 0,
      intakeOralMl: Number(values.intakeOralMl) || 0,
      outputUrineMl: Number(values.outputUrineMl) || 0,
      outputDrainMl: Number(values.outputDrainMl) || 0,
      recordedBy: nurseTitle,
    };

    setEntries((prev) => [newEntry, ...prev]);

    // Find admission for store persistence
    const targetAdmission = admissions.find((a) => a.patientName === newEntry.patientName || a.bedNumber === newEntry.bedNumber);
    if (targetAdmission) {
      try {
        useIpdStore.getState().addRoundNote(
          targetAdmission.admissionNo,
          `[24-Hr Fluid Balance Logged] Net Balance: ${net >= 0 ? `+${net}` : net} mL (Intake: ${inTotal} mL, Output: ${outTotal} mL) - Logged by ${nurseTitle}`
        );
      } catch {
        /* store fallback */
      }
    }

    // Platform Audit Logging
    PlatformAuditService.recordAuditEvent({
      actor: nurseTitle,
      actorRole: "CLINICAL_NURSE",
      action: `Fluid Balance Logged for ${newEntry.patientName}`,
      category: "COMPLIANCE_EVENT",
      entity: `Bed ${newEntry.bedNumber} (${newEntry.patientName})`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: JSON.stringify({
        patient: newEntry.patientName,
        bedNumber: newEntry.bedNumber,
        intakeTotal: inTotal,
        outputTotal: outTotal,
        netBalance: net,
        recordedBy: nurseTitle,
      }),
    });

    message.success(`Fluid I/O logged for ${newEntry.patientName} (${newEntry.bedNumber}). EMR Timeline updated.`);
    form.resetFields();
    setModalOpen(false);
  };

  const columns = [
    {
      title: "Bed & Patient",
      key: "patient",
      render: (_: unknown, record: FluidEntry) => (
        <div>
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {record.bedNumber}
          </span>
          <h4 className="font-bold text-slate-900 text-sm mt-1">{record.patientName}</h4>
        </div>
      ),
    },
    {
      title: "Time Shift",
      dataIndex: "timeSlot",
      key: "timeSlot",
      render: (t: string) => <span className="font-mono text-xs text-slate-700">{t}</span>,
    },
    {
      title: "Intake (IV / Oral)",
      key: "intake",
      render: (_: unknown, record: FluidEntry) => (
        <div className="text-xs font-mono font-bold text-blue-800">
          IV: {record.intakeIvMl} mL | Oral: {record.intakeOralMl} mL
          <span className="block text-3xs text-blue-600">Total In: {record.intakeIvMl + record.intakeOralMl} mL</span>
        </div>
      ),
    },
    {
      title: "Output (Urine / Drain)",
      key: "output",
      render: (_: unknown, record: FluidEntry) => (
        <div className="text-xs font-mono font-bold text-purple-800">
          Urine: {record.outputUrineMl} mL | Drain: {record.outputDrainMl} mL
          <span className="block text-3xs text-purple-600">Total Out: {record.outputUrineMl + record.outputDrainMl} mL</span>
        </div>
      ),
    },
    {
      title: "Net Balance",
      key: "balance",
      render: (_: unknown, record: FluidEntry) => {
        const net = (record.intakeIvMl + record.intakeOralMl) - (record.outputUrineMl + record.outputDrainMl);
        return (
          <span className={`font-mono text-xs font-black ${net >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
            {net >= 0 ? `+${net}` : net} mL
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Fluid Intake</p>
              <h3 className="text-2xl font-bold text-blue-800 mt-1">{totalIntake} mL</h3>
            </div>
            <ArrowUpRight className="w-8 h-8 text-blue-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Fluid Output</p>
              <h3 className="text-2xl font-bold text-purple-800 mt-1">{totalOutput} mL</h3>
            </div>
            <ArrowDownRight className="w-8 h-8 text-purple-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">24-Hr Net Balance</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                {netBalance >= 0 ? `+${netBalance}` : netBalance} mL
              </h3>
            </div>
            <Scale className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-blue-600" /> Inpatient 24-Hour Fluid Intake & Output (I/O) Chart
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log IV fluids, oral hydration, tube feeds, urine output, and wound drainage for fluid balance monitoring.
          </p>
        </div>

        <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Log Fluid I/O
        </HmsButton>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={entries} rowKey="id" pagination={false} />
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-blue-700">
            <Droplet className="w-5 h-5 text-blue-600" />
            <span>Log Bedside Fluid Intake & Output</span>
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
              <Select placeholder="Select Patient" size="large" onChange={handlePatientSelect}>
                {admissions.map((a) => (
                  <Select.Option key={a.id} value={a.admissionNo}>
                    {a.patientName} ({a.bedNumber})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Bed Number" name="bedNumber" rules={[{ required: true }]}>
              <Input placeholder="ICU-BED-01" size="large" />
            </Form.Item>
          </div>

          <Form.Item label="Shift Time Slot" name="timeSlot" initialValue="08:00 AM - 12:00 PM">
            <Input size="large" />
          </Form.Item>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
            <h4 className="font-bold text-xs text-blue-900">Fluid Intake (Inflow)</h4>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="IV Drip Fluid (mL)" name="intakeIvMl" initialValue={500}>
                <InputNumber min={0} max={3000} className="w-full" />
              </Form.Item>

              <Form.Item label="Oral / Tube Feed (mL)" name="intakeOralMl" initialValue={150}>
                <InputNumber min={0} max={2000} className="w-full" />
              </Form.Item>
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-3 mt-3">
            <h4 className="font-bold text-xs text-purple-900">Fluid Output (Excretion)</h4>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Urine Output (mL)" name="outputUrineMl" initialValue={400}>
                <InputNumber min={0} max={3000} className="w-full" />
              </Form.Item>

              <Form.Item label="Wound Drain / Vomitus (mL)" name="outputDrainMl" initialValue={30}>
                <InputNumber min={0} max={2000} className="w-full" />
              </Form.Item>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit">
              Save Fluid Log
            </HmsButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
