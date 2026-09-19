"use client";

import React, { useState } from "react";
import { Table, Tag, Input, Select, Segmented, Modal, Card, Button, Tooltip, message, Alert, Drawer, Badge } from "antd";
import {
  UserCheck,
  Search,
  Download,
  FileCode,
  Lock,
  Clock,
  Key,
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  RotateCcw,
  FileText,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { ConsentArtifact, ConsentType, ConsentStatus } from "../../_super_admin_types/consent_types";
import { ConsentRegistryService } from "../../_super_admin_services/consent_registry_service";

interface ConsentRegistryWorkspaceProps {
  tenantId: string;
}

export const ConsentRegistryWorkspace: React.FC<ConsentRegistryWorkspaceProps> = ({ tenantId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ConsentType | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<ConsentStatus | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"Table Grid" | "Lifecycle Timeline">("Table Grid");

  // Selected for drawer/modal
  const [inspectArtifact, setInspectArtifact] = useState<ConsentArtifact | null>(null);
  const [revokeModalArtifact, setRevokeModalArtifact] = useState<ConsentArtifact | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const artifacts = ConsentRegistryService.getConsents({
    tenantId: tenantId === "ALL" ? undefined : tenantId,
    consentType: selectedType,
    status: selectedStatus,
    searchTerm,
  });

  const activeCount = artifacts.filter((a) => a.status === "Active").length;
  const pendingCount = artifacts.filter((a) => a.status === "Pending").length;
  const revokedCount = artifacts.filter((a) => a.status === "Revoked").length;
  const expiredCount = artifacts.filter((a) => a.status === "Expired").length;

  const handleRevokeConsent = () => {
    if (!revokeModalArtifact) return;
    if (!revokeReason.trim()) {
      message.error("Revocation reason is required!");
      return;
    }

    try {
      ConsentRegistryService.revokeConsent(
        revokeModalArtifact.consentId,
        revokeReason,
        "Hospital SuperAdmin Desk"
      );
      message.success(`Consent ${revokeModalArtifact.consentId} revoked successfully!`);
      setRevokeModalArtifact(null);
      setRevokeReason("");
    } catch (err: any) {
      message.error(err.message || "Failed to revoke consent.");
    }
  };

  const handleExportCSV = () => {
    const csvContent = ConsentRegistryService.exportCSV(tenantId);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `consent_registry_${tenantId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Consent Registry CSV exported successfully!");
  };

  const handleExportJSON = () => {
    const jsonContent = ConsentRegistryService.exportJSON(tenantId);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `consent_registry_${tenantId}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Consent Registry JSON exported successfully!");
  };

  const getConsentTypeTag = (type: ConsentType) => {
    switch (type) {
      case "Treatment Consent":
        return <Tag color="blue" className="font-bold">Treatment Consent</Tag>;
      case "ABDM Consent":
        return <Tag color="cyan" className="font-bold">ABDM Consent</Tag>;
      case "Telemedicine Consent":
        return <Tag color="purple" className="font-bold">Telemedicine Consent</Tag>;
      case "Data Sharing Consent":
        return <Tag color="geekblue" className="font-bold">Data Sharing Consent</Tag>;
      case "Research Consent":
        return <Tag color="magenta" className="font-bold">Research Consent</Tag>;
    }
  };

  const getStatusTag = (status: ConsentStatus) => {
    switch (status) {
      case "Active":
        return <Tag color="success" icon={<CheckCircle2 className="w-3 h-3 inline mr-1" />} className="font-bold">Active</Tag>;
      case "Pending":
        return <Tag color="warning" icon={<Clock className="w-3 h-3 inline mr-1" />} className="font-bold">Pending Verification</Tag>;
      case "Expired":
        return <Tag color="gold" icon={<AlertTriangle className="w-3 h-3 inline mr-1" />} className="font-bold">Expired</Tag>;
      case "Revoked":
        return <Tag color="error" icon={<XCircle className="w-3 h-3 inline mr-1" />} className="font-bold">Revoked</Tag>;
    }
  };

  const columns = [
    {
      title: "Consent ID & Version",
      dataIndex: "consentId",
      key: "consentId",
      render: (id: string, record: ConsentArtifact) => (
        <div>
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 block w-fit">
            {id}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Ver: {record.version}</span>
        </div>
      ),
    },
    {
      title: "Patient & ABHA ID",
      dataIndex: "patientName",
      key: "patientName",
      render: (name: string, record: ConsentArtifact) => (
        <div>
          <span className="font-bold text-xs text-slate-900 block">{name}</span>
          <span className="font-mono text-[10px] text-slate-500 block">{record.patientId}</span>
          {record.abhaAddress && (
            <span className="font-mono text-[9px] text-teal-600 block">{record.abhaAddress}</span>
          )}
        </div>
      ),
    },
    {
      title: "Consent Type",
      dataIndex: "consentType",
      key: "consentType",
      render: (type: ConsentType) => getConsentTypeTag(type),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (st: ConsentStatus) => getStatusTag(st),
    },
    {
      title: "Signed Date",
      dataIndex: "signedDate",
      key: "signedDate",
      render: (d: string) => <span className="text-xs text-slate-600">{d}</span>,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (d: string) => <span className="text-xs font-bold text-slate-800">{d}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ConsentArtifact) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="small"
            icon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => setInspectArtifact(record)}
          >
            Inspect
          </Button>

          {record.status === "Active" && (
            <Button
              size="small"
              danger
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => setRevokeModalArtifact(record)}
            >
              Revoke
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card size="small" className="border-slate-200 bg-slate-50/50 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Consents</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{artifacts.length}</div>
          <span className="text-[10px] text-slate-400">Registered Artifacts</span>
        </Card>

        <Card size="small" className="border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Active Consents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">{activeCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Valid & Enforced</span>
        </Card>

        <Card size="small" className="border-amber-200 bg-amber-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">{pendingCount}</div>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting Patient OTP</span>
        </Card>

        <Card size="small" className="border-rose-200 bg-rose-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Revoked / Expired</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-900 mt-1">{revokedCount + expiredCount}</div>
          <span className="text-[10px] text-rose-600 font-medium">
            {revokedCount} Revoked • {expiredCount} Expired
          </span>
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Search Consent ID, Patient Name, ABHA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 text-xs"
            allowClear
          />

          <Select
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
            className="w-full sm:w-52 text-xs font-semibold"
            options={[
              { value: "ALL", label: "All Consent Types" },
              { value: "Treatment Consent", label: "Treatment Consent" },
              { value: "ABDM Consent", label: "ABDM Consent" },
              { value: "Telemedicine Consent", label: "Telemedicine Consent" },
              { value: "Data Sharing Consent", label: "Data Sharing Consent" },
              { value: "Research Consent", label: "Research Consent" },
            ]}
          />

          <Select
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            className="w-full sm:w-40 text-xs font-semibold"
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "Active", label: "Active" },
              { value: "Pending", label: "Pending" },
              { value: "Expired", label: "Expired" },
              { value: "Revoked", label: "Revoked" },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={["Table Grid", "Lifecycle Timeline"]}
            value={viewMode}
            onChange={(val) => setViewMode(val as "Table Grid" | "Lifecycle Timeline")}
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
            dataSource={artifacts}
            columns={columns}
            rowKey="consentId"
            pagination={{ pageSize: 6 }}
            size="small"
          />
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          {artifacts.map((c) => (
            <div key={c.consentId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {c.consentId}
                  </span>
                  {getConsentTypeTag(c.consentType)}
                  {getStatusTag(c.status)}
                  <span className="text-xs font-bold text-slate-900">{c.patientName} ({c.patientId})</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  Signed: {c.signedDate}
                </div>
              </div>

              {/* Purpose */}
              <div className="text-xs">
                <span className="font-semibold text-slate-700 block">Consent Purpose & Scope:</span>
                <p className="text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100 mt-0.5">
                  "{c.purpose}"
                </p>
              </div>

              {/* Lifecycle Timeline Steps */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Lifecycle Timeline Events
                </span>

                <div className="space-y-1 pl-3 border-l-2 border-slate-200">
                  {c.timelineEvents.map((evt) => (
                    <div key={evt.eventId} className="text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">{evt.event}</span>{" "}
                        <span className="text-slate-400 font-mono text-[10px]">({evt.timestamp})</span> —{" "}
                        <span className="text-slate-600 italic">Actor: {evt.actor}</span>
                        {evt.notes && <div className="text-rose-600 font-medium text-[11px]">{evt.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400">
                  PKI Signature: {c.digitalSignature}
                </span>

                <Button size="small" type="link" onClick={() => setInspectArtifact(c)}>
                  Inspect Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Consent Drawer */}
      {inspectArtifact && (
        <Drawer
          open={!!inspectArtifact}
          onClose={() => setInspectArtifact(null)}
          width={600}
          title={
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <UserCheck className="w-5 h-5 text-teal-600" />
              <span>Consent Artifact Inspector: {inspectArtifact.consentId}</span>
            </div>
          }
        >
          <div className="space-y-4 my-2 text-xs">
            {/* Header Box */}
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                  {inspectArtifact.consentId}
                </span>
                {getStatusTag(inspectArtifact.status)}
              </div>

              <h3 className="text-base font-bold text-white mt-1">{inspectArtifact.patientName}</h3>
              <p className="text-xs text-slate-400 font-mono">Patient ID: {inspectArtifact.patientId}</p>

              {inspectArtifact.abhaAddress && (
                <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>ABHA Address: <strong className="text-teal-300">{inspectArtifact.abhaAddress}</strong></span>
                </div>
              )}
            </div>

            {/* Purpose */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Purpose & Access Authorization:</span>
              <p className="text-slate-600 italic">"{inspectArtifact.purpose}"</p>
            </div>

            {/* Allowed HIPs / HIUs */}
            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div>
                <span className="font-semibold text-slate-500 block mb-1">Allowed HIPs (Providers):</span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-800">
                  {inspectArtifact.allowedHIPs.map((hip) => (
                    <li key={hip}>{hip}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block mb-1">Allowed HIUs (Users):</span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-800">
                  {inspectArtifact.allowedHIUs.map((hiu) => (
                    <li key={hiu}>{hiu}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Revocation Details if Revoked */}
            {inspectArtifact.status === "Revoked" && (
              <Alert
                type="error"
                showIcon
                icon={<XCircle className="w-4 h-4 text-rose-600" />}
                message={<span className="font-bold text-xs text-rose-900">Consent Revoked</span>}
                description={
                  <div>
                    <div><strong>Revocation Date:</strong> {inspectArtifact.revocationDate}</div>
                    <div><strong>Revoked By:</strong> {inspectArtifact.revokedBy}</div>
                    <div><strong>Reason:</strong> "{inspectArtifact.revocationReason}"</div>
                  </div>
                }
              />
            )}

            {/* PKI Signature Hash */}
            <div className="bg-slate-900 text-slate-300 p-3 rounded-xl font-mono text-[11px] space-y-1">
              <span className="text-teal-400 font-bold block">Digital Signature (SHA-256 PKI Hash):</span>
              <span className="break-all">{inspectArtifact.digitalSignature}</span>
            </div>
          </div>
        </Drawer>
      )}

      {/* Revoke Consent Modal */}
      {revokeModalArtifact && (
        <Modal
          open={!!revokeModalArtifact}
          onCancel={() => setRevokeModalArtifact(null)}
          title={
            <div className="flex items-center gap-2 text-rose-900 font-bold text-base">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>Revoke Consent Artifact: {revokeModalArtifact.consentId}</span>
            </div>
          }
          onOk={handleRevokeConsent}
          okText="Revoke Consent"
          okButtonProps={{ danger: true }}
        >
          <div className="space-y-3 my-3 text-xs">
            <Alert
              type="warning"
              showIcon
              message="Immediate Revocation Warning"
              description={`Revoking consent will instantly block all health data exchanges and EHR sharing for ${revokeModalArtifact.patientName}.`}
            />

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mandatory Revocation Reason *:</label>
              <Input.TextArea
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Specify clinical or patient-requested revocation reason..."
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
