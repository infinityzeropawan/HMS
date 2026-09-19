"use client";

import React, { useState, useEffect } from "react";
import { Drawer, Modal, Form, Input, Select, InputNumber, Tag, Progress, Timeline, message, Spin } from "antd";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  HardDrive,
  Users,
  Activity,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Tenant, TenantUsageMetrics, TenantAuditLog } from "../../_super_admin_types/tenant_management";
import { TenantApiService } from "../../_super_admin_services/tenant_api_service";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

// --- 1. View Tenant Drawer ---
export const ViewTenantDrawer: React.FC<{
  tenant: Tenant | null;
  open: boolean;
  onClose: () => void;
  onOpenEdit: (t: Tenant) => void;
  onOpenSub: (t: Tenant) => void;
}> = ({ tenant, open, onClose, onOpenEdit, onOpenSub }) => {
  if (!tenant) return null;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          <span>Tenant Profile - {tenant.hospitalName}</span>
        </div>
      }
      width={640}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <HmsButton variant="secondary" onClick={() => onOpenEdit(tenant)}>
            Edit Tenant Details
          </HmsButton>
          <HmsButton type="primary" variant="emerald" onClick={() => onOpenSub(tenant)}>
            Manage Subscription
          </HmsButton>
        </div>
      }
    >
      <div className="space-y-6 text-slate-700">
        {/* Status Header Banner */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900">{tenant.id}</span>
              <Tag color={tenant.status === "Active" ? "emerald" : tenant.status === "Trial" ? "blue" : "red"}>
                {tenant.status}
              </Tag>
              <Tag color={tenant.healthStatus === "Healthy" ? "green" : tenant.healthStatus === "Warning" ? "gold" : "volcano"}>
                {tenant.healthStatus} SLA
              </Tag>
            </div>
            <p className="text-xs text-slate-500 mt-1">{tenant.subdomain}.hms.com</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase">SLA Uptime</span>
            <span className="text-lg font-bold text-teal-600">{tenant.slaUptime}%</span>
          </div>
        </div>

        {/* General Info Grid */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hospital Credentials</h4>
          <div className="grid grid-cols-2 gap-3 text-sm bg-white p-3.5 rounded-lg border border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block">Hospital Type</span>
              <span className="font-medium text-slate-800">{tenant.hospitalType}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Location</span>
              <span className="font-medium text-slate-800">{tenant.city}, {tenant.state}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">GSTIN</span>
              <span className="font-mono text-xs text-slate-700">{tenant.gstin}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Joined Date</span>
              <span className="font-medium text-slate-800">{tenant.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Administration Contact</h4>
          <div className="space-y-2 bg-white p-3.5 rounded-lg border border-slate-100 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{tenant.adminEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{tenant.adminPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <a href={`https://${tenant.subdomain}.hms.com`} target="_blank" rel="noreferrer" className="text-teal-600 underline">
                https://{tenant.subdomain}.hms.com
              </a>
            </div>
          </div>
        </div>

        {/* Subscription & Quotas */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subscription & Allocation Quotas</h4>
          <div className="grid grid-cols-3 gap-3 text-center bg-teal-50/50 p-4 rounded-xl border border-teal-100">
            <div>
              <Users className="w-5 h-5 text-teal-600 mx-auto mb-1" />
              <span className="text-xs text-slate-500 block">User Seats</span>
              <span className="font-bold text-slate-900">{tenant.activeUsers} / {tenant.maxUsers}</span>
            </div>
            <div>
              <Building2 className="w-5 h-5 text-teal-600 mx-auto mb-1" />
              <span className="text-xs text-slate-500 block">Bed Capacity</span>
              <span className="font-bold text-slate-900">{tenant.bedCount} Beds</span>
            </div>
            <div>
              <HardDrive className="w-5 h-5 text-teal-600 mx-auto mb-1" />
              <span className="text-xs text-slate-500 block">Storage Quota</span>
              <span className="font-bold text-slate-900">{tenant.storageUsedGB} / {tenant.maxStorageGB} GB</span>
            </div>
          </div>
        </div>

        {/* Enabled Modules */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Enabled Enterprise Modules</h4>
          <div className="flex flex-wrap gap-1.5">
            {tenant.enabledModules.map((mod) => (
              <Tag key={mod} color="teal" className="!px-2.5 !py-1 font-semibold">
                ✓ {mod}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

// --- 2. Edit Tenant Modal ---
export const EditTenantModal: React.FC<{
  tenant: Tenant | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Tenant>) => void;
}> = ({ tenant, open, onClose, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (tenant) {
      form.setFieldsValue({
        hospitalName: tenant.hospitalName,
        hospitalType: tenant.hospitalType,
        city: tenant.city,
        state: tenant.state,
        adminEmail: tenant.adminEmail,
        adminPhone: tenant.adminPhone,
        maxUsers: tenant.maxUsers,
        bedCount: tenant.bedCount,
      });
    }
  }, [tenant, form]);

  const handleFinish = (values: Record<string, unknown>) => {
    onSave(values as Partial<Tenant>);
    message.success("Tenant information updated successfully.");
    onClose();
  };

  return (
    <Modal
      title="Edit Hospital Tenant Information"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Save Changes"
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
        <Form.Item label="Hospital Name" name="hospitalName" rules={[{ required: true }]}>
          <Input prefix={<Building2 className="w-4 h-4 text-slate-400" />} />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Hospital Type" name="hospitalType" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Multi-Specialty">Multi-Specialty</Select.Option>
              <Select.Option value="Super-Specialty">Super-Specialty</Select.Option>
              <Select.Option value="Single-Specialty">Single-Specialty</Select.Option>
              <Select.Option value="General Hospital">General Hospital</Select.Option>
              <Select.Option value="Clinic Chain">Clinic Chain</Select.Option>
              <Select.Option value="Teaching Hospital">Teaching Hospital</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Admin Email" name="adminEmail" rules={[{ required: true, type: "email" }]}>
            <Input prefix={<Mail className="w-4 h-4 text-slate-400" />} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="City" name="city" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="State" name="state" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Max Staff Seat Quota" name="maxUsers" rules={[{ required: true }]}>
            <InputNumber min={5} max={5000} className="w-full" />
          </Form.Item>
          <Form.Item label="Bed Capacity" name="bedCount" rules={[{ required: true }]}>
            <InputNumber min={0} max={5000} className="w-full" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

// --- 3. Manage Subscription Modal ---
export const ManageSubscriptionModal: React.FC<{
  tenant: Tenant | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Tenant>) => void;
}> = ({ tenant, open, onClose, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (tenant) {
      form.setFieldsValue({
        subscriptionPlan: tenant.subscriptionPlan,
        status: tenant.status,
        expiryDate: tenant.expiryDate,
        maxUsers: tenant.maxUsers,
        maxStorageGB: tenant.maxStorageGB,
      });
    }
  }, [tenant, form]);

  const handleFinish = (values: Record<string, unknown>) => {
    onSave(values as Partial<Tenant>);
    message.success("Subscription plan updated successfully.");
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-teal-600" />
          <span>Manage Subscription & Quotas - {tenant?.id}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Apply Subscription Update"
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
        <Form.Item label="Subscription Tier" name="subscriptionPlan" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="Enterprise">Enterprise Tier (Full Suite)</Select.Option>
            <Select.Option value="Super Specialty">Super Specialty Tier</Select.Option>
            <Select.Option value="Professional">Professional Tier (OPD + IPD)</Select.Option>
            <Select.Option value="Basic">Basic Tier (OPD Only)</Select.Option>
            <Select.Option value="Custom">Custom Dedicated Cluster</Select.Option>
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Governance Status" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Trial">Trial</Select.Option>
              <Select.Option value="Suspended">Suspended</Select.Option>
              <Select.Option value="Expired">Expired</Select.Option>
              <Select.Option value="Pending Verification">Pending Verification</Select.Option>
              <Select.Option value="Archived">Archived</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Expiry Date (YYYY-MM-DD)" name="expiryDate" rules={[{ required: true }]}>
            <Input prefix={<Calendar className="w-4 h-4 text-slate-400" />} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Staff Seat Quota" name="maxUsers" rules={[{ required: true }]}>
            <InputNumber min={5} max={10000} className="w-full" />
          </Form.Item>

          <Form.Item label="Storage Quota (GB)" name="maxStorageGB" rules={[{ required: true }]}>
            <InputNumber min={50} max={50000} className="w-full" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

// --- 4. View Usage Modal ---
export const TenantUsageModal: React.FC<{
  tenant: Tenant | null;
  open: boolean;
  onClose: () => void;
}> = ({ tenant, open, onClose }) => {
  const [metrics, setMetrics] = useState<TenantUsageMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenant && open) {
      setLoading(true);
      TenantApiService.fetchTenantUsage(tenant.id)
        .then((m) => setMetrics(m))
        .finally(() => setLoading(false));
    }
  }, [tenant, open]);

  if (!tenant) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          <span>Real-time Resource Usage & Analytics - {tenant.hospitalName}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <HmsButton variant="secondary" onClick={onClose}>
          Close Metering
        </HmsButton>
      }
      width={640}
    >
      {loading || !metrics ? (
        <div className="py-12 text-center">
          <Spin size="large" />
          <p className="text-xs text-slate-500 mt-2">Loading live telemetry meters...</p>
        </div>
      ) : (
        <div className="space-y-6 my-2">
          {/* User Seats Progress */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600" /> Active Staff Licenses
              </span>
              <span className="text-xs font-bold text-slate-900">
                {metrics.activeUserSeats.used} / {metrics.activeUserSeats.total} Seats
              </span>
            </div>
            <Progress
              percent={Math.round((metrics.activeUserSeats.used / metrics.activeUserSeats.total) * 100)}
              strokeColor="#0d9488"
              status="active"
            />
          </div>

          {/* Storage Meter */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-blue-600" /> EMR Storage & DICOM PACS
              </span>
              <span className="text-xs font-bold text-slate-900">
                {metrics.storageUsage.usedGB} / {metrics.storageUsage.totalGB} GB
              </span>
            </div>
            <Progress
              percent={Math.round((metrics.storageUsage.usedGB / metrics.storageUsage.totalGB) * 100)}
              strokeColor="#2563eb"
            />
          </div>

          {/* Key Activity Counters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-teal-50/60 p-3.5 rounded-lg border border-teal-100">
              <span className="text-xs text-slate-500 block">Monthly OPD & IPD Consultations</span>
              <span className="text-xl font-bold text-teal-800">{metrics.monthlyConsultations.toLocaleString()}</span>
            </div>

            <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-100">
              <span className="text-xs text-slate-500 block">Lab & Radiology Orders</span>
              <span className="text-xl font-bold text-emerald-800">{metrics.monthlyLabOrders.toLocaleString()}</span>
            </div>

            <div className="bg-indigo-50/60 p-3.5 rounded-lg border border-indigo-100">
              <span className="text-xs text-slate-500 block">API Throughput</span>
              <span className="text-base font-bold text-indigo-800">{metrics.apiThroughput}</span>
            </div>

            <div className="bg-purple-50/60 p-3.5 rounded-lg border border-purple-100">
              <span className="text-xs text-slate-500 block">Isolated DB Footprint</span>
              <span className="text-base font-bold text-purple-800">{metrics.dbSizeBytes}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

// --- 5. View Audit Logs Modal ---
export const TenantAuditLogsModal: React.FC<{
  tenant: Tenant | null;
  open: boolean;
  onClose: () => void;
}> = ({ tenant, open, onClose }) => {
  const [logs, setLogs] = useState<TenantAuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenant && open) {
      setLoading(true);
      TenantApiService.fetchTenantAuditLogs(tenant.id)
        .then((l) => setLogs(l))
        .finally(() => setLoading(false));
    }
  }, [tenant, open]);

  if (!tenant) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          <span>Security & Governance Audit Trail - {tenant.id}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <HmsButton variant="secondary" onClick={onClose}>
          Close Trail
        </HmsButton>
      }
      width={640}
    >
      {loading ? (
        <div className="py-12 text-center">
          <Spin size="large" />
          <p className="text-xs text-slate-500 mt-2">Loading audit events...</p>
        </div>
      ) : (
        <div className="my-4 max-h-96 overflow-y-auto pr-2">
          <Timeline
            items={logs.map((log) => ({
              color: log.category === "SECURITY" ? "red" : log.category === "LICENSE" ? "green" : "blue",
              children: (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{log.action}</span>
                    <span className="text-[11px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-600">{log.details}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Actor: {log.performedBy}</span>
                    <span>IP: {log.ipAddress}</span>
                  </div>
                </div>
              ),
            }))}
          />
        </div>
      )}
    </Modal>
  );
};
