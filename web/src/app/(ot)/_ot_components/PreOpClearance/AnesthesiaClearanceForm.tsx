"use client";

import React from "react";
import { Form, Select, Input, message } from "antd";
import { ShieldCheck } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const AnesthesiaClearanceForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form] = Form.useForm();

  const handleFinish = () => {
    message.success("Pre-Anesthesia Assessment completed & Surgery cleared.");
    onClose();
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ asaGrade: "ASA_II", airwayGrade: "CLASS_I" }}>
      <Form.Item label="ASA Physical Status Classification" name="asaGrade">
        <Select size="large">
          <Select.Option value="ASA_I">ASA I — Normal healthy patient</Select.Option>
          <Select.Option value="ASA_II">ASA II — Mild systemic disease</Select.Option>
          <Select.Option value="ASA_III">ASA III — Severe systemic disease</Select.Option>
          <Select.Option value="ASA_IV">ASA IV — Life-threatening systemic disease</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Mallampati Airway Assessment" name="airwayGrade">
        <Select size="large">
          <Select.Option value="CLASS_I">Class I — Full visibility of soft palate</Select.Option>
          <Select.Option value="CLASS_II">Class II — Partial visibility of uvula</Select.Option>
          <Select.Option value="CLASS_III">Class III — Soft palate only</Select.Option>
          <Select.Option value="CLASS_IV">Class IV — Hard palate only</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="NPO Status (Fasting Hours)" name="npoHours" initialValue="8 Hours NPO">
        <Input size="large" />
      </Form.Item>

      <Form.Item label="Anesthetist Clearance Notes" name="clearanceNotes" initialValue="Patient cleared for General/Spinal Anesthesia. Emergency resuscitation kit on standby.">
        <Input.TextArea rows={3} />
      </Form.Item>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <HmsButton onClick={onClose} variant="secondary">
          Cancel
        </HmsButton>
        <HmsButton type="primary" variant="emerald" htmlType="submit" icon={<ShieldCheck className="w-4 h-4" />}>
          Approve Surgery Clearance
        </HmsButton>
      </div>
    </Form>
  );
};
