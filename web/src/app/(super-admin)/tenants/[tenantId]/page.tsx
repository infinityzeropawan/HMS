"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tabs,
  Tag,
  Progress,
  Switch,
  Input,
  Form,
  Timeline,
  Spin,
  Alert,
  message,
  Card,
  Badge,
  Tooltip,
} from "antd";
import {
  ArrowLeft,
  Building2,
  Shield,
  ShieldCheck,
  CreditCard,
  Activity,
  SlidersHorizontal,
  FileCheck2,
  Palette,
  FileText,
  Monitor,
  Users,
  HardDrive,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Globe,
  Lock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Save,
  Check,
} from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import {
  Tenant,
  TenantUsageMetrics,
  TenantAuditLog,
  TenantBrandingConfig,
} from "../../_super_admin_types/tenant_management";
import { TenantApiService } from "../../_super_admin_services/tenant_api_service";
import { ShieldAlert, RotateCcw, HeartPulse } from "lucide-react";
import { SuspendTenantModal } from "../../_super_admin_components/Subscriptions/SuspendTenantModal";
import { RestoreTenantModal } from "../../_super_admin_components/Subscriptions/RestoreTenantModal";
import { EditTenantModal, ManageSubscriptionModal } from "../../_super_admin_components/Subscriptions/TenantModals";
import { TenantHealthTab } from "../../_super_admin_components/Subscriptions/TenantHealthTab";
import { LiveBrandingPreviewWorkspace } from "../../_super_admin_components/FacilityControl/LiveBrandingPreviewWorkspace";
import { EmailBrandingWorkspace } from "../../_super_admin_components/FacilityControl/EmailBrandingWorkspace";
import { PdfBrandingWorkspace } from "../../_super_admin_components/FacilityControl/PdfBrandingWorkspace";
import { WhiteLabelControlsWorkspace } from "../../_super_admin_components/FacilityControl/WhiteLabelControlsWorkspace";
import { WhiteLabelService } from "../../_super_admin_services/white_label_service";
import { ExtendedTenantBrandingConfig } from "../../_super_admin_types/branding_types";

interface PageProps {
  params: Promise<{ tenantId: string }>;
}

