"use client";

import React from "react";
import { Form, Input, InputNumber, Switch, Select, Tabs, message, Tooltip } from "antd";
import {
  Building2,
  Stethoscope,
  Receipt,
  Globe,
  Save,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Lock,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useAdminSettingsStore } from "../../_admin_stores/admin_settings_store";

export const HospitalSettingsWorkspace: React.FC = () => {
  const settings = useAdminSettingsStore();

  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    settings.updateSettings(values);
    message.success("Hospital master settings and clinical policies updated successfully!");
  };

  return (
    <div className="space-y-6">
      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
        onFinish={handleFinish}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" /> Hospital Configuration Console
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage facility identity, clinical thresholds, GST billing defaults, and ABDM health stack parameters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip title="Reset all settings to default hospital profile">
              <HmsButton
                size="sm"
                variant="ghost"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => {
                  settings.resetToDefaults();
                  form.setFieldsValue(useAdminSettingsStore.getState());
                  message.info("Settings reset to defaults.");
                }}
              >
                Reset
              </HmsButton>
            </Tooltip>
            <HmsButton variant="emerald" icon={<Save className="w-4 h-4" />} htmlType="submit">
              Save Master Settings
            </HmsButton>
          </div>
        </div>

        <Tabs
          defaultActiveKey="branding"
          items={[
            {
              key: "branding",
              label: (
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" /> Facility Profile & Branding
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label="Hospital / Institution Name" name="hospitalName" rules={[{ required: true }]}>
                      <Input prefix={<Building2 className="w-4 h-4 text-slate-400" />} size="large" />
                    </Form.Item>

                    <Form.Item label="Hospital Tagline / Mission Statement" name="tagline">
                      <Input size="large" />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label="State Medical Registration #" name="registrationNumber" rules={[{ required: true }]}>
                      <Input prefix={<ShieldCheck className="w-4 h-4 text-slate-400" />} size="large" />
                    </Form.Item>

                    <Form.Item label="Hospital GSTIN Number" name="gstin" rules={[{ required: true }]}>
                      <Input prefix={<Receipt className="w-4 h-4 text-slate-400" />} size="large" />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Form.Item label="Official Phone Helpline" name="phone">
                      <Input prefix={<Phone className="w-4 h-4 text-slate-400" />} />
                    </Form.Item>

                    <Form.Item label="Official Admin Email" name="email">
                      <Input prefix={<Mail className="w-4 h-4 text-slate-400" />} />
                    </Form.Item>

                    <Form.Item label="Official Portal Website" name="website">
                      <Input prefix={<Globe className="w-4 h-4 text-slate-400" />} />
                    </Form.Item>
                  </div>

                  <Form.Item label="Street Address" name="address">
                    <Input prefix={<MapPin className="w-4 h-4 text-slate-400" />} />
                  </Form.Item>

                  <div className="grid grid-cols-3 gap-4">
                    <Form.Item label="City" name="city">
                      <Input />
                    </Form.Item>
                    <Form.Item label="State" name="state">
                      <Input />
                    </Form.Item>
                    <Form.Item label="PIN Code" name="pincode">
                      <Input />
                    </Form.Item>
                  </div>

                  <Form.Item label="Logo Image URL (For Invoices & Prescriptions)" name="logoUrl">
                    <Input placeholder="https://..." />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: "clinical",
              label: (
                <span className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" /> Clinical Rules & Safety Policies
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-3 gap-4">
                    <Form.Item label="OPD Consultation Slot Duration (Minutes)" name="opdSlotDurationMinutes">
                      <Select size="large">
                        <Select.Option value={10}>10 Minutes / Express</Select.Option>
                        <Select.Option value={15}>15 Minutes / Standard</Select.Option>
                        <Select.Option value={20}>20 Minutes / Detailed</Select.Option>
                        <Select.Option value={30}>30 Minutes / Specialist</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Prescription Validity (Days)" name="prescriptionExpiryDays">
                      <InputNumber min={7} max={180} className="w-full" size="large" />
                    </Form.Item>

                    <Form.Item label="Auto-Discharge Grace Period (Hours)" name="autoDischargeGraceHours">
                      <InputNumber min={1} max={24} className="w-full" size="large" />
                    </Form.Item>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-blue-600" /> Vital Sign Safety Alert Limits
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <Form.Item label="BP Systolic Alert Limit (mmHg)" name="vitalsBpSystolicUpperLimit">
                        <InputNumber min={100} max={220} className="w-full" />
                      </Form.Item>

                      <Form.Item label="BP Diastolic Alert Limit (mmHg)" name="vitalsBpDiastolicUpperLimit">
                        <InputNumber min={60} max={140} className="w-full" />
                      </Form.Item>

                      <Form.Item label="SpO2 Warning Limit (%)" name="vitalsSpO2LowerLimit">
                        <InputNumber min={70} max={99} className="w-full" />
                      </Form.Item>
                    </div>
                  </div>

                  <Form.Item
                    label="Enable AI Clinical Decision Support (CDSS) Drug-Interaction Warnings"
                    name="enableCdssAlerts"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: "billing",
              label: (
                <span className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" /> Billing & Tax Configuration
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-3 gap-4">
                    <Form.Item label="Default GST Tax Rate (%)" name="defaultGstRatePercent">
                      <Select size="large">
                        <Select.Option value={0}>0% (Exempt)</Select.Option>
                        <Select.Option value={5}>5% Healthcare GST</Select.Option>
                        <Select.Option value={12}>12% Standard Medical</Select.Option>
                        <Select.Option value={18}>18% Diagnostic & Tech</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Invoice Number Prefix" name="invoicePrefix">
                      <Input placeholder="INV-2026" size="large" />
                    </Form.Item>

                    <Form.Item label="Currency Symbol" name="currencySymbol">
                      <Input size="large" />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Minimum TPA Cashless Admission Deposit (₹)" name="tpaCashlessMinDeposit">
                      <InputNumber min={0} max={100000} className="w-full" size="large" />
                    </Form.Item>

                    <Form.Item label="Max Staff Billing Discount Limit (%)" name="maxStaffDiscountPercent">
                      <InputNumber min={0} max={50} className="w-full" size="large" />
                    </Form.Item>
                  </div>
                </div>
              ),
            },
            {
              key: "gateways",
              label: (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" /> API Gateways & ABDM Credentials
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-xs text-purple-900 flex items-center justify-between">
                    <div>
                      <span className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" /> ABDM M1/M2/M3 National Health Gateway Active
                      </span>
                      <p className="text-purple-700 mt-0.5">
                        Connected to National Health Authority (NHA) Sandbox with ABHA Card issuing and FHIR health data Exchange.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="ABDM ABHA Facility ID (HIP / HPR)" name="abhaFacilityId">
                      <Input prefix={<ShieldCheck className="w-4 h-4 text-purple-600" />} size="large" />
                    </Form.Item>

                    <Form.Item label="ABHA Gateway Client Secret" name="abhaClientSecret">
                      <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} size="large" />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="SMS Gateway API Key" name="smsGatewayApiKey">
                      <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} />
                    </Form.Item>

                    <Form.Item label="WhatsApp Business API Token" name="whatsAppBusinessToken">
                      <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} />
                    </Form.Item>
                  </div>

                  <Form.Item label="Radiology PACS DICOM Server Connection Endpoint" name="pacsDicomServerUrl">
                    <Input placeholder="dicom://pacs.apollo.hms.com:104" />
                  </Form.Item>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </div>
  );
};
