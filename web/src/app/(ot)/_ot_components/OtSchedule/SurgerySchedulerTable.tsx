"use client";

import React, { useState } from "react";
import { Table, Tag, Modal } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { AnesthesiaClearanceForm } from "../PreOpClearance/AnesthesiaClearanceForm";

export const SurgerySchedulerTable: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const columns = [
    { title: "OT Room", dataIndex: "otRoom", key: "otRoom" },
    { title: "Patient UHID", dataIndex: "uhid", key: "uhid" },
    { title: "Patient Name", dataIndex: "name", key: "name" },
    { title: "Surgical Procedure", dataIndex: "procedure", key: "procedure" },
    { title: "Lead Surgeon", dataIndex: "surgeon", key: "surgeon" },
    { title: "Anesthetist", dataIndex: "anesthetist", key: "anesthetist" },
    {
      title: "Pre-Op Clearance",
      dataIndex: "preOpStatus",
      key: "preOpStatus",
      render: (status: string) => (
        <Tag color={status === "APPROVED" ? "emerald" : "volcano"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: { preOpStatus: string }) => (
        <HmsButton
          size="sm"
          variant={record.preOpStatus === "APPROVED" ? "primary" : "secondary"}
          onClick={() => setModalOpen(true)}
        >
          {record.preOpStatus === "APPROVED" ? "View Clearance" : "Pre-Op Assessment"}
        </HmsButton>
      ),
    },
  ];

  const data = [
    { key: "1", otRoom: "OT 1 (Major)", uhid: "P-2026-1049", name: "Sunil Verma", procedure: "Coronary Angioplasty (PTCA)", surgeon: "Dr. Rajesh Sharma", anesthetist: "Dr. S. Kulkarni", preOpStatus: "APPROVED" },
    { key: "2", otRoom: "OT 2 (Ortho)", uhid: "P-2026-1058", name: "Ramesh Kumar", procedure: "Total Knee Replacement (TKR)", surgeon: "Dr. Priya Nair", anesthetist: "Dr. S. Kulkarni", preOpStatus: "PENDING" },
  ];

  return (
    <>
      <Table columns={columns} dataSource={data} pagination={false} />
      <Modal
        title="Anesthesia Pre-Op Clearance"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={640}
      >
        <AnesthesiaClearanceForm onClose={() => setModalOpen(false)} />
      </Modal>
    </>
  );
};
