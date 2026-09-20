"use client";

import React, { use } from "react";
import Link from "next/link";
import { Tag, Progress, Tabs, Table, Badge, Card } from "antd";
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  MapPin,
  BedDouble,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Stethoscope,
  Activity,
  Layers,
  FileText,
} from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { DepartmentService } from "../../_admin_services/department_service";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import { useAdminRosterStore } from "../../_admin_stores/admin_roster_store";
import { useHrStore } from "@/app/(hr)/_hr_stores/hr_store";

export default function DepartmentDetailPage({ params }: { params: Promise<{ departmentId: string }> }) {
  const resolvedParams = use(params);
  const departmentId = resolvedParams.departmentId;

  const department = DepartmentService.getDepartmentById(departmentId) || DepartmentService.resolveDepartment(departmentId);
  const allDepartments = DepartmentService.getDepartments();

  if (!department) {
    return (
      <HmsAppShell title="Department Not Found">
        <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Department Not Found</h2>
          <p className="text-sm text-slate-500">The requested department identifier &apos;{departmentId}&apos; could not be resolved.</p>
          <Link href="/departments">
            <HmsButton variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Department Master
            </HmsButton>
          </Link>
        </div>
      </HmsAppShell>
    );
  }

  const subDepartments = allDepartments.filter((d) => d.parentDepartmentId === department.id);
  const auditLogs = PlatformAuditService.getAuditLogs().filter(
    (l) => l.entity.includes(department.name) || l.entity.includes(department.id) || l.entity.includes(department.code)
  );

  const allRosters = useAdminRosterStore((s) => s.rosters);
  const allAttendanceLogs = useHrStore((s) => s.attendanceLogs);

  const rosters = React.useMemo(() => {
    if (!department) return [];
    return allRosters.filter(
      (r) =>
        r.department.toLowerCase().includes(department.name.toLowerCase()) ||
        r.department.toLowerCase().includes(department.code.toLowerCase())
    );
  }, [allRosters, department]);

  const attendance = React.useMemo(() => {
    if (!department) return [];
    return allAttendanceLogs.filter(
      (a) =>
        a.department.toLowerCase().includes(department.name.toLowerCase()) ||
        a.department.toLowerCase().includes(department.code.toLowerCase())
    );
  }, [allAttendanceLogs, department]);

  const bedOccupancyPercent = department.bedCapacity?.operationalBeds
    ? Math.round(((department.bedCapacity.occupiedBeds || 0) / department.bedCapacity.operationalBeds) * 100)
    : 0;

  const staffFillPercent = department.staffCapacity?.approvedStaffCount
    ? Math.round(((department.staffCapacity.activeStaffCount || 0) / department.staffCapacity.approvedStaffCount) * 100)
    : 0;

  return (
    <HmsAppShell title={`${department.name} (${department.code})`}>
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/departments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Departments
            </Link>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{department.name}</h2>
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {department.code}
              </span>
              <Tag
                color={
                  department.status === "ACTIVE"
                    ? "emerald"
                    : department.status === "UNDER_MAINTENANCE"
                    ? "amber"
                    : department.status === "PLANNED"
                    ? "blue"
                    : "rose"
                }
                className="!font-bold"
              >
                {department.status}
              </Tag>
            </div>
            <p className="text-xs text-slate-500 mt-1">{department.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Tag color="purple" className="!text-xs py-1 px-3">
              Type: {department.type}
            </Tag>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Head of Department</p>
                <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" /> {department.hodDisplayName || department.headOfDepartment}
                </h3>
                <p className="text-3xs font-mono text-slate-400 mt-0.5">ID: {department.hodUserId || "N/A"}</p>
              </div>
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Bed Occupancy Rate</p>
                <h3 className="text-xl font-bold text-purple-700 mt-1">{bedOccupancyPercent}% Occupied</h3>
                <Progress percent={bedOccupancyPercent} size="small" strokeColor="#9333ea" showInfo={false} />
                <p className="text-3xs text-slate-500 mt-1">
                  {department.bedCapacity?.occupiedBeds || 0} / {department.bedCapacity?.operationalBeds || 0} Operational Beds
                </p>
              </div>
              <BedDouble className="w-8 h-8 text-purple-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Staff Active Fill Rate</p>
                <h3 className="text-xl font-bold text-emerald-700 mt-1">{staffFillPercent}% Staffed</h3>
                <Progress percent={staffFillPercent} size="small" strokeColor="#059669" showInfo={false} />
                <p className="text-3xs text-slate-500 mt-1">
                  {department.staffCapacity?.activeStaffCount || 0} Active / {department.staffCapacity?.approvedStaffCount || 0} Approved
                </p>
              </div>
              <Users className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Wing Location & Ext</p>
                <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-blue-600" /> {department.location}
                </h3>
                <p className="text-3xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" /> Ext: {department.phoneExtension}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </HmsCard>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <Tabs
            defaultActiveKey="capacity"
            items={[
              {
                key: "capacity",
                label: (
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" /> Capacity & Hierarchy
                  </span>
                ),
                children: (
                  <div className="space-y-6 pt-2">
                    {/* Parent Hierarchy Card */}
                    {department.parentDepartmentName && (
                      <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <div>
                            <span className="font-bold text-blue-900 block">Parent Department Hierarchy Link</span>
                            <span className="text-blue-700">This unit reports under parent: <strong>{department.parentDepartmentName}</strong> (ID: {department.parentDepartmentId})</span>
                          </div>
                        </div>
                        <Tag color="blue">Sub-Department Unit</Tag>
                      </div>
                    )}

                    {/* Bed Capacity Detailed Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <BedDouble className="w-4 h-4 text-purple-600" /> Bed Allocation Breakdown
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-500 block">Approved Bed Quota</span>
                            <strong className="text-lg text-slate-900">{department.bedCapacity?.approvedBeds || 0} Beds</strong>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-500 block">Operational Beds</span>
                            <strong className="text-lg text-emerald-700">{department.bedCapacity?.operationalBeds || 0} Beds</strong>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-500 block">Reserved Emergency Beds</span>
                            <strong className="text-lg text-amber-700">{department.bedCapacity?.reservedBeds || 0} Beds</strong>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-500 block">Currently Occupied Beds</span>
                            <strong className="text-lg text-purple-700">{department.bedCapacity?.occupiedBeds || 0} Beds</strong>
                          </div>
                        </div>
                      </div>

                      {/* Staff Capacity Grid */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-600" /> Staffing Quota & Vacancy Model
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-500 block">Approved Sanctioned Posts</span>
                            <strong className="text-lg text-slate-900">{department.staffCapacity?.approvedStaffCount || 0} Staff</strong>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-500 block">Active Staff On-Roll</span>
                            <strong className="text-lg text-emerald-700">{department.staffCapacity?.activeStaffCount || 0} Staff</strong>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200 col-span-2">
                            <span className="text-slate-500 block">Vacant Sanctioned Positions</span>
                            <strong className="text-lg text-rose-600">{department.staffCapacity?.vacantStaffCount || 0} Openings</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sub-departments List */}
                    {subDepartments.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-teal-600" /> Child Sub-Departments ({subDepartments.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {subDepartments.map((sub) => (
                            <Link key={sub.id} href={`/departments/${sub.id}`}>
                              <div className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition-colors flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-900 text-xs block">{sub.name}</span>
                                  <span className="font-mono text-3xs text-slate-500">{sub.code}</span>
                                </div>
                                <Tag color="teal" className="!text-3xs">{sub.type}</Tag>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "roster",
                label: (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" /> Active Roster ({rosters.length})
                  </span>
                ),
                children: (
                  <div className="pt-2">
                    <Table
                      dataSource={rosters}
                      rowKey="id"
                      pagination={false}
                      columns={[
                        { title: "Staff Name", dataIndex: "staffName", key: "staffName" },
                        { title: "Role", dataIndex: "role", key: "role", render: (r: string) => <Tag color="purple">{r}</Tag> },
                        { title: "Shift", dataIndex: "shift", key: "shift" },
                        { title: "Shift Hours", dataIndex: "shiftHours", key: "shiftHours" },
                        { title: "Duty Room/Ward", dataIndex: "assignedWardOrRoom", key: "assignedWardOrRoom" },
                        { title: "Status", dataIndex: "status", key: "status", render: (s: string) => <Tag color={s === "ON_DUTY" ? "emerald" : "orange"}>{s}</Tag> },
                      ]}
                    />
                  </div>
                ),
              },
              {
                key: "audit",
                label: (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" /> Audit Ledger ({auditLogs.length})
                  </span>
                ),
                children: (
                  <div className="pt-2">
                    <Table
                      dataSource={auditLogs}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                      columns={[
                        { title: "Timestamp", dataIndex: "timestamp", key: "timestamp" },
                        { title: "Actor", dataIndex: "actor", key: "actor" },
                        { title: "Action", dataIndex: "action", key: "action" },
                        { title: "Category", dataIndex: "category", key: "category", render: (c: string) => <Tag color="blue">{c}</Tag> },
                        { title: "Risk Level", dataIndex: "riskLevel", key: "riskLevel", render: (r: string) => <Tag color={r === "CRITICAL" ? "rose" : r === "WARNING" ? "amber" : "emerald"}>{r}</Tag> },
                      ]}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </HmsAppShell>
  );
}
