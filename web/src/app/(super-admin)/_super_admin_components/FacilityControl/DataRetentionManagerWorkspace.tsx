"use client";

import React, { useState } from "react";
import { Table, Tag, Input, Select, Segmented, Modal, Card, Button, Tooltip, message, Alert, Drawer, Progress, Switch } from "antd";
import {
  Database,
  Search,
  Download,
  FileCode,
  Lock,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  SlidersHorizontal,
  Archive,
  Layers,
  FileText,
  Activity,
  HardDrive,
  Scale,
} from "lucide-react";
import { RetentionPolicy, RetentionRecordType, RetentionComplianceStatus, ArchiveStatus, PurgeEligibility } from "../../_super_admin_types/retention_types";
import { RetentionService } from "../../_super_admin_services/retention_service";

interface DataRetentionManagerWorkspaceProps {
  tenantId: string;
}

export const DataRetentionManagerWorkspace: React.FC<DataRetentionManagerWorkspaceProps> = ({ tenantId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecordType, setSelectedRecordType] = useState<RetentionRecordType | "ALL">("ALL");
  const [selectedComplianceStatus, setSelectedComplianceStatus] = useState<RetentionComplianceStatus | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"Table Grid" | "Policy Cards">("Table Grid");

  // Selected for drawer/modal
  const [inspectPolicy, setInspectPolicy] = useState<RetentionPolicy | null>(null);

  const policies = RetentionService.getPolicies({
    tenantId: tenantId === "ALL" ? undefined : tenantId,
    recordType: selectedRecordType,
    complianceStatus: selectedComplianceStatus,
    searchTerm,
  });

  const metrics = RetentionService.getMetrics(tenantId);
  const thresholdPolicies = policies.filter((p) => p.approachingThreshold);

  const handleToggleLegalHold = (policy: RetentionPolicy) => {
    const nextState = !policy.isLegalHoldLocked;
    RetentionService.toggleLegalHold(policy.policyId, nextState);
    message.success(`Legal Hold on "${policy.recordType}" ${nextState ? "ENABLED" : "DISABLED"}`);
    if (inspectPolicy?.policyId === policy.policyId) {
      setInspectPolicy({ ...inspectPolicy, isLegalHoldLocked: nextState });
    }
  };

  const handleTriggerColdArchival = (policy: RetentionPolicy) => {
    RetentionService.triggerColdArchival(policy.policyId);
    message.success(`Automated Glacier Cold Storage Archival triggered for ${policy.recordType}!`);
  };

  const handleExportCSV = () => {
    const csvContent = RetentionService.exportCSV(tenantId);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `data_retention_policies_${tenantId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Data Retention Policies CSV exported successfully!");
  };

  const handleExportJSON = () => {
    const jsonContent = RetentionService.exportJSON(tenantId);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `data_retention_policies_${tenantId}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Data Retention Policies JSON exported successfully!");
  };

  const getRecordTypeTag = (type: RetentionRecordType) => {
    switch (type) {
      case "Audit Logs":
        return <Tag color="purple" className="font-bold">Audit Logs</Tag>;
      case "Clinical Records":
        return <Tag color="teal" className="font-bold">Clinical Records</Tag>;
      case "Consent Records":
        return <Tag color="cyan" className="font-bold">Consent Records</Tag>;
      case "Billing Records":
        return <Tag color="blue" className="font-bold">Billing Records</Tag>;
      case "Laboratory Reports":
        return <Tag color="geekblue" className="font-bold">Laboratory Reports</Tag>;
      case "Imaging Reports":
        return <Tag color="magenta" className="font-bold">Imaging Reports</Tag>;
    }
  };

  const getArchiveStatusTag = (st: ArchiveStatus) => {
    switch (st) {
      case "Active Storage":
        return <Tag color="success" icon={<HardDrive className="w-3 h-3 inline mr-1" />} className="font-bold">Active Storage</Tag>;
      case "Archived Cold Storage":
        return <Tag color="purple" icon={<Archive className="w-3 h-3 inline mr-1" />} className="font-bold">Archived Cold Storage</Tag>;
      case "Pending Archival":
        return <Tag color="warning" icon={<Clock className="w-3 h-3 inline mr-1" />} className="font-bold">Pending Archival</Tag>;
    }
  };

  const getPurgeEligibilityBadge = (p: PurgeEligibility) => {
    switch (p) {
      case "Statutory Override Locked":
        return <Tag color="volcano" icon={<Lock className="w-3 h-3 inline mr-1" />} className="font-bold">Statutory Override Locked</Tag>;
      case "Not Eligible (Retained)":
        return <Tag color="blue" className="font-bold">Not Eligible (Retained)</Tag>;
      case "Eligible for Legal Archival":
        return <Tag color="gold" className="font-bold">Eligible for Legal Archival</Tag>;
    }
  };

  const getComplianceStatusTag = (st: RetentionComplianceStatus) => {
    switch (st) {
      case "Healthy":
        return <Tag color="success" icon={<CheckCircle2 className="w-3 h-3 inline mr-1" />} className="font-bold">Healthy</Tag>;
      case "Warning":
        return <Tag color="warning" icon={<AlertTriangle className="w-3 h-3 inline mr-1" />} className="font-bold">Warning</Tag>;
      case "Critical":
        return <Tag color="error" icon={<XCircle className="w-3 h-3 inline mr-1" />} className="font-bold">Critical</Tag>;
    }
  };

  const columns = [
    {
      title: "Policy ID & Mandate",
      dataIndex: "policyId",
      key: "policyId",
      render: (id: string, record: RetentionPolicy) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded block w-fit">
            {id}
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block truncate max-w-xs">{record.statutoryMandate}</span>
        </div>
      ),
    },
    {
      title: "Record Type",
      dataIndex: "recordType",
      key: "recordType",
      render: (type: RetentionRecordType) => getRecordTypeTag(type),
    },
    {
      title: "Retention Period",
      dataIndex: "retentionPeriodYears",
      key: "retentionPeriodYears",
      render: (years: number) => (
        <span className="font-extrabold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          {years} Years
        </span>
      ),
    },
    {
      title: "Archive Status",
      dataIndex: "archiveStatus",
      key: "archiveStatus",
      render: (st: ArchiveStatus) => getArchiveStatusTag(st),
    },
    {
      title: "Purge Eligibility",
      dataIndex: "purgeEligibility",
      key: "purgeEligibility",
      render: (p: PurgeEligibility) => getPurgeEligibilityBadge(p),
    },
    {
      title: "Compliance Status",
      dataIndex: "complianceStatus",
      key: "complianceStatus",
      render: (st: RetentionComplianceStatus) => getComplianceStatusTag(st),
    },
    {
      title: "Storage Meter",
      key: "storage",
      render: (_: any, record: RetentionPolicy) => {
        const percent = Math.round((record.currentStorageGB / record.maxAllocatedGB) * 100);
        return (
          <div className="w-32 space-y-0.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span>{record.currentStorageGB} GB</span>
              <span className="font-bold">{percent}%</span>
            </div>
            <Progress
              percent={percent}
              strokeColor={percent > 85 ? "#f59e0b" : "#0d9488"}
              size="small"
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: RetentionPolicy) => (
        <div className="flex items-center gap-1.5">
          <Button size="small" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setInspectPolicy(record)}>
            Inspect
          </Button>

          {record.approachingThreshold && record.archiveStatus !== "Archived Cold Storage" && (
            <Button
              size="small"
              type="primary"
              className="bg-purple-600 hover:bg-purple-700"
              icon={<Archive className="w-3.5 h-3.5" />}
              onClick={() => handleTriggerColdArchival(record)}
            >
              Cold Archive
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card size="small" className="border-slate-200 bg-slate-50/50 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Managed Storage</span>
            <HardDrive className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.totalManagedStorageGB} GB</div>
          <span className="text-[10px] text-slate-400">Total Retained Healthcare Telemetry</span>
        </Card>

        <Card size="small" className="border-purple-200 bg-purple-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700">Active Policies</span>
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-900 mt-1">{metrics.activePoliciesCount}</div>
          <span className="text-[10px] text-purple-600 font-medium">Configured Data Lifecycle Rules</span>
        </Card>

        <Card size="small" className="border-amber-200 bg-amber-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Threshold Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">{metrics.approachingThresholdCount}</div>
          <span className="text-[10px] text-amber-600 font-medium">Impending Cold Archival Windows</span>
        </Card>

        <Card size="small" className="border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Statutory SLA</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">{metrics.statutoryComplianceRate}%</div>
          <span className="text-[10px] text-emerald-600 font-medium">NABH & NMC Statutory Alignment</span>
        </Card>
      </div>

      {/* Safety Non-Destructive Alert Banner */}
      <Alert
        type="info"
        showIcon
        icon={<ShieldCheck className="w-4 h-4 text-teal-600" />}
        message={<span className="font-bold text-xs text-slate-900">Non-Destructive Data Retention & Archival Policy</span>}
        description="Destructive hard-deletes are strictly disabled under healthcare regulatory mandates. Records past threshold are automatically migrated to encrypted cold storage or locked under Legal Hold."
        className="border-teal-200 bg-teal-50/60"
      />

      {/* Approaching Threshold Warnings Section */}
      {thresholdPolicies.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Retention Threshold & Storage Volume Warnings ({thresholdPolicies.length})
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {thresholdPolicies.map((p) => (
              <div key={p.policyId} className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    {getRecordTypeTag(p.recordType)}
                    <span className="font-mono text-[10px] text-slate-500">({p.policyId})</span>
                  </span>
                  <Tag color="volcano" className="font-bold text-[10px]">
                    {Math.round((p.currentStorageGB / p.maxAllocatedGB) * 100)}% Capacity
                  </Tag>
                </div>

                <p className="text-amber-900 font-medium italic">
                  "{p.warningMessage || "Storage approaching allocated quota limit."}"
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[11px]">
                  <span className="text-slate-600 font-mono">Mandate: {p.statutoryMandate.split("&")[0]}</span>
                  <Button size="small" type="primary" className="bg-amber-600 hover:bg-amber-700" onClick={() => handleTriggerColdArchival(p)}>
                    Archive Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Search Policy ID, Record Type, Mandate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 text-xs"
            allowClear
          />

          <Select
            value={selectedRecordType}
            onChange={(val) => setSelectedRecordType(val)}
            className="w-full sm:w-52 text-xs font-semibold"
            options={[
              { value: "ALL", label: "All Record Types" },
              { value: "Audit Logs", label: "Audit Logs" },
              { value: "Clinical Records", label: "Clinical Records" },
              { value: "Consent Records", label: "Consent Records" },
              { value: "Billing Records", label: "Billing Records" },
              { value: "Laboratory Reports", label: "Laboratory Reports" },
              { value: "Imaging Reports", label: "Imaging Reports" },
            ]}
          />

          <Select
            value={selectedComplianceStatus}
            onChange={(val) => setSelectedComplianceStatus(val)}
            className="w-full sm:w-40 text-xs font-semibold"
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "Healthy", label: "Healthy" },
              { value: "Warning", label: "Warning" },
              { value: "Critical", label: "Critical" },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={["Table Grid", "Policy Cards"]}
            value={viewMode}
            onChange={(val) => setViewMode(val as "Table Grid" | "Policy Cards")}
          />

          <Button icon={<Download className="w-4 h-4 text-teal-600" />} size="small" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button icon={<FileCode className="w-4 h-4 text-purple-600" />} size="small" onClick={handleExportJSON}>
            Export JSON
          </Button>
        </div>
      </div>

      {/* Main Workspace Render */}
      {viewMode === "Table Grid" ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <Table
            dataSource={policies}
            columns={columns}
            rowKey="policyId"
            pagination={{ pageSize: 6 }}
            size="small"
          />
        </div>
      ) : (
        /* Policy Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p) => {
            const percent = Math.round((p.currentStorageGB / p.maxAllocatedGB) * 100);

            return (
              <div key={p.policyId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {p.policyId}
                    </span>
                    {getRecordTypeTag(p.recordType)}
                  </div>
                  {getComplianceStatusTag(p.complianceStatus)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-semibold block">Retention Period:</span>
                    <span className="font-bold text-purple-700">{p.retentionPeriodYears} Years</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Archive Status:</span>
                    {getArchiveStatusTag(p.archiveStatus)}
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Purge Eligibility:</span>
                    {getPurgeEligibilityBadge(p.purgeEligibility)}
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Legal Hold Lock:</span>
                    <span className={`font-bold ${p.isLegalHoldLocked ? "text-rose-600" : "text-slate-600"}`}>
                      {p.isLegalHoldLocked ? "🔒 Locked" : "🔓 Open"}
                    </span>
                  </div>
                </div>

                {/* Storage Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Storage Capacity</span>
                    <span className="font-mono font-bold text-slate-800">{p.currentStorageGB} / {p.maxAllocatedGB} GB ({percent}%)</span>
                  </div>
                  <Progress percent={percent} strokeColor={percent > 85 ? "#f59e0b" : "#0d9488"} size="small" />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[240px]">
                    Schedule: {p.autoArchiveSchedule}
                  </span>
                  <Button size="small" type="link" onClick={() => setInspectPolicy(p)}>
                    Inspect Policy
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Policy Drawer */}
      {inspectPolicy && (
        <Drawer
          open={!!inspectPolicy}
          onClose={() => setInspectPolicy(null)}
          width={600}
          title={
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Database className="w-5 h-5 text-teal-600" />
              <span>Data Retention Policy Inspector: {inspectPolicy.policyId}</span>
            </div>
          }
        >
          <div className="space-y-4 my-2 text-xs">
            {/* Header Box */}
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                  {inspectPolicy.policyId}
                </span>
                {getComplianceStatusTag(inspectPolicy.complianceStatus)}
              </div>

              <h3 className="text-base font-bold text-white mt-1">{inspectPolicy.recordType}</h3>
              <p className="text-xs text-slate-400 font-mono">Mandate: {inspectPolicy.statutoryMandate}</p>
            </div>

            {/* Statutory Legal Mandate Clause */}
            <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 space-y-1">
              <span className="font-bold text-purple-900 block flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-purple-700" /> Statutory Retention Legal Mandate
              </span>
              <p className="text-purple-800 font-semibold">{inspectPolicy.statutoryMandate}</p>
            </div>

            {/* Policy Attributes */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold block">Retention Period:</span>
                <span className="font-bold text-slate-900 text-sm">{inspectPolicy.retentionPeriodYears} Years</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Archive Status:</span>
                {getArchiveStatusTag(inspectPolicy.archiveStatus)}
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Purge Eligibility:</span>
                {getPurgeEligibilityBadge(inspectPolicy.purgeEligibility)}
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Auto-Archive Schedule:</span>
                <span className="font-mono text-xs font-bold text-slate-800">{inspectPolicy.autoArchiveSchedule}</span>
              </div>
            </div>

            {/* Legal Hold Lock Controls */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Legal Hold Override Lock</span>
                <span className="text-[10px] text-slate-500">Locks data against archival or purging during ongoing litigation</span>
              </div>
              <Switch
                checked={inspectPolicy.isLegalHoldLocked}
                onChange={() => handleToggleLegalHold(inspectPolicy)}
              />
            </div>

            {/* Cold Archival Action Button */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Button
                type="primary"
                className="bg-purple-600 hover:bg-purple-700"
                icon={<Archive className="w-4 h-4" />}
                onClick={() => handleTriggerColdArchival(inspectPolicy)}
              >
                Trigger Cold Storage Migration
              </Button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
