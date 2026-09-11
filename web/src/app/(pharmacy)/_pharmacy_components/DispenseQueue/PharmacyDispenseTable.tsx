"use client";

import React, { useState } from "react";
import { Table, Tag, message } from "antd";
import { Pill, CheckSquare } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { FefoBatchModal } from "../FefoBatchSelector/FefoBatchModal";

export const PharmacyDispenseTable: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState("");

  const handleOpenFefo = (drugName: string) => {
    setSelectedDrug(drugName);
    setModalOpen(true);
  };

  const columns = [
    { title: "Rx ID", dataIndex: "rxId", key: "rxId" },
    { title: "Patient UHID", dataIndex: "uhid", key: "uhid" },
    { title: "Patient Name", dataIndex: "patientName", key: "patientName" },
    { title: "Prescribed Medications", dataIndex: "meds", key: "meds" },
    {
      title: "Dispense Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "PENDING" ? "volcano" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_: unknown, record: { key: string; rxId: string; uhid: string; patientName: string; meds: string; status: string }) => (
        <div className="flex gap-2">
          <HmsButton
            size="sm"
            variant="secondary"
            icon={<Pill className="w-3.5 h-3.5" />}
            onClick={() => handleOpenFefo(record.meds.split(",")[0])}
          >
            FEFO Batch
          </HmsButton>
          <HmsButton
            size="sm"
            type="primary"
            variant="emerald"
            icon={<CheckSquare className="w-3.5 h-3.5" />}
            onClick={() => message.success(`Prescription ${record.rxId} dispensed!`)}
          >
            Dispense
          </HmsButton>
        </div>
      ),
    },
  ];

  const data = [
    { key: "1", rxId: "RX-9910", uhid: "P-2026-1049", patientName: "Sunil Verma", meds: "Tab Sorbitrate 5mg, Tab Ecosprin 75mg", status: "PENDING" },
    { key: "2", rxId: "RX-9912", uhid: "P-2026-1052", patientName: "Anjali Gupta", meds: "Cap Amoxicillin 500mg, Paracetamol 650mg", status: "PENDING" },
  ];

  return (
    <>
      <Table columns={columns} dataSource={data} pagination={false} />
      <FefoBatchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        drugName={selectedDrug}
      />
    </>
  );
};
