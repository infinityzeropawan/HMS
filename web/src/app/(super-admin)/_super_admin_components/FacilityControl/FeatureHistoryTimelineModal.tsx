"use client";

import React from "react";
import { Modal, Timeline, Tag } from "antd";
import { History, ShieldCheck, ShieldAlert, Layers } from "lucide-react";
import { useFeatureControlStore } from "../../_super_admin_stores/feature_control_store";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const FeatureHistoryTimelineModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { historyLogs } = useFeatureControlStore();

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <History className="w-5 h-5 text-teal-600" />
          <span>Feature License & Capability Audit Trail</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <HmsButton variant="secondary" onClick={onClose}>
          Close Trail
        </HmsButton>
      }
      width={640}
    >
      <div className="my-4 max-h-[480px] overflow-y-auto pr-2">
        {historyLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No feature license events logged yet.</p>
        ) : (
          <Timeline
            items={historyLogs.map((log) => ({
              color:
                log.action.includes("GLOBAL_KILL")
                  ? "red"
                  : log.action === "ENABLED"
                  ? "green"
                  : log.action === "TEMPLATE_APPLIED"
                  ? "purple"
                  : "gray",
              children: (
                <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag
                        color={
                          log.action === "ENABLED"
                            ? "emerald"
                            : log.action === "TEMPLATE_APPLIED"
                            ? "purple"
                            : "rose"
                        }
                        className="!font-bold"
                      >
                        {log.action}
                      </Tag>
                      <span className="font-bold text-slate-900">{log.featureName}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {log.date} at {log.time}
                    </span>
                  </div>

                  <p className="text-slate-600 font-medium">Tenant: <strong className="text-slate-900">{log.tenantName}</strong> ({log.tenantId})</p>
                  <p className="text-slate-500 italic font-mono bg-white p-1.5 rounded border border-slate-100">
                    Reason: "{log.reason}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>Authorized Admin: <strong className="text-slate-700">{log.performedBy}</strong></span>
                    <span className="font-mono">Log ID: {log.id}</span>
                  </div>
                </div>
              ),
            }))}
          />
        )}
      </div>
    </Modal>
  );
};
