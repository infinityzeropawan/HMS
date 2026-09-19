"use client";

import React, { useState } from "react";
import { Form, Input, Button, message, Tooltip, Tag } from "antd";
import {
  Mail,
  Image as ImageIcon,
  Palette,
  Phone,
  Save,
  RefreshCw,
  Eye,
  CheckCircle2,
  Calendar,
  UserCheck,
  ShieldCheck,
  Building2,
  Receipt,
  FileText,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { EmailBrandingConfig, ExtendedTenantBrandingConfig } from "../../_super_admin_types/branding_types";
import { WhiteLabelService } from "../../_super_admin_services/white_label_service";

import { useBrandingStore } from "../../_super_admin_stores/branding_store";

interface EmailBrandingWorkspaceProps {
  hospitalName: string;
  initialConfig?: EmailBrandingConfig;
  onSave: (config: EmailBrandingConfig) => void;
  loading?: boolean;
}

export const EmailBrandingWorkspace: React.FC<EmailBrandingWorkspaceProps> = ({
  hospitalName,
  initialConfig,
  onSave,
  loading = false,
}) => {
  const storeBranding = useBrandingStore((state) => state.brandingByTenant["TNT-9014"]);
  const defaultConfig = WhiteLabelService.getDefaultEmailBranding(hospitalName);
  const activeEmailConfig: EmailBrandingConfig = storeBranding?.emailBranding || {
    ...defaultConfig,
    ...initialConfig,
  };

  const [config, setConfig] = useState<EmailBrandingConfig>(activeEmailConfig);
  const [form] = Form.useForm();

  const handleValuesChange = (_: unknown, allValues: Partial<EmailBrandingConfig>) => {
    setConfig((prev) => ({ ...prev, ...allValues }));
    useBrandingStore.getState().updateEmailBranding("TNT-9014", allValues);
  };

  const handleFinish = (values: EmailBrandingConfig) => {
    useBrandingStore.getState().updateEmailBranding("TNT-9014", values);
    onSave(values);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-400" /> Transactional Email Branding & Template Engine
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure custom header banners, brand colors, email logos, and support contacts across all automated system notifications.
          </p>
        </div>
        <Tag color="cyan" className="font-mono text-xs px-3 py-1">HTML Email Live Preview</Tag>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Configuration Form Column (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <Form
            form={form}
            layout="vertical"
            initialValues={config}
            onValuesChange={handleValuesChange}
            onFinish={handleFinish}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Email Template Settings</h4>
              <Tooltip title="Reset to default hospital email settings">
                <Button
                  type="text"
                  size="small"
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const res = WhiteLabelService.getDefaultEmailBranding(hospitalName);
                    setConfig(res);
                    form.setFieldsValue(res);
                    message.info("Email branding reset to defaults.");
                  }}
                >
                  Reset
                </Button>
              </Tooltip>
            </div>

            <Form.Item label="Email Header Logo Image URL" name="logoUrl" rules={[{ required: true }]}>
              <Input prefix={<ImageIcon className="w-4 h-4 text-slate-400" />} placeholder="https://..." />
            </Form.Item>

            <Form.Item label="Email Header Hero Banner Image URL" name="headerBannerUrl" rules={[{ required: true }]}>
              <Input prefix={<ImageIcon className="w-4 h-4 text-slate-400" />} placeholder="https://..." />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Primary Accent Color" name="primaryColor" rules={[{ required: true }]}>
                <Input prefix={<Palette className="w-4 h-4 text-teal-500" />} placeholder="#0d9488" />
              </Form.Item>

              <Form.Item label="Secondary Accent Color" name="secondaryColor" rules={[{ required: true }]}>
                <Input prefix={<Palette className="w-4 h-4 text-teal-700" />} placeholder="#0f766e" />
              </Form.Item>
            </div>

            <Form.Item label="Support Helpline Email" name="supportEmail" rules={[{ required: true, type: "email" }]}>
              <Input prefix={<Mail className="w-4 h-4 text-slate-400" />} />
            </Form.Item>

            <Form.Item label="Support Contact Phone" name="supportPhone" rules={[{ required: true }]}>
              <Input prefix={<Phone className="w-4 h-4 text-slate-400" />} />
            </Form.Item>

            <Form.Item label="Custom Email Footer Disclaimer" name="footerText" rules={[{ required: true }]}>
              <Input.TextArea rows={3} placeholder="Confidential Healthcare Communication..." />
            </Form.Item>

            <div className="pt-2">
              <HmsButton
                variant="emerald"
                icon={<Save className="w-4 h-4" />}
                htmlType="submit"
                loading={loading}
                className="w-full"
              >
                Save Email Branding Configuration
              </HmsButton>
            </div>
          </Form>
        </div>

        {/* Live Email Preview Column (Right 7 Cols) */}
        <div className="lg:col-span-7 bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-inner space-y-3 min-h-[550px]">
          <div className="flex items-center justify-between text-slate-600 text-xs font-bold pb-2 border-b border-slate-200">
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-teal-600" /> Interactive Email Client Simulation</span>
            <span className="font-mono text-[11px] text-slate-400">Subject: Appointment & OPD Invoice Confirmation</span>
          </div>

          {/* Email Container Simulation */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-lg mx-auto font-sans">
            {/* Top Email Header Banner */}
            <div className="relative h-28 overflow-hidden bg-slate-900">
              <img
                src={config.headerBannerUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"}
                alt="Banner"
                className="w-full h-full object-cover opacity-60"
              />
              <div
                className="absolute inset-0 opacity-40 mix-blend-multiply"
                style={{ backgroundColor: config.primaryColor || "#0d9488" }}
              />
              <div className="absolute inset-0 p-4 flex items-center justify-between z-10">
                <div className="bg-white/95 p-2 rounded-lg shadow-md border border-white/40">
                  <img
                    src={config.logoUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80"}
                    alt="Logo"
                    className="h-7 w-auto object-contain max-w-[120px]"
                  />
                </div>
                <div className="text-right text-white">
                  <span className="text-xs font-black tracking-wider uppercase block drop-shadow-sm">{hospitalName}</span>
                  <span className="text-[10px] text-slate-200">Official Patient Communication</span>
                </div>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="p-6 space-y-4 text-slate-800 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Appointment Confirmation & Receipt</h4>
                  <p className="text-[11px] text-slate-500">Booking ID: #OPD-2026-90412</p>
                </div>
                <Tag color="emerald" className="!m-0 font-bold">Confirmed</Tag>
              </div>

              <p className="leading-relaxed">
                Dear <strong>Rajesh Verma</strong>, your OPD consultation appointment has been scheduled successfully at <strong>{hospitalName}</strong>.
              </p>

              {/* Consultation Details Card */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Attending Specialist:</span>
                    <strong className="text-slate-800">Dr. Ananya Iyer (Cardiology)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Date & Time Slot:</span>
                    <strong className="text-slate-800">22 Sep 2026 | 10:30 AM</strong>
                  </div>
                </div>
              </div>

              {/* Action Button styled with Primary Color */}
              <div className="py-2 text-center">
                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  style={{ backgroundColor: config.primaryColor || "#0d9488" }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-white font-bold text-xs shadow-md"
                >
                  <Calendar className="w-3.5 h-3.5" /> Download E-Pass & Prescription
                </a>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 space-y-1">
                <p>For inquiries, please reach out to our patient helpdesk at:</p>
                <div className="flex items-center gap-4 text-slate-700 font-semibold">
                  <span>✉ {config.supportEmail}</span>
                  <span>📞 {config.supportPhone}</span>
                </div>
              </div>
            </div>

            {/* Email Footer Styled with Secondary Color */}
            <div
              style={{ backgroundColor: config.secondaryColor || "#0f766e" }}
              className="p-4 text-center text-white text-[11px] space-y-1"
            >
              <p className="opacity-90">{config.footerText}</p>
              <p className="text-[10px] opacity-70">Sent securely via {hospitalName} Enterprise Healthcare Gateway.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
