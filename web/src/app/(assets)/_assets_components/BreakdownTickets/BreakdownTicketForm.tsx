"use client";

import React from "react";
import { Form, Input, Select, message } from "antd";
import { AlertCircle } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const BreakdownTicketForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form] = Form.useForm();

  const handleFinish = () => {
    message.success("Breakdown Ticket logged & dispatched to Biomedical Engineer.");
    onClose();
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ severity: "HIGH" }}>
      <Form.Item label="Equipment Asset" name="assetId" initialValue="EQ-1052 - GE MAC 2000 ECG Machine">
        <Input size="large" disabled />
      </Form.Item>

      <Form.Item label="Fault / Breakdown Description" name="faultDesc" rules={[{ required: true, message: "Fault description required" }]}>
        <Input.TextArea rows={3} placeholder="Describe error code, physical damage or failure..." />
      </Form.Item>

      <Form.Item label="Priority Severity" name="severity">
        <Select size="large">
          <Select.Option value="CRITICAL">Critical (ICU / OT Machine Outage)</Select.Option>
          <Select.Option value="HIGH">High (OPD Machine Down)</Select.Option>
          <Select.Option value="MEDIUM">Medium (Minor Fault)</Select.Option>
        </Select>
      </Form.Item>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <HmsButton onClick={onClose} variant="secondary">
          Cancel
        </HmsButton>
        <HmsButton type="primary" variant="danger" htmlType="submit" icon={<AlertCircle className="w-4 h-4" />}>
          Submit Breakdown Ticket
        </HmsButton>
      </div>
    </Form>
  );
};
