"use client";
import { BellOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import { useNotificationStore } from "@/lib/notification_store/notification.store";

export function HmsNotificationBell() {
  const { unreadCount, openDrawer } = useNotificationStore();

  return (
    <button
      id="hms-notification-bell"
      aria-label={`Notifications — ${unreadCount} unread`}
      onClick={openDrawer}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0 8px",
        display: "flex",
        alignItems: "center",
        color: "var(--hms-text-primary)",
      }}
    >
      <Badge
        count={unreadCount}
        size="small"
        style={{ backgroundColor: "var(--hms-alert-crimson)" }}
      >
        <BellOutlined style={{ fontSize: 20 }} />
      </Badge>
    </button>
  );
}
