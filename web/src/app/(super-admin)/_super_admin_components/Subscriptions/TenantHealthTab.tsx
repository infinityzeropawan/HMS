"use client";

import React, { useState, useEffect } from "react";
import { Tag, Progress, Alert, Spin, Button, Empty, Tooltip } from "antd";
import {
  Activity,
  HeartPulse,
  Database,
  Server,
  Cpu,
  Bell,
  HardDrive,
  ShieldCheck,
  RotateCcw,
  Clock,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  TenantHealthTelemetry,
  InfrastructureServiceItem,
  HealthLevel,
} from "../../_super_admin_types/tenant_management";
import { TenantApiService } from "../../_super_admin_services/tenant_api_service";
import { ServiceDiagnosticDrawer } from "./ServiceDiagnosticDrawer";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface TenantHealthTabProps {
  tenantId: string;
}

export const TenantHealthTab: React.FC<TenantHealthTabProps> = ({ tenantId }) => {
  const [telemetry, setTelemetry] = useState<TenantHealthTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState<InfrastructureServiceItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TenantApiService.fetchTenantHealthTelemetry(tenantId);
      setTelemetry(data);
    } catch {
      setError("Failed to connect to Multi-Tenant Health Telemetry Gateway.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, [tenantId]);

  const handleOpenDiagnostic = (service: InfrastructureServiceItem) => {
    setSelectedService(service);
    setDrawerOpen(true);
  };

  const renderHealthBadge = (health: HealthLevel) => {
    switch (health) {
      case "Healthy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Healthy
          </span>
        );
      case "Warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Warning
          </span>
        );
      case "Critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Critical
          </span>
        );
      case "Offline":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Offline
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Spin size="large" />
        <p className="text-xs font-semibold text-slate-500">Pinging Infrastructure Health Nodes for {tenantId}...</p>
      </div>
    );
  }

  if (error || !telemetry) {
    return (
      <div className="space-y-4 my-4">
        <Alert
          type="error"
          showIcon
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          message="Telemetry Stream Connection Error"
          description={error || "Telemetry unreachable."}
          action={
            <Button size="small" type="primary" danger icon={<RefreshCw className="w-3 h-3" />} onClick={loadTelemetry}>
              Retry Connection
            </Button>
          }
        />
      </div>
    );
  }

  const infra = telemetry.infrastructure;
  const dp = telemetry.dataProtection;
  const perf = telemetry.performance;
  const usage = telemetry.usage;

  const infraItems: { label: string; item: InfrastructureServiceItem; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "Database Status", item: infra.database, icon: Database },
    { label: "API Status", item: infra.api, icon: Server },
    { label: "Background Jobs Status", item: infra.backgroundJobs, icon: Cpu },
    { label: "Notification Service Status", item: infra.notificationService, icon: Bell },
    { label: "Storage Service Status", item: infra.storageService, icon: HardDrive },
  ];

  return (
    <div className="space-y-6">
      {/* Top Telemetry Header Summary */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/20 rounded-xl border border-teal-500/30 text-teal-400">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overall Tenant SLA Health</span>
              {renderHealthBadge(telemetry.overallStatus)}
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">Real-Time Infrastructure Telemetry Stream</h3>
          </div>
        </div>

        <HmsButton variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={loadTelemetry}>
          Re-ping All Services
        </HmsButton>
      </div>

      {/* 1. INFRASTRUCTURE HEALTH SECTION */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Server className="w-4 h-4 text-teal-600" /> Infrastructure Component Health
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {infraItems.map((entry) => {
            const Icon = entry.icon;
            const item = entry.item;
            const isHealthy = item.status === "Healthy";

            return (
              <HmsCard
                key={item.id}
                elevated
                className={`!p-3.5 border transition-all cursor-pointer hover:shadow-md ${
                  isHealthy ? "bg-white border-slate-200" : "bg-rose-50/40 border-rose-200"
                }`}
                onClick={() => handleOpenDiagnostic(item)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  {renderHealthBadge(item.status)}
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{entry.label}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.name}</p>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Ping: {item.pingMs}ms</span>
                  <span className="text-teal-600 font-semibold flex items-center gap-0.5">
                    Drill-down <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </HmsCard>
            );
          })}
        </div>
      </div>

      {/* 2. DATA PROTECTION & 3. PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Protection */}
        <HmsCard elevated>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Data Protection & Backups
            </span>
            {renderHealthBadge(dp.backupStatus)}
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 font-medium">Last Backup Time:</span>
              <span className="font-bold text-slate-900 font-mono">{dp.lastBackupTime}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 font-medium">Last Restore Test:</span>
              <span className="font-medium text-emerald-700">{dp.lastRestoreTest}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 font-medium">Backup Retention Policy:</span>
              <span className="font-semibold text-slate-800">{dp.backupRetentionStatus}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 font-medium">Snapshot Size:</span>
              <span className="font-mono font-bold text-slate-900">{dp.backupSizeBytes}</span>
            </div>
          </div>
        </HmsCard>

        {/* Performance Metrics */}
        <HmsCard elevated>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Performance Metrics
            </span>
            <Tag color={perf.avgApiResponseTimeMs < 100 ? "emerald" : "warning"}>
              {perf.avgApiResponseTimeMs}ms Latency
            </Tag>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-100">
              <span className="text-[11px] text-slate-500 block font-medium">Avg API Latency</span>
              <span className="text-xl font-bold text-teal-800">{perf.avgApiResponseTimeMs} ms</span>
            </div>

            <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100">
              <span className="text-[11px] text-slate-500 block font-medium">Active Sessions</span>
              <span className="text-xl font-bold text-blue-800">{perf.activeSessions}</span>
            </div>

            <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
              <span className="text-[11px] text-slate-500 block font-medium">Concurrent Users</span>
              <span className="text-xl font-bold text-indigo-800">{perf.concurrentUsers}</span>
            </div>

            <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-100">
              <span className="text-[11px] text-slate-500 block font-medium">Error Rate (%)</span>
              <span className="text-xl font-bold text-rose-800">{perf.errorRatePct}%</span>
            </div>
          </div>
        </HmsCard>
      </div>

      {/* 4. USAGE HEALTH METERS */}
      <HmsCard elevated>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-600" /> Usage Health & Allocation Utilization
          </span>
          <span className="text-xs text-slate-400">Telemetry Quota Metering</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex justify-between items-center text-xs mb-1 font-semibold">
              <span className="text-slate-700">User Utilization</span>
              <span className="text-teal-700">{usage.userUtilizationPct}%</span>
            </div>
            <Progress percent={usage.userUtilizationPct} strokeColor="#0d9488" size="small" />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1 font-semibold">
              <span className="text-slate-700">Bed Utilization</span>
              <span className="text-indigo-700">{usage.bedUtilizationPct}%</span>
            </div>
            <Progress percent={usage.bedUtilizationPct} strokeColor="#6366f1" size="small" />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1 font-semibold">
              <span className="text-slate-700">Storage Utilization</span>
              <span className="text-blue-700">{usage.storageUtilizationPct}%</span>
            </div>
            <Progress percent={usage.storageUtilizationPct} strokeColor="#2563eb" size="small" />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1 font-semibold">
              <span className="text-slate-700">API Utilization</span>
              <span className="text-purple-700">{usage.apiUtilizationPct}%</span>
            </div>
            <Progress percent={usage.apiUtilizationPct} strokeColor="#8b5cf6" size="small" />
          </div>
        </div>
      </HmsCard>

      {/* Service Diagnostic Drill-Down Drawer */}
      <ServiceDiagnosticDrawer
        service={selectedService}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRecover={loadTelemetry}
      />
    </div>
  );
};
