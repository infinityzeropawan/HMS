"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, InputNumber, message, Tooltip } from "antd";
import { Plus, Search, Building2, User, Phone, MapPin, BedDouble, Users, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useAdminDepartmentStore, HospitalDepartment, DepartmentType } from "../../_admin_stores/admin_department_store";

export const HospitalDepartmentManager: React.FC = () => {
  const { departments, addDepartment, updateDepartment, toggleDepartmentStatus, deleteDepartment, resetToDefaults } =
    useAdminDepartmentStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<HospitalDepartment | null>(null);
  const [form] = Form.useForm();

  const handleOpenAdd = () => {
    setEditingDept(null);
    form.resetFields();
    form.setFieldsValue({ type: "OPD", status: "ACTIVE", allocatedBeds: 10, activeStaffCount: 8 });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: HospitalDepartment) => {
    setEditingDept(dept);
    form.setFieldsValue(dept);
    setModalOpen(true);
  };

  const handleFormFinish = (values: Record<string, unknown>) => {
    const payload = {
      code: (values.code as string) || `DEPT-${Math.floor(Math.random() * 900 + 100)}`,
      name: values.name as string,
      type: values.type as DepartmentType,
      headOfDepartment: values.headOfDepartment as string,
      location: values.location as string,
      allocatedBeds: Number(values.allocatedBeds) || 0,
      activeStaffCount: Number(values.activeStaffCount) || 0,
      phoneExtension: values.phoneExtension as string,
      status: (values.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
      description: (values.description as string) || "",
    };

    if (editingDept) {
      updateDepartment(editingDept.id, payload);
      message.success(`Department ${payload.name} updated successfully.`);
    } else {
      addDepartment(payload);
      message.success(`New department ${payload.name} added.`);
    }
    setModalOpen(false);
  };

  const filteredDepts = departments.filter((d) => {
    const matchesType = selectedType === "ALL" || d.type === selectedType;
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const columns = [
    {
      title: "Code & Dept Name",
      key: "name",
      render: (_: unknown, record: HospitalDepartment) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{record.name}</span>
            <span className="font-mono text-3xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              {record.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{record.description}</p>
        </div>
      ),
    },
    {
      title: "Type",
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
      title: "HOD (Doctor)",
      dataIndex: "headOfDepartment",
      key: "headOfDepartment",
      render: (hod: string) => (
        <span className="text-xs font-semibold text-teal-800 flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-teal-600" /> {hod}
        </span>
      ),
    },
    {
      title: "Location & Ext",
      key: "location",
      render: (_: unknown, record: HospitalDepartment) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" /> {record.location}
          </div>
          <div className="flex items-center gap-1 text-slate-400 font-mono text-3xs">
            <Phone className="w-3 h-3" /> Ext: {record.phoneExtension}
          </div>
        </div>
      ),
    },
    {
      title: "Capacity & Staff",
      key: "capacity",
      render: (_: unknown, record: HospitalDepartment) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-slate-700">
            <BedDouble className="w-3.5 h-3.5 text-teal-600" /> {record.allocatedBeds} Beds
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Users className="w-3.5 h-3.5 text-blue-500" /> {record.activeStaffCount} Staff
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string, record: HospitalDepartment) => (
        <button
          onClick={() => toggleDepartmentStatus(record.id)}
          className="cursor-pointer"
        >
          <Tag color={s === "ACTIVE" ? "emerald" : "rose"}>
            {s === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
          </Tag>
        </button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: HospitalDepartment) => (
        <div className="flex items-center gap-2">
          <HmsButton size="sm" variant="secondary" onClick={() => handleOpenEdit(record)}>
            Edit
          </HmsButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Departments</p>
              <h3 className="text-2xl font-bold text-teal-700 mt-1">{departments.length} Units</h3>
            </div>
            <Building2 className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Units</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {departments.filter((d) => d.status === "ACTIVE").length} Operational
              </h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Bed Quota</p>
              <h3 className="text-2xl font-bold text-purple-700 mt-1">
                {departments.reduce((acc, d) => acc + d.allocatedBeds, 0)} Beds
              </h3>
            </div>
            <BedDouble className="w-8 h-8 text-purple-500" />
          </div>
        </HmsCard>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search department name, code or HOD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
            options={[
              { value: "ALL", label: "All Department Types" },
              { value: "OPD", label: "OPD Specializations" },
              { value: "IPD", label: "Inpatient Wards" },
              { value: "ICU", label: "Intensive Care Units" },
              { value: "EMERGENCY", label: "Emergency Care" },
              { value: "DIAGNOSTIC", label: "Pathology & Radiology" },
              { value: "SUPPORT", label: "Support & Pharmacy" },
            ]}
            className="w-48"
          />
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Reset department list to default master records">
            <HmsButton size="sm" variant="ghost" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={resetToDefaults}>
              Reset
            </HmsButton>
          </Tooltip>
          <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Add Department
          </HmsButton>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={filteredDepts} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <span>{editingDept ? "Edit Department" : "Add New Department"}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFormFinish} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Department Code" name="code" rules={[{ required: true }]}>
              <Input placeholder="e.g. CARD-01" />
            </Form.Item>

            <Form.Item label="Department Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Cardiology & Cardiac Sciences" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Department Category / Type" name="type" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="OPD">OPD Consultation Clinic</Select.Option>
                <Select.Option value="IPD">IPD Inpatient Ward</Select.Option>
                <Select.Option value="ICU">Intensive Care (ICU/HDU)</Select.Option>
                <Select.Option value="EMERGENCY">Emergency 24x7</Select.Option>
                <Select.Option value="DIAGNOSTIC">Diagnostic & Lab</Select.Option>
                <Select.Option value="SUPPORT">Support & Ancillary</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Head of Department (HOD Doctor)" name="headOfDepartment" rules={[{ required: true }]}>
              <Input placeholder="Dr. Rajesh Sharma" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item label="Wing / Location" name="location" rules={[{ required: true }]}>
              <Input placeholder="Block A, 2nd Floor" />
            </Form.Item>

            <Form.Item label="Bed Allocation" name="allocatedBeds">
              <InputNumber min={0} max={200} className="w-full" />
            </Form.Item>

            <Form.Item label="Phone Extension" name="phoneExtension">
              <Input placeholder="4012" />
            </Form.Item>
          </div>

          <Form.Item label="Department Description & Scope" name="description">
            <Input.TextArea rows={2} placeholder="Brief clinical or operational scope..." />
          </Form.Item>

          <Form.Item label="Operational Status" name="status">
            <Select>
              <Select.Option value="ACTIVE">Active / Operational</Select.Option>
              <Select.Option value="INACTIVE">Inactive / Suspended</Select.Option>
            </Select>
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
    </div>
  );
};
