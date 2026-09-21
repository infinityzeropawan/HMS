"use client";

import React, { useState, useMemo } from "react";
import { Table, Tag, Typography, Select, Modal, Form, Input, message, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, SyncOutlined } from "@ant-design/icons";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useBedStore } from "../../_admin_stores/admin_bed_store";
import { BedService } from "../../_admin_services/bed_service";
import { TariffService } from "../../_admin_services/tariff_service";
import { DepartmentService } from "../../_admin_services/department_service";
import { HospitalBed, BedStatus, BedCategory } from "../../_admin_types/bed_types";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";

const STATUS_COLORS: Record<BedStatus, string> = {
  VACANT: "success",
  OCCUPIED: "error",
  CLEANING: "warning",
  MAINTENANCE: "default",
  RESERVED: "purple",
  BLOCKED: "volcano",
};

export function HospitalBedConfigTable() {
  const rawBeds = useBedStore((state) => state.beds);
  const resetToDefaults = useBedStore((state) => state.resetToDefaults);
  const departments = DepartmentService.getDepartments();

  const user = useAuthUserStore((s) => s.user);
  const actorName = user?.username || "Hospital Admin";
  const actorRole = user?.role || "HOSPITAL_ADMIN";

  // Re-resolve rates dynamically through BedService (single source of truth)
  const beds = useMemo(() => BedService.getBeds(), [rawBeds]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BedCategory>("GENERAL");
  const [form] = Form.useForm();

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [sourceBed, setSourceBed] = useState<HospitalBed | null>(null);
  const [targetBedId, setTargetBedId] = useState<string>("");

  const available = beds.filter((d) => d.status === "VACANT" || d.status === "RESERVED").length;
  const occupied = beds.filter((d) => d.status === "OCCUPIED").length;
  const cleaning = beds.filter((d) => d.status === "CLEANING").length;
  const maintenance = beds.filter((d) => d.status === "MAINTENANCE" || d.status === "BLOCKED").length;

  const derivedRate = useMemo(() => TariffService.resolveBedRate(selectedCategory), [selectedCategory]);

  const handleStatusChange = (bedId: string, newStatus: BedStatus) => {
    try {
      if (newStatus === "VACANT" && beds.find((b) => b.id === bedId)?.status === "CLEANING") {
        BedService.completeCleaning(bedId, actorName);
      } else {
        BedService.setMaintenanceStatus(bedId, newStatus as "MAINTENANCE" | "BLOCKED" | "VACANT", undefined, actorName);
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

    const category = (values.category as BedCategory) || "GENERAL";

    const res = BedService.registerBed(
      {
        bedNumber: values.bedNumber as string,
        roomId: (values.roomId as string) || `rm-${Date.now().toString().slice(-4)}`,
        roomNumber: (values.roomNumber as string) || "Room 101",
        wardId: (values.wardId as string) || "ward-101",
        wardName: (values.wardName as string) || "General Ward A",
        departmentId: dept.id,
        departmentCode: dept.code,
        departmentName: dept.name,
        floor: (values.floor as string) || "1st Floor",
        category,
        status: "VACANT",
        billingCode: `SRV-BED-${category}`,
      },
      actorName,
      actorRole
    );

    if (res.success) {
      message.success(res.message);
      setModalOpen(false);
      form.resetFields();
    } else {
      message.error("Failed to register bed");
    }
  };

  const handleCompleteCleaning = (bedId: string) => {
    try {
      BedService.completeCleaning(bedId, actorName);
      message.success("Housekeeping cleaning completed. Bed status restored to VACANT.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cleaning clearance failed";
      message.error(msg);
    }
  };

  const handleOpenTransfer = (bed: HospitalBed) => {
    setSourceBed(bed);
    setTargetBedId("");
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = () => {
    if (!sourceBed || !targetBedId) {
      message.warning("Please select a target vacant bed for transfer");
      return;
    }
    try {
      BedService.transferBed(
        sourceBed.id,
        targetBedId,
        {
          uhid: sourceBed.currentUhid || "UHID-2026-N/A",
          ipdNo: sourceBed.currentIpdNo || "IPD-2026-N/A",
          patientName: sourceBed.currentPatientName || "Inpatient",
        },
        actorName
      );
      message.success(`Patient transferred successfully.`);
      setTransferModalOpen(false);
      setSourceBed(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bed transfer failed";
      message.error(msg);
    }
  };

  const columns: ColumnsType<HospitalBed> = [
    {
      title: "Bed # & Location",
      dataIndex: "bedNumber",
      key: "bedNumber",
      render: (_, rec) => (
        <div>
          <span className="font-mono font-bold text-slate-900 block">{rec.bedNumber}</span>
          <span className="text-xs text-slate-500">{rec.wardName} ({rec.roomNumber})</span>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (c) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: "Tariff Daily Rate",
      dataIndex: "dailyRate",
      key: "dailyRate",
      render: (v) => <span className="font-mono font-bold text-slate-800">₹{v?.toLocaleString("en-IN")}/day</span>,
    },
    {
      title: "Status & Operations",
      key: "status",
      render: (_, rec) => (
        <div className="flex items-center gap-2">
          <Select
            size="small"
            value={rec.status}
            onChange={(val) => handleStatusChange(rec.id, val as BedStatus)}
            className="w-36 text-xs"
          >
            <Select.Option value="VACANT">VACANT</Select.Option>
            <Select.Option value="OCCUPIED" disabled>OCCUPIED ({rec.currentPatientName || "Patient"})</Select.Option>
            <Select.Option value="CLEANING">CLEANING</Select.Option>
            <Select.Option value="MAINTENANCE">MAINTENANCE</Select.Option>
            <Select.Option value="BLOCKED">BLOCKED</Select.Option>
          </Select>

          {rec.status === "CLEANING" && (
            <Tooltip title="Complete housekeeping & mark bed VACANT">
              <HmsButton size="sm" variant="emerald" onClick={() => handleCompleteCleaning(rec.id)}>
                Sanitize & Clear
              </HmsButton>
            </Tooltip>
          )}

          {rec.status === "OCCUPIED" && (
            <Tooltip title="Transfer patient to another bed">
              <HmsButton size="sm" variant="secondary" onClick={() => handleOpenTransfer(rec)}>
                Transfer
              </HmsButton>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <Tag color="success">{available} Available / Vacant</Tag>
          <Tag color="error">{occupied} Occupied</Tag>
          <Tag color="warning">{cleaning} Cleaning</Tag>
          <Tag>{maintenance} Maintenance / Blocked</Tag>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Reset beds to standard defaults">
            <HmsButton size="sm" variant="secondary" icon={<SyncOutlined />} onClick={resetToDefaults}>
              Reset Defaults
            </HmsButton>
          </Tooltip>
          <HmsButton
            size="sm"
            variant="emerald"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Add Bed
          </HmsButton>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-xl border border-slate-200">
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
              <Select
                size="large"
                onChange={(cat) => setSelectedCategory(cat as BedCategory)}
              >
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

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-4">
            <span className="font-semibold text-slate-700">Resolved Tariff Rate: </span>
            <span className="font-mono font-bold text-teal-700">₹{derivedRate?.toLocaleString("en-IN")}/day</span>
            <span className="text-slate-500 block text-[11px] mt-0.5">Automated single-source resolution from Tariff Price Master for &apos;{selectedCategory}&apos;.</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</HmsButton>
            <HmsButton variant="emerald" htmlType="submit">Add Bed</HmsButton>
          </div>
        </Form>
      </Modal>

      {/* Patient Bed Transfer Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <span className="font-bold">Inpatient Bed Transfer Workflow</span>
          </div>
        }
        open={transferModalOpen}
        onCancel={() => setTransferModalOpen(false)}
        footer={null}
        width={500}
      >
        {sourceBed && (
          <div className="space-y-4 mt-2">
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs">
              <span className="font-bold text-teal-900 block">Current Source Bed: {sourceBed.bedNumber} ({sourceBed.wardName})</span>
              <span className="text-teal-700 block mt-0.5">Patient: {sourceBed.currentPatientName || "Inpatient"} | IPD: {sourceBed.currentIpdNo || "N/A"}</span>
              <span className="text-teal-600 block text-[11px] mt-0.5">Releasing this bed will automatically transition its status to CLEANING for housekeeping.</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Target Vacant Bed</label>
              <Select
                size="large"
                className="w-full"
                placeholder="Choose target vacant bed..."
                value={targetBedId || undefined}
                onChange={(val) => setTargetBedId(val)}
                options={beds
                  .filter((b) => (b.status === "VACANT" || b.status === "RESERVED") && b.id !== sourceBed.id)
                  .map((b) => ({
                    value: b.id,
                    label: `${b.bedNumber} (${b.wardName}) — ${b.category} [₹${b.dailyRate}/day]`,
                  }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <HmsButton variant="secondary" onClick={() => setTransferModalOpen(false)}>
                Cancel
              </HmsButton>
              <HmsButton variant="emerald" onClick={handleExecuteTransfer}>
                Execute Transfer
              </HmsButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
