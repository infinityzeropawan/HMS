"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, message, Tooltip, Progress, Popconfirm, Alert } from "antd";
import {
  Plus,
  Search,
  Building2,
  User,
  Phone,
  MapPin,
  BedDouble,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers,
  AlertTriangle,
  Eye,
  Trash2,
  Activity,
  ShieldCheck,
  Edit,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { DepartmentService } from "../../_admin_services/department_service";
import { HospitalDepartment, DepartmentType, DepartmentStatus, DeleteSafetyResult } from "../../_admin_types/department_types";
import { useAdminDepartmentStore } from "../../_admin_stores/admin_department_store";

export const HospitalDepartmentManager: React.FC = () => {
  const departments = useAdminDepartmentStore((state) => state.departments);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<HospitalDepartment | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDept, setDeletingDept] = useState<HospitalDepartment | null>(null);
  const [deleteSafety, setDeleteSafety] = useState<DeleteSafetyResult | null>(null);

  const [form] = Form.useForm();

  const handleOpenAdd = () => {
    setEditingDept(null);
    form.resetFields();
    form.setFieldsValue({
      type: "OPD",
      status: "ACTIVE",
      allocatedBeds: 10,
      activeStaffCount: 8,
      approvedBeds: 12,
      operationalBeds: 10,
      reservedBeds: 2,
      occupiedBeds: 7,
      approvedStaffCount: 10,
      vacantStaffCount: 2,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: HospitalDepartment) => {
    setEditingDept(dept);
    form.setFieldsValue({
      ...dept,
      approvedBeds: dept.bedCapacity?.approvedBeds || dept.allocatedBeds,
      operationalBeds: dept.bedCapacity?.operationalBeds || dept.allocatedBeds,
      reservedBeds: dept.bedCapacity?.reservedBeds || 0,
      occupiedBeds: dept.bedCapacity?.occupiedBeds || 0,
      approvedStaffCount: dept.staffCapacity?.approvedStaffCount || dept.activeStaffCount,
      activeStaffCount: dept.staffCapacity?.activeStaffCount || dept.activeStaffCount,
      vacantStaffCount: dept.staffCapacity?.vacantStaffCount || 0,
    });
    setModalOpen(true);
  };

  const handleFormFinish = (values: Record<string, unknown>) => {
    const parentId = (values.parentDepartmentId as string) || undefined;
    const parentDept = parentId ? DepartmentService.getDepartmentById(parentId) : undefined;

    const payload = {
      code: (values.code as string) || `DEPT-${Math.floor(Math.random() * 900 + 100)}`,
      name: values.name as string,
      type: values.type as DepartmentType,
      status: (values.status as DepartmentStatus) || "ACTIVE",
      headOfDepartment: (values.headOfDepartment as string) || "Dr. Unassigned",
      hodUserId: (values.hodUserId as string) || undefined,
      hodDisplayName: (values.headOfDepartment as string) || undefined,
      parentDepartmentId: parentId,
      parentDepartmentName: parentDept ? parentDept.name : undefined,
      location: (values.location as string) || "Main Block",
      allocatedBeds: Number(values.operationalBeds || values.allocatedBeds || 0),
      activeStaffCount: Number(values.activeStaffCount || 0),
      phoneExtension: (values.phoneExtension as string) || "1000",
      description: (values.description as string) || "",
      bedCapacity: {
        approvedBeds: Number(values.approvedBeds || values.allocatedBeds || 10),
        operationalBeds: Number(values.operationalBeds || values.allocatedBeds || 10),
        reservedBeds: Number(values.reservedBeds || 0),
        occupiedBeds: Number(values.occupiedBeds || 0),
      },
      staffCapacity: {
        approvedStaffCount: Number(values.approvedStaffCount || values.activeStaffCount || 10),
        activeStaffCount: Number(values.activeStaffCount || 0),
        vacantStaffCount: Number(values.vacantStaffCount || 0),
      },
    };

    if (editingDept) {
      DepartmentService.updateDepartment(editingDept.id, payload);
      message.success(`Department '${payload.name}' updated successfully.`);
    } else {
      DepartmentService.createDepartment(payload);
      message.success(`New department '${payload.name}' created & audited.`);
    }
    setModalOpen(false);
  };

  const handleOpenDelete = (dept: HospitalDepartment) => {
    setDeletingDept(dept);
    const safety = DepartmentService.checkDeleteSafety(dept.id);
    setDeleteSafety(safety);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingDept) return;
    const res = DepartmentService.deleteDepartment(deletingDept.id);
    if (res.success) {
      message.success(`Department '${deletingDept.name}' deleted.`);
      setDeleteModalOpen(false);
    } else {
      message.error(res.error || "Failed to delete department.");
    }
  };

  const handleSuspendInstead = () => {
    if (!deletingDept) return;
    DepartmentService.updateStatus(deletingDept.id, "SUSPENDED");
    message.warning(`Department '${deletingDept.name}' suspended instead of deletion.`);
    setDeleteModalOpen(false);
  };

  const filteredDepts = DepartmentService.getDepartments({
    searchTerm,
    type: selectedType as DepartmentType | "ALL",
    status: selectedStatus as DepartmentStatus | "ALL",
  });

  const columns = [
    {
      title: "Code & Department Name",
      key: "name",
      render: (_: unknown, record: HospitalDepartment) => (
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/departments/${record.id}`} className="font-bold text-slate-900 hover:text-teal-600 transition-colors">
              {record.name}
            </Link>
            <span className="font-mono text-3xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
              {record.code}
            </span>
          </div>
          {record.parentDepartmentName && (
            <div className="flex items-center gap-1 text-3xs text-blue-600 mt-0.5 font-medium">
              <Layers className="w-3 h-3 text-blue-500" /> Sub-unit of: {record.parentDepartmentName}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{record.description}</p>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "type",
      key: "type",
      render: (type: DepartmentType) => {
        let color = "blue";
        if (type === "ICU") color = "purple";
        if (type === "EMERGENCY") color = "red";
        if (type === "DIAGNOSTIC") color = "cyan";
        if (type === "SUPPORT") color = "orange";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Head of Department (HOD)",
      key: "headOfDepartment",
      render: (_: unknown, record: HospitalDepartment) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-teal-600" /> {record.hodDisplayName || record.headOfDepartment}
          </span>
          {record.hodUserId && <span className="font-mono text-3xs text-slate-400 block ml-4">ID: {record.hodUserId}</span>}
        </div>
      ),
    },
    {
      title: "Bed Utilization",
      key: "bedUtilization",
      render: (_: unknown, record: HospitalDepartment) => {
        const occ = record.bedCapacity?.occupiedBeds || 0;
        const total = record.bedCapacity?.operationalBeds || record.allocatedBeds || 0;
        const pct = total > 0 ? Math.round((occ / total) * 100) : 0;
        return (
          <div className="w-32 text-xs">
            <div className="flex items-center justify-between text-3xs text-slate-500 mb-1">
              <span>{occ}/{total} Beds</span>
              <span className="font-bold text-purple-700">{pct}%</span>
            </div>
            <Progress percent={pct} size="small" strokeColor="#9333ea" showInfo={false} />
          </div>
        );
      },
    },
    {
      title: "Staffing",
      key: "staffing",
      render: (_: unknown, record: HospitalDepartment) => {
        const active = record.staffCapacity?.activeStaffCount || record.activeStaffCount || 0;
        const vacant = record.staffCapacity?.vacantStaffCount || 0;
        return (
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> {active} Active Staff
            </div>
            {vacant > 0 && (
              <div className="text-3xs text-rose-600 font-medium">
                {vacant} Vacant Position{vacant > 1 ? "s" : ""}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Lifecycle Status",
      dataIndex: "status",
      key: "status",
      render: (s: DepartmentStatus, record: HospitalDepartment) => {
        let color = "emerald";
        if (s === "UNDER_MAINTENANCE") color = "amber";
        if (s === "SUSPENDED" || s === "CLOSED") color = "rose";
        if (s === "PLANNED") color = "blue";
        return (
          <button
            onClick={() => {
              const nextStatus = s === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
              DepartmentService.updateStatus(record.id, nextStatus);
              message.info(`Department '${record.name}' status updated to ${nextStatus}`);
            }}
            className="cursor-pointer"
          >
            <Tag color={color} className="!font-bold">
              {s}
            </Tag>
          </button>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: HospitalDepartment) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/departments/${record.id}`}>
            <Tooltip title="View Department Detail Console">
              <HmsButton size="sm" variant="ghost" icon={<Eye className="w-3.5 h-3.5 text-teal-600" />} />
            </Tooltip>
          </Link>
          <Tooltip title="Edit Department Parameters">
            <HmsButton size="sm" variant="secondary" icon={<Edit className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete Department (Safety Guard Enabled)">
            <HmsButton size="sm" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />} onClick={() => handleOpenDelete(record)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  const totalBedsOccupied = departments.reduce((acc, d) => acc + (d.bedCapacity?.occupiedBeds || 0), 0);
  const totalBedsOperational = departments.reduce((acc, d) => acc + (d.bedCapacity?.operationalBeds || d.allocatedBeds || 0), 0);
  const overallBedOccupancyPct = totalBedsOperational > 0 ? Math.round((totalBedsOccupied / totalBedsOperational) * 100) : 0;
  const totalVacancies = departments.reduce((acc, d) => acc + (d.staffCapacity?.vacantStaffCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Visual Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500 bg-gradient-to-br from-white to-teal-50/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Department Units</p>
              <h3 className="text-2xl font-bold text-teal-800 mt-1">{departments.length} Units</h3>
              <p className="text-3xs text-emerald-600 font-semibold mt-0.5">
                {departments.filter((d) => d.status === "ACTIVE").length} Operational Units
              </p>
            </div>
            <Building2 className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Hospital Bed Occupancy</p>
              <h3 className="text-2xl font-bold text-purple-800 mt-1">{overallBedOccupancyPct}% Occupied</h3>
              <p className="text-3xs text-slate-500 mt-0.5">
                {totalBedsOccupied} Occupied / {totalBedsOperational} Operational Beds
              </p>
            </div>
            <BedDouble className="w-8 h-8 text-purple-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Staff On-Roll</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                {departments.reduce((acc, d) => acc + (d.staffCapacity?.activeStaffCount || d.activeStaffCount || 0), 0)} Staff
              </h3>
              <p className="text-3xs text-rose-600 font-medium mt-0.5">{totalVacancies} Open Vacancies</p>
            </div>
            <Users className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-amber-500 bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Maintenance & Special Units</p>
              <h3 className="text-2xl font-bold text-amber-700 mt-1">
                {departments.filter((d) => d.status === "UNDER_MAINTENANCE" || d.status === "SUSPENDED").length} Units
              </h3>
              <p className="text-3xs text-slate-500 mt-0.5">Under Audit / Maintenance</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
        </HmsCard>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search code, name, HOD or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
            options={[
              { value: "ALL", label: "All Categories" },
              { value: "OPD", label: "OPD Clinics" },
              { value: "IPD", label: "Inpatient Wards" },
              { value: "ICU", label: "Intensive Care (ICU)" },
              { value: "EMERGENCY", label: "Emergency Care" },
              { value: "DIAGNOSTIC", label: "Pathology & Radiology" },
              { value: "SUPPORT", label: "Support Services" },
            ]}
            className="w-full sm:w-44"
          />

          <Select
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "PLANNED", label: "Planned" },
              { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
              { value: "SUSPENDED", label: "Suspended" },
              { value: "CLOSED", label: "Closed" },
            ]}
            className="w-full sm:w-44"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Tooltip title="Reset department list to system default profile">
            <HmsButton size="sm" variant="ghost" fullWidth icon={<RefreshCw className="w-3.5 h-3.5" />} className="min-h-[44px] sm:min-h-0 sm:w-auto" onClick={() => DepartmentService.resetToDefaults()}>
              Reset
            </HmsButton>
          </Tooltip>
          <HmsButton variant="emerald" fullWidth icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd} className="min-h-[44px] sm:min-h-0 sm:w-auto">
            Add Department
          </HmsButton>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table columns={columns} dataSource={filteredDepts} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <span>{editingDept ? "Edit Department Parameters" : "Add New Department Unit"}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={680}
      >
        <Form form={form} layout="vertical" onFinish={handleFormFinish} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Department Code" name="code" rules={[{ required: true }]}>
              <Input placeholder="e.g. CARD-01" />
            </Form.Item>

            <Form.Item label="Department Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Cardiology & Cardiac Sciences" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Department Category" name="type" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="OPD">OPD Consultation Clinic</Select.Option>
                <Select.Option value="IPD">IPD Inpatient Ward</Select.Option>
                <Select.Option value="ICU">Intensive Care (ICU/HDU)</Select.Option>
                <Select.Option value="EMERGENCY">Emergency 24x7</Select.Option>
                <Select.Option value="DIAGNOSTIC">Diagnostic & Lab</Select.Option>
                <Select.Option value="SUPPORT">Support & Ancillary</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Lifecycle Status" name="status" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="ACTIVE">Active / Operational</Select.Option>
                <Select.Option value="PLANNED">Planned / Upcoming</Select.Option>
                <Select.Option value="UNDER_MAINTENANCE">Under Maintenance</Select.Option>
                <Select.Option value="SUSPENDED">Suspended</Select.Option>
                <Select.Option value="CLOSED">Closed</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Head of Department (HOD Name)" name="headOfDepartment" rules={[{ required: true }]}>
              <Input placeholder="e.g. Dr. Rajesh Sharma" />
            </Form.Item>

            <Form.Item label="Parent Department (Optional Hierarchy)" name="parentDepartmentId">
              <Select allowClear placeholder="Select parent unit (e.g. Medicine)">
                {departments
                  .filter((d) => d.id !== editingDept?.id)
                  .map((d) => (
                    <Select.Option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-purple-600" /> Bed Capacity Breakdown
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <Form.Item label="Approved Beds" name="approvedBeds" className="!mb-0">
                <InputNumber min={0} max={500} className="w-full" />
              </Form.Item>
              <Form.Item label="Operational" name="operationalBeds" className="!mb-0">
                <InputNumber min={0} max={500} className="w-full" />
              </Form.Item>
              <Form.Item label="Reserved" name="reservedBeds" className="!mb-0">
                <InputNumber min={0} max={500} className="w-full" />
              </Form.Item>
              <Form.Item label="Occupied" name="occupiedBeds" className="!mb-0">
                <InputNumber min={0} max={500} className="w-full" />
              </Form.Item>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" /> Staffing Capacity Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <Form.Item label="Sanctioned Posts" name="approvedStaffCount" className="!mb-0">
                <InputNumber min={0} max={500} className="w-full" />
              </Form.Item>
              <Form.Item label="Active On-Roll" name="activeStaffCount" className="!mb-0">
                <InputNumber min={0} max={500} className="w-full" />
              </Form.Item>
              <Form.Item label="Vacancies" name="vacantStaffCount" className="!mb-0">
                <InputNumber min={0} max={500} className="w-full" />
              </Form.Item>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Wing / Location" name="location" rules={[{ required: true }]}>
              <Input placeholder="Block A, 2nd Floor" />
            </Form.Item>

            <Form.Item label="Phone Extension" name="phoneExtension">
              <Input placeholder="4012" />
            </Form.Item>
          </div>

          <Form.Item label="Department Scope & Clinical Notes" name="description">
            <Input.TextArea rows={2} placeholder="Brief clinical or operational scope..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit">
              {editingDept ? "Save Changes" : "Create Department"}
            </HmsButton>
          </div>
        </Form>
      </Modal>

      {/* Delete Safety Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Delete Safety Protection Guard</span>
          </div>
        }
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        footer={null}
        width={540}
      >
        {deletingDept && (
          <div className="space-y-4 mt-3">
            <p className="text-xs text-slate-700">
              Evaluating cross-module dependencies for department <strong>{deletingDept.name} ({deletingDept.code})</strong>:
            </p>

            {deleteSafety?.canDelete ? (
              <Alert
                type="info"
                showIcon
                message="No Active Dependencies Found"
                description="This department is not referenced by any active shift rosters or HR attendance logs. Deletion is permitted."
              />
            ) : (
              <Alert
                type="warning"
                showIcon
                message="Deletion Blocked due to Active Module Dependencies"
                description={
                  <div className="space-y-2 mt-1">
                    <p className="text-xs text-slate-700 font-medium">The following active dependencies prevent permanent deletion:</p>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                      {deleteSafety?.activeReferences.map((ref, i) => (
                        <li key={i}>{ref.description}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-500 italic mt-2">
                      To preserve historical records and audit integrity, please <strong>Suspend</strong> or <strong>Deactivate</strong> this unit instead.
                    </p>
                  </div>
                }
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <HmsButton variant="secondary" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </HmsButton>

              {!deleteSafety?.canDelete && (
                <HmsButton variant="secondary" onClick={handleSuspendInstead}>
                  Suspend Department Instead
                </HmsButton>
              )}

              {deleteSafety?.canDelete && (
                <HmsButton variant="danger" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleConfirmDelete}>
                  Confirm Permanent Delete
                </HmsButton>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
