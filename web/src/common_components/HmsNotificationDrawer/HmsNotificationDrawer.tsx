"use client";
import {
  AlertOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Empty, Space, Tag, Tooltip, Typography } from "antd";
import { useNotificationStore } from "@/lib/notification_store/notification.store";
import type { HmsNotification, NotificationCategory, NotificationPriority } from "@/lib/notification_store/notification.types";

const { Text, Title } = Typography;

function priorityColor(p: NotificationPriority): string {
  if (p === "critical") return "var(--hms-alert-crimson)";
  if (p === "normal") return "var(--hms-info-blue)";
  return "var(--hms-slate-hint)";
}

function categoryIcon(c: NotificationCategory) {
  const style = { fontSize: 16 };
  switch (c) {
    case "LAB_PANIC": return <AlertOutlined style={{ ...style, color: "var(--hms-alert-crimson)" }} />;
    case "MEDICATION_DUE": return <MedicineBoxOutlined style={{ ...style, color: "var(--hms-warning-amber)" }} />;
    case "OT_START": return <ExclamationCircleOutlined style={{ ...style, color: "var(--hms-alert-crimson)" }} />;
    case "CLAIM_STATUS": return <InfoCircleOutlined style={{ ...style, color: "var(--hms-info-blue)" }} />;
    case "INVENTORY_ALERT": return <ExclamationCircleOutlined style={{ ...style, color: "var(--hms-warning-amber)" }} />;
    case "DISCHARGE_READY": return <CheckCircleOutlined style={{ ...style, color: "var(--hms-vital-normal)" }} />;
    default: return <NotificationOutlined style={{ ...style, color: "var(--hms-slate-hint)" }} />;
  }
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationItem({ n }: { n: HmsNotification }) {
  const { markAsRead } = useNotificationStore();
  const isUnread = n.status === "unread";

  return (
    <div
      id={`hms-notif-item-${n.id}`}
      onClick={() => markAsRead(n.id)}
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 16px",
        cursor: "pointer",
        borderBottom: "1px solid var(--hms-border-subtle)",
        background: isUnread ? "var(--hms-surface-raised)" : "transparent",
        transition: "background 0.2s",
      }}
    >
      <div style={{ paddingTop: 2, flexShrink: 0 }}>{categoryIcon(n.category)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <Text
            strong={isUnread}
            style={{
              fontSize: 13,
              color: "var(--hms-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {n.title}
          </Text>
          {isUnread && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: priorityColor(n.priority),
                flexShrink: 0,
              }}
            />
          )}
        </div>
        <Text
          type="secondary"
          style={{ fontSize: 12, display: "block", marginTop: 2, lineHeight: 1.4 }}
        >
          {n.body}
        </Text>
        <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
          <Tag
            color={n.priority === "critical" ? "error" : n.priority === "normal" ? "processing" : "default"}
            style={{ fontSize: 10, padding: "0 6px", margin: 0 }}
          >
            {n.priority.toUpperCase()}
          </Tag>
          <Tag
            color="default"
            style={{ fontSize: 10, padding: "0 6px", margin: 0 }}
          >
            {n.channel.toUpperCase()}
          </Tag>
          {n.patientName && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {n.patientName}
            </Text>
          )}
          <Text type="secondary" style={{ fontSize: 11, marginLeft: "auto" }}>
            {timeAgo(n.createdAt)}
          </Text>
        </div>
      </div>
    </div>
  );
}

export function HmsNotificationDrawer() {
  const { notifications, unreadCount, isDrawerOpen, closeDrawer, markAllAsRead } =
    useNotificationStore();

  return (
    <Drawer
      id="hms-notification-drawer"
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Space>
            <Title level={5} style={{ margin: 0, color: "var(--hms-text-primary)" }}>
              Notifications
            </Title>
            {unreadCount > 0 && (
              <Tag color="error" style={{ borderRadius: 10 }}>
                {unreadCount} unread
              </Tag>
            )}
          </Space>
        </div>
      }
      placement="right"
      width={420}
      open={isDrawerOpen}
      onClose={closeDrawer}
      closeIcon={<CloseOutlined />}
      styles={{
        body: { padding: 0, background: "var(--hms-surface-base)" },
        header: {
          background: "var(--hms-surface-raised)",
          borderBottom: "1px solid var(--hms-border-subtle)",
        },
      }}
      extra={
        unreadCount > 0 ? (
          <Tooltip title="Mark all as read">
            <Button
              id="hms-notif-mark-all-read"
              type="link"
              size="small"
              onClick={markAllAsRead}
              style={{ color: "var(--hms-accent-primary)" }}
            >
              Mark all read
            </Button>
          </Tooltip>
        ) : null
      }
      footer={
        <div style={{ textAlign: "center" }}>
          <Button
            id="hms-notif-view-all"
            type="link"
            href="/notifications"
            style={{ color: "var(--hms-accent-primary)" }}
          >
            View Full Notification Log →
          </Button>
        </div>
      }
    >
      {notifications.length === 0 ? (
        <Empty
          description="No notifications"
          style={{ paddingTop: 60 }}
        />
      ) : (
        <div>
          {notifications.map((n) => (
            <NotificationItem key={n.id} n={n} />
          ))}
        </div>
      )}
    </Drawer>
  );
}
