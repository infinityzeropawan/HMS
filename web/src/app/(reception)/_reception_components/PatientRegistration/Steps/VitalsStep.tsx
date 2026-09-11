"use client";

import React from "react";
import { Form, InputNumber, Row, Col } from "antd";
import { Activity, Heart, Thermometer, Weight } from "lucide-react";

export const VitalsStep: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-600" /> Triage Vitals Capture
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
      </Row>
    </div>
  );
};
