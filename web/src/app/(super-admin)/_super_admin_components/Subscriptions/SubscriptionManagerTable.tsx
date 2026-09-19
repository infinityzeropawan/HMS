"use client";

import React, { useState } from "react";
import { Table, Tag, Dropdown, MenuProps, Modal, Alert, Button, Empty, Tooltip } from "antd";
import {
  MoreVertical,
  Eye,
  Edit3,
  CreditCard,
  SlidersHorizontal,
  Activity,
  FileText,
  ShieldAlert,
  Archive,
  AlertCircle,
  Copy,
  Check,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Tenant, TenantStatus, TenantHealthStatus } from "../../_super_admin_types/tenant_management";
import { useTenantManagement } from "../../_super_admin_hooks/useTenantManagement";
import { TenantStatsCards } from "./TenantStatsCards";
import { TenantFilterToolbar } from "./TenantFilterToolbar";
import {
  ViewTenantDrawer,
  EditTenantModal,
  ManageSubscriptionModal,
  TenantUsageModal,
  TenantAuditLogsModal,
} from "./TenantModals";
import { SuspendTenantModal } from "./SuspendTenantModal";
import { RestoreTenantModal } from "./RestoreTenantModal";
import { HospitalOnboardingWizard } from "../TenantOnboarding/HospitalOnboardingWizard";
import { HospitalFacilityControlManager } from "../FacilityControl/HospitalFacilityControlManager";
import { TenantApiService } from "../../_super_admin_services/tenant_api_service";

import Link from "next/link";

