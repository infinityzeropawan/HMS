"use client";

import React, { useState } from "react";
import { Modal, Tag, Alert, message, Radio } from "antd";
import { Sparkles, ArrowUpRight, Lock, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";
import { SubscriptionPlan } from "../../_super_admin_types/tenant_management";
import { FeatureDefinition } from "../../_super_admin_types/feature_management";
import { SubscriptionPlanService, SUBSCRIPTION_PLAN_DEFINITIONS } from "../../_super_admin_services/subscription_plan_service";
import { useFeatureControlStore } from "../../_super_admin_stores/feature_control_store";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface PlanUpgradeModalProps {
  tenantId: string;
  tenantName: string;
  currentPlan: SubscriptionPlan;
  feature: FeatureDefinition | null;
  open: boolean;
  onClose: () => void;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  tenantId,
  tenantName,
  currentPlan,
  feature,
  open,
  onClose,
}) => {
  const { updateTenantSubscriptionPlan } = useFeatureControlStore();

  const recommendedPlan = feature
    ? SubscriptionPlanService.getRecommendedUpgradePlan(currentPlan, feature.id)
    : SUBSCRIPTION_PLAN_DEFINITIONS.find((p) => p.code === "ENTERPRISE");

  const [selectedPlanCode, setSelectedPlanCode] = useState<SubscriptionPlan>(
    (recommendedPlan?.code as SubscriptionPlan) || "Professional"
  );

  if (!feature) return null;

  const handleConfirmUpgrade = () => {
    updateTenantSubscriptionPlan(tenantId, selectedPlanCode);
    message.success(
      `Tenant "${tenantName}" subscription plan upgraded to ${selectedPlanCode}! Feature "${feature.name}" is now unlocked.`
    );
    onClose();
  };

  const availableUpgradePlans = SUBSCRIPTION_PLAN_DEFINITIONS.filter(
    (p) => p.code !== currentPlan && (p.includedFeatures?.includes(feature.id) || p.optionalAddons?.includes(feature.id))
  );

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Upgrade Subscription Plan: Unlock {feature.name}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      destroyOnClose
    >
      <div className="space-y-4 my-4">
        {/* Restriction Alert Banner */}
        <Alert
          type="warning"
          showIcon
          icon={<Lock className="w-5 h-5 text-amber-600 shrink-0" />}
          message={
            <span className="font-extrabold text-amber-900">
              Module Restricted Under Current "{currentPlan}" Plan Tier
            </span>
          }
          description={
            <span>
              <strong>{feature.name} ({feature.id})</strong> is locked for <strong>{tenantName}</strong> under the current {currentPlan} plan. Upgrade the hospital tenant&apos;s subscription plan to instantly unlock access.
            </span>
          }
        />

        {/* Target Hospital Tenant Info */}
        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-400" />
            <span>Target Hospital: <strong className="text-teal-300">{tenantName}</strong> ({tenantId})</span>
          </div>
          <Tag color="volcano" className="!font-bold">
            Current Plan: {currentPlan}
          </Tag>
        </div>

        {/* Upgrade Tier Options Selection */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Recommended Upgrade Plan Tier:
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {availableUpgradePlans.map((plan) => {
              const isSelected = selectedPlanCode === plan.code;
              const isRecommended = recommendedPlan?.code === plan.code;

              return (
                <div
                  key={plan.code}
                  onClick={() => setSelectedPlanCode(plan.code as SubscriptionPlan)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-teal-50/50 border-teal-600 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Radio checked={isSelected} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{plan.name}</h4>
                          {isRecommended && (
                            <Tag color="gold" className="!text-[10px] !font-bold">
                              ★ RECOMMENDED
                            </Tag>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{plan.monthlyFee.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Unlocks {plan.modules?.length || 0} features & modules
                    </span>
                    <Tag color="blue" className="!font-mono !text-[10px]">
                      {plan.code} Tier
                    </Tag>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <HmsButton variant="secondary" onClick={onClose}>
            Cancel
          </HmsButton>
          <HmsButton
            type="primary"
            variant="emerald"
            icon={<ArrowUpRight className="w-4 h-4" />}
            onClick={handleConfirmUpgrade}
          >
            Confirm & Upgrade Tenant to {selectedPlanCode} Plan
          </HmsButton>
        </div>
      </div>
    </Modal>
  );
};
