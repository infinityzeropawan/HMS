"use client";

import React, { useState } from "react";
import { Modal, Tag, Alert, Segmented, Input, Select, Switch, Progress, message } from "antd";
import { Clock, Calendar, CheckCircle2, ShieldAlert, Sparkles, XCircle, CreditCard, ArrowRight, Building2, Lock } from "lucide-react";
import { FeatureDefinition, FeatureTrialDetails } from "../../_super_admin_types/feature_management";
import { useFeatureControlStore } from "../../_super_admin_stores/feature_control_store";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface ManageTrialModalProps {
  tenantId: string;
  tenantName: string;
  feature: FeatureDefinition | null;
  trialDetails?: FeatureTrialDetails;
  open: boolean;
  onClose: () => void;
}

export const ManageTrialModal: React.FC<ManageTrialModalProps> = ({
  tenantId,
  tenantName,
  feature,
  trialDetails,
  open,
  onClose,
}) => {
  const { extendFeatureTrial, convertTrialToPaid, disableFeatureTrial } = useFeatureControlStore();

  const [activeTab, setActiveTab] = useState<"EXTEND" | "CONVERT" | "DISABLE">("EXTEND");
  const [extensionDays, setExtensionDays] = useState<number>(30);
  const [extensionReason, setExtensionReason] = useState<string>("Customer requested extended evaluation period");
  const [disableReason, setDisableReason] = useState<string>("Evaluation ended without subscription conversion");
  const [autoConvertSetting, setAutoConvertSetting] = useState<boolean>(
    trialDetails?.autoConvertOnExpiry || false
  );

  if (!feature) return null;

  const remainingDays = trialDetails?.remainingDays ?? 14;
  const trialStatus = trialDetails?.status ?? "Active";

  const handleExtend = () => {
    extendFeatureTrial(tenantId, tenantName, feature.id, extensionDays, extensionReason);
    message.success(`Trial for ${feature.name} extended by +${extensionDays} days!`);
    onClose();
  };

  const handleConvert = () => {
    convertTrialToPaid(tenantId, tenantName, feature.id);
    message.success(`Feature ${feature.name} successfully converted to Paid Subscription License!`);
    onClose();
  };

  const handleDisable = () => {
    disableFeatureTrial(tenantId, tenantName, feature.id, disableReason);
    message.warning(`Trial revoked. ${feature.name} has been disabled for ${tenantName}.`);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Clock className="w-5 h-5 text-sky-600" />
          <span>Trial Feature Control Desk: {feature.name}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      destroyOnClose
    >
      <div className="space-y-4 my-4">
        {/* Hospital Tenant & Trial Status Header */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-slate-400 font-mono">{tenantId}</span>
              <Tag
                color={
                  trialStatus === "Active"
                    ? "cyan"
                    : trialStatus === "Expiring Soon"
                    ? "volcano"
                    : "red"
                }
                className="!font-bold flex items-center gap-1"
              >
                <Clock className="w-3 h-3" /> {trialStatus.toUpperCase()}
              </Tag>
            </div>
            <h3 className="text-base font-bold text-white mt-1">{tenantName}</h3>
          </div>

          <div className="text-right">
            <span className="text-2xl font-extrabold text-teal-400">{remainingDays}</span>
            <span className="text-[11px] text-slate-400 block font-semibold uppercase">Days Remaining</span>
          </div>
        </div>

        {/* Warning Banner Alerts for Remaining Days */}
        {remainingDays <= 7 && remainingDays > 0 && (
          <Alert
            type="error"
            showIcon
            icon={<ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />}
            message={<span className="font-extrabold text-rose-900">Trial Expiring Soon (Less than 7 days left)</span>}
            description={`Trial evaluation for "${feature.name}" ends in ${remainingDays} days. Extend the trial or convert to a paid subscription to avoid user access interruption.`}
          />
        )}

        {remainingDays <= 30 && remainingDays > 7 && (
          <Alert
            type="warning"
            showIcon
            icon={<Clock className="w-5 h-5 text-amber-600 shrink-0" />}
            message={<span className="font-extrabold text-amber-900">Trial Expiry Notice (Under 30 days left)</span>}
            description={`Feature trial has ${remainingDays} days remaining (${trialDetails?.endDate || "Upcoming expiry"}).`}
          />
        )}

        {remainingDays <= 0 && (
          <Alert
            type="error"
            showIcon
            icon={<XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            message={<span className="font-extrabold text-rose-900">Trial Period Expired</span>}
            description={`Evaluation trial period for "${feature.name}" expired on ${trialDetails?.endDate}. Convert to paid or extend trial.`}
          />
        )}

        {/* Telemetry Progress Details */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-600 font-semibold">
            <span>Trial Start: <strong className="text-slate-900">{trialDetails?.startDate || "2026-09-01"}</strong></span>
            <span>Trial End: <strong className="text-slate-900">{trialDetails?.endDate || "2026-10-01"}</strong></span>
          </div>
          <Progress
            percent={Math.max(0, Math.min(100, Math.floor(((30 - remainingDays) / 30) * 100)))}
            status={remainingDays <= 7 ? "exception" : "active"}
            strokeColor={remainingDays <= 7 ? "#f43f5e" : "#0d9488"}
            showInfo={false}
          />
        </div>

        {/* Action Tabs Segmented Switch */}
        <div className="pt-1">
          <Segmented
            block
            options={[
              { label: "Extend Trial", value: "EXTEND" },
              { label: "Convert to Paid", value: "CONVERT" },
              { label: "Disable Trial", value: "DISABLE" },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val as "EXTEND" | "CONVERT" | "DISABLE")}
          />
        </div>

        {/* TAB 1: EXTEND TRIAL */}
        {activeTab === "EXTEND" && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-teal-600" /> Extend Trial Duration
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Select Extension Days:</label>
                <Select
                  value={extensionDays}
                  onChange={(val) => setExtensionDays(val)}
                  className="w-full font-bold"
                >
                  <Select.Option value={7}>+ 7 Days Extension</Select.Option>
                  <Select.Option value={14}>+ 14 Days Extension</Select.Option>
                  <Select.Option value={30}>+ 30 Days Extension</Select.Option>
                  <Select.Option value={60}>+ 60 Days Extension</Select.Option>
                </Select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">New Expiry Date:</label>
                <div className="bg-slate-100 p-2 rounded border border-slate-200 font-mono font-bold text-slate-800">
                  {new Date(Date.now() + extensionDays * 86400000).toISOString().slice(0, 10)}
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Extension Justification / Rationale:</label>
              <Input
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                placeholder="Reason for trial extension..."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <HmsButton
                type="primary"
                variant="emerald"
                icon={<Clock className="w-4 h-4" />}
                onClick={handleExtend}
              >
                Confirm & Extend Trial (+{extensionDays} Days)
              </HmsButton>
            </div>
          </div>
        )}

        {/* TAB 2: CONVERT TO PAID FEATURE */}
        {activeTab === "CONVERT" && (
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-3 text-xs">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Convert Trial to Paid Subscription License
            </h4>

            <p className="text-slate-600 leading-relaxed">
              Converting <strong>{feature.name}</strong> will transition the hospital tenant from evaluation mode to an active purchased add-on. Unlocks full production access without expiration limits.
            </p>

            <div className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{feature.name} Add-on</span>
                <span className="text-[11px] text-slate-500">Post-trial recurring plan fee</span>
              </div>
              <span className="text-base font-extrabold text-emerald-700">
                ₹{(trialDetails?.estimatedMonthlyPrice || 14999).toLocaleString("en-IN")} / mo
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <HmsButton
                type="primary"
                variant="emerald"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleConvert}
              >
                Convert to Active Paid Add-on
              </HmsButton>
            </div>
          </div>
        )}

        {/* TAB 3: DISABLE TRIAL */}
        {activeTab === "DISABLE" && (
          <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-3 text-xs">
            <h4 className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
              <XCircle className="w-4 h-4 text-rose-600" /> Revoke & Disable Feature Trial
            </h4>

            <p className="text-slate-600 leading-relaxed">
              Disabling the trial will immediately lock navigation routes and revoke feature access for all users under <strong>{tenantName}</strong>.
            </p>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Revocation Reason:</label>
              <Input
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder="Reason for revoking trial access..."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <HmsButton
                type="primary"
                variant="danger"
                icon={<Lock className="w-4 h-4" />}
                onClick={handleDisable}
              >
                Confirm & Revoke Trial Access
              </HmsButton>
            </div>
          </div>
        )}

        {/* Future Billing Integration Box */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Future Billing Integration Preview</span>
              <span className="text-[11px] text-slate-500">Auto-convert preference on trial expiration</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-600">Auto-convert to Paid:</span>
            <Switch
              checked={autoConvertSetting}
              onChange={(val) => setAutoConvertSetting(val)}
              size="small"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
