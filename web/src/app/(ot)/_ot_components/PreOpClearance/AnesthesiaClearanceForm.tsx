"use client";

import React from "react";
import { Form, Select, Input, message } from "antd";
import { ShieldCheck } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useOtStore } from "../../_ot_stores/ot_store";

export const AnesthesiaClearanceForm: React.FC<{ surgeryId?: string; onClose: () => void }> = ({ surgeryId, onClose }) => {
  const [form] = Form.useForm();
  const { updatePreOpClearance } = useOtStore();

  const handleFinish = (values: Record<string, string>) => {
    if (surgeryId) {
      updatePreOpClearance(surgeryId, {
        pacClearance: "CLEARED",
        consentStatus: "OBTAINED",
        labClearance: "CLEARED",
        radClearance: "CLEARED",
      });
    }
    message.success(`Pre-Anesthesia Assessment completed (ASA: ${values.asaGrade || "ASA II"}). Surgery cleared.`);
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

      <Form.Item label="Pre-Op Clearance Checklists" name="clearances">
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>✓ Informed Consent: <strong className="text-emerald-700">OBTAINED</strong></div>
          <div>✓ Lab Clearance: <strong className="text-emerald-700">CLEARED</strong></div>
          <div>✓ Radiology Clearance: <strong className="text-emerald-700">CLEARED</strong></div>
          <div>✓ Blood Cross-Match: <strong className="text-emerald-700">READY</strong></div>
        </div>
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
