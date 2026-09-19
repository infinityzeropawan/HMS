"use client";

import React, { useState } from "react";
import { Modal, Alert, message } from "antd";
import { ShieldCheck, CheckCircle2, RotateCcw } from "lucide-react";
import { Tenant } from "../../_super_admin_types/tenant_management";
import { TenantApiService } from "../../_super_admin_services/tenant_api_service";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface RestoreTenantModalProps {
  tenant: Tenant | null;
  open: boolean;
  onClose: () => void;
  onRestored: () => void;
  adminName?: string;
}

export const RestoreTenantModal: React.FC<RestoreTenantModalProps> = ({
  tenant,
  open,
  onClose,
  onRestored,
  adminName = "Super Admin Console",
}) => {
  const [submitting, setSubmitting] = useState(false);

  if (!tenant) return null;

  const handleExecuteRestore = async () => {
    setSubmitting(true);
    try {
      await TenantApiService.restoreTenant(tenant.id, adminName);
      message.success(`Hospital Tenant ${tenant.hospitalName} (${tenant.id}) has been restored to Active status!`);
      onRestored();
      onClose();
    } catch {
      message.error("Failed to restore tenant access.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
          <ShieldCheck className="w-5 h-5" />
          <span>Restore Hospital Tenant Access</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnClose
    >
      <div className="space-y-4 my-4">
        <Alert
          type="success"
          showIcon
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          message="Re-activate Hospital Workspace"
          description={`Restoring ${tenant.hospitalName} (${tenant.id}) will re-enable all staff seats, OPD/IPD desks, and ABDM gateway links immediately.`}
        />

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
          <p><strong>Admin Performing Action:</strong> {adminName}</p>
          <p><strong>Date & Time:</strong> {new Date().toISOString().slice(0, 10)} {new Date().toTimeString().slice(0, 8)}</p>
          <p><strong>Status Transition:</strong> Suspended → Active (Healthy SLA)</p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <HmsButton variant="secondary" onClick={onClose}>
            Cancel
          </HmsButton>
          <HmsButton
            type="primary"
            variant="emerald"
            loading={submitting}
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={handleExecuteRestore}
          >
            Confirm & Restore Tenant Access
          </HmsButton>
        </div>
      </div>
    </Modal>
  );
};
