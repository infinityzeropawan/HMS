"use client";

import React, { useState } from "react";
import { Table, Tag, Modal } from "antd";
import { Plus } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HospitalOnboardingWizard } from "../TenantOnboarding/HospitalOnboardingWizard";

export const SubscriptionManagerTable: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

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
      title: "Action",
      key: "action",
      render: () => (
        <HmsButton size="sm" variant="secondary">
          Manage SLA
        </HmsButton>
      ),
    },
  ];

  const data = [
    { key: "1", tenantId: "TENANT-001", name: "Apollo Super Speciality Hospital", domain: "apollo.hms.com", tier: "ENTERPRISE", seats: "85 / 100", status: "ACTIVE" },
    { key: "2", tenantId: "TENANT-002", name: "Fortis Care Heart Institute", domain: "fortis.hms.com", tier: "SUPER_SPECIALTY", seats: "140 / 200", status: "ACTIVE" },
    { key: "3", tenantId: "TENANT-003", name: "City Diagnostics & OPD Clinic", domain: "citydiag.hms.com", tier: "BASIC", seats: "12 / 15", status: "ACTIVE" },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <HmsButton type="primary" variant="emerald" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Onboard New Hospital
        </HmsButton>
      </div>

      <Table columns={columns} dataSource={data} pagination={false} />

      <Modal title="Onboard New Hospital Tenant" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={640}>
        <HospitalOnboardingWizard onClose={() => setModalOpen(false)} />
      </Modal>
    </>
  );
};
