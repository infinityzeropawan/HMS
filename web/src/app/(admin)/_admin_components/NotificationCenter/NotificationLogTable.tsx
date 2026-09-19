"use client";

import React, { useState } from "react";
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
import {
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Tabs,
  Modal,
  Form,
  Input,
  Alert,
  message,
  Badge,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Send,
  Radio,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Building2,
  Clock,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import type {
  HmsNotification,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationCategory,
  BroadcastTarget,
  CommunicationLogEntry,
  NotificationValidationResult,
} from "@/lib/notification_store/notification.types";
import { useNotificationStore } from "@/lib/notification_store/notification.store";
import { useCommunicationStore } from "../../_admin_stores/communication_store";
import { NotificationService } from "../../_admin_services/notification_service";
import { CommunicationService } from "../../_admin_services/communication_service";

function getChannelIcon(channel: NotificationChannel): React.ReactNode {
  switch (channel) {
    case "sms": return <MobileOutlined style={{ color: "#0284c7" }} />;
    case "whatsapp": return <MessageOutlined style={{ color: "#25d366" }} />;
    case "email": return <MailOutlined style={{ color: "#ea580c" }} />;
    case "push": return <NotificationOutlined style={{ color: "#9333ea" }} />;
    case "system": return <AlertOutlined style={{ color: "#0d9488" }} />;
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
    case "critical": return <Tag color="error" className="font-bold">CRITICAL</Tag>;
    case "normal": return <Tag color="processing">NORMAL</Tag>;
    case "low": return <Tag color="default">LOW</Tag>;
  }
}

export function NotificationLogTable() {
  const notifications = useNotificationStore((state) => state.notifications);
  const commLogs = useCommunicationStore((state) => state.logs);

  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [validationReport, setValidationReport] = useState<NotificationValidationResult | null>(null);

  // Forms
  const [sendForm] = Form.useForm();
  const [broadcastForm] = Form.useForm();

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");

  const templates = CommunicationService.getTemplates();

  const filteredNotifications = notifications.filter((n) => {
    if (channelFilter !== "all" && n.channel !== channelFilter) return false;
    if (priorityFilter !== "all" && n.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && n.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchBody = n.body.toLowerCase().includes(q);
      const matchPatient = n.patientName?.toLowerCase().includes(q);
      const matchRole = n.recipientRole?.toLowerCase().includes(q);
      if (!matchTitle && !matchBody && !matchPatient && !matchRole) return false;
    }
    return true;
  });

  const handleSendNotification = async () => {
    try {
      const values = await sendForm.validateFields();
      let variables: Record<string, string | number> = {};

      if (values.templateKey) {
        variables = {
          patientName: values.varPatientName || "Sunil Verma",
          doctorName: values.varDoctorName || "Dr. Rajesh Sharma",
          departmentName: values.varDepartmentName || "Cardiology",
          amount: values.varAmount || "1,200",
          appointmentTime: values.varAppointmentTime || "11:00 AM",
        };
      }

      const res = NotificationService.sendNotification(
        {
          channel: values.channel,
          priority: values.priority,
          category: values.category || "SYSTEM",
          patientName: values.patientName,
          recipientRole: values.recipientRole,
          recipientContact: values.recipientContact,
          templateKey: values.templateKey,
          templateVariables: variables,
          customTitle: values.customTitle,
          customBody: values.customBody,
        },
        "Dr. Rajesh Sharma (Admin)",
        "HOSPITAL_ADMIN"
      );

      if (res.success) {
        message.success(`Notification dispatched successfully: ${res.message}`);
        setIsSendModalOpen(false);
        sendForm.resetFields();
        setSelectedTemplateKey("");
      } else {
        message.error(`Dispatch Warning: ${res.message}`);
      }
    } catch {
      // Form validation fail
    }
  };

  const handleSendBroadcast = async () => {
    try {
      const values = await broadcastForm.validateFields();
      const res = NotificationService.sendBroadcast(
        {
          target: values.target,
          channel: values.channel || "system",
          priority: values.priority || "normal",
          title: values.title,
          body: values.body,
        },
        "Dr. Rajesh Sharma (Admin)",
        "HOSPITAL_ADMIN"
      );

      if (res.success) {
        message.success(res.message);
        setIsBroadcastModalOpen(false);
        broadcastForm.resetFields();
      }
    } catch {
      // Form validation fail
    }
  };

  const handleTriggerEscalation = (notification: HmsNotification) => {
    const res = NotificationService.triggerEscalation(
      notification.id,
      "Dr. Rajesh Sharma (Admin)",
      "HOSPITAL_ADMIN"
    );
    if (res.success) {
      message.warning(res.message);
    } else {
      message.error(res.message);
    }
  };

  const handleRunValidation = () => {
    const report = NotificationService.validateNotificationIntegrity();
    setValidationReport(report);
    if (report.valid && report.warnings.length === 0) {
      message.success("Notification Platform Audit Passed: All templates and target channels are 100% verified.");
    } else {
      message.warning(`Notification Audit Complete: ${report.errors.length} errors, ${report.warnings.length} warnings.`);
    }
  };

  const columns: ColumnsType<HmsNotification> = [
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      width: 100,
      render: (val: NotificationChannel) => (
        <Space size="small">
          {getChannelIcon(val)}
          <Typography.Text style={{ fontSize: 11 }} className="font-semibold text-slate-700">
            {val.toUpperCase()}
          </Typography.Text>
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
      title: "Notification Message",
      key: "title",
      render: (_, rec: HmsNotification) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
            <span>{rec.title}</span>
            {rec.templateKey && (
              <Tag color="cyan" className="text-[10px] py-0 px-1 font-mono">
                {rec.templateKey}
              </Tag>
            )}
          </div>
          <div className="text-slate-500 text-xs leading-relaxed">{rec.body}</div>
          {rec.escalationLevel && rec.escalationLevel > 1 && (
            <div className="text-red-700 text-[11px] font-bold flex items-center gap-1 mt-1 bg-red-50 p-1 rounded border border-red-100">
              <Zap className="w-3 h-3 text-red-600" />
              <span>Escalated to Level {rec.escalationLevel} ({rec.recipientRole || "HOD"})</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Target Recipient",
      key: "recipient",
      width: 170,
      render: (_, rec: HmsNotification) => (
        <div className="text-xs space-y-0.5">
          {rec.patientName && (
            <div className="font-medium text-slate-800 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" /> {rec.patientName}
            </div>
          )}
          {rec.recipientRole && (
            <div>Role: <Tag color="blue" className="text-[10px]">{rec.recipientRole}</Tag></div>
          )}
          {rec.broadcastTarget && (
            <div>Target: <Tag color="purple" className="text-[10px] font-bold">{rec.broadcastTarget}</Tag></div>
          )}
          {rec.departmentCode && (
            <div className="text-slate-400 text-[11px]">Dept: {rec.departmentCode}</div>
          )}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 140,
      render: (val: NotificationCategory) => (
        <Tag color="geekblue" className="text-[10px]">
          {val.replace(/_/g, " ")}
        </Tag>
      ),
    },
    {
      title: "Delivery Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (val: NotificationStatus, rec: HmsNotification) => (
        <div className="space-y-1">
          <div>{getStatusTag(val)}</div>
          {rec.failureReason && (
            <div className="text-[10px] text-red-600 truncate max-w-[110px]" title={rec.failureReason}>
              {rec.failureReason}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions / Timeline",
      key: "actions",
      width: 150,
      render: (_, rec: HmsNotification) => (
        <div className="space-y-1 text-[11px]">
          <div className="text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{new Date(rec.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          {rec.priority === "critical" && rec.status === "unread" && (
            <HmsButton
              size="sm"
              variant="danger"
              icon={<Zap className="w-3 h-3" />}
              onClick={() => handleTriggerEscalation(rec)}
            >
              Escalate
            </HmsButton>
          )}
        </div>
      ),
    },
  ];

  const commLogColumns: ColumnsType<CommunicationLogEntry> = [
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      width: 90,
      render: (c: NotificationChannel) => (
        <Space size="small">
          {getChannelIcon(c)}
          <span className="font-bold text-xs text-slate-700">{c.toUpperCase()}</span>
        </Space>
      ),
    },
    {
      title: "Recipient Contact",
      key: "recipient",
      render: (entry: CommunicationLogEntry) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{entry.recipientName}</div>
          <div className="text-xs text-slate-500 font-mono">{entry.recipientContact}</div>
        </div>
      ),
    },
    {
      title: "Rendered Body",
      dataIndex: "renderedBody",
      key: "renderedBody",
      render: (body: string) => <div className="text-xs text-slate-600 line-clamp-2">{body}</div>,
    },
    {
      title: "Gateway Response",
      dataIndex: "gatewayResponse",
      key: "gatewayResponse",
      render: (resp: string) => (
        <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {resp}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (s: NotificationStatus) => getStatusTag(s),
    },
    {
      title: "Timestamp",
      dataIndex: "sentAt",
      key: "sentAt",
      width: 140,
      render: (t: string) => new Date(t).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Filter & Control Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-full sm:w-56">
            <Input
              placeholder="Search title, patient, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>

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
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <HmsButton
            size="sm"
            variant="outline"
            icon={<ShieldCheck className="w-4 h-4 text-teal-600" />}
            onClick={handleRunValidation}
            className="w-full sm:w-auto"
          >
            Audit Integrity
          </HmsButton>

          <HmsButton
            size="sm"
            variant="secondary"
            icon={<Radio className="w-4 h-4 text-purple-600" />}
            onClick={() => setIsBroadcastModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Send Broadcast
          </HmsButton>

          <HmsButton
            size="sm"
            variant="primary"
            icon={<Send className="w-4 h-4" />}
            onClick={() => setIsSendModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Send Notification
          </HmsButton>
        </div>
      </div>

      {/* Validation Banner if run */}
      {validationReport && (
        <Alert
          type={validationReport.errors.length > 0 ? "error" : validationReport.warnings.length > 0 ? "warning" : "success"}
          showIcon
          icon={validationReport.errors.length > 0 ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          message={
            <div className="font-semibold">
              Notification Platform Validation Report: {validationReport.errors.length} Errors | {validationReport.warnings.length} Warnings
            </div>
          }
          description={
            <div className="text-xs space-y-1 mt-1">
              {validationReport.errors.map((err, i) => (
                <div key={i} className="text-red-700 font-medium">• {err}</div>
              ))}
              {validationReport.warnings.map((warn, i) => (
                <div key={i} className="text-amber-700">• {warn}</div>
              ))}
              {validationReport.errors.length === 0 && validationReport.warnings.length === 0 && (
                <div className="text-emerald-700 font-medium">All notification delivery channels, template mappings, and escalation chains are 100% verified.</div>
              )}
            </div>
          }
          closable
          onClose={() => setValidationReport(null)}
        />
      )}

      {/* Tabs View */}
      <Tabs
        defaultActiveKey="notifications"
        items={[
          {
            key: "notifications",
            label: (
              <span className="flex items-center gap-1.5 font-medium">
                <NotificationOutlined /> Notification Log ({filteredNotifications.length})
              </span>
            ),
            children: (
              <div className="w-full overflow-x-auto">
                <Table<HmsNotification>
                  id="notification-log-table"
                  rowKey="id"
                  columns={columns}
                  dataSource={filteredNotifications}
                  scroll={{ x: "max-content" }}
                  pagination={{ pageSize: 15, showTotal: (t) => `${t} notifications` }}
                  bordered
                  size="middle"
                />
              </div>
            ),
          },
          {
            key: "communication_logs",
            label: (
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4 text-amber-600" /> Communication Gateway Log ({commLogs.length})
              </span>
            ),
            children: (
              <div className="w-full overflow-x-auto">
                <Table<CommunicationLogEntry>
                  rowKey="id"
                  columns={commLogColumns}
                  dataSource={commLogs}
                  scroll={{ x: "max-content" }}
                  pagination={{ pageSize: 15 }}
                  bordered
                  size="middle"
                />
              </div>
            ),
          },
        ]}
      />

      {/* Send Targeted Notification Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <Send className="w-5 h-5 text-teal-600" />
            <span>Send Targeted Hospital Notification</span>
          </div>
        }
        open={isSendModalOpen}
        onCancel={() => {
          setIsSendModalOpen(false);
          sendForm.resetFields();
          setSelectedTemplateKey("");
        }}
        onOk={handleSendNotification}
        okText="Dispatch Notification"
        width={680}
      >
        <Form form={sendForm} layout="vertical" className="mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item
              name="channel"
              label="Delivery Channel"
              rules={[{ required: true }]}
              initialValue="system"
            >
              <Select
                options={[
                  { label: "In-App System Alert", value: "system" },
                  { label: "SMS Text Message", value: "sms" },
                  { label: "WhatsApp Business", value: "whatsapp" },
                  { label: "Transactional Email", value: "email" },
                  { label: "Web Push Notification", value: "push" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priority Level"
              rules={[{ required: true }]}
              initialValue="normal"
            >
              <Select
                options={[
                  { label: "Critical Alert", value: "critical" },
                  { label: "Normal Priority", value: "normal" },
                  { label: "Low Informational", value: "low" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="templateKey"
              label="Template Key"
            >
              <Select
                placeholder="Select reusable template"
                allowClear
                onChange={(val) => setSelectedTemplateKey(val || "")}
                options={templates.map((t) => ({ label: t.name, value: t.key }))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="patientName" label="Recipient Patient Name">
              <Input placeholder="e.g. Ramesh Kumar" />
            </Form.Item>

            <Form.Item name="recipientRole" label="Target Staff Role">
              <Select
                placeholder="Select role"
                allowClear
                options={[
                  { label: "Doctor", value: "DOCTOR" },
                  { label: "Nurse", value: "NURSE" },
                  { label: "Finance / Billing", value: "FINANCE" },
                  { label: "Receptionist", value: "RECEPTIONIST" },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item name="recipientContact" label="Recipient Phone Number / Email Address">
            <Input placeholder="+91 98765 43210 or doctor@hospital.com" />
          </Form.Item>

          {selectedTemplateKey ? (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 space-y-3">
              <div className="text-xs font-semibold text-teal-800">Template Dynamic Variables:</div>
              <div className="grid grid-cols-2 gap-2">
                <Form.Item name="varPatientName" label="Patient Name" className="mb-0" initialValue="Sunil Verma">
                  <Input size="small" />
                </Form.Item>
                <Form.Item name="varDoctorName" label="Doctor Name" className="mb-0" initialValue="Dr. Rajesh Sharma">
                  <Input size="small" />
                </Form.Item>
                <Form.Item name="varDepartmentName" label="Department" className="mb-0" initialValue="Cardiology">
                  <Input size="small" />
                </Form.Item>
                <Form.Item name="varAppointmentTime" label="Time / Date" className="mb-0" initialValue="11:00 AM">
                  <Input size="small" />
                </Form.Item>
              </div>
            </div>
          ) : (
            <>
              <Form.Item name="customTitle" label="Custom Message Title" rules={[{ required: true, message: "Title required" }]}>
                <Input placeholder="Enter notification title" />
              </Form.Item>

              <Form.Item name="customBody" label="Custom Message Body" rules={[{ required: true, message: "Body required" }]}>
                <Input.TextArea rows={3} placeholder="Enter message text..." />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* Send Group Broadcast Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <Radio className="w-5 h-5 text-purple-600" />
            <span>Transmit Group Broadcast Alert</span>
          </div>
        }
        open={isBroadcastModalOpen}
        onCancel={() => {
          setIsBroadcastModalOpen(false);
          broadcastForm.resetFields();
        }}
        onOk={handleSendBroadcast}
        okText="Transmit Broadcast"
        width={580}
      >
        <Form form={broadcastForm} layout="vertical" className="mt-3">
          <Form.Item
            name="target"
            label="Broadcast Target Audience Group"
            rules={[{ required: true, message: "Target group required" }]}
            initialValue="ALL_STAFF"
          >
            <Select
              options={[
                { label: "All Hospital Staff", value: "ALL_STAFF" },
                { label: "All On-Duty Doctors", value: "ALL_DOCTORS" },
                { label: "All Nursing Staff", value: "ALL_NURSES" },
                { label: "All Billing Desk Officers", value: "ALL_BILLING_STAFF" },
                { label: "Department Broadcast (Cardiology)", value: "DEPARTMENT_BROADCAST" },
                { label: "Ward Broadcast (ICU Wing)", value: "WARD_BROADCAST" },
              ]}
            />
          </Form.Item>

          <Form.Item name="title" label="Broadcast Announcement Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. CODE BLUE Emergency Drill / Hospital Staff Meeting" />
          </Form.Item>

          <Form.Item name="body" label="Announcement Details" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Provide broadcast instructions..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
