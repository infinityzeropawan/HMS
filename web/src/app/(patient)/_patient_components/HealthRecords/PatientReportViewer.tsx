"use client";

import React from "react";
import { Table, Tag, message } from "antd";
import { Download } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { EmrService } from "../../_patient_services/emr_service";

export const PatientReportViewer: React.FC<{ uhid?: string }> = ({ uhid = "P-2026-1049" }) => {
  const profile = EmrService.getPatientEmrProfile(uhid);
  const documents = profile.documents;

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (t: string) => (
        <Tag
          color={
            t === "e-Prescription"
              ? "purple"
              : t === "Lab Report"
              ? "blue"
              : t === "Radiology DICOM"
              ? "cyan"
              : t === "Discharge Summary"
              ? "orange"
              : "emerald"
          }
        >
          {t}
        </Tag>
      ),
    },
    { title: "Document Title", dataIndex: "title", key: "title" },
    { title: "Provider / Department", dataIndex: "provider", key: "provider" },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: { title: string }) => (
        <HmsButton
          size="sm"
          variant="secondary"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={() => message.success(`Downloading ${record.title} PDF`)}
        >
          Download PDF
        </HmsButton>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Table columns={columns} dataSource={documents} rowKey="id" pagination={{ pageSize: 6 }} />
    </div>
  );
};
