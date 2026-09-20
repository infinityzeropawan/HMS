"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RoleDefinition } from "../_super_admin_types/rbac_management";
import { RbacCatalogService, GLOBAL_ROLE_TEMPLATES } from "../_super_admin_services/rbac_catalog_service";
import { useRbacAuditStore } from "./rbac_audit_store";

interface RbacControlStoreState {
  globalTemplates: RoleDefinition[];
  tenantCustomRoles: Record<string, RoleDefinition[]>;

  // Actions
  getRolesForTenant: (tenantId: string) => RoleDefinition[];
  cloneTemplate: (
    tenantId: string,
    templateId: string,
    customName?: string,
    customDescription?: string
  ) => RoleDefinition;
  createCustomRole: (
    tenantId: string,
    roleData: Omit<RoleDefinition, "id" | "isGlobalTemplate" | "tenantId" | "updatedAt" | "updatedBy">
  ) => RoleDefinition;
  updateCustomRole: (tenantId: string, roleId: string, roleData: Partial<RoleDefinition>) => void;
  toggleRoleStatus: (tenantId: string, roleId: string, activeStatus: boolean) => void;
  resetToDefaults: () => void;
}

const INITIAL_TENANT_CUSTOM_ROLES: Record<string, RoleDefinition[]> = {
  "TNT-9014": [
    {
      id: "CUST-TNT-9014-CARDIO-SPEC",
      name: "Apollo Senior Cardiologist",
      description: "Specialized attending cardiologist with catheterization lab, PAC & OT privileges",
      category: "Clinical",
      isGlobalTemplate: false,
      parentTemplateId: "TMPL-SR-DOC",
      tenantId: "TNT-9014",
      permissions: [
        "opd:queue:read", "opd:encounter:read", "opd:encounter:write", "opd:prescription:create", "opd:telehealth:consult",
        "ipd:admissions:read", "ipd:rounds:write", "ipd:discharge:approve",
        "ot:schedule:read", "ot:schedule:write", "ot:pac:approve", "pacs:dicom:view", "abdm:gateway:push"
      ],
      scopeRules: {
        scopeType: "Department Scoped",
        allowedDepartments: ["Cardiology", "Coronary Care Unit (CCU)"],
        requiresOnDutyRoster: true,
        allowEmergencyBreakGlass: true,
      },
      status: "Active",
      updatedAt: "2026-09-15",
      updatedBy: "Apollo Chief Medical Officer",
    },
    {
      id: "CUST-TNT-9014-ICU-CHARGE",
      name: "Apollo ICU Charge Nurse",
      description: "Shift supervisor nurse managing critical care bed telemetry & nurse rosters",
      category: "Nursing",
      isGlobalTemplate: false,
      parentTemplateId: "TMPL-ICU-NURSE",
      tenantId: "TNT-9014",
      permissions: ["ipd:admissions:read", "ipd:admissions:write", "ipd:mar:execute", "ot:intraop:nurse", "pacs:dicom:view"],
      scopeRules: {
        scopeType: "Ward Scoped",
        allowedDepartments: ["Intensive Care Unit (ICU)", "Coronary Care Unit (CCU)"],
        requiresOnDutyRoster: true,
        allowEmergencyBreakGlass: true,
      },
      status: "Active",
      updatedAt: "2026-09-12",
      updatedBy: "Apollo Nursing Superintendent",
    },
  ],
  "TNT-1042": [
    {
      id: "CUST-TNT-1042-AUDIT-SUP",
      name: "Fortis Billing Audit Manager",
      description: "Finance lead reviewing TPA insurance claims and tariff discount waivers",
      category: "Billing",
      isGlobalTemplate: false,
      parentTemplateId: "TMPL-BILLING-SUP",
      tenantId: "TNT-1042",
      permissions: ["billing:invoice:create", "billing:discount:approve", "billing:tpa:claims", "billing:payouts:manage", "admin:audit:view"],
      scopeRules: {
        scopeType: "Tenant Wide",
        allowedDepartments: ["Finance & TPA Desk"],
        requiresOnDutyRoster: false,
        allowEmergencyBreakGlass: false,
      },
      status: "Active",
      updatedAt: "2026-09-10",
      updatedBy: "Fortis Finance Director",
    },
  ],
};

