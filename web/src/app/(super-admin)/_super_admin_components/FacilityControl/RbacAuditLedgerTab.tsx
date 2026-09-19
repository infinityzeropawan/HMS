"use client";

import React, { useState } from "react";
import { Table, Tag, Input, Select, Segmented, Modal, Card, Button, Tooltip, message, Alert } from "antd";
import {
  ShieldCheck,
  Search,
  Download,
  FileCode,
  Lock,
  Clock,
  UserCheck,
  Key,
  GitFork,
  SlidersHorizontal,
  Layers,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { RbacAuditEntry, RbacEventType } from "../../_super_admin_types/rbac_audit_types";
import { useRbacAuditStore } from "../../_super_admin_stores/rbac_audit_store";

interface RbacAuditLedgerTabProps {
  tenantId: string;
}

export const RbacAuditLedgerTab: React.FC<RbacAuditLedgerTabProps> = ({ tenantId }) => {
  const { logs, getFilteredLogs, exportToCSV, exportToJSON } = useRbacAuditStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<RbacEventType | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"Timeline" | "Table Grid">("Timeline");
  const [selectedEntryForDiff, setSelectedEntryForDiff] = useState<RbacAuditEntry | null>(null);

  const filteredLogs = getFilteredLogs({
    tenantId: tenantId === "ALL" ? undefined : tenantId,
    eventType: selectedEventType,
    searchTerm,
  });

  const handleExportCSV = () => {
    const csvContent = exportToCSV(tenantId);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rbac_audit_ledger_${tenantId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("RBAC Audit Ledger CSV exported successfully!");
  };

  const handleExportJSON = () => {
    const jsonContent = exportToJSON(tenantId);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rbac_audit_ledger_${tenantId}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("RBAC Audit Ledger JSON exported successfully!");
  };

  const getEventBadge = (type: RbacEventType) => {
    switch (type) {
      case "ROLE_CREATED":
        return <Tag color="green" icon={<CheckCircle2 className="w-3 h-3 inline mr-1" />}>Role Created</Tag>;
      case "ROLE_UPDATED":
        return <Tag color="blue" icon={<SlidersHorizontal className="w-3 h-3 inline mr-1" />}>Role Updated</Tag>;
      case "ROLE_DELETED":
        return <Tag color="red" icon={<AlertTriangle className="w-3 h-3 inline mr-1" />}>Role Deactivated</Tag>;
      case "PERMISSION_ADDED":
        return <Tag color="cyan" icon={<Key className="w-3 h-3 inline mr-1" />}>Permission Granted</Tag>;
      case "PERMISSION_REMOVED":
        return <Tag color="volcano" icon={<Key className="w-3 h-3 inline mr-1" />}>Permission Revoked</Tag>;
      case "USER_ROLE_ASSIGNED":
        return <Tag color="purple" icon={<UserCheck className="w-3 h-3 inline mr-1" />}>User Role Assigned</Tag>;
      case "USER_ROLE_REMOVED":
        return <Tag color="orange" icon={<UserCheck className="w-3 h-3 inline mr-1" />}>User Role Revoked</Tag>;
      case "SCOPE_CHANGED":
        return <Tag color="magenta" icon={<GitFork className="w-3 h-3 inline mr-1" />}>Scope Boundary Changed</Tag>;
      case "FEATURE_PERMISSION_CHANGED":
        return <Tag color="gold" icon={<Layers className="w-3 h-3 inline mr-1" />}>Feature Mask Shift</Tag>;
      default:
        return <Tag color="default">{type}</Tag>;
    }
  };

  const columns = [
    {
      title: "Event ID & Time",
      dataIndex: "eventId",
      key: "eventId",
      render: (id: string, record: RbacAuditEntry) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 block">{id}</span>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400 inline" /> {record.timestamp}
          </span>
        </div>
      ),
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      render: (type: RbacEventType) => getEventBadge(type),
    },
    {
      title: "Actor",
      dataIndex: "actor",
      key: "actor",
      render: (actor: string, record: RbacAuditEntry) => (
        <div>
          <span className="font-bold text-xs text-slate-900 block">{actor}</span>
          <Tag color="purple" className="text-[9px] font-mono mt-0.5">{record.actorRole}</Tag>
        </div>
      ),
    },
    {
      title: "Target Role / User",
      key: "target",
      render: (_: any, record: RbacAuditEntry) => (
        <div>
          <span className="font-bold text-xs text-slate-800 block">
            {record.targetRoleName || record.targetUser || record.targetRoleId || "System Wide"}
          </span>
          {record.targetRoleId && (
            <span className="font-mono text-[10px] text-slate-400 block">{record.targetRoleId}</span>
          )}
        </div>
      ),
    },
    {
      title: "Reason & Justification",
      dataIndex: "reason",
      key: "reason",
      render: (text: string) => (
        <span className="text-xs text-slate-600 line-clamp-2 italic">{text}</span>
      ),
    },
    {
      title: "Hash Signature",
      dataIndex: "hashSignature",
      key: "hashSignature",
      render: (hash: string) => (
        <Tag color="geekblue" className="font-mono text-[10px]">
          {hash}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: RbacAuditEntry) => (
        <Button
          size="small"
          icon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => setSelectedEntryForDiff(record)}
        >
          Diff
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Immutability Guard Banner */}
      <Alert
        type="warning"
        showIcon
        icon={<Lock className="w-4 h-4 text-amber-600" />}
        message={
          <span className="font-bold text-slate-900 text-xs">
            Cryptographic Tamper-Proof Audit Ledger (Append-Only)
          </span>
        }
        description="All RBAC role creations, modifications, scope changes, and user assignments generate immutable, hash-chained records. Audit log modification or deletion is strictly prohibited."
        className="border-amber-200 bg-amber-50/70"
      />

      {/* Control Header & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Search event ID, actor, target or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 text-xs"
            allowClear
          />

          <Select
            value={selectedEventType}
            onChange={(val) => setSelectedEventType(val)}
            className="w-full sm:w-56 text-xs font-semibold"
            options={[
              { value: "ALL", label: "All RBAC Event Types" },
              { value: "ROLE_CREATED", label: "Role Created" },
              { value: "ROLE_UPDATED", label: "Role Updated" },
              { value: "ROLE_DELETED", label: "Role Deactivated" },
              { value: "PERMISSION_ADDED", label: "Permission Granted" },
              { value: "PERMISSION_REMOVED", label: "Permission Revoked" },
              { value: "USER_ROLE_ASSIGNED", label: "User Role Assigned" },
              { value: "SCOPE_CHANGED", label: "Scope Boundary Changed" },
              { value: "FEATURE_PERMISSION_CHANGED", label: "Feature Mask Shift" },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={["Timeline", "Table Grid"]}
            value={viewMode}
            onChange={(val) => setViewMode(val as "Timeline" | "Table Grid")}
          />

          <Button
            icon={<Download className="w-4 h-4 text-teal-600" />}
            size="small"
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            icon={<FileCode className="w-4 h-4 text-purple-600" />}
            size="small"
            onClick={handleExportJSON}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* View Mode: Timeline View */}
      {viewMode === "Timeline" ? (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
              No audit records found matching selected filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.eventId} className="relative group">
                {/* Timeline Bullet Node */}
                <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-teal-600 border-2 border-white shadow-xs flex items-center justify-center text-white text-[10px]">
                  ✓
                </div>

                {/* Event Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 hover:border-teal-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.eventId}
                      </span>
                      {getEventBadge(log.eventType)}
                      <Tag color="geekblue" className="text-[10px] font-mono">
                        {log.tenantId}
                      </Tag>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {log.timestamp}
                    </div>
                  </div>

                  {/* Actor and Target Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 font-semibold block">Executed By (Actor):</span>
                      <span className="font-bold text-slate-900">{log.actor}</span>{" "}
                      <span className="text-slate-500 font-mono text-[10px]">({log.actorRole})</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Target Entity:</span>
                      <span className="font-bold text-slate-900">
                        {log.targetRoleName || log.targetUser || log.targetRoleId || "System Global"}
                      </span>
                    </div>
                  </div>

                  {/* Reason & Audit Note */}
                  <div className="text-xs">
                    <span className="font-semibold text-slate-700 block">Audit Reason & Justification:</span>
                    <p className="text-slate-600 italic bg-amber-50/40 p-2 rounded border border-amber-100/60 mt-0.5">
                      "{log.reason}"
                    </p>
                  </div>

                  {/* Diff Preview Button & Hash Signature Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Hash Signature:{" "}
                      <span className="font-semibold text-slate-600">{log.hashSignature}</span>
                    </span>

                    <Button
                      size="small"
                      type="link"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedEntryForDiff(log)}
                    >
                      Inspect Diff & Payloads
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* View Mode: Table Grid */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <Table
            dataSource={filteredLogs}
            columns={columns}
            rowKey="eventId"
            pagination={{ pageSize: 8 }}
            size="small"
          />
        </div>
      )}

      {/* Diff Inspector Modal */}
      {selectedEntryForDiff && (
        <Modal
          open={!!selectedEntryForDiff}
          onCancel={() => setSelectedEntryForDiff(null)}
          footer={null}
          width={720}
          title={
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>RBAC Audit Entry Inspector: {selectedEntryForDiff.eventId}</span>
            </div>
          }
        >
          <div className="space-y-4 my-2 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-900 text-white p-3 rounded-xl font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block">Event ID:</span>
                <span className="font-bold text-teal-400">{selectedEntryForDiff.eventId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp:</span>
                <span className="font-bold text-white">{selectedEntryForDiff.timestamp}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Actor:</span>
                <span className="font-bold text-white">{selectedEntryForDiff.actor} ({selectedEntryForDiff.actorRole})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Hash Signature:</span>
                <span className="font-bold text-amber-400">{selectedEntryForDiff.hashSignature}</span>
              </div>
            </div>

            {/* Side-by-side JSON diff preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card
                title={<span className="text-xs font-bold text-rose-600">Previous Value / State</span>}
                className="border-rose-200 bg-rose-50/30"
                size="small"
              >
                <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-wrap overflow-x-auto max-h-56">
                  {typeof selectedEntryForDiff.previousValue === "object" && selectedEntryForDiff.previousValue !== null
                    ? JSON.stringify(selectedEntryForDiff.previousValue, null, 2)
                    : String(selectedEntryForDiff.previousValue ?? "")}
                </pre>
              </Card>

              <Card
                title={<span className="text-xs font-bold text-emerald-600">New Value / State</span>}
                className="border-emerald-200 bg-emerald-50/30"
                size="small"
              >
                <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-wrap overflow-x-auto max-h-56">
                  {typeof selectedEntryForDiff.newValue === "object" && selectedEntryForDiff.newValue !== null
                    ? JSON.stringify(selectedEntryForDiff.newValue, null, 2)
                    : String(selectedEntryForDiff.newValue ?? "")}
                </pre>
              </Card>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-0.5">Audit Justification Note:</span>
              <p className="text-slate-600 italic">"{selectedEntryForDiff.reason}"</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
