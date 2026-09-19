"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Table, Tag, Input, Modal, Form, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Layers, Eye, FileText, ShieldCheck, Activity } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { usePacsStore } from "../_pacs_stores/pacs_store";
import { PacsService } from "../_pacs_services/pacs_service";
import { RadiologyStudy, RadiologyReportFormValues } from "../_pacs_types/pacs_types";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";

const MODALITY_COLOR: Record<string, string> = {
  CR: "purple",
  CT: "blue",
  MRI: "cyan",
  US: "emerald",
  MG: "magenta",
  ECG: "red",
};

export default function PacsWorklistPage() {
  const studies = usePacsStore((state) => state.studies);
  const currentUser = useAuthUserStore((state) => state.user);
  const radiologistTitle = currentUser?.username ? `Dr. ${currentUser.username} (MD Radiology)` : "Dr. Vikram Seth (MD Rad)";

  const [searchQuery, setSearchQuery] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeStudy, setActiveStudy] = useState<RadiologyStudy | null>(null);
  const [form] = Form.useForm();

  const handleOpenReportModal = (study: RadiologyStudy) => {
    setActiveStudy(study);
    setReportModalOpen(true);
    form.setFieldsValue({
      radiologist: study.radiologist || radiologistTitle,
      technique: study.technique || `${study.modality} Scan of ${study.bodyPart} performed as per standard hospital protocol.`,
      findings: study.findings || "No gross bony injury or focal lung consolidation. Soft tissue structures appear unremarkable.",
      impression: study.impression || "Normal study. No acute cardiopulmonary abnormality detected.",
    });
  };

  const handleSaveReport = (values: Record<string, unknown>) => {
    if (!activeStudy) return;
    const reportValues: RadiologyReportFormValues = {
      radiologist: String(values.radiologist || ""),
      technique: String(values.technique || ""),
      findings: String(values.findings || ""),
      impression: String(values.impression || ""),
    };

    PacsService.finalizeReport(activeStudy.studyId, reportValues);
    message.success(`Radiology Report for Study ${activeStudy.studyId} finalized & signed by ${values.radiologist}!`);
    setReportModalOpen(false);
    form.resetFields();
  };

  const filteredStudies = studies.filter((s) => {
    const matchesSearch =
      s.studyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.bodyPart.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = modalityFilter === "ALL" || s.modality === modalityFilter;
    return matchesSearch && matchesModality;
  });

  const emergencyCount = studies.filter((s) => s.priority === "EMERGENCY" || s.priority === "STAT").length;
  const reportedCount = studies.filter((s) => s.status === "REPORTED").length;

  const columns = [
    {
      title: "Study ID & Date",
      key: "studyId",
      render: (_: unknown, record: RadiologyStudy) => (
        <div>
          <span className="font-mono font-bold text-purple-700 block">{record.studyId}</span>
          <span className="text-[11px] text-slate-500">{record.date}</span>
        </div>
      ),
    },
    {
      title: "Modality",
      dataIndex: "modality",
      key: "modality",
      render: (m: string) => <Tag color={MODALITY_COLOR[m] || "default"}>{m}</Tag>,
    },
    {
      title: "Patient UHID & Name",
      key: "patient",
      render: (_: unknown, record: RadiologyStudy) => (
        <div>
          <strong className="text-slate-900 block text-xs">{record.patientName}</strong>
          <span className="text-[11px] font-mono text-slate-500">{record.uhid}</span>
        </div>
      ),
    },
    { title: "Body Region / Protocol", dataIndex: "bodyPart", key: "bodyPart" },
    {
      title: "Images",
      dataIndex: "imagesCount",
      key: "imagesCount",
      render: (c: number) => <span className="font-mono text-xs font-semibold">{c} Slices</span>,
    },
    {
      title: "Priority & Status",
      key: "status",
      render: (_: unknown, record: RadiologyStudy) => (
        <div className="space-y-1">
          <Tag color={record.priority === "EMERGENCY" || record.priority === "STAT" ? "red" : record.priority === "HIGH" ? "orange" : "blue"}>
            {record.priority}
          </Tag>
          <Tag color={record.status === "UNREAD" || record.status === "ORDERED" ? "volcano" : "green"}>{record.status}</Tag>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: RadiologyStudy) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/viewer/${record.studyId}`}>
            <HmsButton size="sm" type="primary" variant="primary" icon={<Eye className="w-3.5 h-3.5" />}>
              Open Viewer
            </HmsButton>
          </Link>
          <HmsButton
            size="sm"
            variant="secondary"
            icon={<FileText className="w-3.5 h-3.5" />}
            onClick={() => handleOpenReportModal(record)}
          >
            {record.status === "REPORTED" ? "Edit Report" : "Report"}
          </HmsButton>
        </div>
      ),
    },
  ];

  return (
    <HmsAppShell title="RIS / PACS Radiology Worklist & Diagnostic Hub">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Layers className="w-3.5 h-3.5" /> Picture Archiving and Communication System (PACS)
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Radiology Worklist & Web DICOM Console
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                DICOM 3.0 multi-modality radiology studies, WebGL 2D/3D viewer, AI preliminary diagnostic hints, and structured reports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/viewer/STD-9901">
                <HmsButton variant="emerald" icon={<Eye className="w-4 h-4" />}>
                  Launch Web DICOM Viewer
                </HmsButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Diagnostic KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HmsCard elevated className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Studies Active</p>
                <h3 className="text-2xl font-bold text-purple-800 mt-1">{studies.length} Studies</h3>
                <p className="text-3xs text-purple-600 font-semibold mt-0.5">CR, CT, MRI, US & ECG</p>
              </div>
              <Layers className="w-8 h-8 text-purple-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-rose-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Unread Critical</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{emergencyCount} Emergency</h3>
                <p className="text-3xs text-rose-600 font-semibold mt-0.5">STAT Review Req.</p>
              </div>
              <Activity className="w-8 h-8 text-rose-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-teal-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">PACS Storage</p>
                <h3 className="text-2xl font-bold text-teal-800 mt-1">1.4 TB Active</h3>
                <p className="text-3xs text-slate-500 mt-0.5">DICOM Server Online</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Reported & Signed</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">{reportedCount} Signed</h3>
                <p className="text-3xs text-emerald-600 font-semibold mt-0.5">EHR Pushed</p>
              </div>
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>
        </div>

        {/* Worklist Table Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <Input
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder="Search Study ID, Patient, UHID, Body Region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80"
                allowClear
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Modality:</span>
              <select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
              >
                <option value="ALL">All Modalities</option>
                <option value="CR">CR / Digital X-Ray</option>
                <option value="CT">CT Scan</option>
                <option value="MRI">MRI</option>
                <option value="US">Ultrasound</option>
                <option value="ECG">ECG / Echo</option>
                <option value="MG">Mammography</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table columns={columns} dataSource={filteredStudies} rowKey="key" pagination={{ pageSize: 8 }} />
          </div>
        </div>

        {/* Draft Radiology Report Modal */}
        {activeStudy && (
          <Modal
            title={
              <div className="flex items-center gap-2 text-purple-800 font-bold border-b pb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>Radiology Report Draft ({activeStudy.studyId})</span>
              </div>
            }
            open={reportModalOpen}
            onCancel={() => setReportModalOpen(false)}
            footer={null}
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveReport}
              initialValues={{
                radiologist: activeStudy.radiologist || "Dr. Vikram Seth (MD Radiology - Reg # 77123)",
                technique: activeStudy.technique || `${activeStudy.modality} Scan of ${activeStudy.bodyPart} performed as per standard hospital protocol.`,
                findings: activeStudy.findings || "No gross bony injury or focal lung consolidation. Soft tissue structures appear unremarkable.",
                impression: activeStudy.impression || "Normal study. No acute cardiopulmonary abnormality detected.",
              }}
              className="mt-3 space-y-3"
            >
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between">
                <div>
                  <strong>Patient:</strong> {activeStudy.patientName} ({activeStudy.uhid})
                </div>
                <div>
                  <strong>Modality:</strong> {activeStudy.modality} &bull; {activeStudy.bodyPart}
                </div>
              </div>

              <Form.Item label="Technique & Protocol" name="technique" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item label="Radiological Findings" name="findings" rules={[{ required: true }]}>
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item label="Conclusion / Impression" name="impression" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item label="Reporting Radiologist Signature" name="radiologist" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
                >
                  Sign & Finalize Report
                </button>
              </div>
            </Form>
          </Modal>
        )}
      </div>
    </HmsAppShell>
  );
}
