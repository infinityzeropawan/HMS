"use client";

import React from "react";
import { StaffUserTable } from "../_admin_components/UserManagement/StaffUserTable";
import { Users, UserPlus } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function AdminUsersPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" /> Staff & RBAC User Management
          </h1>
          <p className="text-sm text-slate-500">Hospital Multi-Tenant Staff Credentials & Role Access Control</p>
        </div>
        <HmsButton type="primary" variant="emerald" icon={<UserPlus className="w-4 h-4" />}>
          Add New Staff User
        </HmsButton>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <StaffUserTable />
      </div>
    </div>
  );
}
