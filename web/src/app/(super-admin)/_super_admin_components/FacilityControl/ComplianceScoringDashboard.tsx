"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Progress,
  Tooltip,
  Alert,
  Table,
  Segmented,
  Badge,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  UserCheck,
  BookOpen,
  Lock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  Award,
  Target,
  Zap,
  Activity,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import {
  ComplianceScoreReport,
  ScoreDimension,
  RemediationItem,
  ScoreTrendPoint,
} from "../../_super_admin_types/compliance_scoring_types";
import { ComplianceScoringEngine } from "../../_super_admin_services/compliance_scoring_engine";
import { ComplianceHealthStatus } from "../../_super_admin_types/compliance_types";

// ─── Sub-view tabs ────────────────────────────────────────────────────────────
type ScoringView = "overview" | "breakdown" | "trends" | "remediation" | "regulatory";

// ─── Shared helper components ────────────────────────────────────────────────

function StatusTag({ status }: { status: ComplianceHealthStatus }) {
  switch (status) {
    case "Healthy":
      return (
        <Tag color="success" className="font-bold flex items-center gap-1 !inline-flex">
          <CheckCircle2 className="w-3 h-3" /> Healthy
        </Tag>
      );
    case "Warning":
      return (
        <Tag color="warning" className="font-bold flex items-center gap-1 !inline-flex">
          <AlertTriangle className="w-3 h-3" /> Warning
        </Tag>
      );
    case "Critical":
      return (
        <Tag color="error" className="font-bold flex items-center gap-1 !inline-flex">
          <XCircle className="w-3 h-3" /> Critical
        </Tag>
      );
  }
}

function TrendBadge({ trend, delta }: { trend: ScoreDimension["trend"]; delta: number }) {
  if (trend === "improving")
    return (
      <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
        <TrendingUp className="w-3.5 h-3.5" /> +{Math.abs(delta)}%
      </span>
    );
  if (trend === "declining")
    return (
      <span className="flex items-center gap-1 text-rose-600 font-bold text-xs">
        <TrendingDown className="w-3.5 h-3.5" /> -{Math.abs(delta)}%
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-slate-400 font-medium text-xs">
      <Minus className="w-3.5 h-3.5" /> Stable
    </span>
  );
}

function dimensionIcon(id: string) {
  switch (id) {
    case "audit": return <FileText className="w-4 h-4 text-violet-500" />;
    case "consent": return <UserCheck className="w-4 h-4 text-sky-500" />;
    case "dpdp": return <ShieldCheck className="w-4 h-4 text-teal-500" />;
    case "policy": return <BookOpen className="w-4 h-4 text-amber-500" />;
    case "breakGlass": return <Lock className="w-4 h-4 text-rose-500" />;
    default: return <Activity className="w-4 h-4 text-slate-400" />;
  }
}

function scoreColor(score: number): string {
  if (score >= 90) return "#10b981";
  if (score >= 75) return "#f59e0b";
  return "#ef4444";
}

function scoreGlow(score: number): string {
  if (score >= 90) return "shadow-emerald-200";
  if (score >= 75) return "shadow-amber-200";
  return "shadow-red-200";
}

function priorityTag(priority: RemediationItem["priority"]) {
  const map: Record<RemediationItem["priority"], string> = {
    Critical: "error",
    High: "warning",
    Medium: "processing",
    Low: "default",
  };
  return <Tag color={map[priority]} className="font-bold">{priority}</Tag>;
}

