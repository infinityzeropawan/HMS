"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Table, Tag, Select, Input, Tabs, Card, Progress, Badge, Button, Tooltip, message, Alert } from "antd";
import {
  ShieldCheck,
  Building2,
  Receipt,
  SlidersHorizontal,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  FileText,
  Lock,
  Clock,
  UserCheck,
  Database,
  Download,
  Eye,
  Key,
  Layers,
  Award,
  BookOpen,
  Activity,
  HeartPulse,
} from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ComplianceService } from "../_super_admin_services/compliance_service";
import { getTenantById } from "../_super_admin_services/tenant_api_service";
import { ComplianceHealthStatus } from "../_super_admin_types/compliance_types";
import { ConsentRegistryWorkspace } from "../_super_admin_components/FacilityControl/ConsentRegistryWorkspace";
import { DpdpComplianceCenterWorkspace } from "../_super_admin_components/FacilityControl/DpdpComplianceCenterWorkspace";
import { DataRetentionManagerWorkspace } from "../_super_admin_components/FacilityControl/DataRetentionManagerWorkspace";
import { ComplianceScoringDashboard } from "../_super_admin_components/FacilityControl/ComplianceScoringDashboard";
import { GovernanceExecutiveDashboard } from "../_super_admin_components/FacilityControl/GovernanceExecutiveDashboard";

