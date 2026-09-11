"use client";

import React, { useState } from "react";
import { Form, InputNumber, Alert, message, Modal } from "antd";
import { FlaskConical, Send, MessageSquare } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const LabResultForm: React.FC = () => {
  const [panicAlert, setPanicAlert] = useState(false);
  const [hemoglobin, setHemoglobin] = useState<number | null>(13.5);
  const [tlc, setTlc] = useState<number | null>(7200);
  const [platelets, setPlatelets] = useState<number | null>(2.4);
  const [fbs, setFbs] = useState<number | null>(98);
  const [simulatedSms, setSimulatedSms] = useState<string | null>(null);

  const handleHbChange = (val: number | null) => {
    setHemoglobin(val);
    if (val !== null && (val < 7.0 || val > 18.0)) {
      setPanicAlert(true);
    } else {
      setPanicAlert(false);
    }
  };

  const handleSubmit = () => {
    const reportData = {
      orderId: "LAB-8849",
      uhid: "P-2026-1049",
      patientName: "Sunil Verma",
      hemoglobin,
      tlc,
      platelets,
      fbs,
      panicAlert,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("hms_lab_results") || "[]");
      existing.unshift(reportData);
      localStorage.setItem("hms_lab_results", JSON.stringify(existing));
    }

    if (panicAlert) {
      const smsText = `SMS sent to Dr. Rajesh Sharma (+91 98765 43210): "CRITICAL PANIC ALERT — Patient Sunil Verma (P-2026-1049) Hemoglobin is ${hemoglobin} g/dL (< 7.0 g/dL threshold). Immediate attention required."`;
      setSimulatedSms(smsText);

      Modal.confirm({
        title: "CRITICAL PANIC VALUE ALERT!",
        content: (
          <div className="space-y-2 mt-2">
            <p className="text-sm text-slate-700">Hemoglobin is dangerously low ({hemoglobin} g/dL &lt; 7.0 g/dL).</p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-mono flex items-start gap-2">
              <Send className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{smsText}</span>
            </div>
          </div>
        ),
        okText: "Acknowledge & Dispatch Alert",
        okType: "danger",
        onOk() {
          message.success("Lab report published & Emergency SMS dispatched to Dr. Rajesh Sharma!");
        },
      });
    } else {
      message.success("Lab test results published & saved successfully.");
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Lab Result Verification & Entry</h2>
          <p className="text-xs text-slate-500">Order #LAB-8849 &bull; Patient: Sunil Verma (P-2026-1049)</p>
        </div>
      </div>

      {panicAlert && (
        <Alert
          message="CRITICAL PANIC VALUE DETECTED"
          description="Hemoglobin level is dangerously low (< 7.0 g/dL). Emergency SMS broadcast to attending physician will trigger."
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {simulatedSms && (
        <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Automated Alert Dispatch Log:</span>
            <span>{simulatedSms}</span>
          </div>
        </div>
      )}

      <Form layout="vertical" onFinish={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item label="Hemoglobin (Hb - g/dL)">
            <InputNumber
              value={hemoglobin}
              onChange={handleHbChange}
              step={0.1}
              min={0}
              max={20}
              size="large"
              className="w-full"
            />
            <span className="text-xs text-slate-400">Normal Range: 12.0 - 16.5 g/dL (Valid: 0–20)</span>
          </Form.Item>

          <Form.Item label="Total Leucocyte Count (TLC - /cu mm)">
            <InputNumber
              value={tlc}
              onChange={(val) => setTlc(val)}
              min={1000}
              max={100000}
              size="large"
              className="w-full"
            />
            <span className="text-xs text-slate-400">Normal Range: 4,000 - 11,000 (Valid: 1k–100k)</span>
          </Form.Item>

          <Form.Item label="Platelet Count (lakhs/cu mm)">
            <InputNumber
              value={platelets}
              onChange={(val) => setPlatelets(val)}
              step={0.1}
              min={0.1}
              max={15.0}
              size="large"
              className="w-full"
            />
            <span className="text-xs text-slate-400">Normal Range: 1.5 - 4.5 lakhs</span>
          </Form.Item>

          <Form.Item label="Fasting Blood Sugar (mg/dL)">
            <InputNumber
              value={fbs}
              onChange={(val) => setFbs(val)}
              min={30}
              max={600}
              size="large"
              className="w-full"
            />
            <span className="text-xs text-slate-400">Normal Range: 70 - 100 mg/dL</span>
          </Form.Item>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <HmsButton
            type="primary"
            variant={panicAlert ? "danger" : "emerald"}
            htmlType="submit"
            size="lg"
            fullWidth
          >
            {panicAlert ? "Publish & Broadcast Panic Alert" : "Publish Verified Lab Report"}
          </HmsButton>
        </div>
      </Form>
    </div>
  );
};

