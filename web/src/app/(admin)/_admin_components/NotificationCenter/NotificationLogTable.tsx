"use client";
import {
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  MailOutlined,
  MessageOutlined,
  MobileOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import type { HmsNotification, NotificationChannel, NotificationPriority, NotificationStatus } from "@/lib/notification_store/notification.types";
import { useNotificationStore } from "@/lib/notification_store/notification.store";

function getChannelIcon(channel: NotificationChannel): React.ReactNode {
  switch (channel) {
    case "sms": return <MobileOutlined />;
    case "whatsapp": return <MessageOutlined style={{ color: "#25d366" }} />;
    case "email": return <MailOutlined />;
    case "push": return <NotificationOutlined />;
    case "system": return <AlertOutlined style={{ color: "var(--hms-accent-primary)" }} />;
  }
}

function getStatusTag(status: NotificationStatus): React.ReactNode {
  switch (status) {
    case "queued": return <Tag icon={<ClockCircleOutlined />} color="default">Queued</Tag>;
    case "sent": return <Tag icon={<CheckCircleOutlined />} color="processing">Sent</Tag>;
    case "delivered": return <Tag icon={<CheckCircleOutlined />} color="success">Delivered</Tag>;
    case "failed": return <Tag icon={<CloseCircleOutlined />} color="error">Failed</Tag>;
    case "unread": return <Tag color="blue">Unread</Tag>;
    case "read": return <Tag color="default">Read</Tag>;
  }
}

function getPriorityTag(priority: NotificationPriority): React.ReactNode {
  switch (priority) {
    case "critical": return <Tag color="error">CRITICAL</Tag>;
    case "normal": return <Tag color="processing">NORMAL</Tag>;
    case "low": return <Tag color="default">LOW</Tag>;
  }
}

function buildColumns(): ColumnsType<HmsNotification> {
  return [
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      width: 90,
      render: (val: NotificationChannel) => (
        <Space>
          {getChannelIcon(val)}
          <Typography.Text style={{ fontSize: 12 }}>{val.toUpperCase()}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (val: NotificationPriority) => getPriorityTag(val),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (val, rec) => (
        <div>
          <Typography.Text strong style={{ fontSize: 13 }}>
            {val}
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {rec.body}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Patient",
      dataIndex: "patientName",
      key: "patientName",
      width: 140,
      render: (val) => val ? <Typography.Text>{val}</Typography.Text> : <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (val) => (
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          {val.replace(/_/g, " ")}
        </Typography.Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (val: NotificationStatus) => getStatusTag(val),
    },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
      render: (val) =>
        new Date(val).toLocaleString("en-IN", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
  ];
}

export function NotificationLogTable() {
  const { notifications } = useNotificationStore();
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = notifications.filter((n) => {
    if (channelFilter !== "all" && n.channel !== channelFilter) return false;
    if (priorityFilter !== "all" && n.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && n.status !== statusFilter) return false;
    return true;
  });

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space wrap>
        <FilterOutlined />
        <Select
          id="notif-channel-filter"
          value={channelFilter}
          onChange={setChannelFilter}
          style={{ width: 130 }}
          options={[
            { value: "all", label: "All Channels" },
            { value: "system", label: "System" },
            { value: "sms", label: "SMS" },
            { value: "whatsapp", label: "WhatsApp" },
            { value: "email", label: "Email" },
            { value: "push", label: "Push" },
          ]}
        />
        <Select
          id="notif-priority-filter"
          value={priorityFilter}
          onChange={setPriorityFilter}
          style={{ width: 130 }}
          options={[
            { value: "all", label: "All Priorities" },
            { value: "critical", label: "Critical" },
            { value: "normal", label: "Normal" },
            { value: "low", label: "Low" },
          ]}
        />
        <Select
          id="notif-status-filter"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 130 }}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "unread", label: "Unread" },
            { value: "read", label: "Read" },
            { value: "sent", label: "Sent" },
            { value: "delivered", label: "Delivered" },
            { value: "failed", label: "Failed" },
            { value: "queued", label: "Queued" },
          ]}
        />
      </Space>

      <Table<HmsNotification>
        id="notification-log-table"
        rowKey="id"
        columns={buildColumns()}
        dataSource={filtered}
        pagination={{ pageSize: 20, showTotal: (t) => `${t} notifications` }}
        scroll={{ x: 900 }}
        rowClassName={(rec) =>
          rec.status === "unread" ? "hms-row-unread" : ""
        }
      />
    </Space>
  );
}
