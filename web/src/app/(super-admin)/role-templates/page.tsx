"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Table, Tag, Select, Input, Tabs, Segmented, message, Popconfirm, Tooltip } from "antd";
import {
  ShieldCheck,
  Building2,
  Receipt,
  SlidersHorizontal,
  Headphones,
  Plus,
  Search,
  GitFork,
  Copy,
  Edit3,
  Eye,
  Lock,
  CheckCircle2,
  UserCheck,
  FolderTree,
  ListFilter,
} from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { RoleDefinition } from "../_super_admin_types/rbac_management";
import { RbacCatalogService, PERMISSION_CLAIMS } from "../_super_admin_services/rbac_catalog_service";
import { useRbacControlStore } from "../_super_admin_stores/rbac_control_store";
import { RoleEditorModal } from "../_super_admin_components/FacilityControl/RoleEditorModal";
import { RoleInheritanceTree } from "../_super_admin_components/FacilityControl/RoleInheritanceTree";
import { EffectivePermissionsDrawer } from "../_super_admin_components/FacilityControl/EffectivePermissionsDrawer";
import { FeaturePermissionMappingDrawer } from "../_super_admin_components/FacilityControl/FeaturePermissionMappingDrawer";
import { RbacAuditLedgerTab } from "../_super_admin_components/FacilityControl/RbacAuditLedgerTab";

