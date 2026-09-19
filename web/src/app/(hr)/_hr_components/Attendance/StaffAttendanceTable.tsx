"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, message } from "antd";
import { Users, Clock, Plus, CheckCircle2, AlertTriangle, Fingerprint, Calendar, Search } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useHrStore, StaffAttendanceRecord } from "../../_hr_stores/hr_store";
import { RosterService } from "@/app/(admin)/_admin_services/roster_service";
import { useStaffUserStore } from "@/app/(admin)/_admin_stores/admin_user_store";

export const StaffAttendanceTable: React.FC = () => {
  const { attendanceLogs } = useHrStore();
  const staffUsers = useStaffUserStore((state) => state.users);

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const selectedUser = staffUsers.find((u) => u.id === values.userId);
    const staffId = selectedUser ? selectedUser.employeeId : (values.staffId as string) || "STF-101";
    const clockInTimeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const biometricId = `BIO-${Math.floor(Math.random() * 9000 + 1000)}`;

    try {
      RosterService.recordAttendancePunch(staffId, clockInTimeStr, biometricId, "Staff Biometric Station");
      message.success(`Biometric Punch recorded for ${selectedUser ? selectedUser.fullName : staffId}`);
      setModalOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to record clock-in";
      message.error(errMsg);
    }
  };

  const filteredLogs = attendanceLogs.filter(
    (a) =>
      a.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.biometricId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.staffId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Biometric ID & Staff",
      key: "staff",
      render: (_: unknown, record: StaffAttendanceRecord) => (
        <div>
          <span className="font-mono text-3xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {record.biometricId}
          </span>
          <h4 className="font-bold text-slate-900 text-sm mt-1">{record.staffName}</h4>
          <p className="text-3xs text-slate-400 font-mono">{record.staffId} | {record.role}</p>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (d: string) => <span className="font-semibold text-xs text-slate-800">{d}</span>,
    },
    {
      title: "Clock-In / Clock-Out",
      key: "punch",
      render: (_: unknown, record: StaffAttendanceRecord) => (
        <div className="text-xs font-mono">
          <div className="text-emerald-700 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-600" /> In: {record.clockInTime}
          </div>
          <div className="text-slate-500">
            Out: {record.clockOutTime || "Currently On Shift"}
          </div>
        </div>
      ),
    },
    {
      title: "Duty Hours",
      dataIndex: "totalDutyHours",
      key: "totalDutyHours",
      render: (hrs: number) => <span className="font-mono text-xs font-semibold">{hrs} Hrs</span>,
    },
    {
      title: "Attendance Status",
      dataIndex: "status",
      key: "status",
      render: (s: StaffAttendanceRecord["status"]) => {
        if (s === "LATE") return <Tag color="orange" className="font-bold text-3xs">LATE ARRIVAL</Tag>;
        if (s === "ON_LEAVE") return <Tag color="purple" className="font-bold text-3xs">ON LEAVE</Tag>;
        return <Tag color="emerald" className="font-bold text-3xs">PRESENT ON DUTY</Tag>;
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
              <p className="text-xs font-semibold text-slate-500 uppercase">Staff Present Today</p>
              <h3 className="text-2xl font-bold text-teal-800 mt-1">
                {attendanceLogs.filter((a) => a.status === "PRESENT" || a.status === "LATE").length} Personnel
              </h3>
            </div>
            <Users className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Late Arrivals</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {attendanceLogs.filter((a) => a.status === "LATE").length} Staff
              </h3>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Biometric Verified</p>
              <h3 className="text-2xl font-bold text-purple-800 mt-1">100% Synced</h3>
            </div>
            <Fingerprint className="w-8 h-8 text-purple-500" />
          </div>
        </HmsCard>
      </div>

      {/* Control Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-teal-600" /> Staff Biometric Attendance & Duty Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor biometric clock-in timestamps, shift duty hours, late arrival flags, and attendance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search staff name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Record Clock-In
          </HmsButton>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={filteredLogs} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <Fingerprint className="w-5 h-5 text-teal-600" />
            <span>Biometric Shift Clock-In Punch</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <Form.Item label="Select Staff Member" name="userId" rules={[{ required: true }]}>
            <Select
              size="large"
              placeholder="Select staff user for biometric punch..."
              options={staffUsers.map((u) => ({
                value: u.id,
                label: `${u.fullName} (${u.employeeId}) — ${u.departmentName}`,
              }))}
            />
          </Form.Item>

          <Form.Item label="Punch Status" name="status" initialValue="PRESENT">
            <Select size="large">
              <Select.Option value="PRESENT">Present On Duty</Select.Option>
              <Select.Option value="LATE">Late Arrival</Select.Option>
              <Select.Option value="ON_LEAVE">On Approved Leave</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit">
              Save Clock-In Punch
            </HmsButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
