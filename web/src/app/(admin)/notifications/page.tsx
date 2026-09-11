"use client";

import React from "react";
import { NotificationLogTable } from "@/app/(admin)/_admin_components/NotificationCenter/NotificationLogTable";
import { Bell } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function NotificationsPage() {
  return (
    <HmsAppShell title="Global Notification Center">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-teal-600" /> Global Notification Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Full log of all SMS, WhatsApp, Email, Push, and System notifications. Filter by channel, priority, or delivery status.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <NotificationLogTable />
        </div>
      </div>
    </HmsAppShell>
  );
}
