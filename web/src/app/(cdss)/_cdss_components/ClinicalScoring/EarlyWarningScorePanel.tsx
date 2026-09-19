"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, message } from "antd";
import { Activity, Plus, Calculator } from "lucide-react";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useCdssStore } from "../../_cdss_stores/cdss_store";
import { News2Result, News2Input } from "../../_cdss_types/cdss_types";
import { usePatientStore } from "@/app/(patient)/_patient_stores/patient_store";

export const EarlyWarningScorePanel: React.FC = () => {
  const storeScores = useCdssStore((s) => s.getNews2Scores());
  const calculateAndStoreNews2 = useCdssStore((s) => s.calculateAndStoreNews2);
  const patients = usePatientStore((s) => Object.values(s.patients));

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<News2Input & { uhid: string; bedLocation: string }>();

  const handleCalculateSubmit = (values: News2Input & { uhid: string; bedLocation: string }) => {
    const targetPatient = patients.find((p) => p.uhid === values.uhid);
    const patientName = targetPatient ? targetPatient.fullName : "Patient Record";

    const result = calculateAndStoreNews2(
      values.uhid,
      patientName,
      values.bedLocation || "GW-101",
      {
        respirationRate: Number(values.respirationRate || 16),
        spO2: Number(values.spO2 || 98),
        airOrOxygen: values.airOrOxygen || "AIR",
        systolicBp: Number(values.systolicBp || 120),
        pulseRate: Number(values.pulseRate || 74),
        consciousness: values.consciousness || "ALERT",
        temperature: Number(values.temperature || 36.8),
      }
    );

    message.success(
      `NEWS2 score calculated: ${result.news2Score} (${result.riskTier.replace(/_/g, " ")}). Protocol assigned!`
    );
    form.resetFields();
    setModalOpen(false);
  };

  const columns = [
    { title: "Bed Location", dataIndex: "bedLocation", key: "bedLocation" },
    { title: "Patient Name", dataIndex: "patientName", key: "patientName" },
    {
      title: "NEWS2 Score",
      dataIndex: "news2Score",
      key: "news2Score",
      render: (score: number) => (
        <span className={`font-bold text-sm ${score >= 7 ? "text-rose-600" : score >= 4 ? "text-amber-600" : "text-emerald-600"}`}>
          Score {score}
        </span>
      ),
    },
    {
      title: "Clinical Risk Tier",
      dataIndex: "riskTier",
      key: "riskTier",
      render: (r: string) => <Tag color={r.includes("HIGH") ? "red" : r.includes("MEDIUM") ? "orange" : "green"}>{r.replace(/_/g, " ")}</Tag>,
    },
    { title: "CDSS Recommended Protocol", dataIndex: "recommendation", key: "recommendation" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" /> National Early Warning Score (NEWS2) Monitor
        </h4>
        <div className="flex items-center gap-2">
          <HmsAiGeneratedBadge label="AI Deterioration Predictor" />
          <HmsButton
            size="sm"
            variant="emerald"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setModalOpen(true)}
          >
            Calculate NEWS2 Vitals
          </HmsButton>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={storeScores.map((s) => ({ ...s, key: s.id }))}
        pagination={false}
        locale={{ emptyText: "No NEWS2 risk calculations recorded." }}
      />

      {/* Calculator Modal */}
      <Modal
        title="NEWS2 Deterioration Calculator (Vitals Input)"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Calculate & Persist Score"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCalculateSubmit}
          initialValues={{
            uhid: "P-2026-1049",
            bedLocation: "ICU-01",
            respirationRate: 18,
            spO2: 95,
            airOrOxygen: "AIR",
            systolicBp: 130,
            pulseRate: 82,
            consciousness: "ALERT",
            temperature: 37.0,
          }}
          className="mt-4"
        >
          <Form.Item name="uhid" label="Patient" rules={[{ required: true }]}>
            <Select
              options={patients.map((p) => ({ value: p.uhid, label: `${p.fullName} (${p.uhid})` }))}
            />
          </Form.Item>
          <Form.Item name="bedLocation" label="Bed Location" rules={[{ required: true }]}>
            <Input placeholder="e.g. ICU-01 or GW-102" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="respirationRate" label="Respiration Rate (bpm)" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="spO2" label="SpO2 (%)" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="airOrOxygen" label="Air or Oxygen" rules={[{ required: true }]}>
              <Select options={[{ value: "AIR", label: "Air" }, { value: "OXYGEN", label: "Oxygen" }]} />
            </Form.Item>
            <Form.Item name="systolicBp" label="Systolic BP (mmHg)" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="pulseRate" label="Pulse Rate (bpm)" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="consciousness" label="Consciousness" rules={[{ required: true }]}>
              <Select options={[{ value: "ALERT", label: "Alert" }, { value: "CVPU", label: "Confusion / Voice / Pain / Unresponsive" }]} />
            </Form.Item>
          </div>
          <Form.Item name="temperature" label="Temperature (°C)" rules={[{ required: true }]}>
            <Input type="number" step="0.1" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
