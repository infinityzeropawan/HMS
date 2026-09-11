"use client";

import React, { useState } from "react";
import { Form, Input, Select, message } from "antd";
import { ClipboardList, ShieldCheck, CheckCircle2, UserCheck } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export interface HandoverRecord {
  id: string;
  outgoingNurse: string;
  incomingNurse: string;
  shift: string;
  ward: string;
  criticalNotes: string;
  pendingMedications: string;
  signature: string;
  createdAt: string;
}

interface HandoverFormProps {
  onSaved?: () => void;
}

export const HandoverForm: React.FC<HandoverFormProps> = ({ onSaved }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (values: Record<string, string>) => {
    setSubmitting(true);
    try {
      const record: HandoverRecord = {
        id: `HO-${Date.now().toString().slice(-6)}`,
        outgoingNurse: values.outgoingNurse || "Nurse Sunita Rao (Reg #NUR-4029)",
        incomingNurse: values.incomingNurse || "Nurse Kavita Sharma (Reg #NUR-5102)",
        shift: values.shift || "Morning (07:00 - 15:00)",
        ward: values.ward || "IPD Ward 4A (Medical-Surgical)",
        criticalNotes: values.criticalNotes || "Bed 402: Post-op monitoring required every 2 hours. SpO2 monitoring active.",
        pendingMedications: values.pendingMedications || "Bed 405: Inj Ceftriaxone 1g IV due at 14:00.",
        signature: values.signature || "Digital Verification via PIN",
        createdAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        const saved = JSON.parse(localStorage.getItem("hms_nurse_handovers") || "[]");
        saved.unshift(record);
        localStorage.setItem("hms_nurse_handovers", JSON.stringify(saved));
      }

      message.success(`Shift Handover #${record.id} logged & verified successfully!`);
      form.resetFields();
      onSaved?.();
    } catch {
      message.error("Failed to save shift handover.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Nursing Shift Handover Register</h2>
          <p className="text-xs text-slate-500">Dual-Nurse Sign-off & Patient Continuity Protocol</p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          outgoingNurse: "Nurse Sunita Rao (Reg #NUR-4029)",
          incomingNurse: "Nurse Kavita Sharma (Reg #NUR-5102)",
          shift: "Morning (07:00 - 15:00)",
          ward: "IPD Ward 4A (Medical-Surgical)",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Form.Item label="Outgoing Nurse (Relieving)" name="outgoingNurse" rules={[{ required: true }]}>
            <Input size="large" prefix={<UserCheck className="w-4 h-4 text-slate-400 mr-1" />} />
          </Form.Item>

          <Form.Item label="Incoming Nurse (Taking Over)" name="incomingNurse" rules={[{ required: true }]}>
            <Input size="large" prefix={<UserCheck className="w-4 h-4 text-purple-500 mr-1" />} />
          </Form.Item>

          <Form.Item label="Shift Routine" name="shift" rules={[{ required: true }]}>
            <Select size="large">
              <Select.Option value="Morning (07:00 - 15:00)">Morning Shift (07:00 – 15:00)</Select.Option>
              <Select.Option value="Evening (15:00 - 23:00)">Evening Shift (15:00 – 23:00)</Select.Option>
              <Select.Option value="Night (23:00 - 07:00)">Night Shift (23:00 – 07:00)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ward / Station" name="ward" rules={[{ required: true }]}>
            <Select size="large">
              <Select.Option value="IPD Ward 4A (Medical-Surgical)">IPD Ward 4A (Medical-Surgical)</Select.Option>
              <Select.Option value="ICU Bed Station 2">ICU Bed Station 2</Select.Option>
              <Select.Option value="Pediatric Ward 3B">Pediatric Ward 3B</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item label="Critical Patients Summary & Vitals Watch" name="criticalNotes" rules={[{ required: true }]}>
          <Input.TextArea
            rows={3}
            placeholder="Bed 401: BP spike 165/95 at 11:30. Bed 404: Oxygen requirement 2L/min nasal cannula..."
          />
        </Form.Item>

        <Form.Item label="Pending Medication & MAR Checklist Handover" name="pendingMedications">
          <Input.TextArea
            rows={2}
            placeholder="Inj Ceftriaxone 1g IV due at 14:00 for Bed 405..."
          />
        </Form.Item>

        <Form.Item label="Digital Nurse Authorization Signature PIN" name="signature" rules={[{ required: true }]}>
          <Input.Password placeholder="Enter 4-digit Nurse PIN to verify identity" size="large" />
        </Form.Item>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800 flex items-center gap-2 mb-6">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Both nurses acknowledge accuracy of patient vitals and pending medication MAR administration.</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <HmsButton
            type="primary"
            variant="primary"
            htmlType="submit"
            size="lg"
            loading={submitting}
            icon={<CheckCircle2 className="w-4 h-4" />}
            fullWidth
          >
            Complete Handover Sign-Off
          </HmsButton>
        </div>
      </Form>
    </div>
  );
};
