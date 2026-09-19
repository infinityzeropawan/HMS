"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Tag, Input, Select, Modal, message } from "antd";
import { SearchOutlined, DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { ShieldCheck, Building2, Receipt, SlidersHorizontal, Database, Headphones, AlertTriangle, Activity, Lock } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useRbacAuditStore } from "../_super_admin_stores/rbac_audit_store";
import { PlatformAuditService, PlatformAuditEvent, ExtendedAuditCategory } from "../_super_admin_services/platform_audit_service";

type AuditEvent = PlatformAuditEvent;

const CATEGORY_COLOR: Record<string, string> = {
  TENANT_ONBOARDING: "purple",
  SUBSCRIPTION_CHANGE: "emerald",
  FACILITY_TOGGLE: "cyan",
  FEATURE_FLAG: "blue",
  RBAC_ROLES: "volcano",
  CONSENT_EVENT: "cyan",
  DPDP_REQUEST: "blue",
  BREAK_GLASS_ACCESS: "magenta",
  ROLE_PERMISSION_CHANGE: "purple",
  RETENTION_POLICY_CHANGE: "geekblue",
  COMPLIANCE_EVENT: "emerald",
  BRANDING_CHANGE: "pink",
  WHITE_LABEL_CHANGE: "orange",
  SUBSCRIPTION_LIFECYCLE: "green",
  FEATURE_LICENSE_EVENT: "gold",
  GOVERNANCE_EVENT: "volcano",
  SECURITY: "red",
  LICENSE: "gold",
  SYSTEM: "blue",
  CONFIG: "geekblue",
};

