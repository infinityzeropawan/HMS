"use client";

import React from "react";
import { Modal, Alert, Tag } from "antd";
import { AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { FeatureDependencyViolation } from "../../_super_admin_types/feature_management";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface DependencyWarningModalProps {
  violation: FeatureDependencyViolation | null;
  open: boolean;
  onClose: () => void;
  onAutoResolve: () => void;
}

export const DependencyWarningModal: React.FC<DependencyWarningModalProps> = ({
  violation,
  open,
  onClose,
  onAutoResolve,
}) => {
  if (!violation) return null;

  const isEnablingTarget = violation.missingPrerequisites.length > 0;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Feature Dependency Validation Warning</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={540}
      destroyOnClose
    >
      <div className="space-y-4 my-4">
        {isEnablingTarget ? (
          <>
            <Alert
              type="warning"
              showIcon
              icon={<ShieldAlert className="w-5 h-5 text-amber-600" />}
              message={<span className="font-bold">Prerequisites Missing for "{violation.featureName}"</span>}
              description={`To enable ${violation.featureName}, the following prerequisite module(s) must also be enabled first.`}
            />

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-xs space-y-2">
              <span className="font-bold text-amber-900 block">Required Prerequisite Modules:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {violation.missingPrerequisites.map((req) => (
                  <Tag key={req.id} color="amber" className="!px-3 !py-1 font-bold text-xs">
                    {req.name} ({req.id})
                  </Tag>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <Alert
              type="error"
              showIcon
              icon={<ShieldAlert className="w-5 h-5 text-rose-600" />}
              message={<span className="font-bold">Downstream Modules Dependent on "{violation.featureName}"</span>}
              description={`Disabling ${violation.featureName} will automatically disable or affect the following active module(s).`}
            />

            <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 text-xs space-y-2">
              <span className="font-bold text-rose-900 block">Active Dependent Modules Affected:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {violation.affectedDownstream.map((aff) => (
                  <Tag key={aff.id} color="rose" className="!px-3 !py-1 font-bold text-xs">
                    {aff.name} ({aff.id})
                  </Tag>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <HmsButton variant="secondary" onClick={onClose}>
            Cancel Action
          </HmsButton>
          <HmsButton
            type="primary"
            variant={isEnablingTarget ? "emerald" : "danger"}
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => {
              onAutoResolve();
              onClose();
            }}
          >
            {isEnablingTarget ? "Auto-Enable Prerequisites & Proceed" : "Disable All Dependent Modules"}
          </HmsButton>
        </div>
      </div>
    </Modal>
  );
};
