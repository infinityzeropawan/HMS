"use client";

import React, { useState } from "react";
import { StaffUserTable } from "../_admin_components/UserManagement/StaffUserTable";
import { Users, UserPlus } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function AdminUsersPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <HmsAppShell title="Staff User & RBAC Management">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-teal-600" /> Staff & RBAC User Management
            </h2>
            <p className="text-sm text-slate-500 mt-1">Hospital Multi-Tenant Staff Credentials & Role Access Control</p>
          </div>
          <HmsButton variant="emerald" icon={<UserPlus className="w-4 h-4" />} onClick={() => setCreateModalOpen(true)}>
            Add New Staff User
          </HmsButton>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <StaffUserTable externalCreateModalOpen={createModalOpen} onResetExternalCreateModal={() => setCreateModalOpen(false)} />
        </div>
      </div>
    </HmsAppShell>
  );
}
