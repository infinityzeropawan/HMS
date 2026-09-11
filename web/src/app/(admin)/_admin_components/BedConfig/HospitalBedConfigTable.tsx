"use client";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

interface BedRecord {
  id: string;
  bedNumber: string;
  wardName: string;
  wardType: string;
  floor: string;
  bedType: string;
  status: "available" | "occupied" | "cleaning" | "maintenance" | "blocked";
  dailyRate: number;
}

const MOCK_BEDS: BedRecord[] = [
  { id: "b-1", bedNumber: "A-101", wardName: "Ward A — General", wardType: "general", floor: "1st", bedType: "Standard", status: "occupied", dailyRate: 1200 },
  { id: "b-2", bedNumber: "A-102", wardName: "Ward A — General", wardType: "general", floor: "1st", bedType: "Standard", status: "available", dailyRate: 1200 },
  { id: "b-3", bedNumber: "B-201", wardName: "Ward B — Semi-Private", wardType: "semi_private", floor: "2nd", bedType: "Semi-Private", status: "occupied", dailyRate: 2500 },
  { id: "b-4", bedNumber: "B-202", wardName: "Ward B — Semi-Private", wardType: "semi_private", floor: "2nd", bedType: "Semi-Private", status: "cleaning", dailyRate: 2500 },
  { id: "b-5", bedNumber: "ICU-01", wardName: "ICU", wardType: "icu", floor: "3rd", bedType: "ICU", status: "occupied", dailyRate: 8000 },
  { id: "b-6", bedNumber: "ICU-02", wardName: "ICU", wardType: "icu", floor: "3rd", bedType: "ICU", status: "available", dailyRate: 8000 },
  { id: "b-7", bedNumber: "C-301", wardName: "Ward C — Private", wardType: "private", floor: "3rd", bedType: "Private Suite", status: "available", dailyRate: 5000 },
  { id: "b-8", bedNumber: "C-302", wardName: "Ward C — Private", wardType: "private", floor: "3rd", bedType: "Private Suite", status: "maintenance", dailyRate: 5000 },
];

const STATUS_COLORS: Record<BedRecord["status"], string> = {
  available: "success",
  occupied: "error",
  cleaning: "warning",
  maintenance: "default",
  blocked: "default",
};

function getColumns(): ColumnsType<BedRecord> {
  return [
    { title: "Bed No.", dataIndex: "bedNumber", key: "bedNumber", render: (v) => <Typography.Text strong>{v}</Typography.Text> },
    { title: "Ward", dataIndex: "wardName", key: "wardName" },
    { title: "Floor", dataIndex: "floor", key: "floor" },
    { title: "Type", dataIndex: "bedType", key: "bedType", render: (v) => <Tag>{v}</Tag> },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => <Tag color={STATUS_COLORS[v as BedRecord["status"]]}>{v.toUpperCase()}</Tag>,
      filters: [
        { text: "Available", value: "available" },
        { text: "Occupied", value: "occupied" },
        { text: "Cleaning", value: "cleaning" },
        { text: "Maintenance", value: "maintenance" },
      ],
      onFilter: (val, rec) => rec.status === val,
    },
    {
      title: "Daily Rate (₹)",
      dataIndex: "dailyRate",
      key: "dailyRate",
      render: (v) => `₹${v.toLocaleString("en-IN")}`,
      sorter: (a, b) => a.dailyRate - b.dailyRate,
    },
    {
      title: "Action",
      key: "action",
      render: (_, rec) => (
        <Button
          id={`bed-edit-${rec.id}`}
          icon={<EditOutlined />}
          size="small"
          type="text"
        >
          Edit
        </Button>
      ),
    },
  ];
}

export function HospitalBedConfigTable() {
  const available = MOCK_BEDS.filter((d) => d.status === "available").length;
  const occupied = MOCK_BEDS.filter((d) => d.status === "occupied").length;
  const cleaning = MOCK_BEDS.filter((d) => d.status === "cleaning").length;
  const maintenance = MOCK_BEDS.filter((d) => d.status === "maintenance").length;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Space wrap>
          <Tag color="success">{available} Available</Tag>
          <Tag color="error">{occupied} Occupied</Tag>
          <Tag color="warning">{cleaning} Cleaning</Tag>
          <Tag>{maintenance} Maintenance</Tag>
        </Space>
        <Button
          id="add-bed-btn"
          type="primary"
          icon={<PlusOutlined />}
        >
          Add Bed
        </Button>
      </div>
      <Table<BedRecord>
        id="hospital-bed-config-table"
        rowKey="id"
        columns={getColumns()}
        dataSource={MOCK_BEDS}
        pagination={{ pageSize: 15, showTotal: (t) => `${t} beds total` }}
      />
    </Space>
  );
}