// ─── SVG Sparkline ────────────────────────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 120, h = 36, pad = 4;
  if (values.length === 0) return null;
  if (values.length === 1) {
    const y = h / 2;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <circle cx={w / 2} cy={y} r={3} fill={color} />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const area = `M ${pts[0]} L ${pts.slice(1).join(" L ")} L ${pts[pts.length - 1].split(",")[0]},${h} L ${pts[0].split(",")[0]},${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Latest value dot */}
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r={3} fill={color} />
    </svg>
  );
}

// ─── Main Scoring Overview ────────────────────────────────────────────────────
function OverviewSection({ report }: { report: ComplianceScoreReport }) {
  const maxLift = ComplianceScoringEngine.calculateMaxScoreLift(report);
  const dims = Object.values(report.dimensions);
  const criticalFindings = dims.flatMap((d) => d.findings).filter((f) => f.severity === "Critical" && !f.resolved);
  const warningFindings = dims.flatMap((d) => d.findings).filter((f) => f.severity === "Warning" && !f.resolved);

  return (
    <div className="space-y-6">
      {/* Hero Score Card */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${scoreColor(report.overallScore)} 0%, transparent 60%)` }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Overall Compliance Score — {report.period}
              </span>
            </div>
            <div className="flex items-end gap-4">
              <span
                className="text-6xl font-black tabular-nums"
                style={{ color: scoreColor(report.overallScore) }}
              >
                {report.overallScore}
              </span>
              <div className="pb-2 space-y-1">
                <span className="text-slate-300 text-lg font-semibold">/ 100</span>
                <StatusTag status={report.overallStatus} />
              </div>
            </div>
            <TrendBadge trend={report.overallTrend} delta={report.overallTrendDelta} />
          </div>

          {/* Radial progress rings column */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {dims.map((dim) => (
              <div key={dim.id} className="flex flex-col items-center gap-1.5">
                <div className={`relative w-14 h-14 flex items-center justify-center rounded-full shadow-lg ${scoreGlow(dim.score)}`}>
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#1e293b" strokeWidth="5" />
                    <circle
                      cx="28" cy="28" r="24"
                      fill="none"
                      stroke={scoreColor(dim.score)}
                      strokeWidth="5"
                      strokeDasharray={`${dim.score * 1.508} 150.8`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="relative z-10 text-xs font-black text-white">{dim.score}</span>
                </div>
                <span className="text-[10px] text-slate-400 text-center leading-tight font-medium max-w-[56px]">{dim.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Strip */}
      {criticalFindings.length > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<XCircle className="w-4 h-4" />}
          message={`${criticalFindings.length} Critical Finding${criticalFindings.length > 1 ? "s" : ""} Require Immediate Action`}
          description={criticalFindings.slice(0, 2).map((f) => f.message).join(" · ")}
          className="border-rose-200 bg-rose-50"
        />
      )}
      {warningFindings.length > 0 && criticalFindings.length === 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<AlertTriangle className="w-4 h-4" />}
          message={`${warningFindings.length} Compliance Warning${warningFindings.length > 1 ? "s" : ""} Require Attention`}
          description={warningFindings.slice(0, 2).map((f) => f.message).join(" · ")}
          className="border-amber-200 bg-amber-50"
        />
      )}

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Critical Findings</span>
          <span className={`text-2xl font-black ${criticalFindings.length > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {criticalFindings.length}
          </span>
          <span className="text-[11px] text-slate-400">Require immediate remediation</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Warning Findings</span>
          <span className={`text-2xl font-black ${warningFindings.length > 0 ? "text-amber-600" : "text-slate-700"}`}>
            {warningFindings.length}
          </span>
          <span className="text-[11px] text-slate-400">Scheduled remediation needed</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Open Remediations</span>
          <span className="text-2xl font-black text-slate-700">{report.remediations.filter((r) => r.status === "Open").length}</span>
          <span className="text-[11px] text-slate-400">Open action items in queue</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Potential Score Lift</span>
          <span className="text-2xl font-black text-teal-600">+{maxLift}%</span>
          <span className="text-[11px] text-slate-400">If all remediations resolved</span>
        </div>
      </div>
    </div>
  );
}

// ─── Score Breakdown ──────────────────────────────────────────────────────────
function BreakdownSection({ report }: { report: ComplianceScoreReport }) {
  const dims = Object.values(report.dimensions);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-teal-600" /> Dimension Score Breakdown
        <span className="text-xs text-slate-400 font-normal">— weighted contribution to overall score</span>
      </h3>

      {dims.map((dim) => {
        const openFindings = dim.findings.filter((f) => !f.resolved);
        return (
          <div key={dim.id} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Dimension Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  dim.status === "Healthy" ? "bg-emerald-50 border-emerald-200" :
                  dim.status === "Warning" ? "bg-amber-50 border-amber-200" :
                  "bg-rose-50 border-rose-200"
                }`}>
                  {dimensionIcon(dim.id)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{dim.label}</h4>
                  <p className="text-xs text-slate-500">{dim.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-black" style={{ color: scoreColor(dim.score) }}>{dim.score}</span>
                  <span className="text-slate-400 text-sm">/100</span>
                </div>
                <StatusTag status={dim.status} />
                <TrendBadge trend={dim.trend} delta={dim.trendDelta} />
                <Tooltip title={`Weight: ${(dim.weight * 100).toFixed(0)}% of overall score`}>
                  <Tag color="default" className="font-mono text-xs cursor-help">{(dim.weight * 100).toFixed(0)}%</Tag>
                </Tooltip>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-4 py-2 bg-slate-50/60">
              <Progress
                percent={dim.score}
                strokeColor={scoreColor(dim.score)}
                trailColor="#e2e8f0"
                showInfo={false}
                size={["100%", 8]}
              />
            </div>

            {/* Findings list */}
            {openFindings.length > 0 && (
              <div className="p-4 space-y-2">
                {openFindings.map((f) => (
                  <div key={f.id} className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${
                    f.severity === "Critical" ? "bg-rose-50 border-rose-200" :
                    f.severity === "Warning" ? "bg-amber-50 border-amber-200" :
                    "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="shrink-0 pt-0.5">
                      {f.severity === "Critical" ? <XCircle className="w-4 h-4 text-rose-500" /> :
                       f.severity === "Warning" ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                       <Info className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`font-semibold ${f.severity === "Critical" ? "text-rose-800" : f.severity === "Warning" ? "text-amber-800" : "text-slate-700"}`}>
                        {f.message}
                      </p>
                      <p className="text-slate-500 leading-relaxed"><span className="font-medium text-slate-600">Recommendation: </span>{f.recommendation}</p>
                      {f.regulatoryRef && (
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                          {f.regulatoryRef}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {openFindings.length === 0 && (
              <div className="px-4 py-3 flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> All findings resolved — dimension fully compliant.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Trend Charts ─────────────────────────────────────────────────────────────
function TrendsSection({ report }: { report: ComplianceScoreReport }) {
  const history = report.trendHistory;
  const keys: { key: keyof ScoreTrendPoint; label: string; color: string }[] = [
    { key: "overallScore", label: "Overall", color: "#0d9488" },
    { key: "auditScore", label: "Audit Coverage", color: "#7c3aed" },
    { key: "consentScore", label: "Consent Coverage", color: "#0284c7" },
    { key: "dpdpScore", label: "DPDP Readiness", color: "#0891b2" },
    { key: "policyScore", label: "Policy Compliance", color: "#d97706" },
    { key: "breakGlassScore", label: "Break Glass", color: "#e11d48" },
  ];

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <Activity className="w-4 h-4 text-teal-600" /> Compliance Score Trends — 6-Month Historical View
      </h3>

      {/* Table-based trend view */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left px-4 py-3 font-bold w-44">Dimension</th>
                {history.map((h) => (
                  <th key={h.period} className="text-center px-3 py-3 font-bold text-slate-200">{h.period}</th>
                ))}
                <th className="text-center px-4 py-3 font-bold">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.map(({ key, label, color }) => {
                const vals = history.map((h) => h[key] as number);
                const last = vals[vals.length - 1];
                const prev = vals[vals.length - 2];
                const delta = Math.round((last - prev) * 10) / 10;
                return (
                  <tr key={key} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      {label}
                    </td>
                    {vals.map((v, i) => (
                      <td key={i} className="text-center px-3 py-3">
                        <span className="font-mono font-bold" style={{ color: scoreColor(v) }}>{v}</span>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkline values={vals} color={color} />
                        <span className={`font-bold text-[11px] shrink-0 ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-slate-400"}`}>
                          {delta > 0 ? `+${delta}` : delta}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score status legend */}
      <div className="flex items-center gap-6 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span className="font-semibold text-slate-700">Score Thresholds:</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Healthy (≥ 90)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Warning (75–89)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Critical (&lt; 75)</span>
      </div>
    </div>
  );
}

// ─── Remediation Table ────────────────────────────────────────────────────────
function RemediationSection({ report }: { report: ComplianceScoreReport }) {
  const columns: ColumnsType<RemediationItem> = [
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (p: RemediationItem["priority"]) => priorityTag(p),
      filters: [
        { text: "Critical", value: "Critical" },
        { text: "High", value: "High" },
        { text: "Medium", value: "Medium" },
      ],
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: "Dimension",
      dataIndex: "dimensionLabel",
      key: "dimensionLabel",
      width: 160,
      render: (label: string, row) => (
        <div className="flex items-center gap-1.5">
          {dimensionIcon(row.dimensionId)}
          <span className="text-xs font-medium text-slate-700">{label}</span>
        </div>
      ),
    },
    {
      title: "Issue",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <span className="text-xs text-slate-800 font-medium leading-snug">{title}</span>
      ),
    },
    {
      title: "Recommendation",
      dataIndex: "detail",
      key: "detail",
      render: (detail: string) => (
        <span className="text-xs text-slate-500 leading-snug">{detail}</span>
      ),
    },
    {
      title: "Reg. Ref",
      dataIndex: "regulatoryRef",
      key: "regulatoryRef",
      width: 160,
      render: (ref?: string) =>
        ref ? (
          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 block">
            {ref}
          </span>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        ),
    },
    {
      title: "Score Lift",
      dataIndex: "scoreLift",
      key: "scoreLift",
      width: 90,
      render: (lift: number) => (
        <span className="flex items-center gap-1 text-teal-600 font-bold text-xs">
          <ArrowUpRight className="w-3.5 h-3.5" /> +{lift}%
        </span>
      ),
      sorter: (a, b) => b.scoreLift - a.scoreLift,
    },
    {
      title: "Effort",
      dataIndex: "estimatedEffort",
      key: "estimatedEffort",
      width: 100,
      render: (effort: string) => (
        <span className="text-xs text-slate-500 font-medium">{effort}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: RemediationItem["status"]) => {
        const color = status === "Resolved" ? "success" : status === "In Progress" ? "processing" : "default";
        return <Tag color={color} className="font-bold text-xs">{status}</Tag>;
      },
    },
  ];

  const totalLift = ComplianceScoringEngine.calculateMaxScoreLift(report);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-teal-600" /> Prioritised Remediation Recommendations
        </h3>
        <div className="flex items-center gap-2 text-xs bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg text-teal-700 font-semibold">
          <Zap className="w-3.5 h-3.5" /> Resolving all issues would lift overall score by +{totalLift}%
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={report.remediations}
        scroll={{ x: 980 }}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: false }}
        className="border border-slate-200 rounded-xl overflow-hidden"
        rowClassName={(row) =>
          row.priority === "Critical"
            ? "bg-rose-50/40"
            : row.priority === "High"
            ? "bg-amber-50/40"
            : ""
        }
      />
    </div>
  );
}

// ─── Regulatory Readiness Stubs ───────────────────────────────────────────────
function RegulatorySection({ report }: { report: ComplianceScoreReport }) {
  const stubs = report.regulatoryStubs;
  const frameworks = [
    {
      name: "NABH 5th Edition",
      score: stubs.nabhReadinessScore,
      description: "National Accreditation Board for Hospitals & Healthcare Providers",
      lastAudit: stubs.lastNabhAuditDate,
      nextAudit: stubs.nextNabhAuditDue,
      badge: "Accreditation",
      color: "#0d9488",
      futureIntegration: false,
    },
    {
      name: "NABL ISO 15189",
      score: stubs.nablReadinessScore,
      description: "National Accreditation Board for Testing & Calibration Laboratories",
      badge: "Lab Certification",
      color: "#7c3aed",
      futureIntegration: true,
    },
    {
      name: "ABDM M1–M3",
      score: stubs.abdmReadinessScore,
      description: "Ayushman Bharat Digital Mission Health Stack Integration",
      badge: "ABHA Integration",
      color: "#0284c7",
      futureIntegration: true,
    },
    {
      name: "DPDP Act 2023",
      score: stubs.dpdpComplianceScore,
      description: "India Digital Personal Data Protection Act 2023 Compliance",
      badge: "Statutory Compliance",
      color: "#d97706",
      futureIntegration: false,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" /> Regulatory Reporting Readiness
        </h3>
        <Tag color="cyan" className="font-mono text-xs">API Integration Ready</Tag>
      </div>

      <Alert
        type="info"
        showIcon
        icon={<Info className="w-4 h-4" />}
        message="Regulatory Reporting Integration Architecture"
        description="These readiness scores are computed from the Compliance Scoring Engine and will be directly fed into NABH, NABL, and ABDM reporting APIs in the next integration phase. Data is already structured per statutory reporting schemas."
        className="border-blue-200 bg-blue-50"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frameworks.map((fw) => (
          <div key={fw.name} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{fw.name}</h4>
                  {fw.futureIntegration && (
                    <Tooltip title="Full API reporting integration scheduled for next release">
                      <Tag color="geekblue" className="text-[10px] font-bold cursor-help">API PLANNED</Tag>
                    </Tooltip>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{fw.description}</p>
              </div>
              <Tag color="default" className="font-bold text-xs shrink-0">{fw.badge}</Tag>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Readiness Score</span>
                <span className="font-black text-sm" style={{ color: scoreColor(fw.score) }}>{fw.score} / 100</span>
              </div>
              <Progress
                percent={fw.score}
                strokeColor={fw.color}
                trailColor="#e2e8f0"
                showInfo={false}
                size={["100%", 10]}
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <StatusTag status={fw.score >= 90 ? "Healthy" : fw.score >= 75 ? "Warning" : "Critical"} />
                {fw.lastAudit && (
                  <span className="font-mono">Last Audit: {fw.lastAudit} | Next: {fw.nextAudit}</span>
                )}
              </div>
            </div>

            {/* Future integration indicator */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
              <ChevronRight className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              {fw.futureIntegration
                ? "Compliance data structured and ready for automated regulatory report submission."
                : "Live data feeding into current reporting pipeline."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
interface ComplianceScoringDashboardProps {
  tenantId: string;
  tenantName: string;
}

export const ComplianceScoringDashboard: React.FC<ComplianceScoringDashboardProps> = ({
  tenantId,
  tenantName,
}) => {
  const [view, setView] = useState<ScoringView>("overview");

  const report = useMemo(
    () => ComplianceScoringEngine.generateReport(tenantId, tenantName),
    [tenantId, tenantName]
  );

  const openCount = report.remediations.filter((r) => r.status === "Open").length;
  const criticalCount = Object.values(report.dimensions)
    .flatMap((d) => d.findings)
    .filter((f) => f.severity === "Critical" && !f.resolved).length;

  return (
    <div className="space-y-5">
      {/* Top navigation bar */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" /> Compliance Scoring Engine
            <Badge count={criticalCount} color="#ef4444" className="ml-1" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            5-dimension weighted scoring with trend analysis, remediation queue, and regulatory reporting readiness.
          </p>
        </div>

        <Segmented
          options={[
            { label: <span className="px-1 text-xs font-medium">Overview</span>, value: "overview" },
            { label: <span className="px-1 text-xs font-medium">Breakdown</span>, value: "breakdown" },
            { label: <span className="px-1 text-xs font-medium">Trends</span>, value: "trends" },
            {
              label: (
                <span className="px-1 text-xs font-medium flex items-center gap-1">
                  Remediation
                  {openCount > 0 && (
                    <span className="bg-amber-400 text-slate-900 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                      {openCount}
                    </span>
                  )}
                </span>
              ),
              value: "remediation",
            },
            { label: <span className="px-1 text-xs font-medium">Regulatory</span>, value: "regulatory" },
          ]}
          value={view}
          onChange={(v) => setView(v as ScoringView)}
          className="bg-slate-800 shrink-0"
        />
      </div>

      {/* View panels */}
      {view === "overview" && <OverviewSection report={report} />}
      {view === "breakdown" && <BreakdownSection report={report} />}
      {view === "trends" && <TrendsSection report={report} />}
      {view === "remediation" && <RemediationSection report={report} />}
      {view === "regulatory" && <RegulatorySection report={report} />}
    </div>
  );
};
