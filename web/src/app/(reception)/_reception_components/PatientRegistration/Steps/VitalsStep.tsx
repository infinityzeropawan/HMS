"use client";

import React from "react";
import { Alert, Form, InputNumber, Row, Col, Select } from "antd";
import { Activity, Heart, Thermometer, Weight, AlertTriangle, Droplet, ShieldAlert } from "lucide-react";
import { TRIAGE_PRIORITY_LABELS, TriagePriority } from "../../../_reception_types/visit_types";

export const VitalsStep: React.FC = () => {
  const form = Form.useFormInstance();

  const systolicBp = Form.useWatch("systolicBp", form);
  const diastolicBp = Form.useWatch("diastolicBp", form);
  const pulseRate = Form.useWatch("pulseRate", form);
  const temperatureF = Form.useWatch("temperatureF", form);
  const spo2 = Form.useWatch("spo2", form);
  const triagePriority = Form.useWatch("triagePriority", form) as TriagePriority | undefined;

  const alerts: string[] = [];
  if (typeof systolicBp === "number" && (systolicBp > 160 || systolicBp < 90)) {
    alerts.push(`Systolic BP ${systolicBp} mmHg is out of range (90-160).`);
  }
  if (typeof diastolicBp === "number" && (diastolicBp > 100 || diastolicBp < 60)) {
    alerts.push(`Diastolic BP ${diastolicBp} mmHg is out of range (60-100).`);
  }
  if (typeof pulseRate === "number" && (pulseRate > 120 || pulseRate < 50)) {
    alerts.push(`Pulse ${pulseRate} BPM is out of range (50-120).`);
  }
  if (typeof temperatureF === "number" && (temperatureF > 100.4 || temperatureF < 96)) {
    alerts.push(`Temperature ${temperatureF} °F is abnormal (96-100.4).`);
  }
  if (typeof spo2 === "number" && spo2 < 94) {
    alerts.push(`SpO₂ ${spo2}% is below 94% — oxygen support assessment required.`);
  }

  const critical =
    (typeof spo2 === "number" && spo2 < 90) || (typeof systolicBp === "number" && systolicBp < 90);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-600" /> Triage Vitals & Priority Capture
      </h3>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="Systolic BP (mmHg)" name="systolicBp">
            <InputNumber
              prefix={<Activity className="w-4 h-4 text-teal-600" />}
              placeholder="120"
              className="w-full"
              size="large"
              min={50}
              max={250}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Diastolic BP (mmHg)" name="diastolicBp">
            <InputNumber
              prefix={<Activity className="w-4 h-4 text-teal-600" />}
              placeholder="80"
              className="w-full"
              size="large"
              min={30}
              max={150}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Pulse Rate (BPM)" name="pulseRate">
            <InputNumber
              prefix={<Heart className="w-4 h-4 text-rose-500" />}
              placeholder="72"
              className="w-full"
              size="large"
              min={30}
              max={220}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Body Temp (°F)" name="temperatureF">
            <InputNumber
              prefix={<Thermometer className="w-4 h-4 text-amber-500" />}
              placeholder="98.6"
              className="w-full"
              size="large"
              step={0.1}
              min={90}
              max={110}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="SpO₂ (%)" name="spo2">
            <InputNumber
              prefix={<Droplet className="w-4 h-4 text-sky-500" />}
              placeholder="98"
              className="w-full"
              size="large"
              min={50}
              max={100}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Weight (kg)" name="weightKg">
            <InputNumber
              prefix={<Weight className="w-4 h-4 text-slate-500" />}
              placeholder="68.5"
              className="w-full"
              size="large"
              step={0.5}
              min={1}
              max={300}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Triage Priority (drives the OPD vs IPD decision)"
            name="triagePriority"
            rules={[{ required: true, message: "Assign a triage priority" }]}
          >
            <Select
              size="large"
              placeholder="Select triage priority"
              options={(Object.keys(TRIAGE_PRIORITY_LABELS) as TriagePriority[]).map((key) => ({
                value: key,
                label: TRIAGE_PRIORITY_LABELS[key],
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      {alerts.length > 0 && (
        <Alert
          type={critical ? "error" : "warning"}
          showIcon
          icon={
            critical ? (
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            )
          }
          message={critical ? "Critical vitals — escalate immediately" : "Abnormal vitals captured"}
          description={
            <ul className="list-disc pl-4 space-y-0.5 text-xs">
              {alerts.map((alert) => (
                <li key={alert}>{alert}</li>
              ))}
            </ul>
          }
        />
      )}

      {triagePriority === "P4_STANDARD" && alerts.length > 0 && (
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Abnormal vitals recorded under P4 (standard). Reclassify to P2/P3 or route the patient to the
          Emergency / IPD desk before issuing an OPD token.
        </div>
      )}
    </div>
  );
};

