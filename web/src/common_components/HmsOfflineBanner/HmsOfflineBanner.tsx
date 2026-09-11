"use client";

import React from "react";
import { AlertCircle, WifiOff } from "lucide-react";
import { useOfflineSync } from "@/lib/offline_db/useOfflineSync";
import { useI18n } from "@/i18n/_i18n_context/I18nContext";

export function HmsOfflineBanner() {
  const { isOnline, pendingCount } = useOfflineSync();
  const { t } = useI18n();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "var(--hms-alert-crimson)",
        color: "#ffffff",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }}
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-bounce" />
        <span>{!isOnline ? t.offlineNotice : "Syncing local database records..."}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>{pendingCount} Pending Sync</span>
      </div>
    </div>
  );
}
