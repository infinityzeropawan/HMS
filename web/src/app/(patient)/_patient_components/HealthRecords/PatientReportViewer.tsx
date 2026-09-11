"use client";

import React from "react";
import { Table, Tag, message } from "antd";
import { Download } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const PatientReportViewer: React.FC = () => {
  const records = [
    { key: "1", date: "2026-09-08", type: "e-Prescription", title: "Cardiology OPD Prescription", doctor: "Dr. Rajesh Sharma", docType: "eRx" },
    { key: "2", date: "2026-09-08", type: "Lab Report", title: "Complete Blood Count & Hb", doctor: "Pathology Lab", docType: "Lab" },
    { key: "3", date: "2026-09-08", type: "GST Invoice", title: "OPD Consultation & Diagnostic Bill", doctor: "Billing Counter", docType: "Bill" },
  ];

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Category",
      dataIndex: "type",
      key: "type",
      render: (t: string) => <Tag color={t === "e-Prescription" ? "purple" : t === "Lab Report" ? "blue" : "emerald"}>{t}</Tag>,
    },
    { title: "Document Title", dataIndex: "title", key: "title" },
    { title: "Provider", dataIndex: "doctor", key: "doctor" },
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

  return <Table columns={columns} dataSource={records} pagination={false} />;
};