export default function RoleTemplatesPage() {
  const [selectedTenantId, setSelectedTenantId] = useState<string>("TNT-9014");
  const [tenantOptions, setTenantOptions] = useState<{ value: string; label: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeTabKey, setActiveTabKey] = useState<string>("catalog");

  // Editor Modal state
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [parentTemplateToClone, setParentTemplateToClone] = useState<RoleDefinition | null>(null);

  // Effective Permissions Drawer state
  const [permissionsDrawerOpen, setPermissionsDrawerOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<RoleDefinition | null>(null);

  // Feature-Permission Mapping Drawer state
  const [featureMappingDrawerOpen, setFeatureMappingDrawerOpen] = useState(false);

  const { getRolesForTenant, cloneTemplate, toggleRoleStatus } = useRbacControlStore();
  React.useEffect(() => {
    import("../_super_admin_services/tenant_api_service")
      .then(({ TenantApiService }) =>
        TenantApiService.fetchTenants({}, { field: "hospitalName", order: "asc" }, 1, 100)
          .then((response) => {
            setTenantOptions(response.tenants.map((tenant) => ({
              value: tenant.id,
              label: `${tenant.hospitalName} (${tenant.id})`,
            })));
          })
      )
      .catch(() => setTenantOptions([]));
  }, []);

  const currentTenantLabel =
    tenantOptions.find((t) => t.value === selectedTenantId)?.label.split(" (")[0] || selectedTenantId;

  const allTenantRoles = getRolesForTenant(selectedTenantId);

  const filteredRoles = allTenantRoles.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setParentTemplateToClone(null);
    setEditorModalOpen(true);
  };

  const handleOpenEditModal = (role: RoleDefinition) => {
    setEditingRole(role);
    setParentTemplateToClone(null);
    setEditorModalOpen(true);
  };

  const handleCloneTemplateTrigger = (parent: RoleDefinition) => {
    const cloned = cloneTemplate(selectedTenantId, parent.id, `${parent.name} (${currentTenantLabel} Custom)`);
    message.success(`Cloned template "${parent.name}" to create "${cloned.name}" for ${currentTenantLabel}!`);
    setEditingRole(cloned);
    setEditorModalOpen(true);
  };

  const handleViewPermissions = (role: RoleDefinition) => {
    setSelectedRoleForPermissions(role);
    setPermissionsDrawerOpen(true);
  };

  const renderRoleCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredRoles.map((role) => {
        const parentTemplate = role.parentTemplateId
          ? RbacCatalogService.getTemplateById(role.parentTemplateId)
          : null;

        return (
          <HmsCard
            key={role.id}
            elevated
            className={`!p-4 border transition-all ${
              role.isGlobalTemplate
                ? "bg-white border-slate-200"
                : "bg-teal-50/40 border-teal-200 shadow-xs"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {role.id}
                  </span>
                  <Tag color={role.isGlobalTemplate ? "purple" : "emerald"} className="!font-bold">
                    {role.isGlobalTemplate ? "GLOBAL TEMPLATE" : "CUSTOM ROLE"}
                  </Tag>
                  <Tag color="blue" className="!font-semibold">
                    {role.category}
                  </Tag>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                  {role.name}
                  {role.status === "Disabled" && <Tag color="red">Disabled</Tag>}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{role.description}</p>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-lg font-extrabold text-teal-700 font-mono block">
                  {role.permissions.length}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Claims Granted</span>
              </div>
            </div>

            {/* Parent Template Lineage */}
            {parentTemplate && (
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600">
                <GitFork className="w-3.5 h-3.5 text-teal-600" />
                <span>Parent Template: <strong className="text-slate-900">{parentTemplate.name}</strong></span>
              </div>
            )}

            {/* Scope Rules Summary */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Scope: {role.scopeRules.scopeType}</span>
              <div className="flex items-center gap-2 text-[11px]">
                {role.scopeRules.requiresOnDutyRoster && (
                  <Tag color="cyan" className="!text-[10px]">Roster Required</Tag>
                )}
                {role.scopeRules.allowEmergencyBreakGlass && (
                  <Tag color="gold" className="!text-[10px]">Break-Glass</Tag>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <HmsButton
                size="sm"
                variant="secondary"
                icon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => handleViewPermissions(role)}
              >
                Effective Claims
              </HmsButton>

              <div className="flex items-center gap-2">
                {role.isGlobalTemplate ? (
                  <HmsButton
                    size="sm"
                    variant="outline"
                    icon={<Copy className="w-3.5 h-3.5 text-teal-600" />}
                    onClick={() => handleCloneTemplateTrigger(role)}
                  >
                    Clone to Custom Role
                  </HmsButton>
                ) : (
                  <>
                    <HmsButton
                      size="sm"
                      variant="secondary"
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEditModal(role)}
                    >
                      Modify Role
                    </HmsButton>
                    <HmsButton
                      size="sm"
                      variant={role.status === "Active" ? "danger" : "emerald"}
                      onClick={() => toggleRoleStatus(selectedTenantId, role.id, role.status !== "Active")}
                    >
                      {role.status === "Active" ? "Disable" : "Enable"}
                    </HmsButton>
                  </>
                )}
              </div>
            </div>
          </HmsCard>
        );
      })}
    </div>
  );

  return (
    <HmsAppShell title="Role Templates & Custom Role Governance">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-teal-600" /> Role Templates & Custom RBAC Governance
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Enterprise RBAC: Global Role Templates, Tenant Custom Roles, Granular Permission Claim Matrix & Scope Rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/tenants">
              <HmsButton size="sm" variant="secondary" icon={<Building2 className="w-4 h-4" />}>
                Tenants
              </HmsButton>
            </Link>
            <Link href="/subscription-plans">
              <HmsButton size="sm" variant="secondary" icon={<Receipt className="w-4 h-4" />}>
                Subscriptions
              </HmsButton>
            </Link>
            <Link href="/feature-flags">
              <HmsButton size="sm" variant="secondary" icon={<SlidersHorizontal className="w-4 h-4" />}>
                Feature Flags
              </HmsButton>
            </Link>
            <Link href="/platform-audit">
              <HmsButton size="sm" variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
                Platform Audit
              </HmsButton>
            </Link>
            <Link href="/support-tickets">
              <HmsButton size="sm" variant="secondary" icon={<Headphones className="w-4 h-4" />}>
                Support Tickets
              </HmsButton>
            </Link>
          </div>
        </div>

        {/* Top Tenant Control Selector Header */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selected Hospital Tenant:
              </span>
            </div>
            <Select
              value={selectedTenantId}
              onChange={(val) => setSelectedTenantId(val)}
              options={tenantOptions}
              className="w-full sm:w-80 font-semibold"
              size="large"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
            <HmsButton
              variant="secondary"
              icon={<SlidersHorizontal className="w-4 h-4 text-teal-400" />}
              onClick={() => setFeatureMappingDrawerOpen(true)}
            >
              Feature-Permission Mappings
            </HmsButton>
            <HmsButton
              variant="emerald"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreateModal}
            >
              Create Custom Role
            </HmsButton>
          </div>
        </div>

        {/* Filter and Tab Navigation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <Input
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              placeholder="Search roles by title, code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72 text-xs"
              allowClear
            />

            <Segmented
              options={["ALL", "Clinical", "Nursing", "Front Desk", "Billing", "Diagnostics", "Pharmacy", "Governance"]}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val as string)}
            />
          </div>

          <Tabs
            activeKey={activeTabKey}
            onChange={(key) => setActiveTabKey(key)}
            items={[
              {
                key: "catalog",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Role Catalog & Custom Roles ({filteredRoles.length})
                  </span>
                ),
                children: renderRoleCards(),
              },
              {
                key: "tree",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <FolderTree className="w-4 h-4 text-purple-600" />
                    Role Inheritance Tree
                  </span>
                ),
                children: (
                  <RoleInheritanceTree
                    tenantId={selectedTenantId}
                    tenantName={currentTenantLabel}
                    onEditRole={handleOpenEditModal}
                    onCloneTemplate={handleCloneTemplateTrigger}
                    onViewPermissions={handleViewPermissions}
                  />
                ),
              },
              {
                key: "matrix",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <ListFilter className="w-4 h-4 text-blue-600" />
                    Permission Claims Catalog ({PERMISSION_CLAIMS.length})
                  </span>
                ),
                children: (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Granular permission claims library configured across clinical, administrative, financial, and integration modules.
                    </p>
                    <Table
                      dataSource={PERMISSION_CLAIMS.map((p, idx) => ({ ...p, key: p.id }))}
                      columns={[
                        { title: "Claim Code", dataIndex: "id", key: "id", render: (id: string) => <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{id}</span> },
                        { title: "Permission Name", dataIndex: "name", key: "name", render: (name: string) => <span className="font-bold text-slate-900 text-xs">{name}</span> },
                        { title: "Category", dataIndex: "category", key: "category", render: (cat: string) => <Tag color="blue">{cat}</Tag> },
                        { title: "Description", dataIndex: "description", key: "description", render: (desc: string) => <span className="text-xs text-slate-600">{desc}</span> },
                      ]}
                      pagination={{ pageSize: 10 }}
                      size="small"
                    />
                  </div>
                ),
              },
              {
                key: "audit",
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <Lock className="w-4 h-4 text-amber-600" />
                    RBAC Audit Ledger
                  </span>
                ),
                children: <RbacAuditLedgerTab tenantId={selectedTenantId} />,
              },
            ]}
          />
        </div>

        {/* Modals & Drawers */}
        <RoleEditorModal
          tenantId={selectedTenantId}
          tenantName={currentTenantLabel}
          role={editingRole}
          parentTemplate={parentTemplateToClone}
          open={editorModalOpen}
          onClose={() => setEditorModalOpen(false)}
        />

        <EffectivePermissionsDrawer
          role={selectedRoleForPermissions}
          open={permissionsDrawerOpen}
          onClose={() => setPermissionsDrawerOpen(false)}
        />

        <FeaturePermissionMappingDrawer
          open={featureMappingDrawerOpen}
          onClose={() => setFeatureMappingDrawerOpen(false)}
          tenantId={selectedTenantId}
        />
      </div>
    </HmsAppShell>
  );
}
