"use client";

import React from "react";
import { Modal, Alert, Tag } from "antd";
import { ShieldAlert, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { FeatureDefinition } from "../../_super_admin_types/feature_management";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface DisableImpactPreviewModalProps {
  feature: FeatureDefinition | null;
  tenantName: string;
  open: boolean;
  onClose: () => void;
  onConfirmDisable: () => void;
}

export const DisableImpactPreviewModal: React.FC<DisableImpactPreviewModalProps> = ({
  feature,
  tenantName,
  open,
  onClose,
  onConfirmDisable,
}) => {
  if (!feature) return null;

  const blockedRoutes = feature.routeMeta.blockedRoutes;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
          <ShieldAlert className="w-5 h-5" />
          <span>Disabling Feature Impact Preview: {feature.name}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnClose
    >
      <div className="space-y-4 my-4">
        {/* Warning Banner */}
        <Alert
          type="error"
          showIcon
          icon={<AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
          message={<span className="font-extrabold text-rose-900">Module Disabling Access Lockout</span>}
          description={`Disabling "${feature.name}" for ${tenantName} will immediately block user navigation and lock out the following workspaces.`}
        />

        {/* Affected Blocked Workspaces List */}
        <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 text-xs space-y-2">
          <h4 className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
            <Lock className="w-4 h-4 text-rose-600" /> Workspaces & Navigation Routes That Will Be Blocked:
          </h4>

          <ul className="space-y-1.5 pt-1">
            {blockedRoutes.map((r) => (
              <li key={r.path} className="flex items-center justify-between bg-white p-2 rounded border border-rose-100 font-sans">
                <span className="font-bold text-slate-800">• {r.label}</span>
                <span className="font-mono text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {r.path}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <HmsButton variant="secondary" onClick={onClose}>
            Cancel
          </HmsButton>
          <HmsButton
            type="primary"
            variant="danger"
            icon={<Lock className="w-4 h-4" />}
            onClick={() => {
              onConfirmDisable();
              onClose();
            }}
          >
            Confirm & Disable Feature
          </HmsButton>
        </div>
      </div>
    </Modal>
  );
};
