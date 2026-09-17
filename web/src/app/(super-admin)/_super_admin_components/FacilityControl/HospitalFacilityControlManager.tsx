"use client";

import React, { useState } from "react";
import { Select, Switch, Tag, Modal, Input, Tabs, message, Tooltip } from "antd";
import {
  Building2,
  ShieldAlert,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Activity,
  AlertTriangle,
  RefreshCw,
  Stethoscope,
  Microscope,
  Cpu,
  CreditCard,
  Lock,
  Unlock,
  SlidersHorizontal,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import {
  useHospitalServiceStore,
  ServiceCategory,
  ServiceStatus,
  TenantOperationalStatus,
  HospitalFacilityService,
} from "../../_super_admin_stores/hospital_service_store";

interface HospitalFacilityControlManagerProps {
  initialTenantId?: string;
  onClose?: () => void;
}

export const HospitalFacilityControlManager: React.FC<HospitalFacilityControlManagerProps> = ({
  initialTenantId = "TENANT-001",
}) => {
  const {
    tenantConfigs,
    selectedTenantId,
    setSelectedTenantId,
    getTenantConfig,
    toggleServiceStatus,
    setTenantOperationalStatus,
    bulkToggleCategoryServices,
    resetTenantToDefaults,
  } = useHospitalServiceStore();

  const activeTenantId = selectedTenantId || initialTenantId;
  const currentConfig = getTenantConfig(activeTenantId);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [pendingTargetService, setPendingTargetService] = useState<HospitalFacilityService | null>(null);
  const [maintenanceReasonInput, setMaintenanceReasonInput] = useState("");
  const [killSwitchModalOpen, setKillSwitchModalOpen] = useState(false);
  const [killSwitchReason, setKillSwitchReason] = useState("");

  const tenantOptions = [
    { value: "TENANT-001", label: "Apollo Super Speciality Hospital (TENANT-001)" },
    { value: "TENANT-002", label: "Fortis Care Heart Institute (TENANT-002)" },
    { value: "TENANT-003", label: "City Diagnostics & OPD Clinic (TENANT-003)" },
  ];

  const handleToggleClick = (service: HospitalFacilityService) => {
    if (service.status === "OPEN") {
      // Opening prompt to ask reason for closing
      setPendingTargetService(service);
      setMaintenanceReasonInput("");
      setReasonModalOpen(true);
    } else {
      // Re-opening closed service directly
      toggleServiceStatus(activeTenantId, service.id, "OPEN");
      message.success(`${service.name} has been RE-OPENED for ${currentConfig.tenantName}`);
    }
  };

  const confirmCloseService = () => {
    if (!pendingTargetService) return;
    toggleServiceStatus(
      activeTenantId,
      pendingTargetService.id,
      "CLOSED",
      maintenanceReasonInput || "Disabled by Super Admin"
    );
    message.warning(`${pendingTargetService.name} has been CLOSED for ${currentConfig.tenantName}`);
    setReasonModalOpen(false);
    setPendingTargetService(null);
  };

  const confirmKillSwitch = (suspend: boolean) => {
    if (suspend) {
      setTenantOperationalStatus(
        activeTenantId,
        "SUSPENDED_KILL_SWITCH",
        killSwitchReason || "Emergency Master Kill-Switch Activated by Super Admin"
      );
      message.error(`CRITICAL: All operations SUSPENDED for ${currentConfig.tenantName}!`);
    } else {
      setTenantOperationalStatus(activeTenantId, "FULL_OPERATIONAL");
      message.success(`Operations RESTORED to Full Operational for ${currentConfig.tenantName}`);
    }
    setKillSwitchModalOpen(false);
    setKillSwitchReason("");
  };

  const services = currentConfig.services || [];
  const filteredServices = services.filter((s) => {
    const matchesTab = activeTab === "ALL" || s.category === activeTab;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalServices = services.length;
  const openServices = services.filter((s) => s.status === "OPEN").length;
  const closedServices = services.filter((s) => s.status === "CLOSED").length;
  const healthPercentage = totalServices > 0 ? Math.round((openServices / totalServices) * 100) : 0;

  const renderStatusBadge = (status: TenantOperationalStatus) => {
    switch (status) {
      case "FULL_OPERATIONAL":
        return <Tag color="emerald" className="px-3 py-1 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> FULL OPERATIONAL</Tag>;
      case "PARTIAL_SERVICES":
        return <Tag color="gold" className="px-3 py-1 text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> PARTIAL SERVICES ACTIVE</Tag>;
      case "EMERGENCY_ONLY":
        return <Tag color="volcano" className="px-3 py-1 text-xs font-bold flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> EMERGENCY CARE ONLY</Tag>;
      case "SUSPENDED_KILL_SWITCH":
        return <Tag color="red" className="px-3 py-1 text-xs font-bold flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> SUSPENDED (KILL-SWITCH)</Tag>;
      case "MAINTENANCE":
        return <Tag color="purple" className="px-3 py-1 text-xs font-bold flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> MAINTENANCE MODE</Tag>;
    }
  };

  const getCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case "CLINICAL":
        return <Stethoscope className="w-5 h-5 text-teal-600" />;
      case "DIAGNOSTICS":
        return <Microscope className="w-5 h-5 text-blue-600" />;
      case "INTEGRATIONS":
        return <Cpu className="w-5 h-5 text-purple-600" />;
      case "FINANCIAL":
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hospital Tenant Selector Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">Multi-Hospital Service Controller</p>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {currentConfig.tenantName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tenant ID: <span className="font-mono text-slate-200">{currentConfig.tenantId}</span> | Monolithic Database Schema Isolated
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-72">
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Hospital Tenant</label>
              <Select
                value={activeTenantId}
                onChange={(val) => setSelectedTenantId(val)}
                options={tenantOptions}
                className="w-full"
                size="large"
              />
            </div>

            {currentConfig.operationalStatus === "SUSPENDED_KILL_SWITCH" ? (
              <HmsButton
                variant="emerald"
                icon={<Unlock className="w-4 h-4" />}
                onClick={() => confirmKillSwitch(false)}
                className="self-end mt-4 md:mt-0"
              >
                Restore Operations
              </HmsButton>
            ) : (
              <HmsButton
                variant="danger"
                icon={<Lock className="w-4 h-4" />}
                onClick={() => setKillSwitchModalOpen(true)}
                className="self-end mt-4 md:mt-0"
              >
                Master Kill-Switch
              </HmsButton>
            )}
          </div>
        </div>

        {/* Operational Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Health Status:</span>
            {renderStatusBadge(currentConfig.operationalStatus)}
          </div>
          {currentConfig.suspensionReason && (
            <div className="text-rose-300 bg-rose-950/50 px-3 py-1 rounded-lg border border-rose-800/50 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{currentConfig.suspensionReason}</span>
            </div>
          )}
          <div className="text-slate-400 font-mono">
            Last Audit Update: {new Date(currentConfig.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HmsCard elevated className="border-l-4 border-l-slate-600">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Facilities</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalServices} Modules</h3>
            </div>
            <SlidersHorizontal className="w-8 h-8 text-slate-400" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Services Open</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{openServices} Active</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-rose-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Services Closed</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{closedServices} Disabled</h3>
            </div>
            <XCircle className="w-8 h-8 text-rose-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Operational Availability</p>
              <h3 className="text-2xl font-bold text-teal-700 mt-1">{healthPercentage}%</h3>
            </div>
            <Activity className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>
      </div>

      {/* Main Control Console */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        {/* Search & Bulk Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search facility name, code or functionality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              size="large"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tooltip title="Re-open all clinical facilities for this hospital">
              <HmsButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  bulkToggleCategoryServices(activeTenantId, "CLINICAL", "OPEN");
                  message.success(`All Clinical services set to OPEN for ${currentConfig.tenantName}`);
                }}
              >
                Open Clinical
              </HmsButton>
            </Tooltip>

            <Tooltip title="Reset hospital facilities to standard enterprise defaults">
              <HmsButton
                size="sm"
                variant="ghost"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => {
                  resetTenantToDefaults(activeTenantId);
                  message.info(`Facility settings reset to default for ${currentConfig.tenantName}`);
                }}
              >
                Reset Defaults
              </HmsButton>
            </Tooltip>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            { key: "ALL", label: `All Facilities (${services.length})` },
            { key: "CLINICAL", label: `Clinical Facilities (${services.filter((s) => s.category === "CLINICAL").length})` },
            { key: "DIAGNOSTICS", label: `Diagnostics & Lab (${services.filter((s) => s.category === "DIAGNOSTICS").length})` },
            { key: "INTEGRATIONS", label: `Digital & Integrations (${services.filter((s) => s.category === "INTEGRATIONS").length})` },
            { key: "FINANCIAL", label: `Financial & Admin (${services.filter((s) => s.category === "FINANCIAL").length})` },
          ]}
        />

        {/* Services Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-2">
          {filteredServices.map((service) => {
            const isOpen = service.status === "OPEN";

            return (
              <div
                key={service.id}
                className={`p-5 rounded-xl border transition-all duration-200 ${
                  isOpen
                    ? "bg-white border-slate-200 hover:border-teal-400 hover:shadow-xs"
                    : "bg-slate-50/80 border-rose-200/80"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-lg border ${
                        isOpen
                          ? "bg-teal-50 border-teal-100"
                          : "bg-rose-50 border-rose-100"
                      }`}
                    >
                      {getCategoryIcon(service.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{service.name}</h4>
                        <span className="font-mono text-3xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {service.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{service.description}</p>
                    </div>
                  </div>

                  {/* Open / Close Switch Toggle */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Switch
                      checked={isOpen}
                      onChange={() => handleToggleClick(service)}
                      checkedChildren="OPEN"
                      unCheckedChildren="CLOSED"
                      className={isOpen ? "bg-emerald-600" : "bg-rose-600"}
                    />
                    <Tag color={isOpen ? "emerald" : "rose"} className="mr-0 mt-1 font-semibold text-3xs">
                      {isOpen ? "SERVICE ACTIVE" : "SERVICE CLOSED"}
                    </Tag>
                  </div>
                </div>

                {/* Maintenance Reason Notice if Closed */}
                {!isOpen && service.maintenanceReason && (
                  <div className="mt-3 pt-3 border-t border-rose-100 text-xs text-rose-700 bg-rose-50/60 p-2.5 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-rose-800">Close Notice: </span>
                      {service.maintenanceReason}
                    </div>
                  </div>
                )}

                {/* Audit Line */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-400 font-mono">
                  <span>Category: {service.category}</span>
                  <span>Mod: {new Date(service.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-700">No Facilities Found</h4>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or switching tabs.</p>
          </div>
        )}
      </div>

      {/* Close Reason Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Close Service: {pendingTargetService?.name}</span>
          </div>
        }
        open={reasonModalOpen}
        onCancel={() => {
          setReasonModalOpen(false);
          setPendingTargetService(null);
        }}
        footer={null}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600">
            You are disabling <strong className="text-slate-900">{pendingTargetService?.name}</strong> for hospital tenant{" "}
            <strong className="text-teal-700">{currentConfig.tenantName}</strong>. Doctors and hospital staff will receive a service closure notification when accessing this department.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Closure Reason / Maintenance Notice (Public to Hospital Staff)
            </label>
            <Input.TextArea
              rows={3}
              placeholder="e.g., Scheduled server maintenance, license upgrade, or emergency staff shortage..."
              value={maintenanceReasonInput}
              onChange={(e) => setMaintenanceReasonInput(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setReasonModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="danger" onClick={confirmCloseService}>
              Confirm & Close Service
            </HmsButton>
          </div>
        </div>
      </Modal>

      {/* Master Emergency Kill-Switch Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>Activate Master Emergency Kill-Switch</span>
          </div>
        }
        open={killSwitchModalOpen}
        onCancel={() => setKillSwitchModalOpen(false)}
        footer={null}
      >
        <div className="space-y-4 py-2">
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-900 text-xs space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-sm text-rose-800">
              <Lock className="w-4 h-4 text-rose-600" /> WARNING: High Privilege Action
            </p>
            <p>
              Activating the Emergency Kill-Switch will instantly **CLOSE ALL SERVICES & SUSPEND OPERATIONAL ACCESS** for{" "}
              <strong>{currentConfig.tenantName}</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Operational Suspension (Required for SLA Audit Log)
            </label>
            <Input.TextArea
              rows={3}
              placeholder="e.g. Unpaid subscription tier, billing lock, or security incident freeze..."
              value={killSwitchReason}
              onChange={(e) => setKillSwitchReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setKillSwitchModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="danger" onClick={() => confirmKillSwitch(true)}>
              ACTIVATE KILL-SWITCH
            </HmsButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
