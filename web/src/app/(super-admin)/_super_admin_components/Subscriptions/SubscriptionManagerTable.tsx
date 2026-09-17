"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, message } from "antd";
import { Plus, SlidersHorizontal } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HospitalOnboardingWizard } from "../TenantOnboarding/HospitalOnboardingWizard";
import { HospitalFacilityControlManager } from "../FacilityControl/HospitalFacilityControlManager";

export const SubscriptionManagerTable: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [activeFacilityTenantId, setActiveFacilityTenantId] = useState<string>("TENANT-001");
  const [tenants, setTenants] = useState([
    { key: "1", tenantId: "TENANT-001", name: "Apollo Super Speciality Hospital", domain: "apollo.hms.com", tier: "ENTERPRISE", seats: "85 / 100", status: "ACTIVE" },
    { key: "2", tenantId: "TENANT-002", name: "Fortis Care Heart Institute", domain: "fortis.hms.com", tier: "SUPER_SPECIALTY", seats: "140 / 200", status: "ACTIVE" },
    { key: "3", tenantId: "TENANT-003", name: "City Diagnostics & OPD Clinic", domain: "citydiag.hms.com", tier: "BASIC", seats: "12 / 15", status: "ACTIVE" },
  ]);

  const openFacilityControl = (tenantId: string) => {
    setActiveFacilityTenantId(tenantId);
    setFacilityModalOpen(true);
  };

  const columns = [
    { title: "Tenant ID", dataIndex: "tenantId", key: "tenantId" },
    { title: "Hospital Name", dataIndex: "name", key: "name" },
    { title: "Subdomain", dataIndex: "domain", key: "domain" },
    { title: "License Tier", dataIndex: "tier", key: "tier", render: (t: string) => <Tag color="purple">{t}</Tag> },
    { title: "Active Seats", dataIndex: "seats", key: "seats" },
    {
      title: "SLA Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={s === "ACTIVE" ? "emerald" : "orange"}>{s}</Tag>,
    },
    {
      title: "Facility Controls",
      key: "action",
      render: (_: unknown, record: { tenantId: string; name: string }) => (
        <HmsButton
          size="sm"
          variant="secondary"
          icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
          onClick={() => openFacilityControl(record.tenantId)}
        >
          Manage Facilities
        </HmsButton>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <HmsButton type="primary" variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Onboard New Hospital
        </HmsButton>
      </div>

      <Table columns={columns} dataSource={tenants} pagination={false} />

      <Modal title="Onboard New Hospital Tenant" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={640}>
        <HospitalOnboardingWizard
          onClose={() => setModalOpen(false)}
          onProvisioned={(tenant) => setTenants((current) => [{
            key: `tenant-${Date.now()}`,
            tenantId: `TENANT-${String(current.length + 1).padStart(3, "0")}`,
            name: tenant.hospitalName,
            domain: `${tenant.subdomain}.hms.com`,
            tier: tenant.licenseTier,
            seats: `0 / ${tenant.maxUserSeats}`,
            status: "ACTIVE",
          }, ...current])}
        />
      </Modal>

      <Modal
        open={facilityModalOpen}
        onCancel={() => setFacilityModalOpen(false)}
        footer={null}
        width={1040}
        destroyOnClose
        style={{ top: 20 }}
      >
        <HospitalFacilityControlManager
          initialTenantId={activeFacilityTenantId}
          onClose={() => setFacilityModalOpen(false)}
        />
      </Modal>
    </>
  );
};