export const SubscriptionManagerTable: React.FC = () => {
  const {
    tenants,
    total,
    page,
    pageSize,
    loading,
    error,
    stats,
    filters,
    sort,
    selectedRowKeys,
    activeTenant,
    viewDrawerOpen,
    editModalOpen,
    subModalOpen,
    usageModalOpen,
    auditModalOpen,
    facilityModalOpen,
    onboardingModalOpen,
    setPage,
    setPageSize,
    setSelectedRowKeys,
    updateFilter,
    resetFilters,
    handleSortChange,
    handleBulkAction,
    loadTenants,
    openViewDrawer,
    openEditModal,
    openSubModal,
    openUsageModal,
    openAuditModal,
    openFacilityModal,
    handleQuickStatusChange,
    setViewDrawerOpen,
    setEditModalOpen,
    setSubModalOpen,
    setUsageModalOpen,
    setAuditModalOpen,
    setFacilityModalOpen,
    setOnboardingModalOpen,
  } = useTenantManagement();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [targetSuspendTenant, setTargetSuspendTenant] = useState<Tenant | null>(null);

  const openSuspendModal = (t: Tenant) => {
    setTargetSuspendTenant(t);
    setSuspendModalOpen(true);
  };

  const openRestoreModal = (t: Tenant) => {
    setTargetSuspendTenant(t);
    setRestoreModalOpen(true);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Status Badge Styling
  const renderStatusBadge = (status: TenantStatus) => {
    switch (status) {
      case "Active":
        return <Tag color="emerald" className="!px-2 !py-0.5 font-semibold">Active</Tag>;
      case "Trial":
        return <Tag color="processing" className="!px-2 !py-0.5 font-semibold">Trial</Tag>;
      case "Suspended":
        return <Tag color="error" className="!px-2 !py-0.5 font-semibold">Suspended</Tag>;
      case "Expired":
        return <Tag color="warning" className="!px-2 !py-0.5 font-semibold">Expired</Tag>;
      case "Pending Verification":
        return <Tag color="purple" className="!px-2 !py-0.5 font-semibold">Pending Verification</Tag>;
      case "Archived":
        return <Tag color="default" className="!px-2 !py-0.5 font-semibold">Archived</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Health Status Badge Styling
  const renderHealthBadge = (health: TenantHealthStatus) => {
    switch (health) {
      case "Healthy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Healthy
          </span>
        );
      case "Warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Warning
          </span>
        );
      case "Critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Critical
          </span>
        );
      case "Offline":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Offline
          </span>
        );
      default:
        return <Tag>{health}</Tag>;
    }
  };

  // Column definitions (14 required columns)
  const columns = [
    {
      title: "Tenant ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id: string) => (
        <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-800">
          <span>{id}</span>
          <button
            onClick={() => handleCopyId(id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            title="Copy Tenant ID"
          >
            {copiedId === id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      ),
    },
    {
      title: (
        <span
          className="cursor-pointer flex items-center gap-1 hover:text-teal-600"
          onClick={() => handleSortChange("hospitalName")}
        >
          Hospital Name {sort.field === "hospitalName" && (sort.order === "asc" ? "↑" : "↓")}
        </span>
      ),
      dataIndex: "hospitalName",
      key: "hospitalName",
      minWidth: 200,
      render: (name: string, record: Tenant) => (
        <Link href={`/tenants/${record.id}`} className="group block">
          <div className="font-semibold text-slate-900 group-hover:text-teal-600 flex items-center gap-1.5 transition-colors">
            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{name}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{record.subdomain}.hms.com</div>
        </Link>
      ),
    },
    {
      title: "Hospital Type",
      dataIndex: "hospitalType",
      key: "hospitalType",
      width: 140,
      render: (type: string) => <span className="text-xs text-slate-700">{type}</span>,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      width: 110,
      render: (city: string) => <span className="text-xs font-medium text-slate-700">{city}</span>,
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      width: 120,
      render: (state: string) => <span className="text-xs text-slate-600">{state}</span>,
    },
    {
      title: "Subscription Plan",
      dataIndex: "subscriptionPlan",
      key: "subscriptionPlan",
      width: 140,
      render: (plan: string) => (
        <Tag color={plan === "Enterprise" ? "purple" : plan === "Super Specialty" ? "cyan" : "blue"}>
          {plan}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: TenantStatus) => renderStatusBadge(status),
    },
    {
      title: (
        <span
          className="cursor-pointer flex items-center gap-1 hover:text-teal-600"
          onClick={() => handleSortChange("activeUsers")}
        >
          Active Users {sort.field === "activeUsers" && (sort.order === "asc" ? "↑" : "↓")}
        </span>
      ),
      key: "activeUsers",
      width: 120,
      render: (_: unknown, r: Tenant) => (
        <span className="text-xs font-semibold text-slate-800">
          {r.activeUsers} <span className="text-slate-400 font-normal">/ {r.maxUsers}</span>
        </span>
      ),
    },
    {
      title: (
        <span
          className="cursor-pointer flex items-center gap-1 hover:text-teal-600"
          onClick={() => handleSortChange("bedCount")}
        >
          Bed Count {sort.field === "bedCount" && (sort.order === "asc" ? "↑" : "↓")}
        </span>
      ),
      dataIndex: "bedCount",
      key: "bedCount",
      width: 100,
      render: (beds: number) => <span className="text-xs font-medium text-slate-700">{beds} Beds</span>,
    },
    {
      title: (
        <span
          className="cursor-pointer flex items-center gap-1 hover:text-teal-600"
          onClick={() => handleSortChange("storageUsedGB")}
        >
          Storage Used {sort.field === "storageUsedGB" && (sort.order === "asc" ? "↑" : "↓")}
        </span>
      ),
      key: "storageUsedGB",
      width: 120,
      render: (_: unknown, r: Tenant) => (
        <span className="text-xs text-slate-700 font-mono">
          {r.storageUsedGB} GB <span className="text-slate-400">/ {r.maxStorageGB}</span>
        </span>
      ),
    },
    {
      title: (
        <span
          className="cursor-pointer flex items-center gap-1 hover:text-teal-600"
          onClick={() => handleSortChange("lastActivity")}
        >
          Last Activity {sort.field === "lastActivity" && (sort.order === "asc" ? "↑" : "↓")}
        </span>
      ),
      dataIndex: "lastActivity",
      key: "lastActivity",
      width: 120,
      render: (act: string) => <span className="text-xs text-slate-500">{act}</span>,
    },
    {
      title: (
        <span
          className="cursor-pointer flex items-center gap-1 hover:text-teal-600"
          onClick={() => handleSortChange("expiryDate")}
        >
          Expiry Date {sort.field === "expiryDate" && (sort.order === "asc" ? "↑" : "↓")}
        </span>
      ),
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 110,
      render: (date: string) => {
        const isExpiringSoon = new Date(date).getTime() - new Date().getTime() < 30 * 24 * 3600 * 1000;
        return (
          <span className={`text-xs font-mono ${isExpiringSoon ? "text-amber-600 font-bold" : "text-slate-700"}`}>
            {date}
          </span>
        );
      },
    },
    {
      title: "Health Status",
      dataIndex: "healthStatus",
      key: "healthStatus",
      width: 120,
      render: (health: TenantHealthStatus) => renderHealthBadge(health),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 90,
      render: (_: unknown, record: Tenant) => {
        const actionItems: MenuProps["items"] = [
          {
            key: "view",
            icon: <Eye className="w-4 h-4 text-teal-600" />,
            label: "View Tenant Profile",
            onClick: () => openViewDrawer(record),
          },
          {
            key: "edit",
            icon: <Edit3 className="w-4 h-4 text-blue-600" />,
            label: "Edit Tenant Details",
            onClick: () => openEditModal(record),
          },
          {
            key: "subscription",
            icon: <CreditCard className="w-4 h-4 text-purple-600" />,
            label: "Manage Subscription",
            onClick: () => openSubModal(record),
          },
          {
            key: "features",
            icon: <SlidersHorizontal className="w-4 h-4 text-amber-600" />,
            label: "Manage Features & Services",
            onClick: () => openFacilityModal(record),
          },
          {
            key: "usage",
            icon: <Activity className="w-4 h-4 text-indigo-600" />,
            label: "View Telemetry & Usage",
            onClick: () => openUsageModal(record),
          },
          {
            key: "audit",
            icon: <FileText className="w-4 h-4 text-slate-600" />,
            label: "View Governance Audit Logs",
            onClick: () => openAuditModal(record),
          },
          { type: "divider" },
          {
            key: "suspend",
            icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
            label: record.status === "Suspended" ? "Restore Tenant Access" : "Suspend Tenant (Multi-Step Lockout)",
            onClick: () =>
              record.status === "Suspended" ? openRestoreModal(record) : openSuspendModal(record),
          },
          {
            key: "archive",
            icon: <Archive className="w-4 h-4 text-slate-400" />,
            label: "Archive Tenant Record",
            onClick: () => handleQuickStatusChange(record.id, "Archived"),
          },
        ];

        return (
          <Dropdown menu={{ items: actionItems }} trigger={["click"]} placement="bottomRight">
            <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  const handleUpdateTenantState = async (updates: Partial<Tenant>) => {
    if (!activeTenant) return;
    try {
      await TenantApiService.updateTenant(activeTenant.id, updates);
      loadTenants();
    } catch {
      // error handled in modals
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Cards Above Data Grid */}
      <TenantStatsCards stats={stats} loading={loading} />

      {/* Advanced Filter Toolbar */}
      <TenantFilterToolbar
        filters={filters}
        selectedCount={selectedRowKeys.length}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        onBulkAction={handleBulkAction}
        onOpenOnboarding={() => setOnboardingModalOpen(true)}
      />

      {/* Error State Banner */}
      {error && (
        <Alert
          type="error"
          message="System Connection Notice"
          description={error}
          showIcon
          icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
          action={
            <Button size="small" type="primary" danger icon={<RefreshCw className="w-3 h-3" />} onClick={loadTenants}>
              Retry Connection
            </Button>
          }
        />
      )}

      {/* Enterprise Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table
          columns={columns}
          dataSource={tenants.map((t) => ({ ...t, key: t.id }))}
          loading={loading}
          scroll={{ x: 1500 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showTotal: (t, range) => (
              <span className="text-xs text-slate-500 font-medium">
                Showing {range[0]}-{range[1]} of {t} Hospital Tenants
              </span>
            ),
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">No Hospital Tenants Found</p>
                    <p className="text-xs text-slate-400">Try adjusting search query or resetting filters.</p>
                    <Button size="small" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                }
              />
            ),
          }}
        />
      </div>

      {/* Action Modals & Drawers */}
      <ViewTenantDrawer
        tenant={activeTenant}
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        onOpenEdit={(t) => {
          setViewDrawerOpen(false);
          openEditModal(t);
        }}
        onOpenSub={(t) => {
          setViewDrawerOpen(false);
          openSubModal(t);
        }}
      />

      <EditTenantModal
        tenant={activeTenant}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleUpdateTenantState}
      />

      <ManageSubscriptionModal
        tenant={activeTenant}
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        onSave={handleUpdateTenantState}
      />

      <TenantUsageModal tenant={activeTenant} open={usageModalOpen} onClose={() => setUsageModalOpen(false)} />

      <TenantAuditLogsModal tenant={activeTenant} open={auditModalOpen} onClose={() => setAuditModalOpen(false)} />

      {/* Hospital Onboarding Wizard Modal */}
      <Modal
        title="Onboard New Hospital Tenant"
        open={onboardingModalOpen}
        onCancel={() => setOnboardingModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <HospitalOnboardingWizard
          onClose={() => setOnboardingModalOpen(false)}
          onProvisioned={async (payload) => {
            await TenantApiService.addTenant({
              hospitalName: payload.hospitalName,
              hospitalType: "Multi-Specialty",
              city: "Mumbai",
              state: "Maharashtra",
              subscriptionPlan: payload.licenseTier === "SUPER_SPECIALTY" ? "Super Specialty" : payload.licenseTier === "ENTERPRISE" ? "Enterprise" : "Basic",
              status: "Active",
              activeUsers: 1,
              maxUsers: payload.maxUserSeats,
              bedCount: 100,
              maxBeds: 200,
              storageUsedGB: 5,
              maxStorageGB: 500,
              lastActivity: "Just now",
              expiryDate: "2027-09-30",
              healthStatus: "Healthy",
              subdomain: payload.subdomain,
              adminEmail: payload.adminEmail || `admin@${payload.subdomain}.com`,
              adminPhone: "+91 98000 00000",
              gstin: payload.gstin || "27AAAAA0000A1Z5",
              mrr: 250000,
              joinedDate: new Date().toISOString().slice(0, 10),
              slaUptime: 99.99,
              enabledModules: ["OPD", "IPD", "Pharmacy"],
            });
            loadTenants();
          }}
        />
      </Modal>

      {/* Facility Controls Manager Modal */}
      <Modal
        open={facilityModalOpen}
        onCancel={() => setFacilityModalOpen(false)}
        footer={null}
        width={1040}
        destroyOnClose
        style={{ top: 20 }}
      >
        <HospitalFacilityControlManager
          initialTenantId={activeTenant?.id || "TNT-9014"}
          onClose={() => setFacilityModalOpen(false)}
        />
      </Modal>

      {/* Multi-Step Suspend Tenant Modal */}
      <SuspendTenantModal
        tenant={targetSuspendTenant}
        open={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        onSuspended={loadTenants}
      />

      {/* Restore Tenant Modal */}
      <RestoreTenantModal
        tenant={targetSuspendTenant}
        open={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        onRestored={loadTenants}
      />
    </div>
  );
};