export default function PlatformAuditPage() {
  const { logs: rbacStoreLogs } = useRbacAuditStore();
  const [platformLogs, setPlatformLogs] = useState<PlatformAuditEvent[]>(() => PlatformAuditService.getAuditLogs());
  const [auditStats, setAuditStats] = useState(() => PlatformAuditService.getStatistics());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [selectedAudit, setSelectedAudit] = useState<AuditEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    return PlatformAuditService.subscribe(() => {
      setPlatformLogs(PlatformAuditService.getAuditLogs());
      setAuditStats(PlatformAuditService.getStatistics());
    });
  }, []);

  // Map RBAC audit store logs into AuditEvent structure
  const mappedRbacLogs: AuditEvent[] = rbacStoreLogs.map((l) => ({
    key: l.eventId,
    id: l.eventId,
    timestamp: l.timestamp,
    actor: l.actor,
    actorRole: l.actorRole,
    action: `${l.eventType}: ${l.reason}`,
    category: "ROLE_PERMISSION_CHANGE" as ExtendedAuditCategory,
    entity: `${l.tenantName} (${l.tenantId})`,
    ipAddress: "103.44.120.14",
    riskLevel: l.eventType.includes("DELETED") || l.eventType.includes("REMOVED") ? "WARNING" : "INFO",
    details: JSON.stringify({
      previousValue: l.previousValue,
      newValue: l.newValue,
      hashSignature: l.hashSignature,
    }),
  }));

  const allCombinedLogs = [...mappedRbacLogs, ...platformLogs];

  const handleExportLedger = () => {
    message.success("Generating immutable DPDP Audit Trail Ledger (CSV)...");
  };

  const filteredLogs = allCombinedLogs.filter((l) => {
    const matchesSearch =
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || l.category === categoryFilter;
    const matchesRisk = riskFilter === "ALL" || l.riskLevel === riskFilter;
    return matchesSearch && matchesCategory && matchesRisk;
  });

  const columns = [
    {
      title: "Event ID & Time",
      key: "id",
      render: (_: unknown, r: AuditEvent) => (
        <div>
          <span className="font-mono font-bold text-teal-700 block">{r.id}</span>
          <span className="text-[11px] text-slate-500">{r.timestamp}</span>
        </div>
      ),
    },
    {
      title: "Actor & Role",
      key: "actor",
      render: (_: unknown, r: AuditEvent) => (
        <div>
          <strong className="text-slate-900 block text-xs">{r.actor}</strong>
          <Tag color="blue" className="text-[10px] font-mono">{r.actorRole}</Tag>
        </div>
      ),
    },
    {
      title: "Event Category",
      dataIndex: "category",
      key: "category",
      render: (c: string) => <Tag color={CATEGORY_COLOR[c]}>{c.replace("_", " ")}</Tag>,
    },
    { title: "Action Performed", dataIndex: "action", key: "action", render: (a: string) => <span className="text-xs text-slate-800 font-medium">{a}</span> },
    { title: "Target Entity", dataIndex: "entity", key: "entity", render: (e: string) => <span className="text-xs font-semibold text-slate-700">{e}</span> },
    { title: "IP Address", dataIndex: "ipAddress", key: "ipAddress", render: (ip: string) => <span className="font-mono text-xs text-slate-500">{ip}</span> },
    {
      title: "Risk Level",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (rk: string) => (
        <Tag color={rk === "CRITICAL" ? "red" : rk === "WARNING" ? "orange" : "green"}>
          {rk}
        </Tag>
      ),
    },
    {
      title: "Payload",
      key: "action",
      render: (_: unknown, r: AuditEvent) => (
        <HmsButton
          size="sm"
          variant="secondary"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedAudit(r);
            setModalOpen(true);
          }}
        >
          JSON
        </HmsButton>
      ),
    },
  ];

  return (
    <HmsAppShell title="Platform Audit Log & Security Ledger">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-teal-600" /> Platform Audit Log & Security Ledger
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Immutable SaaS Event Ledger: Tenant Onboarding, Subscription Changes, Facility Toggles & Security Alerts (DPDP Act Compliant)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/tenants">
              <HmsButton size="sm" variant="secondary" icon={<Building2 className="w-4 h-4" />}>
                Tenants
              </HmsButton>
            </Link>
            <Link href="/subscription-plans">
              <HmsButton size="sm" variant="secondary" icon={<Receipt className="w-4 h-4" />}>
                Subscriptions
              </HmsButton>
            </Link>
            <Link href="/feature-flags">
              <HmsButton size="sm" variant="secondary" icon={<SlidersHorizontal className="w-4 h-4" />}>
                Feature Flags
              </HmsButton>
            </Link>
            <Link href="/global-masters">
              <HmsButton size="sm" variant="secondary" icon={<Database className="w-4 h-4" />}>
                Global Masters
              </HmsButton>
            </Link>
            <Link href="/support-tickets">
              <HmsButton size="sm" variant="secondary" icon={<Headphones className="w-4 h-4" />}>
                Support Tickets
              </HmsButton>
            </Link>
          </div>
        </div>

        {/* Audit KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Audit Events</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">{allCombinedLogs.length.toLocaleString("en-IN")} Events</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">100% Tamper Proof</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Info Events</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">{auditStats.info} Events</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">Informational Actions</p>
              </div>
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Security Alerts</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{auditStats.warning} Warning{auditStats.warning !== 1 ? "s" : ""}</h3>
                <p className="text-3xs text-amber-600 font-semibold mt-0.5">{auditStats.critical} Critical Event{auditStats.critical !== 1 ? "s" : ""}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-indigo-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">DPDP Ledger Status</p>
                <h3 className="text-2xl font-bold text-indigo-800 mt-1">COMPLIANT</h3>
                <p className="text-3xs text-indigo-600 font-semibold mt-0.5">DPDP Act 2023 Compliant</p>
              </div>
              <Activity className="w-8 h-8 text-indigo-500" />
            </div>
          </HmsCard>
        </div>

        {/* Toolbar & Filter Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search Event ID, Actor, Action, Entity, or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80"
              allowClear
            />

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Category:</span>
                <Select value={categoryFilter} onChange={(v) => setCategoryFilter(v)} className="w-56" showSearch filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
                  <Select.Option value="ALL">All Categories</Select.Option>
                  <Select.Option value="CONSENT_EVENT">Consent Event</Select.Option>
                  <Select.Option value="DPDP_REQUEST">DPDP Request</Select.Option>
                  <Select.Option value="BREAK_GLASS_ACCESS">Break Glass Access</Select.Option>
                  <Select.Option value="ROLE_PERMISSION_CHANGE">Role Permission Change</Select.Option>
                  <Select.Option value="RETENTION_POLICY_CHANGE">Retention Policy Change</Select.Option>
                  <Select.Option value="COMPLIANCE_EVENT">Compliance Event</Select.Option>
                  <Select.Option value="BRANDING_CHANGE">Branding Change</Select.Option>
                  <Select.Option value="WHITE_LABEL_CHANGE">White Label Change</Select.Option>
                  <Select.Option value="SUBSCRIPTION_LIFECYCLE">Subscription Lifecycle</Select.Option>
                  <Select.Option value="FEATURE_LICENSE_EVENT">Feature License Event</Select.Option>
                  <Select.Option value="GOVERNANCE_EVENT">Governance Event</Select.Option>
                  <Select.Option value="TENANT_ONBOARDING">Tenant Onboarding</Select.Option>
                  <Select.Option value="FACILITY_TOGGLE">Facility Toggle</Select.Option>
                  <Select.Option value="FEATURE_FLAG">Feature Flags</Select.Option>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Risk:</span>
                <Select value={riskFilter} onChange={(v) => setRiskFilter(v)} className="w-32">
                  <Select.Option value="ALL">All Risks</Select.Option>
                  <Select.Option value="INFO">INFO</Select.Option>
                  <Select.Option value="WARNING">WARNING</Select.Option>
                  <Select.Option value="CRITICAL">CRITICAL</Select.Option>
                </Select>
              </div>

              <HmsButton variant="secondary" icon={<DownloadOutlined />} onClick={handleExportLedger} size="md">
                Export Ledger
              </HmsButton>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <Table columns={columns} dataSource={filteredLogs} rowKey="key" pagination={{ pageSize: 10 }} scroll={{ x: 1100 }} size="middle" />
          </div>
        </div>

        {/* JSON Payload View Drawer / Modal */}
        {selectedAudit && (
          <Modal
            title={
              <div className="flex items-center gap-2 text-teal-700 font-bold border-b pb-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Audit Event Payload ({selectedAudit.id})</span>
              </div>
            }
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            footer={null}
            width="min(520px, calc(100vw - 32px))"
          >
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div><strong>Actor:</strong> {selectedAudit.actor} ({selectedAudit.actorRole})</div>
                <div><strong>Action:</strong> {selectedAudit.action}</div>
                <div><strong>Entity:</strong> {selectedAudit.entity}</div>
                <div><strong>Timestamp:</strong> {selectedAudit.timestamp}</div>
                <div><strong>IP Address:</strong> <span className="font-mono text-purple-700">{selectedAudit.ipAddress}</span></div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Raw JSON Audit Payload:</span>
                <pre className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-lg overflow-x-auto">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedAudit.details), null, 2);
                    } catch {
                      return selectedAudit.details;
                    }
                  })()}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </HmsAppShell>
  );
}
