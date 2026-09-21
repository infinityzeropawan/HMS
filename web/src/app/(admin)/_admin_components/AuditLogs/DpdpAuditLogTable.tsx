"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag, Input, Select } from "antd";
import { Lock, Search, ShieldCheck } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { PlatformAuditService, PlatformAuditEvent } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";

export const DpdpAuditLogTable: React.FC = () => {
  const [logs, setLogs] = useState<PlatformAuditEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");

  useEffect(() => {
    setLogs(PlatformAuditService.getAuditLogs());
    return PlatformAuditService.subscribe(() => {
      setLogs(PlatformAuditService.getAuditLogs());
    });
  }, []);

  const handleExportAuditJson = () => {
    const jsonContent = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dpdp_compliance_audit_log_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesCategory = categoryFilter === "ALL" || l.category === categoryFilter;
    const matchesRisk = riskFilter === "ALL" || l.riskLevel === riskFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      l.id.toLowerCase().includes(term) ||
      l.actor.toLowerCase().includes(term) ||
      l.action.toLowerCase().includes(term) ||
      l.entity.toLowerCase().includes(term) ||
      (l.details && l.details.toLowerCase().includes(term));
    return matchesCategory && matchesRisk && matchesSearch;
  });

  const columns = [
    {
      title: "Audit ID & Time",
      key: "id",
      render: (r: PlatformAuditEvent) => (
        <div>
          <span className="font-mono font-bold text-teal-700 block">{r.id}</span>
          <span className="text-[11px] text-slate-500">{r.timestamp}</span>
        </div>
      ),
    },
    {
      title: "Actor & Role",
      key: "actor",
      render: (r: PlatformAuditEvent) => (
        <div>
          <span className="font-semibold text-slate-900 text-xs block">{r.actor}</span>
          <Tag color="purple" className="text-[10px] mt-0.5">{r.actorRole}</Tag>
        </div>
      ),
    },
    {
      title: "Action & Category",
      key: "action",
      render: (r: PlatformAuditEvent) => (
        <div className="max-w-md">
          <span className="font-semibold text-slate-800 text-xs block">{r.action}</span>
          <Tag color="blue" className="text-[10px] mt-0.5">{r.category}</Tag>
        </div>
      ),
    },
    {
      title: "Target Entity",
      dataIndex: "entity",
      key: "entity",
      render: (e: string) => <span className="text-xs font-mono text-slate-700">{e}</span>,
    },
    {
      title: "Risk Level",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (lvl: string) => (
        <Tag color={lvl === "CRITICAL" ? "red" : lvl === "WARNING" ? "orange" : "green"}>
          {lvl}
        </Tag>
      ),
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      render: (d: string) => (
        <span className="text-[11px] font-mono text-slate-500 max-w-xs truncate block" title={d}>
          {d}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <span className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-teal-300">
          <Lock className="w-4 h-4 text-emerald-400" /> DPDP & ABDM Compliance Immutable Audit Trail (Append-Only)
        </span>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span className="font-mono text-[11px] text-slate-300">Hash-Chain Validated Ledger</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <Input
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Search Audit ID, Actor, Action or Entity..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80"
          allowClear
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <Select value={riskFilter} onChange={(v) => setRiskFilter(v)} className="w-36">
            <Select.Option value="ALL">All Risk Levels</Select.Option>
            <Select.Option value="CRITICAL">CRITICAL</Select.Option>
            <Select.Option value="WARNING">WARNING</Select.Option>
            <Select.Option value="INFO">INFO</Select.Option>
          </Select>

          <Select value={categoryFilter} onChange={(v) => setCategoryFilter(v)} className="w-48">
            <Select.Option value="ALL">All Audit Categories</Select.Option>
            <Select.Option value="SUBSCRIPTION_LIFECYCLE">Subscription Lifecycle</Select.Option>
            <Select.Option value="TENANT_ONBOARDING">Tenant Onboarding</Select.Option>
            <Select.Option value="BREAK_GLASS_ACCESS">Break Glass Access</Select.Option>
            <Select.Option value="ROLE_PERMISSION_CHANGE">Role Permission Change</Select.Option>
            <Select.Option value="CONSENT_EVENT">Consent Event</Select.Option>
            <Select.Option value="DPDP_REQUEST">DPDP Request</Select.Option>
            <Select.Option value="GOVERNANCE_EVENT">Governance Event</Select.Option>
          </Select>

          <HmsButton size="sm" variant="ghost" onClick={handleExportAuditJson}>
            Export JSON
          </HmsButton>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-xl border border-slate-200">
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          size="small"
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};
