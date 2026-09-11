"use client";
import { SearchOutlined } from "@ant-design/icons";
import { Input, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

interface DrugMaster {
  id: string;
  drugCode: string;
  genericName: string;
  brandName: string;
  composition: string;
  scheduleClass: string;
  isControlled: boolean;
  hsnCode: string;
  gstRate: number;
  cdscoApproved: boolean;
}

interface Icd10Entry {
  id: string;
  code: string;
  description: string;
}

interface TerminologyEntry {
  id: string;
  code: string;
  description: string;
}

const MOCK_DRUGS: DrugMaster[] = [
  { id: "d-1", drugCode: "MET-500", genericName: "Metformin Hydrochloride", brandName: "Glycomet", composition: "Metformin HCl 500mg", scheduleClass: "H", isControlled: false, hsnCode: "30042019", gstRate: 5, cdscoApproved: true },
  { id: "d-2", drugCode: "AMX-500", genericName: "Amoxicillin", brandName: "Mox", composition: "Amoxicillin 500mg", scheduleClass: "H", isControlled: false, hsnCode: "30041090", gstRate: 5, cdscoApproved: true },
  { id: "d-3", drugCode: "ALP-0.5", genericName: "Alprazolam", brandName: "Alprax", composition: "Alprazolam 0.5mg", scheduleClass: "H1", isControlled: true, hsnCode: "30049099", gstRate: 12, cdscoApproved: true },
  { id: "d-4", drugCode: "ATR-10", genericName: "Atorvastatin", brandName: "Lipitor", composition: "Atorvastatin Calcium 10mg", scheduleClass: "H", isControlled: false, hsnCode: "30042019", gstRate: 12, cdscoApproved: true },
  { id: "d-5", drugCode: "INS-REG", genericName: "Insulin Regular", brandName: "Actrapid", composition: "Human Insulin 100IU/ml", scheduleClass: "H", isControlled: false, hsnCode: "30043900", gstRate: 5, cdscoApproved: true },
  { id: "d-6", drugCode: "MOR-10", genericName: "Morphine Sulphate", brandName: "MS Contin", composition: "Morphine Sulphate 10mg", scheduleClass: "X", isControlled: true, hsnCode: "30049099", gstRate: 12, cdscoApproved: true },
  { id: "d-7", drugCode: "PCM-500", genericName: "Paracetamol", brandName: "Crocin", composition: "Paracetamol 500mg", scheduleClass: "OTC", isControlled: false, hsnCode: "30049099", gstRate: 0, cdscoApproved: true },
];

const MOCK_ICD10: Icd10Entry[] = [
  { id: "icd-1", code: "E11", description: "Type 2 diabetes mellitus" },
  { id: "icd-2", code: "I10", description: "Essential (primary) hypertension" },
  { id: "icd-3", code: "J18.9", description: "Pneumonia, unspecified organism" },
  { id: "icd-4", code: "K92.1", description: "Melaena" },
  { id: "icd-5", code: "N39.0", description: "Urinary tract infection, site not specified" },
  { id: "icd-6", code: "I21.9", description: "Acute myocardial infarction, unspecified" },
  { id: "icd-7", code: "J45.9", description: "Asthma, unspecified" },
  { id: "icd-8", code: "M54.5", description: "Low back pain" },
  { id: "icd-9", code: "F32.1", description: "Moderate depressive episode" },
  { id: "icd-10", code: "A09", description: "Other and unspecified gastroenteritis and colitis" },
];

function getDrugCols(): ColumnsType<DrugMaster> {
  return [
    { title: "Code", dataIndex: "drugCode", key: "drugCode", width: 100, render: (v) => <Typography.Text code>{v}</Typography.Text> },
    { title: "Generic Name", dataIndex: "genericName", key: "genericName", render: (v) => <Typography.Text strong>{v}</Typography.Text> },
    { title: "Brand Name", dataIndex: "brandName", key: "brandName" },
    { title: "Composition", dataIndex: "composition", key: "composition", render: (v) => <Typography.Text type="secondary">{v}</Typography.Text> },
    {
      title: "Schedule",
      dataIndex: "scheduleClass",
      key: "scheduleClass",
      render: (v, rec) => (
        <Space>
          <Tag color={rec.isControlled ? "error" : v === "OTC" ? "success" : "warning"}>{v}</Tag>
          {rec.isControlled && <Tag color="error" style={{ fontSize: 10 }}>CONTROLLED</Tag>}
        </Space>
      ),
    },
    { title: "HSN Code", dataIndex: "hsnCode", key: "hsnCode", render: (v) => <Typography.Text code>{v}</Typography.Text> },
    { title: "GST %", dataIndex: "gstRate", key: "gstRate", render: (v) => `${v}%` },
    { title: "CDSCO", dataIndex: "cdscoApproved", key: "cdscoApproved", render: (v) => v ? <Tag color="success">Approved</Tag> : <Tag color="error">Pending</Tag> },
  ];
}

function getIcd10Cols(): ColumnsType<Icd10Entry> {
  return [
    { title: "ICD-10 Code", dataIndex: "code", key: "code", width: 130, render: (v) => <Typography.Text code strong>{v}</Typography.Text> },
    { title: "Description", dataIndex: "description", key: "description" },
  ];
}

export function DrugMasterTable() {
  const [search, setSearch] = useState("");
  const data = MOCK_DRUGS.filter(
    (d) =>
      d.genericName.toLowerCase().includes(search.toLowerCase()) ||
      d.brandName.toLowerCase().includes(search.toLowerCase()) ||
      d.drugCode.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Input
        id="drug-master-search"
        prefix={<SearchOutlined />}
        placeholder="Search by generic name, brand or code…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ maxWidth: 380 }}
      />
      <Table<DrugMaster>
        id="drug-master-table"
        rowKey="id"
        columns={getDrugCols()}
        dataSource={data}
        pagination={{ pageSize: 15 }}
        scroll={{ x: 900 }}
      />
    </Space>
  );
}

export function Icd10BrowserTable() {
  const [search, setSearch] = useState("");
  const data = MOCK_ICD10.filter(
    (d) =>
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Input
        id="icd10-search"
        prefix={<SearchOutlined />}
        placeholder="Search by ICD-10 code or diagnosis description…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ maxWidth: 420 }}
      />
      <Table<Icd10Entry>
        id="icd10-browser-table"
        rowKey="id"
        columns={getIcd10Cols()}
        dataSource={data}
        pagination={{ pageSize: 15 }}
      />
    </Space>
  );
}

export function TerminologyBrowserTable({
  vocabulary,
  entries,
}: {
  vocabulary: string;
  entries: TerminologyEntry[];
}) {
  const [search, setSearch] = useState("");
  const data = entries.filter((entry) =>
    entry.code.toLowerCase().includes(search.toLowerCase()) ||
    entry.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Input
        prefix={<SearchOutlined />}
        placeholder={`Search ${vocabulary} code or description…`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        allowClear
        style={{ maxWidth: 420 }}
      />
      <Table<TerminologyEntry>
        rowKey="id"
        columns={getIcd10Cols()}
        dataSource={data}
        pagination={{ pageSize: 15 }}
      />
    </Space>
  );
}
