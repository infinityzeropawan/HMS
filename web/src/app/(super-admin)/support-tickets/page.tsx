"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Table, Tag, Modal, Form, Input, Select, message } from "antd";
import { SearchOutlined, PlusOutlined, MessageOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Headphones, Building2, Receipt, SlidersHorizontal, Database, ShieldCheck, Clock, CheckCircle2, AlertTriangle, UserCheck } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";

interface SupportTicket {
  key: string;
  ticketId: string;
  tenantName: string;
  tenantId: string;
  subject: string;
  category: "BILLING_QUERY" | "PACS_INTEGRATION" | "USER_SEATS_LIMIT" | "ABDM_GATEWAY" | "SYSTEM_BUG";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdDate: string;
  assignedAgent: string;
  conversation: { sender: string; text: string; time: string }[];
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    key: "1",
    ticketId: "TICK-901",
    tenantName: "Apollo Super Speciality Hospital",
    tenantId: "TENANT-001",
    subject: "Requesting additional user seat allocation for IPD Nurse Station",
    category: "USER_SEATS_LIMIT",
    priority: "HIGH",
    status: "OPEN",
    createdDate: "2026-09-17 08:30 AM",
    assignedAgent: "Agent Rahul (Tier 2 Support)",
    conversation: [
      { sender: "Apollo Admin", text: "We have reached our 85 user limit and need 15 additional nurse seats provisioned.", time: "08:30 AM" },
    ],
  },
  {
    key: "2",
    ticketId: "TICK-902",
    tenantName: "Fortis Care Heart Institute",
    tenantId: "TENANT-002",
    subject: "ABDM M2 Consent Artifact Push Latency Query",
    category: "ABDM_GATEWAY",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    createdDate: "2026-09-17 09:15 AM",
    assignedAgent: "Eng. Sneha (ABDM Gateway Team)",
    conversation: [
      { sender: "Fortis Admin", text: "ABHA consent artifact responses taking > 3 seconds during peak hours.", time: "09:15 AM" },
      { sender: "Eng. Sneha", text: "Investigating Redis cache queue size; scaling gateway workers.", time: "09:40 AM" },
    ],
  },
  {
    key: "3",
    ticketId: "TICK-903",
    tenantName: "City Diagnostics & OPD Clinic",
    tenantId: "TENANT-003",
    subject: "PACS DICOM Viewer WebGL rendering issue on Safari mobile",
    category: "PACS_INTEGRATION",
    priority: "MEDIUM",
    status: "RESOLVED",
    createdDate: "2026-09-16 02:00 PM",
    assignedAgent: "Agent Rahul (Tier 2 Support)",
    conversation: [
      { sender: "City Diag Admin", text: "DICOM canvas invert button not triggering on iOS 17.", time: "02:00 PM" },
      { sender: "Agent Rahul", text: "Applied WebGL context fallback patch v2.1.0.", time: "04:30 PM" },
    ],
  },
];

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: "red",
  HIGH: "volcano",
  MEDIUM: "orange",
  LOW: "blue",
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [form] = Form.useForm();

  const handleOpenReplyModal = (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    setReplyModalOpen(true);
  };

  const handleSendReply = () => {
    if (!activeTicket || !replyText.trim()) return;
    const updated = tickets.map((t) => {
      if (t.ticketId === activeTicket.ticketId) {
        return {
          ...t,
          status: "IN_PROGRESS" as const,
          conversation: [
            ...t.conversation,
            { sender: "SuperAdmin Support", text: replyText, time: new Date().toLocaleTimeString() },
          ],
        };
      }
      return t;
    });
    setTickets(updated);
    message.success(`Reply sent to ${activeTicket.tenantName} for ticket ${activeTicket.ticketId}!`);
    setReplyText("");
    setReplyModalOpen(false);
  };

  const handleResolveTicket = (ticketId: string) => {
    const updated = tickets.map((t) =>
      t.ticketId === ticketId ? { ...t, status: "RESOLVED" as const } : t
    );
    setTickets(updated);
    message.success(`Ticket ${ticketId} marked as RESOLVED!`);
    setReplyModalOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateTicket = (values: Record<string, any>) => {
    const newTicket: SupportTicket = {
      key: `tick-${Date.now()}`,
      ticketId: `TICK-${Math.floor(Math.random() * 900 + 100)}`,
      tenantName: values.tenantName,
      tenantId: `TENANT-00${tickets.length + 1}`,
      subject: values.subject,
      category: values.category,
      priority: values.priority,
      status: "OPEN",
      createdDate: new Date().toLocaleString(),
      assignedAgent: "SuperAdmin Support",
      conversation: [{ sender: "SuperAdmin", text: values.subject, time: new Date().toLocaleTimeString() }],
    };
    setTickets([newTicket, ...tickets]);
    message.success(`Support ticket ${newTicket.ticketId} created!`);
    setCreateModalOpen(false);
    form.resetFields();
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "Ticket ID & Date",
      key: "ticketId",
      render: (_: unknown, r: SupportTicket) => (
        <div>
          <span className="font-mono font-bold text-teal-700 block">{r.ticketId}</span>
          <span className="text-[11px] text-slate-500">{r.createdDate}</span>
        </div>
      ),
    },
    {
      title: "Hospital / Tenant",
      dataIndex: "tenantName",
      key: "tenantName",
      render: (n: string) => <strong className="text-slate-900 text-xs">{n}</strong>,
    },
    {
      title: "Subject & Category",
      key: "subject",
      render: (_: unknown, r: SupportTicket) => (
        <div className="max-w-md">
          <span className="font-semibold text-slate-800 text-xs block">{r.subject}</span>
          <Tag color="purple" className="text-[10px]">{r.category.replace("_", " ")}</Tag>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (p: string) => <Tag color={PRIORITY_COLOR[p]}>{p}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={s === "OPEN" ? "volcano" : s === "IN_PROGRESS" ? "processing" : "green"}>
          {s.replace("_", " ")}
        </Tag>
      ),
    },
    {
      title: "Assigned Agent",
      dataIndex: "assignedAgent",
      key: "assignedAgent",
      render: (a: string) => <span className="text-xs text-slate-600">{a}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, r: SupportTicket) => (
        <HmsButton
          size="sm"
          variant="secondary"
          icon={<MessageOutlined />}
          onClick={() => handleOpenReplyModal(r)}
        >
          View / Reply
        </HmsButton>
      ),
    },
  ];

  return (
    <HmsAppShell title="Platform Support Tickets & Tenant Escalation Console">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Headphones className="w-6 h-6 text-purple-600" /> Platform Support Tickets & Escalation Console
            </h1>
            <p className="text-sm text-slate-500 mt-1">Track, Respond & Resolve SaaS Tenant Support Requests and SLA Escalations</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/tenants">
              <HmsButton size="sm" variant="secondary" icon={<Building2 className="w-4 h-4" />}>
                Tenants
              </HmsButton>
            </Link>
            <Link href="/subscription-plans">
              <HmsButton size="sm" variant="secondary" icon={<Receipt className="w-4 h-4" />}>
                Subscriptions
              </HmsButton>
            </Link>
            <Link href="/feature-flags">
              <HmsButton size="sm" variant="secondary" icon={<SlidersHorizontal className="w-4 h-4" />}>
                Feature Flags
              </HmsButton>
            </Link>
            <Link href="/global-masters">
              <HmsButton size="sm" variant="secondary" icon={<Database className="w-4 h-4" />}>
                Global Masters
              </HmsButton>
            </Link>
            <Link href="/platform-audit">
              <HmsButton size="sm" variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
                Platform Audit
              </HmsButton>
            </Link>
          </div>
        </div>

        {/* Support KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-rose-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Open Tickets</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">
                  {tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length} Pending
                </h3>
                <p className="text-3xs text-rose-600 font-semibold mt-0.5">1 Critical Priority</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Avg SLA Resolution</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">1.2 Hours</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">SLA Target &lt; 4 Hours</p>
              </div>
              <Clock className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Resolved This Month</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">42 Tickets</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">100% CSAT Rating</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-indigo-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Customer CSAT</p>
                <h3 className="text-2xl font-bold text-indigo-800 mt-1">98.4%</h3>
                <p className="text-3xs text-indigo-600 font-semibold mt-0.5">High Tenant Satisfaction</p>
              </div>
              <UserCheck className="w-8 h-8 text-indigo-500" />
            </div>
          </HmsCard>
        </div>

        {/* Support Tickets Table Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search Ticket ID, Hospital Name, or Subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80"
              allowClear
            />

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Filter Status:</span>
                <Select value={statusFilter} onChange={(v) => setStatusFilter(v)} className="w-36">
                  <Select.Option value="ALL">All Tickets</Select.Option>
                  <Select.Option value="OPEN">Open</Select.Option>
                  <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
                  <Select.Option value="RESOLVED">Resolved</Select.Option>
                </Select>
              </div>

              <HmsButton variant="emerald" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                Create Ticket
              </HmsButton>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table columns={columns} dataSource={filteredTickets} rowKey="key" pagination={{ pageSize: 8 }} />
          </div>
        </div>

        {/* View & Reply Ticket Modal */}
        {activeTicket && (
          <Modal
            title={
              <div className="flex items-center justify-between border-b pb-3 pr-6">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-purple-600" />
                  <span>Support Ticket Thread ({activeTicket.ticketId})</span>
                </div>
                <Tag color={activeTicket.status === "OPEN" ? "volcano" : "green"}>{activeTicket.status}</Tag>
              </div>
            }
            open={replyModalOpen}
            onCancel={() => setReplyModalOpen(false)}
            footer={null}
            width={600}
          >
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">{activeTicket.tenantName}</p>
                <p className="text-slate-600 mt-0.5">{activeTicket.subject}</p>
                <div className="flex gap-2 mt-2">
                  <Tag color="purple">{activeTicket.category}</Tag>
                  <Tag color={PRIORITY_COLOR[activeTicket.priority]}>Priority: {activeTicket.priority}</Tag>
                </div>
              </div>

              {/* Conversation Log */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Message History</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-slate-100/70 rounded-xl border border-slate-200">
                  {activeTicket.conversation.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.sender.includes("SuperAdmin")
                          ? "bg-teal-50 border border-teal-200 ml-6 text-teal-900"
                          : "bg-white border border-slate-200 mr-6 text-slate-800"
                      }`}
                    >
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span>{msg.sender}</span>
                        <span className="text-slate-400 font-normal">{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              {activeTicket.status !== "RESOLVED" && (
                <div className="space-y-2 pt-2 border-t">
                  <label className="font-bold text-slate-800 block">Respond to Tenant:</label>
                  <Input.TextArea
                    rows={3}
                    placeholder="Type support response or resolution notes..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleResolveTicket(activeTicket.ticketId)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircleOutlined /> Mark as Resolved
                    </button>
                    <button
                      type="button"
                      onClick={handleSendReply}
                      className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
                    >
                      Send Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Create New Ticket Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-teal-700 font-bold border-b pb-3">
              <Headphones className="w-5 h-5 text-teal-600" />
              <span>Log Internal SuperAdmin Support Ticket</span>
            </div>
          }
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          footer={null}
          width={520}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateTicket} className="mt-3 space-y-3">
            <Form.Item label="Target Hospital / Tenant" name="tenantName" rules={[{ required: true }]} initialValue="Apollo Super Speciality Hospital">
              <Input size="large" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item label="Category" name="category" rules={[{ required: true }]} initialValue="USER_SEATS_LIMIT">
                <Select size="large">
                  <Select.Option value="USER_SEATS_LIMIT">User Seats & Limits</Select.Option>
                  <Select.Option value="BILLING_QUERY">Billing / Subscription</Select.Option>
                  <Select.Option value="PACS_INTEGRATION">PACS / DICOM Integration</Select.Option>
                  <Select.Option value="ABDM_GATEWAY">ABDM Gateway Linkage</Select.Option>
                  <Select.Option value="SYSTEM_BUG">System Bug Report</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Priority Level" name="priority" rules={[{ required: true }]} initialValue="HIGH">
                <Select size="large">
                  <Select.Option value="CRITICAL">CRITICAL (System Down)</Select.Option>
                  <Select.Option value="HIGH">HIGH Priority</Select.Option>
                  <Select.Option value="MEDIUM">MEDIUM Priority</Select.Option>
                  <Select.Option value="LOW">LOW Priority</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item label="Ticket Subject & Summary" name="subject" rules={[{ required: true }]}>
              <Input.TextArea rows={3} placeholder="Describe ticket issue or tenant request..." />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
              >
                Create Support Ticket
              </button>
            </div>
          </Form>
        </Modal>
      </div>
    </HmsAppShell>
  );
}
