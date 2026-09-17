"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, DatePicker, message, Tooltip } from "antd";
import { Calendar, Clock, Plus, UserCheck, ShieldAlert, Search, RefreshCw, User, Phone, MapPin } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import {
  useAdminRosterStore,
  StaffShiftRoster,
  ShiftType,
  StaffRoleCategory,
} from "../../_admin_stores/admin_roster_store";

export const StaffRosterManager: React.FC = () => {
  const { rosters, addShift, updateShiftStatus, resetToDefaults } = useAdminRosterStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const payload = {
      staffName: values.staffName as string,
      role: values.role as StaffRoleCategory,
      department: values.department as string,
      shift: values.shift as ShiftType,
      shiftHours: (values.shiftHours as string) || "08:00 AM - 04:00 PM",
      assignedWardOrRoom: (values.assignedWardOrRoom as string) || "General Ward",
      dutyDate: values.dutyDate
        ? (values.dutyDate as { format: (f: string) => string }).format("YYYY-MM-DD")
        : new Date().toISOString().split("T")[0],
      status: "ON_DUTY" as const,
      contactNumber: (values.contactNumber as string) || "+91 98200 00000",
    };

    addShift(payload);
    message.success(`Shift assigned for ${payload.staffName} (${payload.shift})`);
    setModalOpen(false);
  };

  const filteredRosters = rosters.filter((r) => {
    const matchesRole = selectedRole === "ALL" || r.role === selectedRole;
    const matchesSearch =
      r.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.assignedWardOrRoom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const columns = [
    {
      title: "Staff Member",
      key: "staffName",
      render: (_: unknown, record: StaffShiftRoster) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{record.staffName}</span>
            <Tag color="purple" className="text-3xs">{record.role}</Tag>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{record.department}</p>
        </div>
      ),
    },
    {
      title: "Shift & Hours",
      key: "shift",
      render: (_: unknown, record: StaffShiftRoster) => {
        let color = "blue";
        if (record.shift === "EVENING") color = "gold";
        if (record.shift === "NIGHT") color = "purple";
        if (record.shift === "ON_CALL") color = "red";

        return (
          <div>
            <Tag color={color} className="font-bold">{record.shift}</Tag>
            <div className="text-3xs text-slate-500 font-mono mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> {record.shiftHours}
            </div>
          </div>
        );
      },
    },
    {
      title: "Assigned Station / Room",
      dataIndex: "assignedWardOrRoom",
      key: "assignedWardOrRoom",
      render: (loc: string) => (
        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-teal-600" /> {loc}
        </span>
      ),
    },
    {
      title: "Duty Date",
      dataIndex: "dutyDate",
      key: "dutyDate",
      render: (d: string) => <span className="font-mono text-xs text-slate-600">{d}</span>,
    },
    {
      title: "Duty Status",
      dataIndex: "status",
      key: "status",
      render: (s: StaffShiftRoster["status"], record: StaffShiftRoster) => {
        return (
          <Select
            value={s}
            onChange={(val) => updateShiftStatus(record.id, val)}
            className="w-36"
            size="small"
          >
            <Select.Option value="ON_DUTY">ON DUTY</Select.Option>
            <Select.Option value="OFF_DUTY">OFF DUTY</Select.Option>
            <Select.Option value="ON_LEAVE">ON LEAVE</Select.Option>
            <Select.Option value="EMERGENCY_CALL">EMERGENCY CALL</Select.Option>
          </Select>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Staff On Duty Now</p>
              <h3 className="text-2xl font-bold text-teal-700 mt-1">
                {rosters.filter((r) => r.status === "ON_DUTY").length} Active Staff
              </h3>
            </div>
            <UserCheck className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Night Shift Assigned</p>
              <h3 className="text-2xl font-bold text-purple-700 mt-1">
                {rosters.filter((r) => r.shift === "NIGHT").length} Personnel
              </h3>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-rose-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">On-Call Standby</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">
                {rosters.filter((r) => r.shift === "ON_CALL").length} Emergency Specialists
              </h3>
            </div>
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
        </HmsCard>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search staff name, department or ward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={selectedRole}
            onChange={(val) => setSelectedRole(val)}
            options={[
              { value: "ALL", label: "All Staff Roles" },
              { value: "DOCTOR", label: "Doctors & Consultants" },
              { value: "NURSE", label: "Nursing Staff" },
              { value: "PHARMACIST", label: "Pharmacists" },
              { value: "LAB_TECH", label: "Lab Technicians" },
              { value: "RECEPTIONIST", label: "Front Desk & Billing" },
            ]}
            className="w-48"
          />
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Reset roster to standard shift defaults">
            <HmsButton size="sm" variant="ghost" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={resetToDefaults}>
              Reset
            </HmsButton>
          </Tooltip>
          <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Assign Shift Roster
          </HmsButton>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={filteredRosters} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Assign Doctor & Staff Shift Roster</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <Form.Item label="Staff Member Name" name="staffName" rules={[{ required: true }]}>
            <Input prefix={<User className="w-4 h-4 text-teal-600" />} placeholder="Dr. Rajesh Sharma" size="large" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Role Category" name="role" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="DOCTOR">Doctor / Consultant</Select.Option>
                <Select.Option value="NURSE">Nurse / Sister</Select.Option>
                <Select.Option value="PHARMACIST">Pharmacist</Select.Option>
                <Select.Option value="LAB_TECH">Lab Technician</Select.Option>
                <Select.Option value="RECEPTIONIST">Receptionist</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Department" name="department" rules={[{ required: true }]}>
              <Input placeholder="Cardiology" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Shift Type" name="shift" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="MORNING">Morning Shift</Select.Option>
                <Select.Option value="EVENING">Evening Shift</Select.Option>
                <Select.Option value="NIGHT">Night Shift</Select.Option>
                <Select.Option value="ON_CALL">24x7 On-Call Standby</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Shift Hours" name="shiftHours">
              <Input placeholder="08:00 AM - 02:00 PM" size="large" />
            </Form.Item>
          </div>

          <Form.Item label="Assigned Station / OPD Clinic Room / Ward" name="assignedWardOrRoom" rules={[{ required: true }]}>
            <Input placeholder="OPD Clinic Room 104 or ICU Bed Station A" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Duty Date" name="dutyDate">
              <DatePicker className="w-full" size="large" />
            </Form.Item>

            <Form.Item label="Contact Phone Number" name="contactNumber">
              <Input prefix={<Phone className="w-4 h-4 text-slate-400" />} placeholder="+91 98200 11223" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit">
              Assign Shift
            </HmsButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
