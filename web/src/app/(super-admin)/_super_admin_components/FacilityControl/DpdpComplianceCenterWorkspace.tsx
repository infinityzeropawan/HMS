"use client";

import React, { useState } from "react";
import { Table, Tag, Input, Select, Segmented, Modal, Card, Button, Tooltip, message, Alert, Drawer, Badge } from "antd";
import {
  FileCheck,
  Search,
  Download,
  FileCode,
  Lock,
  Clock,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  SlidersHorizontal,
  ArrowRight,
  FileText,
  Activity,
  Sparkles,
  Building2,
} from "lucide-react";
import { DpdpPrincipalRequest, DpdpRequestType, DpdpWorkflowState } from "../../_super_admin_types/dpdp_center_types";
import { DpdpCenterService } from "../../_super_admin_services/dpdp_center_service";

interface DpdpComplianceCenterWorkspaceProps {
  tenantId: string;
}

export const DpdpComplianceCenterWorkspace: React.FC<DpdpComplianceCenterWorkspaceProps> = ({ tenantId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<DpdpRequestType | "ALL">("ALL");
  const [selectedState, setSelectedState] = useState<DpdpWorkflowState | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"Table Grid" | "Workflow Timeline">("Table Grid");

  // Selected for drawer/modal
  const [inspectRequest, setInspectRequest] = useState<DpdpPrincipalRequest | null>(null);
  const [updateStateModalRequest, setUpdateStateModalRequest] = useState<DpdpPrincipalRequest | null>(null);
  const [targetWorkflowState, setTargetWorkflowState] = useState<DpdpWorkflowState>("Under Review");
  const [dpoNotes, setDpoNotes] = useState("");

  const requests = DpdpCenterService.getRequests({
    tenantId: tenantId === "ALL" ? undefined : tenantId,
    requestType: selectedType,
    workflowState: selectedState,
    searchTerm,
  });

  const metrics = DpdpCenterService.getMetrics(tenantId);

  const handleAdvanceWorkflow = () => {
    if (!updateStateModalRequest) return;

    try {
      DpdpCenterService.updateRequestWorkflowState(
        updateStateModalRequest.requestId,
        targetWorkflowState,
        "Adv. Meenakshi Sundaram (DPO)",
        dpoNotes
      );
      message.success(`Request ${updateStateModalRequest.requestId} moved to state "${targetWorkflowState}"!`);
      setUpdateStateModalRequest(null);
      setDpoNotes("");
    } catch (err: any) {
      message.error(err.message || "Failed to update workflow state.");
    }
  };

  const handleExportCSV = () => {
    const csvContent = DpdpCenterService.exportCSV(tenantId);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dpdp_compliance_center_${tenantId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("DPDP Compliance Center CSV exported successfully!");
  };

  const handleExportJSON = () => {
    const jsonContent = DpdpCenterService.exportJSON(tenantId);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dpdp_compliance_center_${tenantId}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("DPDP Compliance Center JSON exported successfully!");
  };

  const getWorkflowStateBadge = (state: DpdpWorkflowState) => {
    switch (state) {
      case "Submitted":
        return <Tag color="blue" icon={<Clock className="w-3 h-3 inline mr-1" />} className="font-bold">Submitted</Tag>;
      case "Under Review":
        return <Tag color="purple" icon={<SlidersHorizontal className="w-3 h-3 inline mr-1" />} className="font-bold">Under Review</Tag>;
      case "Approved":
        return <Tag color="emerald" icon={<CheckCircle2 className="w-3 h-3 inline mr-1" />} className="font-bold">Approved</Tag>;
      case "Rejected":
        return <Tag color="rose" icon={<XCircle className="w-3 h-3 inline mr-1" />} className="font-bold">Rejected</Tag>;
      case "Completed":
        return <Tag color="green" icon={<CheckCircle2 className="w-3 h-3 inline mr-1" />} className="font-bold">Completed</Tag>;
    }
  };

  const getRequestTypeTag = (type: DpdpRequestType) => {
    switch (type) {
      case "Data Access Request":
        return <Tag color="geekblue" className="font-bold">Data Access</Tag>;
      case "Data Correction Request":
        return <Tag color="cyan" className="font-bold">Data Correction</Tag>;
      case "Data Export Request":
        return <Tag color="purple" className="font-bold">Data Export</Tag>;
      case "Data Deletion Request":
        return <Tag color="volcano" className="font-bold">Data Deletion</Tag>;
      case "Consent Withdrawal Request":
        return <Tag color="magenta" className="font-bold">Consent Withdrawal</Tag>;
    }
  };

  const columns = [
    {
      title: "Request ID & Clause",
      dataIndex: "requestId",
      key: "requestId",
      render: (id: string, record: DpdpPrincipalRequest) => (
        <div>
          <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 block w-fit">
            {id}
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block truncate max-w-xs">{record.statutoryClause}</span>
        </div>
      ),
    },
    {
      title: "Data Principal",
      dataIndex: "dataPrincipalName",
      key: "dataPrincipalName",
      render: (name: string, record: DpdpPrincipalRequest) => (
        <div>
          <span className="font-bold text-xs text-slate-900 block">{name}</span>
          <span className="text-[10px] text-slate-500 block">{record.dataPrincipalEmail}</span>
          <Tag color="default" className="text-[9px] font-mono mt-0.5">{record.dataPrincipalCategory}</Tag>
        </div>
      ),
    },
    {
      title: "Request Type",
      dataIndex: "requestType",
      key: "requestType",
      render: (type: DpdpRequestType) => getRequestTypeTag(type),
    },
    {
      title: "Workflow State",
      dataIndex: "workflowState",
      key: "workflowState",
      render: (state: DpdpWorkflowState) => getWorkflowStateBadge(state),
    },
    {
      title: "Submitted Date",
      dataIndex: "submittedDate",
      key: "submittedDate",
      render: (d: string) => <span className="text-xs text-slate-600">{d}</span>,
    },
    {
      title: "SLA Due Date",
      dataIndex: "slaDueDate",
      key: "slaDueDate",
      render: (d: string) => <span className="text-xs font-bold text-slate-800">{d}</span>,
    },
    {
      title: "Processing Time",
      dataIndex: "processingTimeDays",
      key: "processingTimeDays",
      render: (days: number | undefined) => (
        <span className="font-mono text-xs font-semibold text-teal-700">
          {days !== undefined ? `${days} Days` : "In Progress"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: DpdpPrincipalRequest) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="small"
            icon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => setInspectRequest(record)}
          >
            Inspect
          </Button>

          {record.workflowState !== "Completed" && record.workflowState !== "Rejected" && (
            <Button
              size="small"
              type="primary"
              className="bg-purple-600 hover:bg-purple-700"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => {
                setUpdateStateModalRequest(record);
                setTargetWorkflowState(record.workflowState === "Submitted" ? "Under Review" : "Approved");
              }}
            >
              Advance State
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
        {/* Metric 1: Request Count */}
        <Card size="small" className="border-slate-200 bg-slate-50/50 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Request Count</span>
            <FileCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.totalRequestCount}</div>
          <span className="text-[10px] text-slate-400">Total Statutory Data Principal Filings</span>
        </Card>

        {/* Metric 2: SLA Status */}
        <Card size="small" className="border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">SLA Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">{metrics.slaComplianceRate}%</div>
          <span className="text-[10px] text-emerald-600 font-medium">On-Time Statutory 7-Day Fulfillment</span>
        </Card>

        {/* Metric 3: Processing Time */}
        <Card size="small" className="border-sky-200 bg-sky-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700">Processing Time</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-900 mt-1">{metrics.avgProcessingTimeDays} Days</div>
          <span className="text-[10px] text-sky-600 font-medium">Average Request Resolution Speed</span>
        </Card>

        {/* Metric 4: Open Requests */}
        <Card size="small" className="border-amber-200 bg-amber-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Open Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">{metrics.openRequestsCount}</div>
          <span className="text-[10px] text-amber-600 font-medium">Submitted & Under Review</span>
        </Card>
      </div>

      {/* Workflow State Distribution Bar */}
      <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <SlidersHorizontal className="w-4 h-4" /> Workflow State Distribution
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <Badge count={metrics.stateCounts.Submitted} overflowCount={99} color="blue">
            <Tag color="blue" className="!mr-0 font-semibold">Submitted</Tag>
          </Badge>
          <Badge count={metrics.stateCounts["Under Review"]} overflowCount={99} color="purple">
            <Tag color="purple" className="!mr-0 font-semibold">Under Review</Tag>
          </Badge>
          <Badge count={metrics.stateCounts.Approved} overflowCount={99} color="emerald">
            <Tag color="emerald" className="!mr-0 font-semibold">Approved</Tag>
          </Badge>
          <Badge count={metrics.stateCounts.Rejected} overflowCount={99} color="red">
            <Tag color="red" className="!mr-0 font-semibold">Rejected</Tag>
          </Badge>
          <Badge count={metrics.stateCounts.Completed} overflowCount={99} color="green">
            <Tag color="green" className="!mr-0 font-semibold">Completed</Tag>
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Search Request ID, Principal Name, Email..."
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
              { value: "ALL", label: "All Request Types" },
              { value: "Data Access Request", label: "Data Access Request" },
              { value: "Data Correction Request", label: "Data Correction Request" },
              { value: "Data Export Request", label: "Data Export Request" },
              { value: "Data Deletion Request", label: "Data Deletion Request" },
              { value: "Consent Withdrawal Request", label: "Consent Withdrawal Request" },
            ]}
          />

          <Select
            value={selectedState}
            onChange={(val) => setSelectedState(val)}
            className="w-full sm:w-44 text-xs font-semibold"
            options={[
              { value: "ALL", label: "All Workflow States" },
              { value: "Submitted", label: "Submitted" },
              { value: "Under Review", label: "Under Review" },
              { value: "Approved", label: "Approved" },
              { value: "Rejected", label: "Rejected" },
              { value: "Completed", label: "Completed" },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={["Table Grid", "Workflow Timeline"]}
            value={viewMode}
            onChange={(val) => setViewMode(val as "Table Grid" | "Workflow Timeline")}
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
            dataSource={requests}
            columns={columns}
            rowKey="requestId"
            pagination={{ pageSize: 6 }}
            size="small"
          />
        </div>
      ) : (
        /* Workflow Timeline View */
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.requestId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {r.requestId}
                  </span>
                  {getRequestTypeTag(r.requestType)}
                  {getWorkflowStateBadge(r.workflowState)}
                  <span className="text-xs font-bold text-slate-900">{r.dataPrincipalName} ({r.dataPrincipalEmail})</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  SLA Due: {r.slaDueDate}
                </div>
              </div>

              {/* Summary */}
              <div className="text-xs">
                <span className="font-semibold text-slate-700 block">Data Principal Filing Summary:</span>
                <p className="text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100 mt-0.5">
                  "{r.requestSummary}"
                </p>
              </div>

              {/* History Timeline Steps */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  State Transition History ({r.history.length} Steps)
                </span>

                <div className="space-y-1 pl-3 border-l-2 border-purple-200">
                  {r.history.map((h, idx) => (
                    <div key={idx} className="text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">State: {h.state}</span>{" "}
                        <span className="text-slate-400 font-mono text-[10px]">({h.timestamp})</span> —{" "}
                        <span className="text-slate-600 italic">Actor: {h.actor}</span>
                        {h.notes && <div className="text-purple-700 font-medium text-[11px]">{h.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400">
                  Statutory Reference: {r.statutoryClause}
                </span>

                <Button size="small" type="link" onClick={() => setInspectRequest(r)}>
                  Inspect Request
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Request Drawer */}
      {inspectRequest && (
        <Drawer
          open={!!inspectRequest}
          onClose={() => setInspectRequest(null)}
          width={600}
          title={
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <FileCheck className="w-5 h-5 text-purple-600" />
              <span>DPDP Principal Request Inspector: {inspectRequest.requestId}</span>
            </div>
          }
        >
          <div className="space-y-4 my-2 text-xs">
            {/* Header Box */}
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                  {inspectRequest.requestId}
                </span>
                {getWorkflowStateBadge(inspectRequest.workflowState)}
              </div>

              <h3 className="text-base font-bold text-white mt-1">{inspectRequest.dataPrincipalName}</h3>
              <p className="text-xs text-slate-400 font-mono">
                {inspectRequest.dataPrincipalEmail} • {inspectRequest.dataPrincipalPhone}
              </p>
            </div>

            {/* Statutory Reference */}
            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 space-y-1">
              <span className="font-bold text-purple-900 block">India DPDP Act 2023 Statutory Provision:</span>
              <span className="text-purple-800 font-mono text-xs">{inspectRequest.statutoryClause}</span>
            </div>

            {/* Filing Details */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold block">Submitted Date:</span>
                <span className="font-bold text-slate-800">{inspectRequest.submittedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">SLA Due Date:</span>
                <span className="font-bold text-slate-800">{inspectRequest.slaDueDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Assigned DPO:</span>
                <span className="font-bold text-slate-800">{inspectRequest.assignedDpo}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Processing Time:</span>
                <span className="font-bold text-teal-700">
                  {inspectRequest.processingTimeDays !== undefined ? `${inspectRequest.processingTimeDays} Days` : "Active / In-Progress"}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">Request Summary & Details:</span>
              <p className="text-slate-600 italic">"{inspectRequest.requestSummary}"</p>
            </div>

            {/* DPO Resolution Notes if available */}
            {inspectRequest.dpoResolutionNotes && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-900 block">DPO Resolution & Audit Sign-Off Notes:</span>
                <p className="text-emerald-800 font-medium">"{inspectRequest.dpoResolutionNotes}"</p>
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* DPO Advance Workflow State Modal */}
      {updateStateModalRequest && (
        <Modal
          open={!!updateStateModalRequest}
          onCancel={() => setUpdateStateModalRequest(null)}
          title={
            <div className="flex items-center gap-2 text-purple-900 font-bold text-base">
              <SlidersHorizontal className="w-5 h-5 text-purple-600" />
              <span>Advance Workflow State: {updateStateModalRequest.requestId}</span>
            </div>
          }
          onOk={handleAdvanceWorkflow}
          okText="Update Workflow State"
          okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700" }}
        >
          <div className="space-y-3 my-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Workflow State *:</label>
              <Select
                value={targetWorkflowState}
                onChange={(val) => setTargetWorkflowState(val)}
                className="w-full font-bold"
                options={[
                  { value: "Submitted", label: "Submitted" },
                  { value: "Under Review", label: "Under Review" },
                  { value: "Approved", label: "Approved" },
                  { value: "Rejected", label: "Rejected" },
                  { value: "Completed", label: "Completed" },
                ]}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">DPO Resolution & Audit Justification Notes *:</label>
              <Input.TextArea
                rows={3}
                value={dpoNotes}
                onChange={(e) => setDpoNotes(e.target.value)}
                placeholder="Enter DPO findings, statutory verification details or fulfillment notes..."
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
