"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Tag, Modal, Form, Input, InputNumber, Select, message, Space, Switch } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons";
import { Receipt, Building2, SlidersHorizontal, ShieldCheck, Database, FileText, Headphones, CheckCircle2, ArrowUpRight } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";

import { SubscriptionPlanService, PlanConfig, TenantSubscription } from "../_super_admin_services/subscription_plan_service";

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<PlanConfig[]>(() => SubscriptionPlanService.getPlans());
  const [tenantSubs, setTenantSubs] = useState<TenantSubscription[]>(() => SubscriptionPlanService.getTenantSubscriptions());
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantSubscription | null>(null);
  const [form] = Form.useForm();
  const [upgradeForm] = Form.useForm();

  useEffect(() => {
    return SubscriptionPlanService.subscribe(() => {
      setPlans(SubscriptionPlanService.getPlans());
      setTenantSubs(SubscriptionPlanService.getTenantSubscriptions());
    });
  }, []);

  const activeSubscriptions = tenantSubs.filter((sub) => sub.status === "ACTIVE");
  const monthlyRecurringRevenue = activeSubscriptions.reduce((total, sub) => {
    const plan = plans.find((item) => item.code === sub.planCode);
    if (!plan) return total;
    return total + (sub.billingCycle === "ANNUAL" ? plan.monthlyFee : plan.monthlyFee);
  }, 0);
  const averageSlaTarget = activeSubscriptions.length
    ? Math.max(
        ...activeSubscriptions.map((sub) => {
          const plan = plans.find((item) => item.code === sub.planCode);
          return plan?.sla.includes("99.99") ? 99.99 : plan?.sla.includes("24/7") ? 99.9 : 99;
        })
      )
    : 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreatePlan = (values: Record<string, any>) => {
    const newPlan: PlanConfig = {
      id: `plan-${Date.now()}`,
      code: values.code.toUpperCase(),
      name: values.name,
      monthlyFee: Number(values.monthlyFee),
      maxUsers: `${values.maxUsers} Users`,
      maxBeds: `${values.maxBeds} Beds`,
      modules: values.modules || ["OPD Queue", "Billing"],
      sla: values.sla || "Standard 24/7",
      status: "ACTIVE",
      includedFeatures: values.modules || ["OPD Queue", "Billing"],
      restrictedFeatures: [],
      optionalAddons: [],
    };
    SubscriptionPlanService.savePlan(newPlan);
    message.success(`Subscription Plan '${newPlan.name}' created successfully!`);
    setPlanModalOpen(false);
    form.resetFields();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpgradeTenantPlan = (values: Record<string, any>) => {
    if (!selectedTenant) return;
    const updated: TenantSubscription = {
      ...selectedTenant,
      planCode: values.planCode,
      billingCycle: values.billingCycle,
    };
    SubscriptionPlanService.updateTenantSubscription(updated);
    message.success(`Subscription plan for ${selectedTenant.tenantName} updated to ${values.planCode}!`);
    setUpgradeModalOpen(false);
  };

  const planColumns = [
    { title: "Plan Code", dataIndex: "code", key: "code", render: (c: string) => <Tag color="purple" className="font-bold font-mono">{c}</Tag> },
    { title: "Plan Name", dataIndex: "name", key: "name", render: (n: string) => <strong className="text-slate-900">{n}</strong> },
    { title: "Monthly Fee", dataIndex: "monthlyFee", key: "monthlyFee", render: (f: number) => <span className="font-bold text-emerald-700 font-mono">₹{f.toLocaleString("en-IN")} / mo</span> },
    { title: "Capacity Limits", key: "limits", render: (_: unknown, r: PlanConfig) => <span className="text-xs">{r.maxUsers} &bull; {r.maxBeds}</span> },
    { title: "SLA Support", dataIndex: "sla", key: "sla", render: (s: string) => <Tag color="blue">{s}</Tag> },
    {
      title: "Included Modules",
      dataIndex: "modules",
      key: "modules",
      render: (mods: string[]) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {mods.map((m, idx) => (
            <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">{m}</span>
          ))}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={s === "ACTIVE" ? "emerald" : "default"}>{s}</Tag>,
    },
  ];

  const tenantColumns = [
    { title: "Tenant ID", dataIndex: "tenantId", key: "tenantId", render: (t: string) => <span className="font-mono text-xs text-slate-500">{t}</span> },
    { title: "Hospital Name", dataIndex: "tenantName", key: "tenantName", render: (n: string) => <strong className="text-slate-900">{n}</strong> },
    { title: "Assigned Plan", dataIndex: "planCode", key: "planCode", render: (p: string) => <Tag color="purple" className="font-bold">{p}</Tag> },
    { title: "Billing Cycle", dataIndex: "billingCycle", key: "billingCycle", render: (b: string) => <Tag color="cyan">{b}</Tag> },
    { title: "User Seats Used", dataIndex: "userSeats", key: "userSeats", render: (u: string) => <span className="font-mono text-xs font-semibold">{u}</span> },
    { title: "Next Renewal", dataIndex: "renewalDate", key: "renewalDate", render: (d: string) => <span className="text-xs text-slate-600">{d}</span> },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: TenantSubscription) => (
        <HmsButton
          size="sm"
          variant="secondary"
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedTenant(record);
            setUpgradeModalOpen(true);
          }}
        >
          Change Plan
        </HmsButton>
      ),
    },
  ];

  return (
    <HmsAppShell title="SaaS Subscription Plans & Tier Configurator">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Super Admin Navigation Bar */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-purple-600" /> Subscription Plans & SaaS Tiers
            </h1>
            <p className="text-sm text-slate-500 mt-1">Configure SaaS Pricing Tiers, Capacity Limits, Module Entitlements & SLA Allocations</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/tenants">
              <HmsButton size="sm" variant="secondary" icon={<Building2 className="w-4 h-4" />}>
                Tenant Onboarding
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
            <Link href="/support-tickets">
              <HmsButton size="sm" variant="secondary" icon={<Headphones className="w-4 h-4" />}>
                Support Tickets
              </HmsButton>
            </Link>
          </div>
        </div>

        {/* Subscription KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Configured Plans</p>
                <h3 className="text-2xl font-bold text-purple-800 mt-1">{plans.length} Tiers</h3>
                <p className="text-3xs text-purple-600 font-semibold mt-0.5">Basic, Pro, Enterprise</p>
              </div>
              <Receipt className="w-8 h-8 text-purple-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Monthly SaaS MRR</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">₹{(monthlyRecurringRevenue / 100000).toFixed(1)} Lakhs</h3>
                <p className="text-3xs text-slate-500 font-semibold mt-0.5">Derived from active plan assignments</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Subscribed Tenants</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">{activeSubscriptions.length} Hospitals</h3>
                <p className="text-3xs text-slate-500 mt-0.5">{tenantSubs.length} total plan assignments</p>
              </div>
              <Building2 className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Target Uptime SLA</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{averageSlaTarget.toFixed(2)}%</h3>
                <p className="text-3xs text-slate-500 font-semibold mt-0.5">Highest active plan SLA target</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-amber-500" />
            </div>
          </HmsCard>
        </div>

        {/* Section 1: Configured Subscription Plans Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" /> SaaS Pricing & Plan Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Active tier configurations available for hospital tenant onboarding.</p>
            </div>
            <HmsButton variant="emerald" icon={<PlusOutlined />} onClick={() => setPlanModalOpen(true)}>
              Create New Plan
            </HmsButton>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <Table columns={planColumns} dataSource={plans} rowKey="id" pagination={false} scroll={{ x: 900 }} size="middle" />
          </div>
        </div>

        {/* Section 2: Tenant Subscription Assignments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" /> Active Tenant Plan Subscriptions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Hospital tenants and their current tier allocations.</p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <Table columns={tenantColumns} dataSource={tenantSubs} rowKey="key" pagination={false} scroll={{ x: 900 }} size="middle" />
          </div>
        </div>

        {/* Modal: Create New Subscription Plan */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-purple-800 font-bold border-b pb-3">
              <Receipt className="w-5 h-5 text-purple-600" />
              <span>Define New Subscription Plan Tier</span>
            </div>
          }
          open={planModalOpen}
          onCancel={() => setPlanModalOpen(false)}
          footer={null}
          width="min(580px, calc(100vw - 32px))"
        >
          <Form form={form} layout="vertical" onFinish={handleCreatePlan} className="mt-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item label="Plan Code" name="code" rules={[{ required: true }]}>
                <Input placeholder="e.g. ULTIMATE" size="large" />
              </Form.Item>
              <Form.Item label="Plan Display Name" name="name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Ultimate Super Specialty" size="large" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Form.Item label="Monthly Fee (₹)" name="monthlyFee" rules={[{ required: true }]}>
                <InputNumber min={0} max={1000000} className="w-full" size="large" />
              </Form.Item>
              <Form.Item label="Max User Seats" name="maxUsers" rules={[{ required: true }]}>
                <InputNumber min={1} max={5000} className="w-full" size="large" />
              </Form.Item>
              <Form.Item label="Max Inpatient Beds" name="maxBeds" rules={[{ required: true }]}>
                <InputNumber min={1} max={5000} className="w-full" size="large" />
              </Form.Item>
            </div>

            <Form.Item label="Included Modules" name="modules">
              <Select mode="multiple" placeholder="Select included modules" size="large" defaultValue={["OPD Queue", "IPD Ward Matrix", "Pharmacy FEFO", "ABDM Gateway"]}>
                <Select.Option value="OPD Queue">OPD Queue & Appointments</Select.Option>
                <Select.Option value="IPD Ward Matrix">IPD Ward & Bed Matrix</Select.Option>
                <Select.Option value="OT Scheduler">OT Surgical Suite</Select.Option>
                <Select.Option value="Pharmacy FEFO">Pharmacy & FEFO Inventory</Select.Option>
                <Select.Option value="Lab Pathology">Pathology & Lab Integration</Select.Option>
                <Select.Option value="PACS DICOM Viewer">PACS DICOM Viewer</Select.Option>
                <Select.Option value="ABDM Gateway">ABDM Gateway M1/M2</Select.Option>
                <Select.Option value="CDSS AI Assist">CDSS AI Clinical Assist</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="SLA Support Level" name="sla" initialValue="Priority 24/7 SLA">
              <Select size="large">
                <Select.Option value="Standard (9x5)">Standard (9x5)</Select.Option>
                <Select.Option value="Priority 24/7 SLA">Priority 24/7 SLA</Select.Option>
                <Select.Option value="Dedicated 99.99% SLA">Dedicated 99.99% SLA</Select.Option>
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setPlanModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
              >
                Save & Activate Plan
              </button>
            </div>
          </Form>
        </Modal>

        {/* Modal: Upgrade / Downgrade Tenant Plan */}
        {selectedTenant && (
          <Modal
            title={
              <div className="flex items-center gap-2 text-teal-700 font-bold border-b pb-3">
                <Building2 className="w-5 h-5 text-teal-600" />
                <span>Change Subscription Plan ({selectedTenant.tenantName})</span>
              </div>
            }
            open={upgradeModalOpen}
            onCancel={() => setUpgradeModalOpen(false)}
            footer={null}
            width="min(480px, calc(100vw - 32px))"
          >
            <Form
              form={upgradeForm}
              layout="vertical"
              onFinish={handleUpgradeTenantPlan}
              initialValues={{
                planCode: selectedTenant.planCode,
                billingCycle: selectedTenant.billingCycle,
              }}
              className="mt-3 space-y-3"
            >
              <Form.Item label="Select New Plan Tier" name="planCode" rules={[{ required: true }]}>
                <Select size="large">
                  {plans.map((p) => (
                    <Select.Option key={p.code} value={p.code}>
                      {p.name} ({p.code}) — ₹{p.monthlyFee.toLocaleString("en-IN")}/mo
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Billing Cycle" name="billingCycle" rules={[{ required: true }]}>
                <Select size="large">
                  <Select.Option value="MONTHLY">Monthly Billing</Select.Option>
                  <Select.Option value="ANNUAL">Annual Billing (15% Discount)</Select.Option>
                </Select>
              </Form.Item>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900">
                <strong>Capacity Sync:</strong> Updating subscription plan will automatically adjust maximum user seats and bed allocation limits for {selectedTenant.tenantName}.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setUpgradeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
                >
                  Confirm Plan Update
                </button>
              </div>
            </Form>
          </Modal>
        )}
      </div>
    </HmsAppShell>
  );
}
