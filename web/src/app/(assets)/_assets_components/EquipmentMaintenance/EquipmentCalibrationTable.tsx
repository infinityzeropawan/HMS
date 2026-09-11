"use client";

import React, { useState } from "react";
import { Table, Tag, Modal } from "antd";
import { AlertCircle } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { BreakdownTicketForm } from "../BreakdownTickets/BreakdownTicketForm";

export const EquipmentCalibrationTable: React.FC = () => {
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const equipmentList = [
    { key: "1", assetId: "EQ-1049", name: "ICU Ventilator (Hamilton C3)", dept: "ICU Ward", lastCalib: "2026-06-15", nextDue: "2026-09-15", status: "CALIBRATED" },
    { key: "2", assetId: "EQ-1052", name: "12-Lead ECG Machine (GE MAC 2000)", dept: "Cardiology OPD", lastCalib: "2025-12-10", nextDue: "2026-09-10", status: "DUE_FOR_CALIB" },
    { key: "3", assetId: "EQ-1088", name: "OT Shadowless LED Lights", dept: "OT Room 1", lastCalib: "2026-01-20", nextDue: "2026-10-20", status: "CALIBRATED" },
  ];

  const columns = [
    { title: "Asset ID", dataIndex: "assetId", key: "assetId" },
    { title: "Equipment Name", dataIndex: "name", key: "name" },
    { title: "Department", dataIndex: "dept", key: "dept" },
    { title: "Last Calibration", dataIndex: "lastCalib", key: "lastCalib" },
    { title: "Next Due Date", dataIndex: "nextDue", key: "nextDue" },
    {
      title: "Calibration Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={s === "CALIBRATED" ? "emerald" : "orange"}>{s}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <HmsButton
          size="sm"
          variant="danger"
          icon={<AlertCircle className="w-3.5 h-3.5" />}
          onClick={() => setTicketModalOpen(true)}
        >
          Log Breakdown
        </HmsButton>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={equipmentList} pagination={false} />
      <Modal
        title="Log Biomedical Breakdown Ticket"
        open={ticketModalOpen}
        onCancel={() => setTicketModalOpen(false)}
        footer={null}
        width={560}
      >
        <BreakdownTicketForm onClose={() => setTicketModalOpen(false)} />
      </Modal>
    </>
  );
};
