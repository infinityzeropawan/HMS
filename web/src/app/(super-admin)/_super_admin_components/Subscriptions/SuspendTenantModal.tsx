"use client";

import React, { useState } from "react";
import { Modal, Alert, Select, Input, Steps, message } from "antd";
import { AlertTriangle, ShieldAlert, FileText, CheckCircle2, Lock } from "lucide-react";
import { Tenant, SuspensionReason } from "../../_super_admin_types/tenant_management";
import { TenantApiService } from "../../_super_admin_services/tenant_api_service";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface SuspendTenantModalProps {
  tenant: Tenant | null;
  open: boolean;
  onClose: () => void;
  onSuspended: () => void;
  adminName?: string;
}

export const SuspendTenantModal: React.FC<SuspendTenantModalProps> = ({
  tenant,
  open,
  onClose,
  onSuspended,
  adminName = "Super Admin Console",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [reason, setReason] = useState<SuspensionReason>("Non Payment");
  const [reasonNotes, setReasonNotes] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!tenant) return null;

  const resetModalState = () => {
    setCurrentStep(0);
    setReason("Non Payment");
    setReasonNotes("");
    setConfirmInput("");
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleExecuteSuspend = async () => {
    if (confirmInput.trim() !== "SUSPEND") {
      message.error("You must type exact 'SUSPEND' to confirm!");
      return;
    }

    setSubmitting(true);
    try {
      await TenantApiService.suspendTenant(tenant.id, reason, reasonNotes, adminName);
      message.success(`Hospital Tenant ${tenant.hospitalName} (${tenant.id}) suspended.`);
      onSuspended();
      handleClose();
    } catch {
      message.error("Failed to suspend hospital tenant.");
    } finally {
      setSubmitting(false);
    }
  };

  const isStep3Valid = confirmInput.trim() === "SUSPEND";

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
          <ShieldAlert className="w-5 h-5" />
          <span>Governance Action: Suspend Hospital Tenant</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="space-y-6 my-4">
        {/* Step Indicator */}
        <Steps
          current={currentStep}
          size="small"
          items={[
            { title: "Step 1: Warning" },
            { title: "Step 2: Reason" },
            { title: "Step 3: Verification" },
            { title: "Step 4: Confirm" },
          ]}
        />

        {/* STEP 1: WARNING */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <Alert
              type="error"
              showIcon
              icon={<AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />}
              message={<span className="font-extrabold text-rose-900 text-base">CRITICAL ACCESS WARNING</span>}
              description={
                <div className="text-sm text-rose-800 mt-1 font-medium leading-relaxed">
                  Suspending a hospital will immediately block all user access!
                </div>
              }
            />

            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-2">
              <p className="font-bold">Immediate System Impacts for {tenant.hospitalName} ({tenant.id}):</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>All active doctor, nurse, pharmacy & receptionist login sessions will be terminated immediately.</li>
                <li>EMR OPD consultation desks & IPD admission queues will be frozen.</li>
                <li>ABDM Health Information Exchange gateway requests for this tenant will be blocked.</li>
                <li>Data schema will remain safely backed up in isolated storage.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <HmsButton variant="secondary" onClick={handleClose}>
                Cancel
              </HmsButton>
              <HmsButton type="primary" variant="danger" onClick={() => setCurrentStep(1)}>
                Acknowledge Warning & Proceed →
              </HmsButton>
            </div>
          </div>
        )}

        {/* STEP 2: REQUIRE REASON */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
              Please specify the governance or compliance reason for suspending <strong>{tenant.hospitalName}</strong>.
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block uppercase">
                Select Suspension Reason *
              </label>
              <Select
                value={reason}
                onChange={(val) => setReason(val as SuspensionReason)}
                className="w-full"
                size="large"
              >
                <Select.Option value="Non Payment">Non Payment (Subscription / Invoice Overdue)</Select.Option>
                <Select.Option value="Compliance Issue">Compliance Issue (NABH / NABL / Regulatory)</Select.Option>
                <Select.Option value="Security Incident">Security Incident (Data Breach / Malicious Activity)</Select.Option>
                <Select.Option value="Requested by Customer">Requested by Customer (Hospital Management Request)</Select.Option>
                <Select.Option value="Other">Other Governance Reason</Select.Option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase">
                Additional Explanatory Notes / Reference (Optional)
              </label>
              <Input.TextArea
                rows={3}
                placeholder="Enter details e.g., Invoice #INV-2026-0012 overdue by 60 days..."
                value={reasonNotes}
                onChange={(e) => setReasonNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-100">
              <HmsButton variant="secondary" onClick={() => setCurrentStep(0)}>
                ← Back
              </HmsButton>
              <HmsButton type="primary" variant="danger" onClick={() => setCurrentStep(2)}>
                Next: Type Verification →
              </HmsButton>
            </div>
          </div>
        )}

        {/* STEP 3: REQUIRE TYPING "SUSPEND" */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Case-Sensitive Safety Verification</p>
              <p>To prevent accidental execution, please type <strong>SUSPEND</strong> in capital letters below.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase">
                Type <span className="font-mono text-rose-600 font-extrabold">SUSPEND</span> to authorize:
              </label>
              <Input
                size="large"
                placeholder="SUSPEND"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="font-mono font-bold tracking-widest text-center uppercase"
              />
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-100">
              <HmsButton variant="secondary" onClick={() => setCurrentStep(1)}>
                ← Back
              </HmsButton>
              <HmsButton
                type="primary"
                variant="danger"
                disabled={!isStep3Valid}
                onClick={() => setCurrentStep(3)}
              >
                Next: Review Audit Entry →
              </HmsButton>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRM & RECORD METADATA */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-2 text-xs">
              <h4 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-600" /> Final Governance Audit Verification
              </h4>
              <p className="text-rose-800">The following suspension metadata will be permanently recorded in the tenant history:</p>

              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-rose-100 font-sans text-slate-800 mt-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Performing Admin:</span>
                  <span className="font-bold">{adminName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Execution Timestamp:</span>
                  <span className="font-mono">{new Date().toISOString().slice(0, 10)} {new Date().toTimeString().slice(0, 8)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Suspension Reason:</span>
                  <span className="font-bold text-rose-700">{reason}</span>
                  {reasonNotes && <p className="text-slate-600 italic mt-0.5">"{reasonNotes}"</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-100">
              <HmsButton variant="secondary" onClick={() => setCurrentStep(2)}>
                ← Back
              </HmsButton>
              <HmsButton
                type="primary"
                variant="danger"
                loading={submitting}
                icon={<ShieldAlert className="w-4 h-4" />}
                onClick={handleExecuteSuspend}
              >
                Confirm & Lockout Hospital Tenant
              </HmsButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
