"use client";

import React from "react";
import { Input, Select, Dropdown, MenuProps } from "antd";
import { Search, RotateCcw, Download, ShieldCheck, ShieldAlert, Archive, Plus, Layers } from "lucide-react";
import { TenantFilterParams } from "../../_super_admin_types/tenant_management";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface TenantFilterToolbarProps {
  filters: TenantFilterParams;
  selectedCount: number;
  onFilterChange: (key: keyof TenantFilterParams, value: string) => void;
  onResetFilters: () => void;
  onBulkAction: (action: "Activate" | "Suspend" | "Archive" | "Export") => void;
  onOpenOnboarding: () => void;
}

export const TenantFilterToolbar: React.FC<TenantFilterToolbarProps> = ({
  filters,
  selectedCount,
  onFilterChange,
  onResetFilters,
  onBulkAction,
  onOpenOnboarding,
}) => {
  const bulkMenu: MenuProps["items"] = [
    {
      key: "activate",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      label: "Activate Selected",
      onClick: () => onBulkAction("Activate"),
    },
    {
      key: "suspend",
      icon: <ShieldAlert className="w-4 h-4 text-amber-600" />,
      label: "Suspend Selected",
      onClick: () => onBulkAction("Suspend"),
    },
    {
      key: "archive",
      icon: <Archive className="w-4 h-4 text-slate-500" />,
      label: "Archive Selected",
      onClick: () => onBulkAction("Archive"),
    },
    {
      type: "divider",
    },
    {
      key: "export",
      icon: <Download className="w-4 h-4 text-blue-600" />,
      label: "Export Selected / All (CSV)",
      onClick: () => onBulkAction("Export"),
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
      {/* Top row: Search Inputs & Actions */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Search Hospital Name..."
            value={filters.searchName}
            onChange={(e) => onFilterChange("searchName", e.target.value)}
            className="w-full sm:w-64"
            allowClear
          />
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Search Tenant ID (e.g. TNT-9014)..."
            value={filters.searchId}
            onChange={(e) => onFilterChange("searchId", e.target.value)}
            className="w-full sm:w-56"
            allowClear
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {selectedCount > 0 && (
            <Dropdown menu={{ items: bulkMenu }} trigger={["click"]}>
              <HmsButton variant="secondary" icon={<Layers className="w-4 h-4" />}>
                Bulk Actions ({selectedCount})
              </HmsButton>
            </Dropdown>
          )}

          <HmsButton variant="secondary" icon={<Download className="w-4 h-4" />} onClick={() => onBulkAction("Export")}>
            Export CSV
          </HmsButton>

          <HmsButton type="primary" variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={onOpenOnboarding}>
            Onboard Hospital
          </HmsButton>
        </div>
      </div>

      {/* Bottom row: Multi-select dropdown filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
          Filters:
        </span>

        {/* Status Filter */}
        <Select
          value={filters.status || "ALL"}
          onChange={(val) => onFilterChange("status", val)}
          className="w-36 text-xs"
          size="small"
        >
          <Select.Option value="ALL">All Statuses</Select.Option>
          <Select.Option value="Active">Active</Select.Option>
          <Select.Option value="Trial">Trial</Select.Option>
          <Select.Option value="Suspended">Suspended</Select.Option>
          <Select.Option value="Expired">Expired</Select.Option>
          <Select.Option value="Pending Verification">Pending Verification</Select.Option>
          <Select.Option value="Archived">Archived</Select.Option>
        </Select>

        {/* Plan Filter */}
        <Select
          value={filters.plan || "ALL"}
          onChange={(val) => onFilterChange("plan", val)}
          className="w-36 text-xs"
          size="small"
        >
          <Select.Option value="ALL">All Plans</Select.Option>
          <Select.Option value="Enterprise">Enterprise</Select.Option>
          <Select.Option value="Super Specialty">Super Specialty</Select.Option>
          <Select.Option value="Professional">Professional</Select.Option>
          <Select.Option value="Basic">Basic</Select.Option>
          <Select.Option value="Custom">Custom</Select.Option>
        </Select>

        {/* Hospital Type Filter */}
        <Select
          value={filters.hospitalType || "ALL"}
          onChange={(val) => onFilterChange("hospitalType", val)}
          className="w-40 text-xs"
          size="small"
        >
          <Select.Option value="ALL">All Hospital Types</Select.Option>
          <Select.Option value="Multi-Specialty">Multi-Specialty</Select.Option>
          <Select.Option value="Super-Specialty">Super-Specialty</Select.Option>
          <Select.Option value="Single-Specialty">Single-Specialty</Select.Option>
          <Select.Option value="General Hospital">General Hospital</Select.Option>
          <Select.Option value="Clinic Chain">Clinic Chain</Select.Option>
          <Select.Option value="Teaching Hospital">Teaching Hospital</Select.Option>
        </Select>

        {/* State Filter */}
        <Select
          value={filters.state || "ALL"}
          onChange={(val) => onFilterChange("state", val)}
          className="w-36 text-xs"
          size="small"
        >
          <Select.Option value="ALL">All States</Select.Option>
          <Select.Option value="Delhi NCR">Delhi NCR</Select.Option>
          <Select.Option value="Maharashtra">Maharashtra</Select.Option>
          <Select.Option value="Karnataka">Karnataka</Select.Option>
          <Select.Option value="Tamil Nadu">Tamil Nadu</Select.Option>
          <Select.Option value="Telangana">Telangana</Select.Option>
          <Select.Option value="Gujarat">Gujarat</Select.Option>
          <Select.Option value="West Bengal">West Bengal</Select.Option>
          <Select.Option value="Punjab">Punjab</Select.Option>
          <Select.Option value="Assam">Assam</Select.Option>
        </Select>

        {/* Expiry Date Filter */}
        <Select
          value={filters.expiryFilter || "all"}
          onChange={(val) => onFilterChange("expiryFilter", val)}
          className="w-40 text-xs"
          size="small"
        >
          <Select.Option value="all">All Expiry Windows</Select.Option>
          <Select.Option value="7days">Expiring in 7 Days</Select.Option>
          <Select.Option value="30days">Expiring in 30 Days</Select.Option>
          <Select.Option value="90days">Expiring in 90 Days</Select.Option>
          <Select.Option value="expired">Already Expired</Select.Option>
        </Select>

        <HmsButton
          variant="secondary"
          size="sm"
          icon={<RotateCcw className="w-3 h-3 text-slate-500" />}
          onClick={onResetFilters}
          className="text-xs"
        >
          Reset Filters
        </HmsButton>
      </div>
    </div>
  );
};
