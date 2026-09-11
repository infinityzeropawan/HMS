"use client";
import { Space, Typography } from "antd";
import { NotificationLogTable } from "@/app/(admin)/_admin_components/NotificationCenter/NotificationLogTable";

export default function NotificationsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Notification Center
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: "4px 0 0" }}>
            Full log of all SMS, WhatsApp, Email, Push, and System notifications.
            Filter by channel, priority, or delivery status.
          </Typography.Paragraph>
        </div>
        <NotificationLogTable />
      </Space>
    </main>
  );
}