export default function TenantDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tenantId = resolvedParams.tenantId;
  const router = useRouter();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [usageMetrics, setUsageMetrics] = useState<TenantUsageMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<TenantAuditLog[]>([]);

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  // Branding Form State
  const [brandingForm] = Form.useForm();
  const [savingBranding, setSavingBranding] = useState(false);

  // Feature Toggle Loading Map
  const [togglingModule, setTogglingModule] = useState<string | null>(null);

  const loadTenantDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TenantApiService.fetchTenantById(tenantId);
      if (!data) {
        setError(`Hospital Tenant with ID "${tenantId}" was not found.`);
        setLoading(false);
        return;
      }
      setTenant(data);
      brandingForm.setFieldsValue(data.branding);

      // Fetch supplementary metrics & logs
      const [metrics, logs] = await Promise.all([
        TenantApiService.fetchTenantUsage(tenantId),
        TenantApiService.fetchTenantAuditLogs(tenantId),
      ]);
      setUsageMetrics(metrics);
      setAuditLogs(logs);
    } catch {
      setError("Failed to fetch tenant workspace telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenantDetails();
  }, [tenantId]);

  // Handle Feature Toggle
  const handleToggleModule = async (moduleName: string) => {
    if (!tenant) return;
    setTogglingModule(moduleName);
    try {
      const updatedModules = await TenantApiService.toggleTenantModule(tenant.id, moduleName);
      setTenant({ ...tenant, enabledModules: updatedModules });
      message.success(`Module "${moduleName}" ${updatedModules.includes(moduleName) ? "enabled" : "disabled"} for ${tenant.hospitalName}`);
    } catch {
      message.error(`Failed to toggle module "${moduleName}".`);
    } finally {
      setTogglingModule(null);
    }
  };

  // Handle Branding Save
  const handleSaveBranding = async (values: TenantBrandingConfig) => {
    if (!tenant) return;
    setSavingBranding(true);
    try {
      const updatedBranding = await TenantApiService.updateTenantBranding(tenant.id, values);
      setTenant({ ...tenant, branding: updatedBranding });
      message.success("Hospital tenant branding settings saved successfully!");
    } catch {
      message.error("Failed to save branding configurations.");
    } finally {
      setSavingBranding(false);
    }
  };

  // Handle Auto-Renewal Toggle
  const handleToggleAutoRenew = async (checked: boolean) => {
    if (!tenant) return;
    try {
      const updatedDetail = { ...tenant.subscriptionDetail, autoRenewal: checked };
      await TenantApiService.updateTenant(tenant.id, { subscriptionDetail: updatedDetail });
      setTenant({ ...tenant, subscriptionDetail: updatedDetail });
      message.success(`Auto-renewal ${checked ? "enabled" : "disabled"}`);
    } catch {
      message.error("Failed to update auto-renewal preference.");
    }
  };

  const handleUpdateTenant = async (updates: Partial<Tenant>) => {
    if (!tenant) return;
    try {
      const updated = await TenantApiService.updateTenant(tenant.id, updates);
      setTenant(updated);
      loadTenantDetails();
    } catch {
      // handled in modals
    }
  };

  if (loading) {
    return (
      <HmsAppShell title="Tenant Workspace">
        <div className="py-24 text-center">
          <Spin size="large" />
          <p className="text-sm font-medium text-slate-500 mt-4">Connecting to Tenant Control Console ({tenantId})...</p>
        </div>
      </HmsAppShell>
    );
  }

  if (error || !tenant) {
    return (
      <HmsAppShell title="Tenant Workspace">
        <div className="max-w-4xl mx-auto py-12 space-y-4">
          <Link href="/tenants">
            <HmsButton variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Tenant Control Grid
            </HmsButton>
          </Link>
          <Alert type="error" message="Tenant Workspace Error" description={error} showIcon />
        </div>
      </HmsAppShell>
    );
  }

  const allModulesList = [
    { name: "OPD", title: "Outpatient Department (OPD)", desc: "Doctor queues, token generation, prescription templates & e-prescribing" },
    { name: "IPD", title: "Inpatient Admission (IPD)", desc: "Admission desk, ward matrix, daily clinical rounds, discharge summaries" },
    { name: "OT", title: "Operation Theatre (OT)", desc: "Surgical roster, PAC clearance, intra-op nurse notes & surgical billing" },
    { name: "Lab", title: "Pathology & Diagnostics Lab", desc: "Sample barcode tracking, analyzer auto-comm & verified lab reports" },
    { name: "Pharmacy", title: "Pharmacy Dispensing Engine", desc: "IPD/OPD medication dispensing, batch tracking, expiry alerts & GST invoices" },
    { name: "Radiology", title: "Radiology & DICOM PACS", desc: "X-Ray/CT/MRI booking, DICOM viewer integration & radiologist reports" },
    { name: "Blood Bank", title: "Blood Bank & Transfusion Unit", desc: "Donor management, cross-matching, blood component stock & release" },
    { name: "Telemedicine", title: "Telehealth & Remote Care", desc: "HD video appointments, remote vitals monitoring, patient mobile app" },
    { name: "ABDM", title: "ABDM Ayushman Bharat Gateway", desc: "ABHA registration, M1/M2/M3 records link & Health Information Exchange" },
  ];

  const tabItems = [
    // 1. OVERVIEW TAB
    {
      key: "overview",
      label: (
        <span className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-teal-600" /> Overview
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Hospital Credentials */}
            <HmsCard elevated>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Hospital Credentials</span>
                <Tag color="purple">{tenant.hospitalType}</Tag>
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Hospital Name:</span>
                  <span className="font-bold text-slate-900">{tenant.hospitalName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Tenant Unique ID:</span>
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {tenant.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Governance Status:</span>
                  <Tag color={tenant.status === "Active" ? "emerald" : tenant.status === "Trial" ? "blue" : "red"}>
                    {tenant.status}
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Provisioning Date:</span>
                  <span className="font-medium text-slate-800">{tenant.createdDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Last Login Session:</span>
                  <span className="font-medium text-slate-800">{tenant.lastLogin}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">GSTIN Tax Registration:</span>
                  <span className="font-mono text-xs text-slate-800">{tenant.gstin}</span>
                </div>
              </div>
            </HmsCard>

            {/* Address & Admin Contact */}
            <HmsCard elevated>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" /> Location & Primary Contact
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 font-medium">Street Address:</span>
                  <span className="font-medium text-slate-800 text-right max-w-xs">{tenant.address}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">City & State:</span>
                  <span className="font-medium text-slate-800">{tenant.city}, {tenant.state}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Primary Contact Person:</span>
                  <span className="font-bold text-slate-900">{tenant.contactPerson}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Admin Email:</span>
                  <a href={`mailto:${tenant.adminEmail}`} className="text-teal-600 hover:underline font-medium">
                    {tenant.adminEmail}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Phone Number:</span>
                  <span className="font-medium text-slate-800">{tenant.adminPhone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Hospital Portal URL:</span>
                  <a href={`https://${tenant.subdomain}.hms.com`} target="_blank" rel="noreferrer" className="text-teal-600 underline font-mono text-xs">
                    https://{tenant.subdomain}.hms.com
                  </a>
                </div>
              </div>
            </HmsCard>
          </div>
        </div>
      ),
    },

    // 2. HEALTH TAB
    {
      key: "health",
      label: (
        <span className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-600 animate-pulse" /> Health & SLA
        </span>
      ),
      children: <TenantHealthTab tenantId={tenant.id} />,
    },

    // 2. USAGE TAB
    {
      key: "usage",
      label: (
        <span className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" /> Usage & Telemetry
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Users Progress */}
            <HmsCard elevated>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-600" /> Staff Seats
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {tenant.activeUsers} / {tenant.maxUsers}
                </span>
              </div>
              <Progress
                percent={Math.round((tenant.activeUsers / tenant.maxUsers) * 100)}
                strokeColor="#0d9488"
              />
              <p className="text-[11px] text-slate-500 mt-2">Active licensed doctor & staff seats</p>
            </HmsCard>

            {/* Beds Capacity Progress */}
            <HmsCard elevated>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Bed Capacity
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {tenant.bedCount} / {tenant.maxBeds} Beds
                </span>
              </div>
              <Progress
                percent={Math.round((tenant.bedCount / tenant.maxBeds) * 100)}
                strokeColor="#6366f1"
              />
              <p className="text-[11px] text-slate-500 mt-2">Allocated inpatient ward & ICU beds</p>
            </HmsCard>

            {/* Storage Progress */}
            <HmsCard elevated>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-blue-600" /> EMR Storage
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {tenant.storageUsedGB} / {tenant.maxStorageGB} GB
                </span>
              </div>
              <Progress
                percent={Math.round((tenant.storageUsedGB / tenant.maxStorageGB) * 100)}
                strokeColor="#2563eb"
              />
              <p className="text-[11px] text-slate-500 mt-2">Encrypted patient documents & DICOM PACS</p>
            </HmsCard>
          </div>

          {/* Secondary Metering Breakdown */}
          {usageMetrics && (
            <HmsCard elevated>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Monthly Activity Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <span className="text-xs text-slate-500 block font-medium">Monthly Active Users</span>
                  <span className="text-2xl font-bold text-teal-800">{usageMetrics.monthlyActiveUsers} MAU</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-xs text-slate-500 block font-medium">Monthly API Requests</span>
                  <span className="text-2xl font-bold text-blue-800">{(usageMetrics.monthlyApiRequests / 1000).toFixed(0)}k req</span>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-xs text-slate-500 block font-medium">API Throughput</span>
                  <span className="text-xl font-bold text-indigo-800">{usageMetrics.apiThroughput}</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-xs text-slate-500 block font-medium">Database Footprint</span>
                  <span className="text-xl font-bold text-purple-800">{usageMetrics.dbSizeBytes}</span>
                </div>
              </div>
            </HmsCard>
          )}
        </div>
      ),
    },

    // 3. SUBSCRIPTION TAB
    {
      key: "subscription",
      label: (
        <span className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-purple-600" /> Subscription
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HmsCard elevated>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Active Subscription Plan</span>
                <Tag color="purple" className="!px-3 !py-1 font-bold text-sm">
                  {tenant.subscriptionDetail.currentPlan}
                </Tag>
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Subscription Start Date:</span>
                  <span className="font-medium text-slate-800">{tenant.subscriptionDetail.startDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Expiry / Renewal Date:</span>
                  <span className="font-bold text-amber-700 font-mono">{tenant.subscriptionDetail.expiryDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Billing Cycle:</span>
                  <span className="font-medium text-slate-800">{tenant.subscriptionDetail.billingCycle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Auto Renewal:</span>
                  <Switch
                    checked={tenant.subscriptionDetail.autoRenewal}
                    onChange={handleToggleAutoRenew}
                    checkedChildren="Enabled"
                    unCheckedChildren="Disabled"
                  />
                </div>
              </div>
            </HmsCard>

            <HmsCard elevated>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Billing & Invoicing</span>
                <Tag color={tenant.subscriptionDetail.paymentStatus === "Paid" ? "emerald" : "warning"}>
                  {tenant.subscriptionDetail.paymentStatus}
                </Tag>
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Monthly Recurring Revenue (MRR):</span>
                  <span className="text-lg font-bold text-teal-700">₹{tenant.mrr.toLocaleString("en-IN")}/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Last Invoice Processed:</span>
                  <span className="font-mono text-xs font-semibold text-slate-800">{tenant.subscriptionDetail.lastInvoice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Payment Method:</span>
                  <span className="font-medium text-slate-800">Corporate Wire Transfer / HDFC ACH</span>
                </div>
                <div className="pt-2">
                  <HmsButton variant="secondary" size="sm" onClick={() => setSubModalOpen(true)} className="w-full">
                    Modify Subscription Tier or Seat Limits
                  </HmsButton>
                </div>
              </div>
            </HmsCard>
          </div>
        </div>
      ),
    },

    // 4. FEATURES TAB (TOGGLE CARDS)
    {
      key: "features",
      label: (
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-600" /> Features & Modules
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" /> Enterprise Module License Toggles
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Enable or disable specialized healthcare modules for {tenant.hospitalName} in real time.
              </p>
            </div>
            <Tag color="amber" className="!px-3 !py-1 font-bold">
              {tenant.enabledModules.length} / {allModulesList.length} Modules Active
            </Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allModulesList.map((mod) => {
              const isEnabled = tenant.enabledModules.includes(mod.name);
              const isToggling = togglingModule === mod.name;

              return (
                <div
                  key={mod.name}
                  className={`p-4 rounded-xl border transition-all ${
                    isEnabled
                      ? "bg-white border-teal-200 shadow-xs hover:border-teal-400"
                      : "bg-slate-50/80 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                          isEnabled ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {mod.name}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{mod.desc}</p>
                    </div>
                    <Switch
                      checked={isEnabled}
                      loading={isToggling}
                      onChange={() => handleToggleModule(mod.name)}
                      className="shrink-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },

    // 5. COMPLIANCE TAB
    {
      key: "compliance",
      label: (
        <span className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-600" /> Compliance & Certifications
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NABH Accreditation */}
            <HmsCard elevated>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 text-sm">NABH Accreditation</h4>
                <Tag color={tenant.compliance.nabh.includes("Full") ? "emerald" : "gold"}>
                  {tenant.compliance.nabh}
                </Tag>
              </div>
              <p className="text-xs text-slate-500 mb-2">National Accreditation Board for Hospitals & Healthcare Providers</p>
              {tenant.compliance.nabhCertNo && (
                <div className="text-xs font-mono bg-slate-50 p-2 rounded border border-slate-100 text-slate-700">
                  Cert No: {tenant.compliance.nabhCertNo}
                </div>
              )}
            </HmsCard>

            {/* NABL Lab Accreditation */}
            <HmsCard elevated>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 text-sm">NABL Laboratory Accreditation</h4>
                <Tag color={tenant.compliance.nabl.includes("Accredited") ? "emerald" : "gold"}>
                  {tenant.compliance.nabl}
                </Tag>
              </div>
              <p className="text-xs text-slate-500 mb-2">National Accreditation Board for Testing and Calibration Laboratories</p>
              {tenant.compliance.nablCertNo && (
                <div className="text-xs font-mono bg-slate-50 p-2 rounded border border-slate-100 text-slate-700">
                  Cert No: {tenant.compliance.nablCertNo}
                </div>
              )}
            </HmsCard>

            {/* HFR Registry */}
            <HmsCard elevated>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 text-sm">ABDM Health Facility Registry (HFR)</h4>
                <Tag color={tenant.compliance.hfr.includes("Verified") ? "blue" : "warning"}>
                  {tenant.compliance.hfr}
                </Tag>
              </div>
              <p className="text-xs text-slate-500 mb-2">Official Health Facility ID in National ABDM Registry</p>
              {tenant.compliance.hfrId && (
                <div className="text-xs font-mono bg-blue-50 p-2 rounded border border-blue-100 text-blue-900 font-bold">
                  HFR ID: {tenant.compliance.hfrId}
                </div>
              )}
            </HmsCard>

            {/* ABDM Gateway Certification */}
            <HmsCard elevated>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 text-sm">ABDM M1 / M2 / M3 Gateway Certification</h4>
                <Tag color={tenant.compliance.abdm.includes("M3") ? "purple" : "cyan"}>
                  {tenant.compliance.abdm}
                </Tag>
              </div>
              <p className="text-xs text-slate-500 mb-2">Ayushman Bharat Digital Mission Interoperability Gateway</p>
              {tenant.compliance.abdmGatewayId && (
                <div className="text-xs font-mono bg-purple-50 p-2 rounded border border-purple-100 text-purple-900 font-bold">
                  Gateway Node: {tenant.compliance.abdmGatewayId}
                </div>
              )}
            </HmsCard>
          </div>
        </div>
      ),
    },

    // 6. BRANDING TAB
    {
      key: "branding",
      label: (
        <span className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-pink-600" /> Branding & Theme
        </span>
      ),
      children: (() => {
        const fullBranding = WhiteLabelService.ensureCompleteBranding(
          tenant.hospitalName,
          tenant.subdomain,
          tenant.branding
        );

        return (
          <div className="space-y-4">
            <Tabs
              defaultActiveKey="basic"
              type="card"
              items={[
                {
                  key: "basic",
                  label: (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Palette className="w-4 h-4 text-pink-500" /> Basic Theme & Letterhead
                    </span>
                  ),
                  children: (
                    <HmsCard elevated className="!mt-2">
                      <Form form={brandingForm} layout="vertical" onFinish={handleSaveBranding}>
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">Custom Tenant White-Label & Theme Config</h3>
                            <p className="text-xs text-slate-500">Customize portal colors, custom domains, and prescription headers.</p>
                          </div>
                          <HmsButton type="primary" variant="emerald" htmlType="submit" loading={savingBranding} icon={<Save className="w-4 h-4" />}>
                            Save Branding Settings
                          </HmsButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Form.Item label="Custom Subdomain / Dedicated Domain" name="customDomain" rules={[{ required: true }]}>
                            <Input prefix={<Globe className="w-4 h-4 text-slate-400" />} size="large" />
                          </Form.Item>

                          <Form.Item label="Primary Brand Color Accent (Hex)" name="primaryColor" rules={[{ required: true }]}>
                            <Input prefix={<Palette className="w-4 h-4 text-pink-500" />} placeholder="#0d9488" size="large" />
                          </Form.Item>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Form.Item label="Prescription Letterhead Title" name="prescriptionHeader" rules={[{ required: true }]}>
                            <Input size="large" />
                          </Form.Item>

                          <Form.Item label="Patient Mobile Portal Title" name="patientPortalTitle" rules={[{ required: true }]}>
                            <Input size="large" />
                          </Form.Item>
                        </div>

                        <Form.Item label="Medical Document Watermark Text" name="watermarkText">
                          <Input size="large" placeholder="OFFICIAL MEDICAL RECORD" />
                        </Form.Item>
                      </Form>
                    </HmsCard>
                  ),
                },
                {
                  key: "live_preview",
                  label: (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Monitor className="w-4 h-4 text-teal-500" /> Live App Preview
                    </span>
                  ),
                  children: (
                    <div className="pt-2">
                      <LiveBrandingPreviewWorkspace
                        branding={fullBranding}
                        hospitalName={tenant.hospitalName}
                      />
                    </div>
                  ),
                },
                {
                  key: "email_branding",
                  label: (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Mail className="w-4 h-4 text-amber-500" /> Email Branding
                    </span>
                  ),
                  children: (
                    <div className="pt-2">
                      <EmailBrandingWorkspace
                        hospitalName={tenant.hospitalName}
                        initialConfig={fullBranding.emailBranding}
                        loading={savingBranding}
                        onSave={async (emailConfig) => {
                          const updated = { ...fullBranding, emailBranding: emailConfig };
                          await handleSaveBranding(updated);
                        }}
                      />
                    </div>
                  ),
                },
                {
                  key: "pdf_branding",
                  label: (
                    <span className="flex items-center gap-1.5 font-medium">
                      <FileText className="w-4 h-4 text-indigo-500" /> PDF Document Branding
                    </span>
                  ),
                  children: (
                    <div className="pt-2">
                      <PdfBrandingWorkspace
                        hospitalName={tenant.hospitalName}
                        initialConfig={fullBranding.pdfBranding}
                        loading={savingBranding}
                        onSave={async (pdfConfig) => {
                          const updated = { ...fullBranding, pdfBranding: pdfConfig };
                          await handleSaveBranding(updated);
                        }}
                      />
                    </div>
                  ),
                },
                {
                  key: "white_label",
                  label: (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Globe className="w-4 h-4 text-cyan-500" /> White-Label Controls
                    </span>
                  ),
                  children: (
                    <div className="pt-2">
                      <WhiteLabelControlsWorkspace
                        hospitalName={tenant.hospitalName}
                        subdomain={tenant.subdomain}
                        initialConfig={fullBranding.whiteLabel}
                        loading={savingBranding}
                        onSave={async (wlConfig) => {
                          const updated = {
                            ...fullBranding,
                            customDomain: wlConfig.customDomain || fullBranding.customDomain,
                            whiteLabel: wlConfig,
                          };
                          await handleSaveBranding(updated);
                        }}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        );
      })(),
    },

    // 7. AUDIT TAB (TIMELINE VIEW)
    {
      key: "audit",
      label: (
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-600" /> Governance Audit
        </span>
      ),
      children: (
        <HmsCard elevated>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Recent Administrative & Security Events</span>
            <Tag color="blue">{auditLogs.length} Events Logged</Tag>
          </h3>

          <div className="my-2">
            <Timeline
              items={auditLogs.map((log) => ({
                color: log.category === "SECURITY" ? "red" : log.category === "LICENSE" ? "green" : "blue",
                children: (
                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{log.action}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{log.details}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100/80">
                      <span>Performed By: <strong className="text-slate-700">{log.performedBy}</strong></span>
                      <span>IP: <strong className="text-slate-700">{log.ipAddress}</strong></span>
                      <Tag className="!text-[10px]">{log.category}</Tag>
                    </div>
                  </div>
                ),
              }))}
            />
          </div>
        </HmsCard>
      ),
    },

    // 8. SUSPENSION HISTORY TAB
    {
      key: "suspension-history",
      label: (
        <span className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" /> Suspension History
        </span>
      ),
      children: (
        <HmsCard elevated>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-600" /> Multi-Step Governance Suspension Log
              </h3>
              <p className="text-xs text-slate-500">Recorded history of governance lockouts, reason audit trails, and access restorations.</p>
            </div>
            {tenant.status === "Suspended" ? (
              <HmsButton type="primary" variant="emerald" icon={<RotateCcw className="w-4 h-4" />} onClick={() => setRestoreModalOpen(true)}>
                Restore Tenant Access
              </HmsButton>
            ) : (
              <HmsButton type="primary" variant="danger" icon={<ShieldAlert className="w-4 h-4" />} onClick={() => setSuspendModalOpen(true)}>
                Suspend Tenant Access
              </HmsButton>
            )}
          </div>

          {!tenant.suspensionHistory || tenant.suspensionHistory.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Clean Governance Record</p>
              <p className="text-xs text-slate-400 mt-1">No governance suspension actions recorded for this hospital tenant.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tenant.suspensionHistory.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-4 rounded-xl border ${
                    rec.action === "SUSPEND"
                      ? "bg-rose-50/50 border-rose-200"
                      : "bg-emerald-50/50 border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Tag color={rec.action === "SUSPEND" ? "rose" : "emerald"} className="!font-bold">
                        {rec.action === "SUSPEND" ? "LOCKED OUT" : "RESTORED"}
                      </Tag>
                      <span className="font-bold text-slate-900 text-sm">Reason: {rec.reason}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      {rec.date} at {rec.time}
                    </span>
                  </div>

                  {rec.reasonNotes && (
                    <p className="text-xs text-slate-700 italic bg-white p-2 rounded border border-slate-100 mb-2">
                      &quot;{rec.reasonNotes}&quot;
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Authorized Admin: <strong className="text-slate-800">{rec.adminName}</strong></span>
                    <span className="font-mono text-slate-400">Record ID: {rec.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </HmsCard>
      ),
    },
  ];

  return (
    <HmsAppShell title={`Tenant Workspace - ${tenant.hospitalName}`}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Workspace Top Header Banner */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-3">
              <Link href="/tenants">
                <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                    {tenant.id}
                  </span>
                  <Tag color={tenant.status === "Active" ? "emerald" : "volcano"}>{tenant.status}</Tag>
                  <Tag color="purple">{tenant.hospitalType}</Tag>
                </div>
                <h1 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-teal-400 shrink-0" />
                  {tenant.hospitalName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tenant.city}, {tenant.state} • Subdomain: <span className="text-teal-300 font-mono">{tenant.subdomain}.hms.com</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto">
              {tenant.status === "Suspended" ? (
                <HmsButton type="primary" variant="emerald" icon={<RotateCcw className="w-4 h-4" />} onClick={() => setRestoreModalOpen(true)}>
                  Restore Access
                </HmsButton>
              ) : (
                <HmsButton type="primary" variant="danger" icon={<ShieldAlert className="w-4 h-4" />} onClick={() => setSuspendModalOpen(true)}>
                  Suspend Tenant
                </HmsButton>
              )}
              <HmsButton variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadTenantDetails}>
                Refresh Telemetry
              </HmsButton>
              <HmsButton variant="secondary" icon={<Zap className="w-4 h-4" />} onClick={() => setEditModalOpen(true)}>
                Edit Credentials
              </HmsButton>
              <HmsButton type="primary" variant="emerald" icon={<CreditCard className="w-4 h-4" />} onClick={() => setSubModalOpen(true)}>
                Manage Subscription
              </HmsButton>
            </div>
          </div>
        </div>

        {/* Tabbed Workspace Section */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <Tabs defaultActiveKey="overview" items={tabItems} size="large" />
        </div>

        {/* Modals */}
        <EditTenantModal
          tenant={tenant}
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleUpdateTenant}
        />

        <ManageSubscriptionModal
          tenant={tenant}
          open={subModalOpen}
          onClose={() => setSubModalOpen(false)}
          onSave={handleUpdateTenant}
        />

        <SuspendTenantModal
          tenant={tenant}
          open={suspendModalOpen}
          onClose={() => setSuspendModalOpen(false)}
          onSuspended={loadTenantDetails}
        />

        <RestoreTenantModal
          tenant={tenant}
          open={restoreModalOpen}
          onClose={() => setRestoreModalOpen(false)}
          onRestored={loadTenantDetails}
        />
      </div>
    </HmsAppShell>
  );
}
