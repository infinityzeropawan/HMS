"use client";

import React, { useState } from "react";
import { Drawer, Tag, Alert, message, Spin } from "antd";
import { ShieldAlert, RefreshCw, Terminal, Cpu, Clock, CheckCircle2, Zap } from "lucide-react";
import { InfrastructureServiceItem, HealthLevel } from "../../_super_admin_types/tenant_management";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface ServiceDiagnosticDrawerProps {
  service: InfrastructureServiceItem | null;
  open: boolean;
  onClose: () => void;
  onRecover?: (actionName: string) => void;
}

export const ServiceDiagnosticDrawer: React.FC<ServiceDiagnosticDrawerProps> = ({
  service,
  open,
  onClose,
  onRecover,
}) => {
  const [executing, setExecuting] = useState(false);

  if (!service) return null;

  const handleAction = (actionName: string) => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      message.success(`Recovery Action "${actionName}" executed successfully for ${service.name}!`);
      onRecover?.(actionName);
      onClose();
    }, 800);
  };

  const getStatusTag = (status: HealthLevel) => {
    switch (status) {
      case "Healthy":
        return <Tag color="emerald" className="!font-bold">✓ HEALTHY</Tag>;
      case "Warning":
        return <Tag color="warning" className="!font-bold">⚠ WARNING</Tag>;
      case "Critical":
        return <Tag color="error" className="!font-bold">✖ CRITICAL</Tag>;
      case "Offline":
        return <Tag color="default" className="!font-bold">⊘ OFFLINE</Tag>;
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>Diagnostic Drill-Down: {service.name}</span>
        </div>
      }
      width={600}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <HmsButton variant="secondary" onClick={onClose}>
            Close Diagnostics
          </HmsButton>
          <HmsButton
            type="primary"
            variant="emerald"
            loading={executing}
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => handleAction("Trigger Immediate Health Check Ping")}
          >
            Re-ping Service
          </HmsButton>
        </div>
      }
    >
      <div className="space-y-6 text-slate-700">
        {/* Service Header Status Banner */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400 font-bold">{service.id}</span>
              {getStatusTag(service.status)}
            </div>
            <h3 className="text-base font-bold text-white mt-1">{service.name}</h3>
          </div>
          <div className="text-right font-mono text-xs text-slate-300">
            <span className="block text-[10px] text-slate-400 uppercase">Ping Latency</span>
            <span className="text-lg font-bold text-teal-400">{service.pingMs} ms</span>
          </div>
        </div>

        {/* Error Trace Banner (If Error) */}
        {service.errorTrace && (
          <Alert
            type={service.status === "Offline" ? "error" : "warning"}
            showIcon
            message={<span className="font-bold">Diagnostic Exception Trace</span>}
            description={
              <div className="font-mono text-xs bg-slate-950 text-rose-300 p-3 rounded-lg mt-2 overflow-x-auto whitespace-pre-wrap border border-slate-800">
                {service.errorTrace}
              </div>
            }
          />
        )}

        {/* Affected Cluster Nodes */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-teal-600" /> Affected Infrastructure Cluster Nodes
          </h4>
          <div className="flex flex-wrap gap-2">
            {(service.affectedNodes && service.affectedNodes.length > 0
              ? service.affectedNodes
              : ["cluster-node-main-ap-south-1a", "cluster-node-replica-ap-south-1b"]
            ).map((node) => (
              <span key={node} className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-800 font-semibold">
                {node}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Recovery Actions */}
        <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-100 space-y-3">
          <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-teal-600" /> Automated Recovery Options
          </h4>
          <p className="text-xs text-slate-600">
            {service.recommendedAction || "Select a recovery action below to execute automated worker healing."}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <HmsButton
              size="sm"
              type="primary"
              variant="emerald"
              loading={executing}
              onClick={() => handleAction("Restart Worker Concurrency Pool")}
            >
              Restart Worker Pool
            </HmsButton>

            <HmsButton
              size="sm"
              variant="secondary"
              loading={executing}
              onClick={() => handleAction("Flush Redis Latency Queue")}
            >
              Flush Redis Cache
            </HmsButton>

            <HmsButton
              size="sm"
              variant="secondary"
              loading={executing}
              onClick={() => handleAction("Trigger Immediate Database Failover Check")}
            >
              Failover Check
            </HmsButton>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
