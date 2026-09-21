"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Form, Input, Select, DatePicker, message, Tooltip, Alert } from "antd";
import { Calendar, Clock, Plus, UserCheck, ShieldAlert, Search, RefreshCw, User, Phone, MapPin, AlertTriangle } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useRosterStore } from "../../_admin_stores/admin_roster_store";
import { RosterService } from "../../_admin_services/roster_service";
import { useStaffUserStore } from "../../_admin_stores/admin_user_store";
import { DepartmentService } from "../../_admin_services/department_service";
import { StaffShiftRoster, StandardShiftType, StaffRoleCategory } from "../../_admin_types/roster_types";

export const StaffRosterManager: React.FC = () => {
  const rosters = useRosterStore((state) => state.rosters);
  const resetToDefaults = useRosterStore((state) => state.resetToDefaults);
  const staffUsers = useStaffUserStore((state) => state.users);
  const departments = DepartmentService.getDepartments();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapShift1Id, setSwapShift1Id] = useState<string>("");
  const [swapShift2Id, setSwapShift2Id] = useState<string>("");

  const [form] = Form.useForm();

  const handleExecuteSwap = () => {
    if (!swapShift1Id || !swapShift2Id) {
      message.error("Please select two shifts to swap.");
      return;
    }
    if (swapShift1Id === swapShift2Id) {
      message.error("Please select two different shifts for exchange.");
      return;
    }
    try {
      RosterService.swapShift(swapShift1Id, swapShift2Id, "Admin Roster Manager");
      message.success("Shifts swapped successfully between staff members!");
      setSwapModalOpen(false);
      setSwapShift1Id("");
      setSwapShift2Id("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Shift swap failed";
      message.error(msg);
    }
  };

  const handleSimulatePunch = (shift: StaffShiftRoster) => {
    try {
      const nowTime = new Date().toTimeString().split(" ")[0].substring(0, 5);
      RosterService.recordAttendancePunch(
        shift.staffId,
        nowTime,
        `BIO-GATE-${Math.floor(10 + Math.random() * 90)}`,
        "Admin Biometric Simulator"
      );
      message.success(`Biometric clock-in recorded for ${shift.staffName} at ${nowTime}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Punch simulation failed";
      message.error(msg);
    }
  };

  const handleStaffSelect = (userId: string) => {
    setSelectedUserId(userId);
    setValidationError(null);

    const user = staffUsers.find((u) => u.id === userId);
    if (user) {
      // Pre-fill department, role category, contact details
      let roleCat: StaffRoleCategory = "DOCTOR";
      const cat = (user.roleCategory || "").toUpperCase();
      const roleNameUpper = (user.roleName || "").toUpperCase();
      const roleIdUpper = (user.roleId || "").toUpperCase();

      if (cat === "DOCTOR" || roleNameUpper.includes("DOCTOR") || roleIdUpper.includes("DOC")) roleCat = "DOCTOR";
      else if (cat === "NURSE" || roleNameUpper.includes("NURSE") || roleIdUpper.includes("NUR")) roleCat = "NURSE";
      else if (cat === "PHARMACIST" || roleNameUpper.includes("PHARM") || roleIdUpper.includes("PHARM")) roleCat = "PHARMACIST";
      else if (cat === "LAB_TECH" || roleNameUpper.includes("LAB") || roleIdUpper.includes("LAB")) roleCat = "LAB_TECH";
      else if (cat === "RECEPTIONIST" || roleNameUpper.includes("RECEPT") || roleIdUpper.includes("REC")) roleCat = "RECEPTIONIST";
      else if (cat === "FINANCE" || roleNameUpper.includes("BILLER") || roleNameUpper.includes("FINANCE") || roleIdUpper.includes("BIL")) roleCat = "FINANCE";
      else if (cat === "ADMINISTRATIVE" || roleNameUpper.includes("ADMIN") || roleIdUpper.includes("ADM")) roleCat = "ADMINISTRATIVE";
      else if (cat === "ALLIED_HEALTH") roleCat = "ALLIED_HEALTH";

      form.setFieldsValue({
        departmentId: user.departmentId,
        role: roleCat,
        contactNumber: user.phone || "+91 98200 00000",
      });

      // Immediate status check notification
      if (user.status !== "ACTIVE") {
        setValidationError(`Warning: User ${user.fullName} is currently ${user.status}. Shift assignment will be blocked.`);
      }
    }
  };

  const handleFinish = (values: Record<string, unknown>) => {
    setValidationError(null);

    const user = staffUsers.find((u) => u.id === values.userId);
    if (!user) {
      message.error("Selected staff user not found.");
      return;
    }

    const dept = departments.find((d) => d.id === values.departmentId) || {
      id: user.departmentId,
      code: user.departmentCode,
      name: user.departmentName,
    };

    const payload: Omit<StaffShiftRoster, "id"> = {
      userId: user.id,
      staffId: user.employeeId,
      staffName: user.fullName,
      role: (values.role as StaffRoleCategory) || "DOCTOR",
      departmentId: dept.id,
      departmentCode: dept.code,
      departmentName: dept.name,
      department: dept.name,
      shift: (values.shift as StandardShiftType) || "MORNING",
      shiftHours: (values.shiftHours as string) || "08:00 AM - 02:00 PM",
      assignedWardOrRoom: (values.assignedWardOrRoom as string) || "OPD Clinic Room 104",
      dutyDate: values.dutyDate
        ? (values.dutyDate as { format: (f: string) => string }).format("YYYY-MM-DD")
        : new Date().toISOString().split("T")[0],
      status: "ON_DUTY",
      approvalStatus: "APPROVED",
      contactNumber: (values.contactNumber as string) || user.phone || "+91 98200 00000",
    };

    try {
      RosterService.assignShift(payload, "Admin Roster Workspace");
      message.success(`Shift assigned for ${payload.staffName} (${payload.shift})`);
      setModalOpen(false);
      form.resetFields();
      setSelectedUserId("");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to assign shift";
      setValidationError(errMsg);
      message.error(errMsg);
    }
  };

  const handleStatusChange = (shiftId: string, newStatus: StaffShiftRoster["status"]) => {
    try {
      RosterService.modifyShift(shiftId, { status: newStatus }, "Admin Roster Manager");
      message.success(`Updated shift status to ${newStatus}`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update shift status";
      message.error(errMsg);
    }
  };

  const handleCancelShift = (shiftId: string) => {
    try {
      RosterService.cancelShift(shiftId, "Cancelled by Admin", "Admin Roster Manager");
      message.info("Shift cancelled successfully.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to cancel shift";
      message.error(errMsg);
    }
  };

  const filteredRosters = rosters.filter((r) => {
    const matchesRole = selectedRole === "ALL" || r.role === selectedRole;
    const matchesSearch =
      r.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.assignedWardOrRoom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.staffId.toLowerCase().includes(searchTerm.toLowerCase());
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
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="font-mono text-3xs font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded mr-1">
              {record.staffId}
            </span>
            {record.departmentName}
          </p>
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
        if (record.shift === "CUSTOM") color = "cyan";

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
            onChange={(val) => handleStatusChange(record.id, val)}
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
              placeholder="Search staff name, ID, department or ward..."
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
              { value: "RECEPTIONIST", label: "Front Desk & Reception" },
              { value: "FINANCE", label: "Billing & Finance" },
              { value: "ADMINISTRATIVE", label: "Hospital Admin & Ops" },
              { value: "ALLIED_HEALTH", label: "Allied Health" },
            ]}
            className="w-56"
          />
        </div>

        <div className="flex items-center gap-2">
          <HmsButton size="sm" variant="secondary" onClick={() => setSwapModalOpen(true)}>
            Swap Duty Shifts
          </HmsButton>
          <Tooltip title="Reset roster to standard shift defaults">
            <HmsButton size="sm" variant="ghost" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={resetToDefaults}>
              Reset
            </HmsButton>
          </Tooltip>
          <HmsButton variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => { setValidationError(null); setModalOpen(true); }}>
            Assign Shift Roster
          </HmsButton>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table columns={columns} dataSource={filteredRosters} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />
        </div>
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
        width={580}
      >
        {validationError && (
          <Alert
            type="error"
            message="Roster Assignment Validation Error"
            description={validationError}
            showIcon
            icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
            className="mb-4"
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <Form.Item label="Select Staff Member (Canonical Record)" name="userId" rules={[{ required: true, message: "Please select a staff member" }]}>
            <Select
              size="large"
              placeholder="Select active staff user..."
              onChange={handleStaffSelect}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
              }
              options={staffUsers.map((u) => ({
                value: u.id,
                label: `${u.fullName} (${u.employeeId}) — ${u.roleName} [${u.status}]`,
              }))}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Role Category" name="role" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="DOCTOR">Doctor / Consultant</Select.Option>
                <Select.Option value="NURSE">Nurse / Sister</Select.Option>
                <Select.Option value="PHARMACIST">Pharmacist</Select.Option>
                <Select.Option value="LAB_TECH">Lab Technician</Select.Option>
                <Select.Option value="RECEPTIONIST">Receptionist</Select.Option>
                <Select.Option value="FINANCE">Billing & Finance</Select.Option>
                <Select.Option value="ADMINISTRATIVE">Hospital Admin & Ops</Select.Option>
                <Select.Option value="ALLIED_HEALTH">Allied Health</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Department" name="departmentId" rules={[{ required: true }]}>
              <Select size="large">
                {departments.map((d) => (
                  <Select.Option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Standard Shift Type" name="shift" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="MORNING">Morning Shift</Select.Option>
                <Select.Option value="EVENING">Evening Shift</Select.Option>
                <Select.Option value="NIGHT">Night Shift</Select.Option>
                <Select.Option value="ON_CALL">24x7 On-Call Standby</Select.Option>
                <Select.Option value="CUSTOM">Custom Shift Routine</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Shift Hours" name="shiftHours">
              <Input placeholder="08:00 AM - 02:00 PM" size="large" />
            </Form.Item>
          </div>

          <Form.Item label="Assigned Station / OPD Clinic Room / Ward" name="assignedWardOrRoom" rules={[{ required: true }]}>
            <Input placeholder="OPD Clinic Room 104 or ICU Bed Station A" size="large" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Duty Date" name="dutyDate" rules={[{ required: true }]}>
              <DatePicker className="w-full" size="large" />
            </Form.Item>

            <Form.Item label="Contact Phone Number" name="contactNumber">
              <Input prefix={<Phone className="w-4 h-4 text-slate-400" />} placeholder="+91 98200 11223" size="large" />
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

      {/* Shift Swap Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700 font-bold">
            <span>Staff Shift Exchange & Swap Workflow</span>
          </div>
        }
        open={swapModalOpen}
        onCancel={() => setSwapModalOpen(false)}
        footer={null}
        width={540}
      >
        <div className="space-y-4 mt-2">
          <p className="text-xs text-slate-500">
            Select two scheduled staff shift assignments to exchange between staff members. Cross-module audit logs will record the shift swap event.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">First Staff Member Shift Assignment</label>
            <Select
              className="w-full"
              size="large"
              placeholder="Select first shift assignment..."
              value={swapShift1Id || undefined}
              onChange={(val) => setSwapShift1Id(val)}
              options={rosters.map((r) => ({
                value: r.id,
                label: `${r.staffName} (${r.role}) — ${r.shift} on ${r.dutyDate} [${r.departmentName}]`,
              }))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Second Staff Member Shift Assignment</label>
            <Select
              className="w-full"
              size="large"
              placeholder="Select second shift assignment..."
              value={swapShift2Id || undefined}
              onChange={(val) => setSwapShift2Id(val)}
              options={rosters
                .filter((r) => r.id !== swapShift1Id)
                .map((r) => ({
                  value: r.id,
                  label: `${r.staffName} (${r.role}) — ${r.shift} on ${r.dutyDate} [${r.departmentName}]`,
                }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setSwapModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" onClick={handleExecuteSwap}>
              Execute Shift Swap
            </HmsButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
