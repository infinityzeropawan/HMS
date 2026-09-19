"use client";

import React from "react";
import { Tag, Tooltip } from "antd";
import { ShieldCheck, GitFork, ChevronRight, Layers, ArrowRight, Lock, Eye, Edit3, Copy } from "lucide-react";
import { RoleDefinition } from "../../_super_admin_types/rbac_management";
import { RbacCatalogService } from "../../_super_admin_services/rbac_catalog_service";
import { useRbacControlStore } from "../../_super_admin_stores/rbac_control_store";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface RoleInheritanceTreeProps {
  tenantId: string;
  tenantName: string;
  onEditRole: (role: RoleDefinition) => void;
  onCloneTemplate: (parent: RoleDefinition) => void;
  onViewPermissions: (role: RoleDefinition) => void;
}

export const RoleInheritanceTree: React.FC<RoleInheritanceTreeProps> = ({
  tenantId,
  tenantName,
  onEditRole,
  onCloneTemplate,
  onViewPermissions,
}) => {
  const globalTemplates = RbacCatalogService.getGlobalTemplates();
  const { tenantCustomRoles } = useRbacControlStore();
  const customRoles = tenantCustomRoles[tenantId] || [];

  // Group roles by parent template structure
  const rootTemplates = globalTemplates.filter((t) => t.parentTemplateId === null);

  const getChildrenOfTemplate = (templateId: string) => {
    const childTemplates = globalTemplates.filter((t) => t.parentTemplateId === templateId);
    const childCustom = customRoles.filter((r) => r.parentTemplateId === templateId);
    return [...childTemplates, ...childCustom];
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitFork className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="font-bold text-white text-sm">Role Template & Custom Inheritance Map</h3>
            <p className="text-xs text-slate-400">Visual hierarchy showing Parent Global Templates branching into Tenant Custom Roles</p>
          </div>
        </div>

        <Tag color="teal" className="!font-bold">
          Tenant: {tenantName} ({tenantId})
        </Tag>
      </div>

      <div className="space-y-4">
        {rootTemplates.map((root) => {
          const directChildren = getChildrenOfTemplate(root.id);

          return (
            <div key={root.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              {/* Root Parent Template Card */}
              <div className="flex items-start justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-700 font-bold text-xs">
                    ROOT
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{root.name}</h4>
                      <Tag color="purple" className="!font-semibold">GLOBAL TEMPLATE</Tag>
                      <Tag color="blue" className="!font-mono !text-[10px]">{root.category}</Tag>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{root.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs text-slate-600 font-bold bg-white px-2 py-1 rounded border border-slate-200">
                    {root.permissions.length} perms
                  </span>
                  <HmsButton
                    size="sm"
                    variant="outline"
                    icon={<Copy className="w-3.5 h-3.5 text-teal-600" />}
                    onClick={() => onCloneTemplate(root)}
                  >
                    Clone Custom Role
                  </HmsButton>
                  <HmsButton
                    size="sm"
                    variant="secondary"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => onViewPermissions(root)}
                  >
                    View Claims
                  </HmsButton>
                </div>
              </div>

              {/* Branching Children Cards */}
              {directChildren.length > 0 && (
                <div className="pl-6 border-l-2 border-dashed border-teal-300 ml-4 space-y-2.5 pt-1">
                  {directChildren.map((child) => {
                    const grandChildren = getChildrenOfTemplate(child.id);

                    return (
                      <div key={child.id} className="space-y-2">
                        <div
                          className={`p-3 rounded-lg border transition-all flex items-start justify-between ${
                            child.isGlobalTemplate
                              ? "bg-slate-50/80 border-slate-200"
                              : "bg-teal-50/50 border-teal-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <ChevronRight className="w-4 h-4 text-teal-600 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-xs">{child.name}</h5>
                                {child.isGlobalTemplate ? (
                                  <Tag color="purple" className="!text-[10px]">SUB-TEMPLATE</Tag>
                                ) : (
                                  <Tag color="emerald" className="!text-[10px] !font-bold">TENANT CUSTOM ROLE</Tag>
                                )}
                                <Tag color="default" className="!text-[10px]">{child.scopeRules.scopeType}</Tag>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{child.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[11px] text-slate-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                              {child.permissions.length} perms
                            </span>
                            {!child.isGlobalTemplate && (
                              <HmsButton
                                size="sm"
                                variant="secondary"
                                icon={<Edit3 className="w-3.5 h-3.5" />}
                                onClick={() => onEditRole(child)}
                              >
                                Edit Role
                              </HmsButton>
                            )}
                            <HmsButton
                              size="sm"
                              variant="outline"
                              icon={<Eye className="w-3.5 h-3.5 text-teal-600" />}
                              onClick={() => onViewPermissions(child)}
                            >
                              Effective Claims
                            </HmsButton>
                          </div>
                        </div>

                        {/* Grandchildren Recursive Branching */}
                        {grandChildren.length > 0 && (
                          <div className="pl-6 border-l-2 border-dashed border-emerald-300 ml-4 space-y-2 pt-1">
                            {grandChildren.map((grand) => (
                              <div
                                key={grand.id}
                                className="p-2.5 bg-emerald-50/40 rounded-lg border border-emerald-200 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-bold text-slate-900">{grand.name}</span>
                                  <Tag color="emerald" className="!text-[10px] !font-bold">CUSTOM</Tag>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-slate-600">{grand.permissions.length} perms</span>
                                  <HmsButton size="sm" variant="secondary" onClick={() => onEditRole(grand)}>
                                    Edit
                                  </HmsButton>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
