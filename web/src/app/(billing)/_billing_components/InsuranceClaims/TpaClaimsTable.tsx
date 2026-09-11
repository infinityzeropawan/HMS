"use client";
import { EyeOutlined, FileAddOutlined } from "@ant-design/icons";
import { Button, Drawer, Space, Steps, Table, Tag, Timeline, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientName: string;
  uhid: string;
  insuranceProvider: string;
  providerType: "insurance_company" | "tpa" | "government_scheme";
  claimedAmount: number;
  approvedAmount: number | null;
  status: "draft" | "preauth_requested" | "preauth_approved" | "submitted" | "query_raised" | "settled" | "rejected";
  createdAt: string;
}

const MOCK_CLAIMS: InsuranceClaim[] = [
  { id: "c-1", claimNumber: "TPA-2024-0891", patientName: "Ramesh Kumar", uhid: "UHID-2024-001", insuranceProvider: "Star Health Insurance", providerType: "insurance_company", claimedAmount: 85000, approvedAmount: null, status: "query_raised", createdAt: "2026-09-05" },
  { id: "c-2", claimNumber: "TPA-2024-0892", patientName: "Priya Sharma", uhid: "UHID-2024-002", insuranceProvider: "Medi Assist TPA", providerType: "tpa", claimedAmount: 42000, approvedAmount: 40000, status: "preauth_approved", createdAt: "2026-09-06" },
  { id: "c-3", claimNumber: "AB-2024-0021", patientName: "Arjun Mehta", uhid: "UHID-2024-003", insuranceProvider: "Ayushman Bharat PMJAY", providerType: "government_scheme", claimedAmount: 30000, approvedAmount: 30000, status: "settled", createdAt: "2026-09-01" },
  { id: "c-4", claimNumber: "TPA-2024-0893", patientName: "Sunita Patel", uhid: "UHID-2024-004", insuranceProvider: "HDFC Ergo", providerType: "insurance_company", claimedAmount: 120000, approvedAmount: null, status: "preauth_requested", createdAt: "2026-09-08" },
  { id: "c-5", claimNumber: "TPA-2024-0890", patientName: "Deepak Singh", uhid: "UHID-2024-005", insuranceProvider: "New India Assurance", providerType: "insurance_company", claimedAmount: 55000, approvedAmount: 48000, status: "submitted", createdAt: "2026-09-03" },
];

const STATUS_COLOR: Record<InsuranceClaim["status"], string> = {
  draft: "default",
  preauth_requested: "processing",
  preauth_approved: "blue",
  submitted: "gold",
  query_raised: "warning",
  settled: "success",
  rejected: "error",
};

const STATUS_STEPS: InsuranceClaim["status"][] = [
  "draft", "preauth_requested", "preauth_approved", "submitted", "settled",
];

function ClaimDetailDrawer({ claim, onClose }: { claim: InsuranceClaim; onClose: () => void }) {
  const stepIdx = STATUS_STEPS.indexOf(claim.status);
  return (
    <Drawer
      id="claim-detail-drawer"
      open
      onClose={onClose}
      title={`Claim ${claim.claimNumber}`}
      width={480}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <div>
          <Typography.Text type="secondary">Patient</Typography.Text>
          <br />
          <Typography.Text strong>{claim.patientName}</Typography.Text>
          <Typography.Text type="secondary"> · {claim.uhid}</Typography.Text>
        </div>
        <div>
          <Typography.Text type="secondary">Insurer / TPA</Typography.Text>
          <br />
          <Typography.Text>{claim.insuranceProvider}</Typography.Text>
          <Tag style={{ marginLeft: 8 }}>{claim.providerType.replace("_", " ").toUpperCase()}</Tag>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          <div>
            <Typography.Text type="secondary">Claimed</Typography.Text>
            <br />
            <Typography.Text strong>₹{claim.claimedAmount.toLocaleString("en-IN")}</Typography.Text>
          </div>
          <div>
            <Typography.Text type="secondary">Approved</Typography.Text>
            <br />
            <Typography.Text strong>{claim.approvedAmount ? `₹${claim.approvedAmount.toLocaleString("en-IN")}` : "—"}</Typography.Text>
          </div>
        </div>
        <div>
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 12 }}>Claim Workflow</Typography.Text>
          <Steps
            current={stepIdx === -1 ? 4 : stepIdx}
            status={claim.status === "rejected" ? "error" : claim.status === "query_raised" ? "wait" : "process"}
            size="small"
            direction="vertical"
            items={STATUS_STEPS.map((s) => ({
              title: s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            }))}
          />
        </div>
        <div>
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>Documents</Typography.Text>
          <Timeline
            items={[
              { children: "Discharge Summary uploaded" },
              { children: "Lab Reports attached" },
              { children: "Pre-auth form submitted to insurer" },
            ]}
          />
        </div>
        <Button
          id="upload-claim-doc-btn"
          icon={<FileAddOutlined />}
          type="dashed"
          block
        >
          Upload Document
        </Button>
      </Space>
    </Drawer>
  );
}

function getColumns(): ColumnsType<InsuranceClaim> {
  return [
    { title: "Claim No.", dataIndex: "claimNumber", key: "claimNumber", render: (v) => <Typography.Text code>{v}</Typography.Text> },
    { title: "Patient", key: "patient", render: (_, r) => (<div><Typography.Text strong>{r.patientName}</Typography.Text><br /><Typography.Text type="secondary" style={{ fontSize: 12 }}>{r.uhid}</Typography.Text></div>) },
    { title: "Insurer / TPA", dataIndex: "insuranceProvider", key: "insuranceProvider" },
    { title: "Claimed (₹)", dataIndex: "claimedAmount", key: "claimedAmount", render: (v) => `₹${v.toLocaleString("en-IN")}`, sorter: (a, b) => a.claimedAmount - b.claimedAmount },
    { title: "Approved (₹)", dataIndex: "approvedAmount", key: "approvedAmount", render: (v) => v ? `₹${v.toLocaleString("en-IN")}` : <Typography.Text type="secondary">—</Typography.Text> },
    { title: "Status", dataIndex: "status", key: "status", render: (v) => <Tag color={STATUS_COLOR[v as InsuranceClaim["status"]]}>{v.replace(/_/g, " ").toUpperCase()}</Tag>, filters: Object.keys(STATUS_COLOR).map((k) => ({ text: k, value: k })), onFilter: (val, rec) => rec.status === val },
    { title: "Date", dataIndex: "createdAt", key: "createdAt" },
  ];
}

export function TpaClaimsTable() {
  const [selected, setSelected] = useState<InsuranceClaim | null>(null);
  const cols: ColumnsType<InsuranceClaim> = [...getColumns(), {
    title: "Actions",
    key: "actions",
    render: (_, rec) => (
      <Button id={`claim-view-${rec.id}`} icon={<EyeOutlined />} size="small" type="text" onClick={() => setSelected(rec)}>
        View
      </Button>
    ),
  }];
  return (
    <>
      <Table<InsuranceClaim> id="tpa-claims-table" rowKey="id" columns={cols} dataSource={MOCK_CLAIMS} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
      {selected && <ClaimDetailDrawer claim={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
