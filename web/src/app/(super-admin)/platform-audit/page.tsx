"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Tag, Input, Select, Modal, message } from "antd";
import { SearchOutlined, DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { ShieldCheck, Building2, Receipt, SlidersHorizontal, Database, Headphones, AlertTriangle, Activity, Lock } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";

interface AuditEvent {
  key: string;
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  category: "TENANT_ONBOARDING" | "SUBSCRIPTION_CHANGE" | "FACILITY_TOGGLE" | "FEATURE_FLAG" | "RBAC_ROLES";
  entity: string;
  ipAddress: string;
  riskLevel: "INFO" | "WARNING" | "CRITICAL";
  details: string;
}

const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    key: "1",
    id: "AUD-8801",
    timestamp: "2026-09-17 10:45:12 AM",
    actor: "Pawan SuperAdmin",
    actorRole: "SUPER_ADMIN",
    action: "Updated tenant subscription tier to ENTERPRISE",
    category: "SUBSCRIPTION_CHANGE",
    entity: "Apollo Super Speciality Hospital (TENANT-001)",
    ipAddress: "103.44.120.14",
    riskLevel: "INFO",
    details: '{"previousPlan": "PRO", "newPlan": "ENTERPRISE", "seats": 500, "updatedBy": "superadmin_01"}',
  },
  {
    key: "2",
    id: "AUD-8802",
    timestamp: "2026-09-17 09:30:44 AM",
    actor: "System Auto-Provisioner",
    actorRole: "SYSTEM",
    action: "Onboarded new hospital tenant & provisioned database schema",
    category: "TENANT_ONBOARDING",
    entity: "Fortis Care Heart Institute (TENANT-002)",
    ipAddress: "10.0.4.12",
    riskLevel: "INFO",
    details: '{"subdomain": "fortis", "dbInstance": "db-prod-fortis-02", "status": "PROVISIONED"}',
  },
  {
    key: "3",
    id: "AUD-8803",
    timestamp: "2026-09-16 04:15:20 PM",
    actor: "Admin Rajesh",
    actorRole: "HOSPITAL_ADMIN",
    action: "Toggled facility service state (OT Suite 3 Closed for Maintenance)",
    category: "FACILITY_TOGGLE",
    entity: "Apollo Super Speciality Hospital",
    ipAddress: "115.240.88.9",
    riskLevel: "WARNING",
    details: '{"facilityId": "FAC-OT-03", "prevState": "OPEN", "newState": "CLOSED", "reason": "Sterilization"}',
  },
  {
    key: "4",
    id: "AUD-8804",
    timestamp: "2026-09-16 02:10:00 PM",
    actor: "Pawan SuperAdmin",
    actorRole: "SUPER_ADMIN",
    action: "Enabled global feature flag 'ABDM_M2_CONSENT_ENGINE'",
    category: "FEATURE_FLAG",
    entity: "Global SaaS Platform",
    ipAddress: "103.44.120.14",
    riskLevel: "INFO",
    details: '{"flag": "ABDM_M2_CONSENT_ENGINE", "value": true, "scope": "ALL_TENANTS"}',
  },
  {
    key: "5",
    id: "AUD-8805",
    timestamp: "2026-09-15 11:05:18 AM",
    actor: "Security Guardian",
    actorRole: "SYSTEM",
    action: "Detected 3 failed login attempts for user admin@apollo.com",
    category: "RBAC_ROLES",
    entity: "Apollo Super Speciality Hospital",
    ipAddress: "49.207.140.22",
    riskLevel: "CRITICAL",
    details: '{"user": "admin@apollo.com", "attempts": 3, "status": "ACCOUNT_LOCKED_TEMPORARY"}',
  },
];

const CATEGORY_COLOR: Record<string, string> = {
  TENANT_ONBOARDING: "purple",
  SUBSCRIPTION_CHANGE: "emerald",
  FACILITY_TOGGLE: "cyan",
  FEATURE_FLAG: "blue",
  RBAC_ROLES: "volcano",
};

export default function PlatformAuditPage() {
  const [logs, setLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [selectedAudit, setSelectedAudit] = useState<AuditEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleExportLedger = () => {
    message.success("Generating immutable DPDP Audit Trail Ledger (CSV)...");
  };

  const filteredLogs = logs.filter((l) => {
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
                <p className="text-xs font-semibold text-slate-500 uppercase">Audit Logged Today</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">1,420 Events</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">100% Tamper Proof</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Active Admins</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">48 Sessions</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">Authenticated 2FA</p>
              </div>
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Security Alerts</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">1 Warning</h3>
                <p className="text-3xs text-amber-600 font-semibold mt-0.5">Failed Login Lockout</p>
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
                <Select value={categoryFilter} onChange={(v) => setCategoryFilter(v)} className="w-44">
                  <Select.Option value="ALL">All Categories</Select.Option>
                  <Select.Option value="TENANT_ONBOARDING">Tenant Onboarding</Select.Option>
                  <Select.Option value="SUBSCRIPTION_CHANGE">Subscription Change</Select.Option>
                  <Select.Option value="FACILITY_TOGGLE">Facility Toggle</Select.Option>
                  <Select.Option value="FEATURE_FLAG">Feature Flags</Select.Option>
                  <Select.Option value="RBAC_ROLES">RBAC & Roles</Select.Option>
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

          <div className="overflow-x-auto">
            <Table columns={columns} dataSource={filteredLogs} rowKey="key" pagination={{ pageSize: 10 }} />
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
            width={520}
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
                  {JSON.stringify(JSON.parse(selectedAudit.details), null, 2)}
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
