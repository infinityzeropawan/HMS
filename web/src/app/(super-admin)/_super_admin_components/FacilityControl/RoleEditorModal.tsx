"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Switch, Checkbox, Tag, Alert, message, Divider } from "antd";
import { ShieldCheck, Layers, Lock, CheckCircle2, Building2, SlidersHorizontal } from "lucide-react";
import { RoleDefinition, RoleScopeType, PermissionCategory } from "../../_super_admin_types/rbac_management";
import { RbacCatalogService, PERMISSION_CLAIMS } from "../../_super_admin_services/rbac_catalog_service";
import { UnifiedAuthEvaluator } from "../../_super_admin_services/unified_auth_evaluator";
import { useRbacControlStore } from "../../_super_admin_stores/rbac_control_store";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface RoleEditorModalProps {
  tenantId: string;
  tenantName: string;
  role: RoleDefinition | null;
  parentTemplate?: RoleDefinition | null;
  open: boolean;
  onClose: () => void;
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  "Clinical OPD",
  "Inpatient Care (IPD)",
  "Operation Theatre (OT)",
  "Pharmacy & Dispensing",
  "Pathology & Diagnostics",
  "Billing & Financials",
  "Integrations & ABDM",
  "System Administration",
];

export const RoleEditorModal: React.FC<RoleEditorModalProps> = ({
  tenantId,
  tenantName,
  role,
  parentTemplate,
  open,
  onClose,
}) => {
  const { createCustomRole, updateCustomRole } = useRbacControlStore();
  const globalTemplates = RbacCatalogService.getGlobalTemplates();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Clinical" | "Nursing" | "Front Desk" | "Billing" | "Diagnostics" | "Pharmacy" | "Governance">("Clinical");
  const [parentTemplateId, setParentTemplateId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [scopeType, setScopeType] = useState<RoleScopeType>("Department Scoped");
  const [allowedDepartments, setAllowedDepartments] = useState<string[]>(["ALL"]);
  const [requiresOnDutyRoster, setRequiresOnDutyRoster] = useState(true);
  const [allowEmergencyBreakGlass, setAllowEmergencyBreakGlass] = useState(true);
  const [hideUnavailable, setHideUnavailable] = useState(false);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setCategory(role.category);
      setParentTemplateId(role.parentTemplateId);
      setSelectedPermissions([...role.permissions]);
      setScopeType(role.scopeRules.scopeType);
      setAllowedDepartments([...(role.scopeRules.allowedDepartments || ["ALL"])]);
      setRequiresOnDutyRoster(role.scopeRules.requiresOnDutyRoster);
      setAllowEmergencyBreakGlass(role.scopeRules.allowEmergencyBreakGlass);
    } else if (parentTemplate) {
      setName(`${parentTemplate.name} (Custom)`);
      setDescription(`Cloned from template "${parentTemplate.name}". ${parentTemplate.description}`);
      setCategory(parentTemplate.category);
      setParentTemplateId(parentTemplate.id);
      setSelectedPermissions([...parentTemplate.permissions]);
      setScopeType(parentTemplate.scopeRules.scopeType);
      setAllowedDepartments([...(parentTemplate.scopeRules.allowedDepartments || ["ALL"])]);
      setRequiresOnDutyRoster(parentTemplate.scopeRules.requiresOnDutyRoster);
      setAllowEmergencyBreakGlass(parentTemplate.scopeRules.allowEmergencyBreakGlass);
    } else {
      setName("");
      setDescription("");
      setCategory("Clinical");
      setParentTemplateId(null);
      setSelectedPermissions([]);
      setScopeType("Department Scoped");
      setAllowedDepartments(["ALL"]);
      setRequiresOnDutyRoster(true);
      setAllowEmergencyBreakGlass(true);
    }
  }, [role, parentTemplate, open]);

  const handleSelectParentTemplate = (tmplId: string | null) => {
    setParentTemplateId(tmplId);
    if (tmplId) {
      const parent = RbacCatalogService.getTemplateById(tmplId);
      if (parent) {
        setSelectedPermissions([...parent.permissions]);
        setCategory(parent.category);
        setScopeType(parent.scopeRules.scopeType);
        setAllowedDepartments([...(parent.scopeRules.allowedDepartments || ["ALL"])]);
        setRequiresOnDutyRoster(parent.scopeRules.requiresOnDutyRoster);
        setAllowEmergencyBreakGlass(parent.scopeRules.allowEmergencyBreakGlass);
      }
    }
  };

  const handleTogglePermission = (permId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, permId])));
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => id !== permId));
    }
  };

  const handleSelectAllCategory = (cat: PermissionCategory, checked: boolean) => {
    const catPermIds = PERMISSION_CLAIMS.filter((p) => p.category === cat).map((p) => p.id);
    if (checked) {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...catPermIds])));
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => !catPermIds.includes(id)));
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      message.error("Role Name is required!");
      return;
    }

    const scopeRules = {
      scopeType,
      allowedDepartments,
      requiresOnDutyRoster,
      allowEmergencyBreakGlass,
    };

    if (role) {
      updateCustomRole(tenantId, role.id, {
        name,
        description,
        category,
        parentTemplateId,
        permissions: selectedPermissions,
        scopeRules,
      });
      message.success(`Custom Role "${name}" updated successfully!`);
    } else {
      createCustomRole(tenantId, {
        name,
        description,
        category,
        parentTemplateId,
        permissions: selectedPermissions,
        scopeRules,
        status: "Active",
      });
      message.success(`Custom Role "${name}" created for ${tenantName}!`);
    }
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <span>{role ? `Edit Custom Role: ${role.name}` : `Create Custom Role for ${tenantName}`}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnClose
    >
      <div className="space-y-4 my-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Header Alert Banner */}
        <Alert
          type="info"
          showIcon
          icon={<Building2 className="w-4 h-4 text-teal-600" />}
          message={
            <span className="font-bold text-slate-900 text-xs">
              Role Governance Matrix & Boundary Controls ({tenantName})
            </span>
          }
          description="Custom roles grant specific permission claims and scope boundaries to staff user accounts without breaking legacy role structures."
        />

        {/* Basic Role Configuration Form */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">Parent Global Template (Optional):</label>
            <Select
              value={parentTemplateId}
              onChange={handleSelectParentTemplate}
              placeholder="Select base global template to clone from..."
              className="w-full font-semibold"
              allowClear
            >
              {globalTemplates.map((t) => (
                <Select.Option key={t.id} value={t.id}>
                  <span className="font-bold text-slate-900">{t.name}</span>{" "}
                  <span className="text-slate-400 text-[11px]">({t.category} • {t.permissions.length} perms)</span>
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Role Title / Name *:</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apollo Senior Cardiologist"
              className="font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Role Category *:</label>
            <Select
              value={category}
              onChange={(val) => setCategory(val)}
              className="w-full font-semibold"
            >
              <Select.Option value="Clinical">Clinical</Select.Option>
              <Select.Option value="Nursing">Nursing</Select.Option>
              <Select.Option value="Front Desk">Front Desk</Select.Option>
              <Select.Option value="Billing">Billing</Select.Option>
              <Select.Option value="Diagnostics">Diagnostics</Select.Option>
              <Select.Option value="Pharmacy">Pharmacy</Select.Option>
              <Select.Option value="Governance">Governance</Select.Option>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">Role Description & Operational Purpose:</label>
            <Input.TextArea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe duty responsibilities and clinical access scope..."
            />
          </div>
        </div>

        {/* Scope Rules Configuration */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-teal-400" /> Access Boundary & Scope Rules
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Scope Rule Boundary:</label>
              <Select
                value={scopeType}
                onChange={(val) => setScopeType(val)}
                className="w-full font-bold"
              >
                <Select.Option value="Tenant Wide">Tenant Wide</Select.Option>
                <Select.Option value="Branch Network">Branch Network</Select.Option>
                <Select.Option value="Department Scoped">Department Scoped</Select.Option>
                <Select.Option value="Ward Scoped">Ward Scoped</Select.Option>
                <Select.Option value="Care Team Assigned Only">Care Team Assigned Only</Select.Option>
              </Select>
            </div>

            <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <span className="font-semibold text-slate-300">Requires Active Duty Roster:</span>
              <Switch checked={requiresOnDutyRoster} onChange={(val) => setRequiresOnDutyRoster(val)} size="small" />
            </div>

            <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <span className="font-semibold text-slate-300">Emergency Break-Glass Allowed:</span>
              <Switch checked={allowEmergencyBreakGlass} onChange={(val) => setAllowEmergencyBreakGlass(val)} size="small" />
            </div>
          </div>
        </div>

        {/* Granular Permission Claim Checkbox Matrix */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-600" /> Granular Permission Claims Matrix ({selectedPermissions.length} Granted)
            </h4>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                <Switch size="small" checked={hideUnavailable} onChange={setHideUnavailable} />
                Hide Unavailable Feature Claims
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Total Claims: {PERMISSION_CLAIMS.length}</span>
            </div>
          </div>

          <div className="space-y-3">
            {PERMISSION_CATEGORIES.map((cat) => {
              let catClaims = PERMISSION_CLAIMS.filter((p) => p.category === cat);
              if (hideUnavailable) {
                catClaims = catClaims.filter((c) => {
                  const featInfo = UnifiedAuthEvaluator.getFeatureStateForClaim(tenantId, c.requiredFeatureId);
                  return featInfo.state === "Enabled" || featInfo.state === "Trial";
                });
              }

              if (catClaims.length === 0) return null;

              const allChecked = catClaims.every((p) => selectedPermissions.includes(p.id));

              return (
                <div key={cat} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                      <Tag color="teal" className="!font-semibold">{cat}</Tag>
                      ({catClaims.filter((p) => selectedPermissions.includes(p.id)).length} / {catClaims.length} active)
                    </span>
                    <Checkbox
                      checked={allChecked}
                      onChange={(e) => handleSelectAllCategory(cat, e.target.checked)}
                      className="text-xs font-semibold text-slate-600"
                    >
                      Select All Category
                    </Checkbox>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {catClaims.map((claim) => {
                      const isChecked = selectedPermissions.includes(claim.id);
                      const featInfo = UnifiedAuthEvaluator.getFeatureStateForClaim(tenantId, claim.requiredFeatureId);
                      const isUnavailable = featInfo.state === "Disabled" || featInfo.state === "Restricted";

                      return (
                        <label
                          key={claim.id}
                          className={`p-2 rounded-lg border transition-all flex items-start gap-2.5 ${
                            isUnavailable
                              ? "bg-slate-100/80 border-slate-200 opacity-75 cursor-not-allowed"
                              : isChecked
                              ? "bg-teal-50/60 border-teal-200 cursor-pointer"
                              : "bg-slate-50/50 border-slate-100 hover:border-slate-200 cursor-pointer"
                          }`}
                        >
                          <Checkbox
                            checked={isChecked && !isUnavailable}
                            disabled={isUnavailable}
                            onChange={(e) => handleTogglePermission(claim.id, e.target.checked)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`font-bold text-xs truncate ${isUnavailable ? "text-slate-500 line-through" : "text-slate-900"}`}>
                                {claim.name}
                              </span>
                              <Tag color={isUnavailable ? "volcano" : "cyan"} className="text-[9px] font-mono shrink-0">
                                {featInfo.source}
                              </Tag>
                            </div>
                            <span className="text-[10px] text-slate-500 block leading-tight">{claim.description}</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-mono text-[9px] text-slate-400">{claim.id}</span>
                              {isUnavailable && (
                                <Tag color="error" icon={<Lock className="w-2.5 h-2.5 inline mr-1" />} className="text-[9px] font-bold">
                                  Feature {featInfo.state}
                                </Tag>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 sticky bottom-0 bg-white">
          <HmsButton variant="secondary" onClick={onClose}>
            Cancel
          </HmsButton>
          <HmsButton
            type="primary"
            variant="emerald"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handleSave}
          >
            {role ? "Save Role Changes" : "Create Custom Role"}
          </HmsButton>
        </div>
      </div>
    </Modal>
  );
};