export default function ComplianceGovernancePage() {
  const [selectedTenantId, setSelectedTenantId] = useState<string>("TNT-9014");
  const [tenantOptions, setTenantOptions] = useState<{ value: string; label: string }[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>("overview");

  const tenant = getTenantById(selectedTenantId);
  const kpis = ComplianceService.getComplianceKPIs(selectedTenantId);
  const consentRegistry = ComplianceService.getConsentRegistry(selectedTenantId);
  const dpdpRecords = ComplianceService.getDpdpRecords(selectedTenantId);
  const retentionPolicies = ComplianceService.getDataRetentionPolicies(selectedTenantId);
  const governancePolicies = ComplianceService.getGovernancePolicies(selectedTenantId);
  const complianceReports = ComplianceService.getComplianceReports(selectedTenantId);
  const breakGlassLogs = ComplianceService.getBreakGlassLogs(selectedTenantId);

  const getStatusTag = (status: ComplianceHealthStatus) => {
    switch (status) {
      case "Healthy":
        return <Tag color="success" icon={<CheckCircle2 className="w-3 h-3 inline mr-1" />} className="font-bold">Healthy</Tag>;
      case "Warning":
        return <Tag color="warning" icon={<AlertTriangle className="w-3 h-3 inline mr-1" />} className="font-bold">Warning</Tag>;
      case "Critical":
        return <Tag color="error" icon={<XCircle className="w-3 h-3 inline mr-1" />} className="font-bold">Critical</Tag>;
    }
  };

  return (
    <HmsAppShell title="Compliance & Governance Control Center">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-teal-600" /> Compliance & Governance Control Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Enterprise Healthcare Regulatory Telemetry, DPDP Act 2023, ABHA Consents & Clinical Break-Glass Monitoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/tenants">
              <HmsButton size="sm" variant="secondary" icon={<Building2 className="w-4 h-4" />}>
                Tenants
              </HmsButton>
            </Link>
            <Link href="/role-templates">
              <HmsButton size="sm" variant="secondary" icon={<Lock className="w-4 h-4" />}>
                RBAC & Roles
              </HmsButton>
            </Link>
            <Link href="/platform-audit">
              <HmsButton size="sm" variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
                Platform Audit
              </HmsButton>
            </Link>
          </div>
        </div>

        {/* Top Tenant Control Selector Header */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hospital Tenant:
              </span>
            </div>
            <Select
              value={selectedTenantId}
              onChange={(val) => setSelectedTenantId(val)}
              options={tenantOptions}
              className="w-full sm:w-80 font-semibold"
              size="large"
            />
          </div>

          {tenant && (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Status: <Tag color="green" className="font-bold">{tenant.status}</Tag></span>
              <span className="text-slate-600">|</span>
              <span>ABDM: <Tag color="blue" className="font-bold">{tenant.compliance?.abdm || "Certified"}</Tag></span>
            </div>
          )}
        </div>

        {/* Subsections Workspace Tabs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <Tabs
            activeKey={activeTabKey}
            onChange={(key) => setActiveTabKey(key)}
            items={[
              // --- EXECUTIVE OVERVIEW ---
              {
                key: "overview",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Executive Overview
                  </span>
                ),
                children: (
                  <div className="pt-2">
                    <GovernanceExecutiveDashboard
                      tenantId={selectedTenantId}
                      onNavigateTab={(tabKey) => setActiveTabKey(tabKey)}
                    />
                  </div>
                ),
              },

              // --- 0. COMPLIANCE SCORING ENGINE ---
              {
                key: "scoring",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <Award className="w-4 h-4 text-teal-600" />
                    Scoring Engine
                  </span>
                ),
                children: (
                  <div className="pt-2">
                    <ComplianceScoringDashboard
                      tenantId={selectedTenantId}
                      tenantName={tenant?.hospitalName ?? selectedTenantId}
                    />
                  </div>
                ),
              },

              // --- 1. COMPLIANCE DASHBOARD ---
              {
                key: "dashboard",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <Activity className="w-4 h-4 text-teal-600" />
                    Compliance Dashboard
                  </span>
                ),
                children: (
                  <div className="space-y-6 pt-2">
                    {/* Visual Compliance Summary KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {/* KPI 1: Compliance Score */}
                      <Card size="small" className="border-slate-200 bg-slate-50/50 shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-500 block">Compliance Score</span>
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900">{kpis.complianceScore}%</span>
                            {getStatusTag(kpis.complianceScoreStatus)}
                          </div>
                          <Progress percent={kpis.complianceScore} strokeColor="#0d9488" size="small" showInfo={false} />
                        </div>
                      </Card>

                      {/* KPI 2: Consent Coverage */}
                      <Card size="small" className="border-slate-200 bg-slate-50/50 shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-500 block">Consent Coverage</span>
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900">{kpis.consentCoverage}%</span>
                            {getStatusTag(kpis.consentCoverageStatus)}
                          </div>
                          <Progress percent={kpis.consentCoverage} strokeColor="#0284c7" size="small" showInfo={false} />
                        </div>
                      </Card>

                      {/* KPI 3: Audit Coverage */}
                      <Card size="small" className="border-slate-200 bg-slate-50/50 shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-500 block">Audit Coverage</span>
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900">{kpis.auditCoverage}%</span>
                            {getStatusTag(kpis.auditCoverageStatus)}
                          </div>
                          <Progress percent={kpis.auditCoverage} strokeColor="#7c3aed" size="small" showInfo={false} />
                        </div>
                      </Card>

                      {/* KPI 4: DPDP Status */}
                      <Card size="small" className="border-slate-200 bg-slate-50/50 shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-500 block">DPDP Act Status</span>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">DPDP 2023</span>
                            {getStatusTag(kpis.dpdpStatus)}
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight truncate mt-1">
                            {kpis.dpdpStatusMessage}
                          </span>
                        </div>
                      </Card>

                      {/* KPI 5: Policy Review Status */}
                      <Card size="small" className="border-slate-200 bg-slate-50/50 shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-500 block">Policy Review Status</span>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">Review SLA</span>
                            {getStatusTag(kpis.policyReviewStatus)}
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight truncate mt-1">
                            {kpis.policyReviewStatusMessage}
                          </span>
                        </div>
                      </Card>
                    </div>

                    {/* Tenant Accreditation & Compliance Metadata Card (Preserved Metadata) */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-400" />
                          <h3 className="text-base font-bold text-white">
                            Accreditation & Statutory Metadata ({tenant?.hospitalName})
                          </h3>
                        </div>
                        <Tag color="cyan" className="font-mono text-xs">
                          Subdomain: {tenant?.subdomain}.hms.com
                        </Tag>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
                          <span className="text-slate-400 text-[11px] font-semibold block">NABH Accreditation</span>
                          <span className="font-bold text-teal-300 text-sm block">{tenant?.compliance.nabh || "Full Accreditation"}</span>
                          <span className="font-mono text-[10px] text-slate-400 block">Cert: {tenant?.compliance.nabhCertNo || "NABH-HOSP-2024-0891"}</span>
                        </div>

                        <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
                          <span className="text-slate-400 text-[11px] font-semibold block">NABL Laboratory Certification</span>
                          <span className="font-bold text-sky-300 text-sm block">{tenant?.compliance.nabl || "Accredited Lab"}</span>
                          <span className="font-mono text-[10px] text-slate-400 block">Cert: {tenant?.compliance.nablCertNo || "NABL-LAB-2024-3312"}</span>
                        </div>

                        <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
                          <span className="text-slate-400 text-[11px] font-semibold block">HFR Health Facility Registry</span>
                          <span className="font-bold text-purple-300 text-sm block">{tenant?.compliance.hfr || "Registered & Verified"}</span>
                          <span className="font-mono text-[10px] text-slate-400 block">HFR ID: {tenant?.compliance.hfrId || "IN331000291"}</span>
                        </div>

                        <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
                          <span className="text-slate-400 text-[11px] font-semibold block">ABDM Health Gateway Integration</span>
                          <span className="font-bold text-emerald-300 text-sm block">{tenant?.compliance.abdm || "Level M1-M3 Certified"}</span>
                          <span className="font-mono text-[10px] text-slate-400 block">Gateway ID: {tenant?.compliance.abdmGatewayId || "ABDM-GW-9014"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },

              // --- 2. CONSENT REGISTRY ---
              {
                key: "consent",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    Consent Registry
                  </span>
                ),
                children: <ConsentRegistryWorkspace tenantId={selectedTenantId} />,
              },

              // --- 3. DPDP CENTER ---
              {
                key: "dpdp",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    DPDP Center
                  </span>
                ),
                children: <DpdpComplianceCenterWorkspace tenantId={selectedTenantId} />,
              },

              // --- 4. DATA RETENTION ---
              {
                key: "retention",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <Database className="w-4 h-4 text-blue-600" />
                    Data Retention
                  </span>
                ),
                children: <DataRetentionManagerWorkspace tenantId={selectedTenantId} />,
              },

              // --- 5. GOVERNANCE POLICIES ---
              {
                key: "policies",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Governance Policies
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-2">
                    <p className="text-xs text-slate-500">
                      Hospital clinical governance, data privacy, and information security policy register.
                    </p>

                    <Table
                      dataSource={governancePolicies.map((p) => ({ ...p, key: p.policyId }))}
                      columns={[
                        { title: "Policy Code", dataIndex: "policyId", key: "policyId", render: (id: string) => <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{id}</span> },
                        { title: "Policy Title", dataIndex: "title", key: "title", render: (title: string) => <span className="font-bold text-slate-900 text-xs">{title}</span> },
                        { title: "Category", dataIndex: "category", key: "category", render: (cat: string) => <Tag color="blue">{cat}</Tag> },
                        { title: "Version", dataIndex: "version", key: "version", render: (v: string) => <span className="font-mono text-xs font-semibold text-slate-700">{v}</span> },
                        { title: "Last Reviewed", dataIndex: "lastReviewedDate", key: "lastReviewedDate", render: (d: string) => <span className="text-xs text-slate-500">{d}</span> },
                        { title: "Next Review Due", dataIndex: "nextReviewDate", key: "nextReviewDate", render: (d: string) => <span className="text-xs font-bold text-slate-800">{d}</span> },
                        { title: "Policy Owner", dataIndex: "policyOwner", key: "policyOwner", render: (o: string) => <span className="text-xs font-semibold text-slate-700">{o}</span> },
                        { title: "Status", dataIndex: "status", key: "status", render: (st: ComplianceHealthStatus) => getStatusTag(st) },
                      ]}
                      pagination={false}
                      size="small"
                    />
                  </div>
                ),
              },

              // --- 6. COMPLIANCE REPORTS ---
              {
                key: "reports",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <FileText className="w-4 h-4 text-volcano-600" />
                    Compliance Reports
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-2">
                    <p className="text-xs text-slate-500">
                      Generated regulatory compliance audit packages and accreditation sign-off documents.
                    </p>

                    <Table
                      dataSource={complianceReports.map((r) => ({ ...r, key: r.reportId }))}
                      columns={[
                        { title: "Report Package ID", dataIndex: "reportId", key: "reportId", render: (id: string) => <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{id}</span> },
                        { title: "Report Title", dataIndex: "title", key: "title", render: (t: string) => <span className="font-bold text-slate-900 text-xs">{t}</span> },
                        { title: "Standard / Regulatory Framework", dataIndex: "standard", key: "standard", render: (s: string) => <Tag color="purple">{s}</Tag> },
                        { title: "Generated Date", dataIndex: "generatedDate", key: "generatedDate", render: (d: string) => <span className="text-xs text-slate-500">{d}</span> },
                        { title: "Audit Score", dataIndex: "score", key: "score", render: (s: number) => <span className="font-extrabold text-teal-700 text-xs">{s}%</span> },
                        { title: "Status", dataIndex: "status", key: "status", render: (st: ComplianceHealthStatus) => getStatusTag(st) },
                        {
                          title: "Actions",
                          key: "actions",
                          render: () => (
                            <Button size="small" icon={<Download className="w-3.5 h-3.5 text-teal-600" />} onClick={() => message.success("Downloading compliance audit package (PDF)...")}>
                              Download
                            </Button>
                          ),
                        },
                      ]}
                      pagination={false}
                      size="small"
                    />
                  </div>
                ),
              },

              // --- 7. BREAK GLASS MONITORING ---
              {
                key: "breakglass",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    Break Glass Monitoring
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-2">
                    <Alert
                      type="warning"
                      showIcon
                      icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                      message={<span className="font-bold text-xs text-slate-900">Clinical Emergency Break-Glass Escalation Audit Desk</span>}
                      description="Monitors emergency clinical privilege overrides where attending doctors access patient EHRs outside standard shift roster scope."
                    />

                    <div className="space-y-3">
                      {breakGlassLogs.map((log) => (
                        <div key={log.eventId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {log.eventId}
                              </span>
                              <span className="font-bold text-slate-900 text-xs">{log.doctorName}</span>
                              <Tag color="cyan">{log.doctorSpecialty}</Tag>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                              <Tag color={log.reviewStatus === "APPROVED" ? "green" : "gold"} className="font-bold text-[10px]">
                                {log.reviewStatus}
                              </Tag>
                            </div>
                          </div>

                          <div className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-slate-400 font-semibold block">Target Patient:</span>
                              <span className="font-bold text-slate-900">{log.patientName}</span>{" "}
                              <span className="font-mono text-[10px] text-slate-400">({log.patientId})</span>
                            </div>

                            <div>
                              <span className="text-slate-400 font-semibold block">Accessed Medical Records:</span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {log.accessedRecords.map((r) => (
                                  <Tag key={r} color="purple" className="text-[9px] font-mono">{r}</Tag>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs">
                            <span className="font-semibold text-slate-700 block">Emergency Break-Glass Justification:</span>
                            <p className="text-slate-600 italic bg-amber-50/50 p-2 rounded border border-amber-100 mt-0.5">
                              &quot;{log.emergencyReason}&quot;
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </HmsAppShell>
  );
}
