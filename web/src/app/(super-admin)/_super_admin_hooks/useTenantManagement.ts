"use client";

import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import {
  Tenant,
  TenantFilterParams,
  TenantSortParams,
  TenantStats,
  TenantStatus,
} from "../_super_admin_types/tenant_management";
import { TenantApiService } from "../_super_admin_services/tenant_api_service";

export function useTenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<TenantStats>({
    totalHospitals: 0,
    activeHospitals: 0,
    trialHospitals: 0,
    expiredHospitals: 0,
    suspendedHospitals: 0,
    monthlyRevenue: 0,
  });

  // Filters
  const [filters, setFilters] = useState<TenantFilterParams>({
    searchName: "",
    searchId: "",
    plan: "ALL",
    status: "ALL",
    state: "ALL",
    hospitalType: "ALL",
    expiryFilter: "all",
  });

  // Sorting
  const [sort, setSort] = useState<TenantSortParams>({
    field: "hospitalName",
    order: "asc",
  });

  // Bulk Selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Modal / Drawer Active States
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  // Fetch Data Function
  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await TenantApiService.fetchTenants(filters, sort, page, pageSize);
      setTenants(res.tenants);
      setTotal(res.total);
      setStats(res.stats);
    } catch {
      setError("Failed to connect to Multi-Tenant Control Center. Please check connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [filters, sort, page, pageSize]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Handle filter changes
  const updateFilter = (key: keyof TenantFilterParams, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  const resetFilters = () => {
    setFilters({
      searchName: "",
      searchId: "",
      plan: "ALL",
      status: "ALL",
      state: "ALL",
      hospitalType: "ALL",
      expiryFilter: "all",
    });
    setPage(1);
  };

  // Handle sorting change
  const handleSortChange = (field: TenantSortParams["field"]) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Actions
  const handleBulkAction = async (action: "Activate" | "Suspend" | "Archive" | "Export") => {
    if (action === "Export") {
      const csv = TenantApiService.exportTenants(selectedRowKeys as string[]);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `tenant_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success(`Exported ${selectedRowKeys.length || "all"} tenant records successfully.`);
      return;
    }

    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one tenant row first.");
      return;
    }

    const newStatus: TenantStatus =
      action === "Activate" ? "Active" : action === "Suspend" ? "Suspended" : "Archived";

    try {
      const count = await TenantApiService.bulkUpdateStatus(selectedRowKeys as string[], newStatus);
      message.success(`Successfully updated ${count} tenants to ${newStatus}`);
      setSelectedRowKeys([]);
      loadTenants();
    } catch {
      message.error("Failed to execute bulk action.");
    }
  };

  const openViewDrawer = (tenant: Tenant) => {
    setActiveTenant(tenant);
    setViewDrawerOpen(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setActiveTenant(tenant);
    setEditModalOpen(true);
  };

  const openSubModal = (tenant: Tenant) => {
    setActiveTenant(tenant);
    setSubModalOpen(true);
  };

  const openUsageModal = (tenant: Tenant) => {
    setActiveTenant(tenant);
    setUsageModalOpen(true);
  };

  const openAuditModal = (tenant: Tenant) => {
    setActiveTenant(tenant);
    setAuditModalOpen(true);
  };

  const openFacilityModal = (tenant: Tenant) => {
    setActiveTenant(tenant);
    setFacilityModalOpen(true);
  };

  const handleQuickStatusChange = async (tenantId: string, newStatus: TenantStatus) => {
    try {
      await TenantApiService.updateTenant(tenantId, {
        status: newStatus,
        healthStatus: newStatus === "Suspended" || newStatus === "Archived" ? "Offline" : "Healthy",
      });
      message.success(`Tenant ${tenantId} updated to ${newStatus}`);
      loadTenants();
    } catch {
      message.error("Failed to update tenant status.");
    }
  };

  return {
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
  };
}