export const useRbacControlStore = create<RbacControlStoreState>()(
  persist(
    (set, get) => ({
      globalTemplates: GLOBAL_ROLE_TEMPLATES,
      tenantCustomRoles: INITIAL_TENANT_CUSTOM_ROLES,

      getRolesForTenant: (tenantId) => {
        const state = get();
        const custom = state.tenantCustomRoles[tenantId] || [];
        return [...state.globalTemplates, ...custom];
      },

      cloneTemplate: (tenantId, templateId, customName, customDescription) => {
        const state = get();
        const parent = RbacCatalogService.getTemplateById(templateId);
        if (!parent) {
          throw new Error(`Template ${templateId} not found`);
        }

        const newId = `CUST-${tenantId}-${Date.now().toString().slice(-5)}`;
        const clonedRole: RoleDefinition = {
          id: newId,
          name: customName || `${parent.name} (Custom Copy)`,
          description: customDescription || `Cloned from global template "${parent.name}". ${parent.description}`,
          category: parent.category,
          isGlobalTemplate: false,
          parentTemplateId: parent.id,
          tenantId,
          permissions: [...parent.permissions],
          scopeRules: { ...parent.scopeRules },
          status: "Active",
          updatedAt: new Date().toISOString().slice(0, 10),
          updatedBy: "SuperAdmin Console",
        };

        const existingCustom = state.tenantCustomRoles[tenantId] || [];
        set({
          tenantCustomRoles: {
            ...state.tenantCustomRoles,
            [tenantId]: [...existingCustom, clonedRole],
          },
        });

        useRbacAuditStore.getState().logEvent({
          tenantId,
          tenantName: "Hospital Tenant",
          actor: "SuperAdmin Console",
          actorRole: "SUPER_ADMIN",
          targetRoleId: clonedRole.id,
          targetRoleName: clonedRole.name,
          eventType: "ROLE_CREATED",
          previousValue: `Cloned from template ${parent.id} (${parent.name})`,
          newValue: clonedRole,
          reason: `Cloned custom role created from template ${parent.name}.`,
        });

        return clonedRole;
      },

      createCustomRole: (tenantId, roleData) => {
        const state = get();
        const newId = `CUST-${tenantId}-${Date.now().toString().slice(-5)}`;
        const newRole: RoleDefinition = {
          ...roleData,
          id: newId,
          isGlobalTemplate: false,
          tenantId,
          updatedAt: new Date().toISOString().slice(0, 10),
          updatedBy: "SuperAdmin Console",
        };

        const existingCustom = state.tenantCustomRoles[tenantId] || [];
        set({
          tenantCustomRoles: {
            ...state.tenantCustomRoles,
            [tenantId]: [...existingCustom, newRole],
          },
        });

        useRbacAuditStore.getState().logEvent({
          tenantId,
          tenantName: "Hospital Tenant",
          actor: "SuperAdmin Console",
          actorRole: "SUPER_ADMIN",
          targetRoleId: newRole.id,
          targetRoleName: newRole.name,
          eventType: "ROLE_CREATED",
          previousValue: "None (New Role)",
          newValue: newRole,
          reason: `Created custom role "${newRole.name}" for tenant ${tenantId}.`,
        });

        return newRole;
      },

      updateCustomRole: (tenantId, roleId, roleData) => {
        const state = get();
        const customRoles = state.tenantCustomRoles[tenantId] || [];
        const index = customRoles.findIndex((r) => r.id === roleId);

        if (index !== -1) {
          const oldRole = customRoles[index];
          const updatedRoles = [...customRoles];
          updatedRoles[index] = {
            ...updatedRoles[index],
            ...roleData,
            updatedAt: new Date().toISOString().slice(0, 10),
            updatedBy: "SuperAdmin Console",
          };

          set({
            tenantCustomRoles: {
              ...state.tenantCustomRoles,
              [tenantId]: updatedRoles,
            },
          });

          useRbacAuditStore.getState().logEvent({
            tenantId,
            tenantName: "Hospital Tenant",
            actor: "SuperAdmin Console",
            actorRole: "SUPER_ADMIN",
            targetRoleId: roleId,
            targetRoleName: updatedRoles[index].name,
            eventType: "ROLE_UPDATED",
            previousValue: oldRole,
            newValue: updatedRoles[index],
            reason: `Updated permissions and scope rules for custom role ${roleId}.`,
          });
        }
      },

      toggleRoleStatus: (tenantId, roleId, activeStatus) => {
        const state = get();
        const customRoles = state.tenantCustomRoles[tenantId] || [];
        const index = customRoles.findIndex((r) => r.id === roleId);

        if (index !== -1) {
          const oldRole = customRoles[index];
          const updatedRoles = [...customRoles];
          updatedRoles[index] = {
            ...updatedRoles[index],
            status: activeStatus ? "Active" : "Disabled",
            updatedAt: new Date().toISOString().slice(0, 10),
          };

          set({
            tenantCustomRoles: {
              ...state.tenantCustomRoles,
              [tenantId]: updatedRoles,
            },
          });

          useRbacAuditStore.getState().logEvent({
            tenantId,
            tenantName: "Hospital Tenant",
            actor: "SuperAdmin Console",
            actorRole: "SUPER_ADMIN",
            targetRoleId: roleId,
            targetRoleName: oldRole.name,
            eventType: "ROLE_UPDATED",
            previousValue: `Status: ${oldRole.status}`,
            newValue: `Status: ${activeStatus ? "Active" : "Disabled"}`,
            reason: `Role status toggled to ${activeStatus ? "Active" : "Disabled"}.`,
          });
        }
      },

      resetToDefaults: () => {
        set({
          globalTemplates: GLOBAL_ROLE_TEMPLATES,
          tenantCustomRoles: INITIAL_TENANT_CUSTOM_ROLES,
        });
      },
    }),
    {
      name: "superadmin_rbac_control_v2",
    }
  )
);
