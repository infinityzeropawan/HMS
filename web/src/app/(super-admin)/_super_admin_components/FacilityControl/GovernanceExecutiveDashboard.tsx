"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Tag, Progress, Badge, Tooltip } from "antd";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  ArrowUpRight,
  ChevronRight,
  Database,
  Activity,
  Users,
  Eye,
  RefreshCcw,
  Zap,
} from "lucide-react";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

import { ComplianceScoringEngine } from "../../_super_admin_services/compliance_scoring_engine";
import { ConsentRegistryService } from "../../_super_admin_services/consent_registry_service";
import { DpdpCenterService } from "../../_super_admin_services/dpdp_center_service";
import { RetentionService } from "../../_super_admin_services/retention_service";
import { PlatformAuditService } from "../../_super_admin_services/platform_audit_service";
import { GovernanceEventBus } from "../../_super_admin_services/governance_event_bus";
import { RemediationItem } from "../../_super_admin_types/compliance_scoring_types";

interface GovernanceExecutiveDashboardProps {
  tenantId?: string;
  onNavigateTab?: (tabKey: string) => void;
}

export const GovernanceExecutiveDashboard: React.FC<GovernanceExecutiveDashboardProps> = ({
  tenantId,
  onNavigateTab,
}) => {
  const [scoreData, setScoreData] = useState(() => ComplianceScoringEngine.calculateComplianceScore(tenantId || "TNT-9014"));
  const [dpdpMetrics, setDpdpMetrics] = useState(() => DpdpCenterService.getMetrics(tenantId));
  const [retentionMetrics, setRetentionMetrics] = useState(() => RetentionService.getRetentionMetrics(tenantId));
  const [auditStats, setAuditStats] = useState(() => PlatformAuditService.getStatistics());
  const [consents, setConsents] = useState(() => ConsentRegistryService.getConsents({ tenantId }));

  const refreshDashboard = () => {
    setScoreData(ComplianceScoringEngine.calculateComplianceScore(tenantId || "TNT-9014"));
    setDpdpMetrics(DpdpCenterService.getMetrics(tenantId));
    setRetentionMetrics(RetentionService.getRetentionMetrics(tenantId));
    setAuditStats(PlatformAuditService.getStatistics());
    setConsents(ConsentRegistryService.getConsents({ tenantId }));
  };

  useEffect(() => {
    const unsubBus = GovernanceEventBus.subscribe(() => {
      refreshDashboard();
    });
    const unsubAudit = PlatformAuditService.subscribe(() => {
      refreshDashboard();
    });
    return () => {
      unsubBus();
      unsubAudit();
    };
  }, [tenantId]);

  const activeConsentsCount = consents.filter((c) => c.status === "Active").length;
  const expiredConsentsCount = consents.filter((c) => c.status === "Expired").length;
  const revokedConsentsCount = consents.filter((c) => c.status === "Revoked").length;

  const breakGlassEventsCount = auditStats.categoryBreakdown["BREAK_GLASS_ACCESS"] || 1;
  const criticalAuditCount = auditStats.critical;

  const overallStatus: "Healthy" | "Warning" | "Critical" =
    scoreData.overallScore >= 85 ? "Healthy" : scoreData.overallScore >= 70 ? "Warning" : "Critical";

  const statusColorMap = {
    Healthy: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", tag: "green" },
    Warning: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", tag: "orange" },
    Critical: { text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", tag: "red" },
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Banner */}
      <div className={`p-6 rounded-2xl border ${statusColorMap[overallStatus].bg} ${statusColorMap[overallStatus].border} shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-xs">
            <ShieldCheck className={`w-10 h-10 ${overallStatus === "Healthy" ? "text-emerald-600" : overallStatus === "Warning" ? "text-amber-600" : "text-rose-600"}`} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">Platform Governance & Compliance Executive Overview</h2>
              <Tag color={statusColorMap[overallStatus].tag} className="font-mono text-xs font-bold uppercase">
                {overallStatus} STATE
              </Tag>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Cross-module executive telemetry combining real-time NABH/ABDM compliance scores, DPDP principal request SLAs, digital consent coverage, break-glass security events, and record retention lifecycle warnings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-slate-300/60 pl-6">
          <div className="text-right">
            <span className="text-3xs font-semibold text-slate-500 uppercase tracking-wider block">Overall Governance Score</span>
            <span className="text-3xl font-black text-slate-900 font-mono">{scoreData.overallScore.toFixed(1)} / 100</span>
          </div>
          <HmsButton size="sm" variant="secondary" icon={<RefreshCcw className="w-4 h-4" />} onClick={refreshDashboard}>
            Refresh
          </HmsButton>
        </div>
      </div>

      {/* 9 KPI Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Compliance Score */}
        <HmsCard elevated className="border-l-4 border-l-teal-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Overall Compliance Score</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{scoreData.overallScore.toFixed(1)}%</h3>
              <p className="text-3xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> NABH & ABDM Standard
              </p>
            </div>
            <div className="w-12 h-12">
              <Progress type="circle" percent={scoreData.overallScore} width={48} strokeColor="#0d9488" />
            </div>
          </div>
        </HmsCard>

        {/* Card 2: Consent Coverage */}
        <HmsCard elevated className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Consent Coverage</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{scoreData.dimensions.consent.score.toFixed(1)}%</h3>
              <p className="text-3xs text-slate-500 font-medium mt-1">
                {activeConsentsCount} Active / {consents.length} Total
              </p>
            </div>
            <button
              onClick={() => onNavigateTab?.("consent-registry")}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </HmsCard>

        {/* Card 3: Active Consents */}
        <HmsCard elevated className="border-l-4 border-l-cyan-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Active Consents</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeConsentsCount}</h3>
              <p className="text-3xs text-cyan-600 font-semibold mt-1">Digital Signed & Valid</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-cyan-500" />
          </div>
        </HmsCard>

        {/* Card 4: Expired / Revoked Consents */}
        <HmsCard elevated className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Expired / Revoked Consents</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{expiredConsentsCount + revokedConsentsCount}</h3>
              <p className="text-3xs text-amber-600 font-semibold mt-1">
                {revokedConsentsCount} Explicitly Revoked
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
        </HmsCard>

        {/* Card 5: DPDP Requests */}
        <HmsCard elevated className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">DPDP Principal Requests</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{dpdpMetrics.totalRequestCount}</h3>
              <p className="text-3xs text-indigo-600 font-semibold mt-1">
                SLA Compliance: {dpdpMetrics.slaComplianceRate}%
              </p>
            </div>
            <button
              onClick={() => onNavigateTab?.("dpdp-center")}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </HmsCard>

        {/* Card 6: Retention Warnings */}
        <HmsCard elevated className="border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Retention Threshold Warnings</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{retentionMetrics.approachingThresholdCount}</h3>
              <p className="text-3xs text-rose-600 font-semibold mt-1">Approaching Retention Limit</p>
            </div>
            <button
              onClick={() => onNavigateTab?.("data-retention")}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </HmsCard>

        {/* Card 7: Break Glass Events */}
        <HmsCard elevated className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Break Glass Access Events</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{breakGlassEventsCount}</h3>
              <p className="text-3xs text-purple-600 font-semibold mt-1">Emergency ICU Override</p>
            </div>
            <button
              onClick={() => onNavigateTab?.("break-glass")}
              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </HmsCard>

        {/* Card 8: Critical Audit Events */}
        <HmsCard elevated className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Critical Audit Events</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{criticalAuditCount}</h3>
              <p className="text-3xs text-orange-600 font-semibold mt-1">Platform Audit Trail</p>
            </div>
            <Link href="/platform-audit">
              <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </HmsCard>

        {/* Card 9: Policy Review Status */}
        <HmsCard elevated className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Governance Policy Review</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">Verified</h3>
              <p className="text-3xs text-blue-600 font-semibold mt-1">6 Active Governance Policies</p>
            </div>
            <button
              onClick={() => onNavigateTab?.("policies")}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </HmsCard>
      </div>

      {/* Cross-Module Quick Links & Recommendations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sub-score breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" /> Module Compliance Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Audit Coverage Score</span>
                <span>{scoreData.dimensions.audit.score.toFixed(1)}%</span>
              </div>
              <Progress percent={scoreData.dimensions.audit.score} strokeColor="#0d9488" size="small" showInfo={false} />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Consent Registry Score</span>
                <span>{scoreData.dimensions.consent.score.toFixed(1)}%</span>
              </div>
              <Progress percent={scoreData.dimensions.consent.score} strokeColor="#10b981" size="small" showInfo={false} />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>DPDP Readiness Score</span>
                <span>{scoreData.dimensions.dpdp.score.toFixed(1)}%</span>
              </div>
              <Progress percent={scoreData.dimensions.dpdp.score} strokeColor="#6366f1" size="small" showInfo={false} />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Data Retention Policy Score</span>
                <span>{scoreData.dimensions.policy.score.toFixed(1)}%</span>
              </div>
              <Progress percent={scoreData.dimensions.policy.score} strokeColor="#f59e0b" size="small" showInfo={false} />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Break Glass Access Compliance</span>
                <span>{scoreData.dimensions.breakGlass.score.toFixed(1)}%</span>
              </div>
              <Progress percent={scoreData.dimensions.breakGlass.score} strokeColor="#a855f7" size="small" showInfo={false} />
            </div>
          </div>
        </div>

        {/* Executive Remediation Recommendations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Executive Remediation Directives
          </h3>
          <div className="space-y-2">
            {scoreData.remediations.map((rec: RemediationItem) => (
              <div key={rec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Tag color={rec.priority === "Critical" ? "red" : rec.priority === "High" ? "volcano" : rec.priority === "Medium" ? "orange" : "blue"} className="mt-0.5 text-[10px] font-mono font-bold">
                  {rec.priority.toUpperCase()}
                </Tag>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
                  <p className="text-3xs text-slate-500 mt-0.5">{rec.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
