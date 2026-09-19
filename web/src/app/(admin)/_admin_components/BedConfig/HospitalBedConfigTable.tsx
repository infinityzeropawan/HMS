"use client";

import React, { useState } from "react";
import { EditOutlined, PlusOutlined, ToolOutlined, CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Space, Table, Tag, Typography, Select, Modal, Form, Input, InputNumber, message, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useBedStore } from "../../_admin_stores/admin_bed_store";
import { BedService } from "../../_admin_services/bed_service";
import { DepartmentService } from "../../_admin_services/department_service";
import { HospitalBed, BedStatus, BedCategory } from "../../_admin_types/bed_types";

const STATUS_COLORS: Record<BedStatus, string> = {
  VACANT: "success",
  OCCUPIED: "error",
  CLEANING: "warning",
  MAINTENANCE: "default",
  RESERVED: "purple",
  BLOCKED: "volcano",
};

export function HospitalBedConfigTable() {
  const beds = useBedStore((state) => state.beds);
  const resetToDefaults = useBedStore((state) => state.resetToDefaults);
  const departments = DepartmentService.getDepartments();

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const available = beds.filter((d) => d.status === "VACANT" || d.status === "RESERVED").length;
  const occupied = beds.filter((d) => d.status === "OCCUPIED").length;
  const cleaning = beds.filter((d) => d.status === "CLEANING").length;
  const maintenance = beds.filter((d) => d.status === "MAINTENANCE" || d.status === "BLOCKED").length;

  const handleStatusChange = (bedId: string, newStatus: BedStatus) => {
    try {
      if (newStatus === "VACANT" && beds.find((b) => b.id === bedId)?.status === "CLEANING") {
        BedService.completeCleaning(bedId, "Admin Bed Config");
      } else {
        BedService.setMaintenanceStatus(bedId, newStatus as "MAINTENANCE" | "BLOCKED" | "VACANT", undefined, "Admin Bed Config");
      }
      message.success(`Updated bed status to ${newStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Status update failed";
      message.error(msg);
    }
  };

  const handleAddBed = (values: Record<string, unknown>) => {
    const dept = departments.find((d) => d.id === values.departmentId) || {
      id: "dept-101",
      code: "CARD-01",
      name: "Cardiology",
    };

    const newBed: Omit<HospitalBed, "id"> = {
      bedNumber: values.bedNumber as string,
      roomId: (values.roomId as string) || `rm-${Date.now().toString().slice(-4)}`,
      roomNumber: (values.roomNumber as string) || "Room 101",
      wardId: (values.wardId as string) || "ward-101",
      wardName: (values.wardName as string) || "General Ward A",
      departmentId: dept.id,
      departmentCode: dept.code,
      departmentName: dept.name,
      floor: (values.floor as string) || "1st Floor",
      category: (values.category as BedCategory) || "GENERAL",
      status: "VACANT",
      dailyRate: Number(values.dailyRate) || 2500,
      billingCode: `SRV-BED-${(values.category as string || "GEN")}`,
    };

    useBedStore.getState().addBed(newBed);
    message.success(`Added new bed ${newBed.bedNumber} (${newBed.wardName})`);
    setModalOpen(false);
    form.resetFields();
  };

  const columns: ColumnsType<HospitalBed> = [
    {
      title: "Bed No.",
      dataIndex: "bedNumber",
      key: "bedNumber",
      render: (v, rec) => (
        <div>
          <Typography.Text strong>{v}</Typography.Text>
          <div className="text-3xs text-slate-400 font-mono">{rec.roomNumber} ({rec.floor})</div>
        </div>
      ),
    },
    {
      title: "Ward & Department",
      key: "ward",
      render: (_, rec) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{rec.wardName}</div>
          <span className="text-3xs font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
            {rec.departmentCode} — {rec.departmentName}
          </span>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (v) => <Tag color="blue" className="font-bold text-3xs">{v}</Tag>,
    },
    {
      title: "Bed Status",
      dataIndex: "status",
      key: "status",
      render: (v: BedStatus, rec: HospitalBed) => (
        <Select
          value={v}
          onChange={(val) => handleStatusChange(rec.id, val)}
          size="small"
          className="w-32 font-bold"
        >
          <Select.Option value="VACANT">VACANT</Select.Option>
          <Select.Option value="OCCUPIED">OCCUPIED</Select.Option>
          <Select.Option value="CLEANING">CLEANING</Select.Option>
          <Select.Option value="MAINTENANCE">MAINTENANCE</Select.Option>
          <Select.Option value="RESERVED">RESERVED</Select.Option>
          <Select.Option value="BLOCKED">BLOCKED</Select.Option>
        </Select>
      ),
    },
    {
      title: "Current Occupant",
      key: "occupant",
      render: (_, rec) =>
        rec.currentPatientName ? (
          <div>
            <div className="font-bold text-xs text-slate-900">{rec.currentPatientName}</div>
            <div className="text-3xs font-mono text-slate-500">{rec.currentUhid} | {rec.currentIpdNo}</div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Unoccupied</span>
        ),
    },
    {
      title: "Daily Rate (₹)",
      dataIndex: "dailyRate",
      key: "dailyRate",
      render: (v: number) => `₹${v.toLocaleString("en-IN")}`,
      sorter: (a, b) => a.dailyRate - b.dailyRate,
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Space wrap>
          <Tag color="success">{available} Available / Vacant</Tag>
          <Tag color="error">{occupied} Occupied</Tag>
          <Tag color="warning">{cleaning} Cleaning</Tag>
          <Tag>{maintenance} Maintenance / Blocked</Tag>
        </Space>

        <Space>
          <Tooltip title="Reset beds to standard defaults">
            <Button size="small" icon={<SyncOutlined />} onClick={resetToDefaults}>
              Reset Defaults
            </Button>
          </Tooltip>
          <Button
            id="add-bed-btn"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Add Bed
          </Button>
        </Space>
      </div>

      <div className="w-full overflow-x-auto">
        <Table<HospitalBed>
          id="hospital-bed-config-table"
          rowKey="id"
          columns={columns}
          dataSource={beds}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} physical beds total` }}
        />
      </div>

      <Modal
        title="Register New Physical Bed"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleAddBed} className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Bed Number / Code" name="bedNumber" rules={[{ required: true }]}>
              <Input placeholder="e.g. ICU-BED-03" size="large" />
            </Form.Item>

            <Form.Item label="Room Number / Cubicle" name="roomNumber" rules={[{ required: true }]}>
              <Input placeholder="e.g. Room 104" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Ward Name" name="wardName" rules={[{ required: true }]}>
              <Input placeholder="General Ward A" size="large" />
            </Form.Item>

            <Form.Item label="Floor Location" name="floor" initialValue="1st Floor">
              <Input placeholder="1st Floor" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Department" name="departmentId" rules={[{ required: true }]}>
              <Select size="large">
                {departments.map((d) => (
                  <Select.Option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Bed Category" name="category" initialValue="GENERAL">
              <Select size="large">
                <Select.Option value="GENERAL">General Ward</Select.Option>
                <Select.Option value="SEMI_PRIVATE">Semi-Private</Select.Option>
                <Select.Option value="PRIVATE">Private Suite</Select.Option>
                <Select.Option value="DELUXE">Deluxe Suite</Select.Option>
                <Select.Option value="ICU">ICU</Select.Option>
                <Select.Option value="NICU">NICU</Select.Option>
                <Select.Option value="PICU">PICU</Select.Option>
                <Select.Option value="EMERGENCY">Emergency Triage</Select.Option>
                <Select.Option value="ISOLATION">Isolation Room</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Daily Bed Tariff Rate (₹)" name="dailyRate" initialValue={2500}>
            <InputNumber className="w-full" size="large" min={0} max={500000} />
          </Form.Item>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="primary" htmlType="submit" className="w-full sm:w-auto">Add Bed</Button>
          </div>
        </Form>
      </Modal>
    </Space>
  );
}
