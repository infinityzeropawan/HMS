"use client";

import React from "react";
import { Form, Input, Select, InputNumber, Switch, message } from "antd";
import { Building2, Globe, Mail, Shield } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { TenantOnboardingSchema } from "../../_super_admin_schemas/tenant_schema";

interface HospitalOnboardingWizardProps {
  onClose: () => void;
  onProvisioned?: (tenant: { hospitalName: string; subdomain: string; licenseTier: string; maxUserSeats: number }) => void;
}

export const HospitalOnboardingWizard: React.FC<HospitalOnboardingWizardProps> = ({ onClose, onProvisioned }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    try {
      const payload = {
        hospitalName: values.hospitalName as string,
        subdomain: values.subdomain as string,
        adminEmail: values.adminEmail as string,
        gstin: values.gstin as string,
        licenseTier: (values.licenseTier as "BASIC" | "ENTERPRISE" | "SUPER_SPECIALTY") || "ENTERPRISE",
        maxUserSeats: (values.maxUserSeats as number) || 50,
        isMultiBranch: Boolean(values.isMultiBranch),
      };
      TenantOnboardingSchema.parse(payload);
      onProvisioned?.(payload);
      message.success(`Hospital Tenant ${payload.hospitalName} (${payload.subdomain}.hms.com) provisioned successfully!`);
      onClose();
    } catch {
      message.error("Validation error. Check hospital onboarding parameters.");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ licenseTier: "ENTERPRISE", maxUserSeats: 50, isMultiBranch: false }}>
      <Form.Item label="Hospital / Healthcare Group Name" name="hospitalName" rules={[{ required: true }]}>
        <Input prefix={<Building2 className="w-4 h-4 text-teal-600" />} placeholder="e.g. Fortis Healthcare Mumbai" size="large" />
      </Form.Item>

      <Form.Item label="Requested Domain Prefix" name="subdomain" rules={[{ required: true }]}>
        <Input prefix={<Globe className="w-4 h-4 text-slate-400" />} suffix=".hms.com" placeholder="fortis-mumbai" size="large" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item label="Super Admin Email" name="adminEmail" rules={[{ required: true, type: "email" }]}>
          <Input prefix={<Mail className="w-4 h-4 text-slate-400" />} placeholder="admin@fortis.com" size="large" />
        </Form.Item>

        <Form.Item label="Hospital GSTIN Number" name="gstin" rules={[{ required: true }]}>
          <Input prefix={<Shield className="w-4 h-4 text-slate-400" />} placeholder="27AAAAA0000A1Z5" size="large" />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item label="License Tier" name="licenseTier">
          <Select size="large">
            <Select.Option value="BASIC">Basic (Single Clinic OPD)</Select.Option>
            <Select.Option value="ENTERPRISE">Enterprise (OPD + IPD + OT + Pharmacy)</Select.Option>
            <Select.Option value="SUPER_SPECIALTY">Super Specialty Network</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Staff Seat Limit" name="maxUserSeats">
          <InputNumber min={5} max={1000} size="large" className="w-full" />
        </Form.Item>
      </div>

      <Form.Item label="Multi-Branch Network Support" name="isMultiBranch" valuePropName="checked">
        <Switch />
      </Form.Item>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <HmsButton onClick={onClose} variant="secondary">
          Cancel
        </HmsButton>
        <HmsButton type="primary" variant="emerald" htmlType="submit">
          Provision Tenant Schema
        </HmsButton>
      </div>
    </Form>
  );
};
