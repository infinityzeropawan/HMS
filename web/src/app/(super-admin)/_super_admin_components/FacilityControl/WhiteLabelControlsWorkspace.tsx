"use client";

import React, { useState } from "react";
import { Form, Input, Switch, Modal, Tag, Tooltip, message, Button } from "antd";
import {
  Globe,
  ShieldCheck,
  Phone,
  Mail,
  Save,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Lock,
  Sparkles,
  Server,
  ShieldCheck as CloudCheckIcon,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { WhiteLabelConfig } from "../../_super_admin_types/branding_types";
import { WhiteLabelService } from "../../_super_admin_services/white_label_service";

import { useBrandingStore } from "../../_super_admin_stores/branding_store";

interface WhiteLabelControlsWorkspaceProps {
  hospitalName: string;
  subdomain: string;
  initialConfig?: WhiteLabelConfig;
  onSave: (config: WhiteLabelConfig) => void;
  loading?: boolean;
}

export const WhiteLabelControlsWorkspace: React.FC<WhiteLabelControlsWorkspaceProps> = ({
  hospitalName,
  subdomain,
  initialConfig,
  onSave,
  loading = false,
}) => {
  const storeBranding = useBrandingStore((state) => state.brandingByTenant["TNT-9014"]);
  const defaultConfig = WhiteLabelService.getDefaultWhiteLabelConfig(hospitalName, subdomain);
  const activeWLConfig: WhiteLabelConfig = storeBranding?.whiteLabel || {
    ...defaultConfig,
    ...initialConfig,
  };

  const [config, setConfig] = useState<WhiteLabelConfig>(activeWLConfig);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  const handleValuesChange = (_: unknown, allValues: Partial<WhiteLabelConfig>) => {
    setConfig((prev) => ({ ...prev, ...allValues }));
    useBrandingStore.getState().updateWhiteLabel("TNT-9014", allValues);
  };

  const handleFinish = (values: WhiteLabelConfig) => {
    useBrandingStore.getState().updateWhiteLabel("TNT-9014", values);
    onSave(values);
  };

  const domainValidation = WhiteLabelService.validateCustomDomain(config.customDomain);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-400" /> Multi-Tenant White-Label Deployment Controls
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure custom product identity, dedicated subdomains, custom CNAME routing, dynamic browser favicons, and support lines.
          </p>
        </div>
        <Tag color="cyan" className="font-mono text-xs px-3 py-1">Enterprise White-Label Ready</Tag>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={config}
        onValuesChange={handleValuesChange}
        onFinish={handleFinish}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">White-Label Branding Parameters</h4>
            <p className="text-xs text-slate-500">Configure parameters before deploying white-label assets.</p>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip title="Reset to default hospital white-label defaults">
              <Button
                type="text"
                size="small"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => {
                  const res = WhiteLabelService.getDefaultWhiteLabelConfig(hospitalName, subdomain);
                  setConfig(res);
                  form.setFieldsValue(res);
                  message.info("White-label settings reset to defaults.");
                }}
              >
                Reset
              </Button>
            </Tooltip>

            {/* Display Preview Before Saving Button */}
            <HmsButton
              variant="secondary"
              icon={<Eye className="w-4 h-4 text-teal-600" />}
              onClick={() => setPreviewModalOpen(true)}
            >
              Display Preview Before Saving
            </HmsButton>

            <HmsButton
              variant="emerald"
              icon={<Save className="w-4 h-4" />}
              htmlType="submit"
              loading={loading}
            >
              Save White-Label Controls
            </HmsButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            label="White-Label Product Name (Displayed in Title & Headers)"
            name="productName"
            rules={[{ required: true }]}
          >
            <Input prefix={<Sparkles className="w-4 h-4 text-teal-500" />} size="large" />
          </Form.Item>

          <Form.Item
            label="Dedicated SaaS Subdomain ([subdomain].hospitalcore.in)"
            name="subdomain"
            rules={[{ required: true }]}
          >
            <Input prefix={<Globe className="w-4 h-4 text-slate-400" />} size="large" addonAfter=".hospitalcore.in" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item label="Browser FavIcon Image URL (.png / .ico)" name="faviconUrl" rules={[{ required: true }]}>
            <Input
              prefix={
                config.faviconUrl ? (
                  <img src={config.faviconUrl} alt="Favicon" className="w-4 h-4 object-contain" />
                ) : (
                  <Globe className="w-4 h-4 text-slate-400" />
                )
              }
              size="large"
            />
          </Form.Item>

          <Form.Item label="Dedicated Custom CNAME Domain (Optional FQDN)" name="customDomain">
            <Input prefix={<ExternalLink className="w-4 h-4 text-slate-400" />} size="large" placeholder="portal.apollo.org" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item label="Dedicated Support Email Address" name="supportEmail" rules={[{ required: true, type: "email" }]}>
            <Input prefix={<Mail className="w-4 h-4 text-slate-400" />} size="large" />
          </Form.Item>

          <Form.Item label="Dedicated Support Phone Line" name="supportPhone" rules={[{ required: true }]}>
            <Input prefix={<Phone className="w-4 h-4 text-slate-400" />} size="large" />
          </Form.Item>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Hide Vendor "Powered By HMS SaaS" Badge</span>
            <span className="text-[11px] text-slate-500">Remove all SaaS vendor branding footers for pure white-label deployment.</span>
          </div>
          <Form.Item name="hideVendorPoweredBy" valuePropName="checked" className="!mb-0">
            <Switch />
          </Form.Item>
        </div>
      </Form>

      {/* PREVIEW BEFORE SAVING MODAL */}
      <Modal
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <HmsButton key="close" variant="ghost" onClick={() => setPreviewModalOpen(false)}>
            Close Preview
          </HmsButton>,
          <HmsButton
            key="confirm"
            variant="emerald"
            icon={<Save className="w-4 h-4" />}
            loading={loading}
            onClick={() => {
              form.submit();
              setPreviewModalOpen(false);
            }}
          >
            Confirm & Save White-Label Settings
          </HmsButton>,
        ]}
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Eye className="w-5 h-5 text-teal-600" /> Pre-Save Multi-Tenant White-Label Deployment Inspection
          </div>
        }
        width={720}
      >
        <div className="space-y-6 pt-2">
          {/* Browser Tab Simulation Header */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs text-slate-400 font-medium block">1. Browser FavIcon & Window Title Preview:</span>
            
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
              <div className="bg-slate-900 px-3 py-1.5 rounded-t-md border border-slate-700 flex items-center gap-2 max-w-xs text-xs text-slate-200">
                <img
                  src={config.faviconUrl || "https://cdn-icons-png.flaticon.com/512/3063/3063822.png"}
                  alt="Favicon"
                  className="w-4 h-4 object-contain"
                />
                <span className="truncate font-medium">{config.productName || hospitalName}</span>
                <span className="text-[10px] text-slate-500">×</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 truncate flex-1">
                https://{config.subdomain || "tenant"}.hospitalcore.in
              </div>
            </div>
          </div>

          {/* DNS CNAME & SSL Readiness Inspection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs text-slate-900 font-bold flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-600" /> 2. DNS CNAME & SSL Multi-Tenant Architecture Readiness:
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Dedicated SaaS Subdomain:</span>
                <strong className="font-mono text-teal-700">{config.subdomain}.hospitalcore.in</strong>
                <Tag color="emerald" className="!m-0 text-[10px]">Auto-Provisioned</Tag>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Target CNAME Server:</span>
                <strong className="font-mono text-slate-800">cname.hms-saas.cloud</strong>
                <Tag color="blue" className="!m-0 text-[10px]">Cloudflare SSL Ready</Tag>
              </div>
            </div>

            {config.customDomain && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CloudCheckIcon className="w-4 h-4 text-amber-600" /> Custom Domain Pointing: {config.customDomain}
                </div>
                <p className="text-[11px] text-amber-800">
                  {domainValidation.message} Point CNAME record of <strong>{config.customDomain}</strong> to <strong>cname.hms-saas.cloud</strong>.
                </p>
              </div>
            )}
          </div>

          {/* White Label Support Line Preview */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Configured Support Line:</span>
              <strong className="text-teal-300 font-mono">{config.supportEmail} | {config.supportPhone}</strong>
            </div>
            <Tag color={config.hideVendorPoweredBy ? "purple" : "default"}>
              {config.hideVendorPoweredBy ? "Pure White-Label (No SaaS Footer)" : "Standard Branding"}
            </Tag>
          </div>
        </div>
      </Modal>
    </div>
  );
};
