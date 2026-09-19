"use client";

import React, { useState } from "react";
import { Table, Tag, Switch, Modal, Form, Input, Select, Drawer, Progress, message, Tooltip, Alert } from "antd";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Key,
  Lock,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  TrendingUp,
  FileText,
  Calendar,
  Search,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useStaffUserStore } from "../../_admin_stores/admin_user_store";
import { StaffUserService } from "../../_admin_services/staff_user_service";
import { DepartmentService } from "../../_admin_services/department_service";
import { StaffUser, StaffUserStatus, StaffRoleCategory, UserDeleteSafetyResult } from "../../_admin_types/staff_user_types";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import { useRbacControlStore } from "@/app/(super-admin)/_super_admin_stores/rbac_control_store";

export const StaffUserTable: React.FC = () => {
  const users = useStaffUserStore((state) => state.users);
  const rbacRoles = useRbacControlStore((state) => state.getRolesForTenant("TNT-9014"));
  const globalTemplates = useRbacControlStore((state) => state.globalTemplates);
  const allRoles = [...globalTemplates, ...(rbacRoles || [])];

  const departments = DepartmentService.getDepartments();
  const licenseUsage = StaffUserService.getLicenseUsage();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<StaffUser | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetUserForSafety, setTargetUserForSafety] = useState<StaffUser | null>(null);
  const [safetyCheckResult, setSafetyCheckResult] = useState<UserDeleteSafetyResult | null>(null);

  const [form] = Form.useForm();

  const handleOpenAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      roleCategory: "DOCTOR",
      departmentId: departments[0]?.id || "dept-101",
      roleId: "TMPL-SR-DOC",
      status: "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
    });
    setModalOpen(true);
  };

  const handleOpenDetail = (user: StaffUser) => {
    setSelectedUserDetail(user);
    setDrawerOpen(true);
  };

  const handleOpenSafetyCheck = (user: StaffUser) => {
    setTargetUserForSafety(user);
    const safety = StaffUserService.checkDeleteOrDisableSafety(user.id);
    setSafetyCheckResult(safety);
    setDeleteModalOpen(true);
  };

  const handleFormFinish = (values: Record<string, unknown>) => {
    const deptId = (values.departmentId as string) || "dept-101";
    const dept = DepartmentService.getDepartmentById(deptId) || DepartmentService.resolveDepartment(deptId);
    const roleId = (values.roleId as string) || "TMPL-SR-DOC";
    const role = allRoles.find((r) => r.id === roleId);

    const payload = {
      staffId: (values.staffId as string) || `STF-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: (values.employeeId as string) || `EMP-9014-${Math.floor(100 + Math.random() * 900)}`,
      fullName: values.fullName as string,
      email: values.email as string,
      phone: (values.phone as string) || "+91 98200 00000",
      roleCategory: (values.roleCategory as StaffRoleCategory) || "DOCTOR",
      roleId,
      roleTemplateId: role?.parentTemplateId || roleId,
      roleName: role ? role.name : (values.roleName as string) || "Healthcare Specialist",
      departmentId: dept ? dept.id : deptId,
      departmentCode: dept ? dept.code : "GEN-01",
      departmentName: dept ? dept.name : "General Medicine",
      status: (values.status as StaffUserStatus) || "ACTIVE",
      licenseNumber: (values.licenseNumber as string) || undefined,
      joinedDate: (values.joinedDate as string) || new Date().toISOString().split("T")[0],
      effectivePermissions: role ? role.permissions : ["opd:queue:read"],
    };

    if (editingUser) {
      StaffUserService.updateStaffUser(editingUser.id, payload);
      message.success(`Staff account '${payload.fullName}' updated successfully.`);
      setModalOpen(false);
    } else {
      const res = StaffUserService.createStaffUser(payload);
      if (res.success) {
        message.success(`New staff user '${payload.fullName}' created and license seat provisioned.`);
        setModalOpen(false);
      } else {
        message.error(res.error || "Failed to create user.");
      }
    }
  };

  const handleToggleStatus = (user: StaffUser) => {
    const nextStatus: StaffUserStatus = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const res = StaffUserService.updateUserStatus(user.id, nextStatus);
    if (res.success) {
      message.success(`User '${user.fullName}' status changed to ${nextStatus}`);
    } else {
      message.error(res.error || "Failed to change user status.");
    }
  };

  const handleResetPassword = (user: StaffUser) => {
    const res = StaffUserService.resetUserPassword(user.id);
    Modal.info({
      title: "Temporary Password Issued",
      content: (
        <div className="space-y-2 mt-2">
          <p className="text-xs text-slate-600">A temporary single-use password has been generated for <strong>{user.fullName}</strong>:</p>
          <div className="p-3 bg-slate-900 text-teal-400 font-mono text-sm rounded-lg text-center tracking-wide">
            {res.temporaryPassword}
          </div>
          <p className="text-3xs text-slate-400 italic">User will be prompted to change password upon next login.</p>
        </div>
      ),
    });
  };

  const handleConfirmDisableOrDelete = () => {
    if (!targetUserForSafety) return;
    StaffUserService.updateUserStatus(targetUserForSafety.id, "DISABLED");
    message.warning(`Staff user '${targetUserForSafety.fullName}' disabled.`);
    setDeleteModalOpen(false);
  };

  const filteredUsers = StaffUserService.getStaffUsers({
    searchTerm,
    departmentId: selectedDeptFilter !== "ALL" ? selectedDeptFilter : undefined,
    status: selectedStatusFilter as StaffUserStatus | "ALL",
  });

  const columns = [
    {
      title: "Staff ID & Full Name",
      key: "name",
      render: (_: unknown, record: StaffUser) => (
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenDetail(record)}
              className="font-bold text-slate-900 hover:text-teal-600 transition-colors text-left"
            >
              {record.fullName}
            </button>
            <span className="font-mono text-3xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
              {record.staffId}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>{record.email}</span>
            {record.licenseNumber && <span className="font-mono text-3xs text-teal-700 font-semibold">Lic: {record.licenseNumber}</span>}
          </p>
        </div>
      ),
    },
    {
      title: "RBAC Role & Category",
      key: "role",
      render: (_: unknown, record: StaffUser) => (
        <div>
          <span className="text-xs font-bold text-slate-800 block">{record.roleName}</span>
          <Tag color="purple" className="!text-3xs mt-0.5">{record.roleCategory}</Tag>
        </div>
      ),
    },
    {
      title: "Department",
      key: "department",
      render: (_: unknown, record: StaffUser) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-slate-800 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-teal-600" /> {record.departmentName}
          </div>
          <span className="font-mono text-3xs text-slate-400">Code: {record.departmentCode}</span>
        </div>
      ),
    },
    {
      title: "Contact & Joined",
      key: "contact",
      render: (_: unknown, record: StaffUser) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" /> {record.phone}
          </div>
          <div className="text-3xs text-slate-400 font-mono">Joined: {record.joinedDate}</div>
        </div>
      ),
    },
    {
      title: "Lifecycle Status",
      dataIndex: "status",
      key: "status",
      render: (s: StaffUserStatus, record: StaffUser) => {
        let color = "emerald";
        if (s === "INVITED") color = "blue";
        if (s === "SUSPENDED") color = "amber";
        if (s === "LOCKED") color = "orange";
        if (s === "DISABLED") color = "slate";
        if (s === "TERMINATED") color = "rose";

        return (
          <button onClick={() => handleToggleStatus(record)} className="cursor-pointer">
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
      render: (_: unknown, record: StaffUser) => (
        <div className="flex items-center gap-1.5">
          <Tooltip title="View User Details & Claims Drawer">
            <HmsButton size="sm" variant="ghost" icon={<Eye className="w-3.5 h-3.5 text-teal-600" />} onClick={() => handleOpenDetail(record)} />
          </Tooltip>

          <Tooltip title="Edit Staff Roles & Department">
            <HmsButton size="sm" variant="secondary" icon={<Edit className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(record)} />
          </Tooltip>

          <Tooltip title="Reset Password (Generates Temp Key)">
            <HmsButton size="sm" variant="ghost" icon={<Key className="w-3.5 h-3.5 text-amber-600" />} onClick={() => handleResetPassword(record)} />
          </Tooltip>

          <Tooltip title="Disable Account (Safety Guard Enabled)">
            <HmsButton size="sm" variant="ghost" icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />} onClick={() => handleOpenSafetyCheck(record)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  const userAuditLogs = selectedUserDetail
    ? PlatformAuditService.getAuditLogs().filter(
        (l) => l.entity.includes(selectedUserDetail.fullName) || l.entity.includes(selectedUserDetail.staffId) || (l.details && l.details.includes(selectedUserDetail.staffId))
      )
    : [];

  return (
    <div className="space-y-6">
      {/* 7. License Dashboard Metrics Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500 bg-gradient-to-br from-white to-teal-50/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Licensed User Seats</p>
              <h3 className="text-2xl font-bold text-teal-800 mt-1">{licenseUsage.licensedSeats} Seats</h3>
              <p className="text-3xs text-emerald-600 font-semibold mt-0.5">Tenant Enterprise Plan</p>
            </div>
            <Users className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Staff Accounts</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">{licenseUsage.activeUsers} Active</h3>
              <p className="text-3xs text-slate-500 mt-0.5">Currently On-Roll & Logged In</p>
            </div>
            <UserCheck className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Available License Seats</p>
              <h3 className="text-2xl font-bold text-purple-700 mt-1">{licenseUsage.availableSeats} Seats</h3>
              <p className="text-3xs text-purple-600 font-semibold mt-0.5">Ready for Onboarding</p>
            </div>
            <UserPlus className="w-8 h-8 text-purple-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">License Utilization Rate</p>
              <h3 className="text-2xl font-bold text-blue-800 mt-1">{licenseUsage.utilizationPercent}%</h3>
              <Progress percent={licenseUsage.utilizationPercent} size="small" strokeColor="#2563eb" showInfo={false} />
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </HmsCard>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search staff ID, name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={selectedDeptFilter}
            onChange={(val) => setSelectedDeptFilter(val)}
            className="w-48"
          >
            <Select.Option value="ALL">All Departments</Select.Option>
            {departments.map((d) => (
              <Select.Option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </Select.Option>
            ))}
          </Select>

          <Select
            value={selectedStatusFilter}
            onChange={(val) => setSelectedStatusFilter(val)}
            className="w-40"
          >
            <Select.Option value="ALL">All Statuses</Select.Option>
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="INVITED">Invited</Select.Option>
            <Select.Option value="SUSPENDED">Suspended</Select.Option>
            <Select.Option value="LOCKED">Locked</Select.Option>
            <Select.Option value="DISABLED">Disabled</Select.Option>
            <Select.Option value="TERMINATED">Terminated</Select.Option>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Reset staff user database to system defaults">
            <HmsButton size="sm" variant="ghost" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => StaffUserService.resetToDefaults()}>
              Reset
            </HmsButton>
          </Tooltip>
          <HmsButton variant="emerald" icon={<UserPlus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Add Staff User
          </HmsButton>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table columns={columns} dataSource={filteredUsers} rowKey="id" pagination={{ pageSize: 7 }} scroll={{ x: "max-content" }} />
        </div>
      </div>

      {/* Create / Edit Staff User Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>{editingUser ? "Edit Staff User & RBAC Roles" : "Provision New Staff User Account"}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={650}
      >
        <Form form={form} layout="vertical" onFinish={handleFormFinish} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Staff ID" name="staffId" rules={[{ required: true }]}>
              <Input placeholder="e.g. DOC-101" />
            </Form.Item>

            <Form.Item label="Employee Payroll ID" name="employeeId" rules={[{ required: true }]}>
              <Input placeholder="e.g. EMP-9014-101" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Full Name & Title" name="fullName" rules={[{ required: true }]}>
              <Input placeholder="e.g. Dr. Rajesh Sharma" />
            </Form.Item>

            <Form.Item label="Official Email Address" name="email" rules={[{ required: true, type: "email" }]}>
              <Input placeholder="rajesh.sharma@apollo.hms.com" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Contact Phone Number" name="phone" rules={[{ required: true }]}>
              <Input placeholder="+91 98200 11223" />
            </Form.Item>

            <Form.Item label="Medical / Council License #" name="licenseNumber">
              <Input placeholder="MCI-2012-44912" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Canonical Department Linkage" name="departmentId" rules={[{ required: true }]}>
              <Select placeholder="Select department">
                {departments.map((d) => (
                  <Select.Option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Staff Role Category" name="roleCategory" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="DOCTOR">DOCTOR / Senior Physician</Select.Option>
                <Select.Option value="NURSE">NURSE / Ward Sister</Select.Option>
                <Select.Option value="RECEPTIONIST">RECEPTIONIST / Front Desk</Select.Option>
                <Select.Option value="PHARMACIST">PHARMACIST / Store</Select.Option>
                <Select.Option value="LAB_TECH">LAB_TECH / Diagnostics</Select.Option>
                <Select.Option value="BILLER">BILLER / Accounts</Select.Option>
                <Select.Option value="ADMIN">ADMIN / Operations</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Canonical RBAC Role Assignment" name="roleId" rules={[{ required: true }]}>
              <Select placeholder="Select RBAC Role">
                {allRoles.map((r) => (
                  <Select.Option key={r.id} value={r.id}>
                    {r.name} ({r.category})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Account Lifecycle Status" name="status" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="ACTIVE">Active (Consumes 1 Seat)</Select.Option>
                <Select.Option value="INVITED">Invited (Pending Confirmation)</Select.Option>
                <Select.Option value="SUSPENDED">Suspended</Select.Option>
                <Select.Option value="LOCKED">Locked</Select.Option>
                <Select.Option value="DISABLED">Disabled</Select.Option>
                <Select.Option value="TERMINATED">Terminated</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit">
              {editingUser ? "Save User Account" : "Provision Staff Account"}
            </HmsButton>
          </div>
        </Form>
      </Modal>

      {/* 5. Slide-over User Details Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <span>Staff Account Specification & Claims</span>
          </div>
        }
        width={500}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedUserDetail && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base">{selectedUserDetail.fullName}</span>
                <Tag color="emerald" className="!font-bold">{selectedUserDetail.status}</Tag>
              </div>
              <p className="text-xs text-slate-300 font-mono">Staff ID: {selectedUserDetail.staffId} | Employee: {selectedUserDetail.employeeId}</p>
              <div className="text-xs text-slate-400 flex items-center gap-3 pt-1 border-t border-slate-800">
                <span>Joined: {selectedUserDetail.joinedDate}</span>
                <span>Last Login: {selectedUserDetail.lastLogin || "N/A"}</span>
              </div>
            </div>

            {/* Department Linkage Card */}
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200/60 space-y-2">
              <h4 className="font-bold text-teal-900 text-xs flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-600" /> Department Master Binding
              </h4>
              <div className="text-xs text-teal-950">
                <p><strong>Department:</strong> {selectedUserDetail.departmentName}</p>
                <p className="font-mono text-3xs text-teal-700">Code: {selectedUserDetail.departmentCode} | ID: {selectedUserDetail.departmentId}</p>
              </div>
            </div>

            {/* RBAC Role & Claims Card */}
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200/60 space-y-2">
              <h4 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" /> RBAC Role & Granted Claims ({selectedUserDetail.effectivePermissions.length})
              </h4>
              <p className="text-xs text-purple-950 font-bold">{selectedUserDetail.roleName} (ID: {selectedUserDetail.roleId})</p>
              <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pt-1">
                {selectedUserDetail.effectivePermissions.map((claim) => (
                  <Tag key={claim} color="purple" className="text-3xs font-mono">{claim}</Tag>
                ))}
              </div>
            </div>

            {/* Audit History */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600" /> Audit Log History ({userAuditLogs.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {userAuditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-3xs text-slate-500 font-mono">
                      <span>{log.timestamp}</span>
                      <Tag color="blue" className="!text-3xs">{log.category}</Tag>
                    </div>
                    <p className="font-semibold text-slate-800">{log.action}</p>
                    <span className="text-3xs text-slate-500">By: {log.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* 6. Delete / Disable Safety Check Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Staff Account Protection Guard</span>
          </div>
        }
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        footer={null}
        width={540}
      >
        {targetUserForSafety && (
          <div className="space-y-4 mt-3">
            <p className="text-xs text-slate-700">
              Evaluating cross-module dependencies for staff member <strong>{targetUserForSafety.fullName} ({targetUserForSafety.staffId})</strong>:
            </p>

            {safetyCheckResult?.canDeleteOrDisable ? (
              <Alert
                type="info"
                showIcon
                message="No Active Dependencies Found"
                description="This staff member is not currently assigned to active shift rosters or HOD duties. Disabling or removing is permitted."
              />
            ) : (
              <Alert
                type="warning"
                showIcon
                message="Operation Blocked due to Active Module References"
                description={
                  <div className="space-y-2 mt-1">
                    <p className="text-xs text-slate-700 font-medium">The following active dependencies prevent account disabling/removal:</p>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                      {safetyCheckResult?.activeReferences.map((ref, i) => (
                        <li key={i}>{ref.description}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-500 italic mt-2">
                      Please reassign shift rosters and HOD duties before disabling this staff account.
                    </p>
                  </div>
                }
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <HmsButton variant="secondary" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </HmsButton>

              {safetyCheckResult?.canDeleteOrDisable && (
                <HmsButton variant="danger" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleConfirmDisableOrDelete}>
                  Disable Staff Account
                </HmsButton>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
