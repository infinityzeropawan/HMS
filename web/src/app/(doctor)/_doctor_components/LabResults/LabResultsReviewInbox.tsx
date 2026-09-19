"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag, Modal, Input, message } from "antd";
import { Microscope, AlertTriangle, CheckCircle2, Search, FileText, Calendar } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { PatientProfileService } from "@/app/(patient)/_patient_services/patient_profile_service";

interface LabResultRecord {
  id: string;
  orderNo: string;
  uhid: string;
  testName: string;
  category: "PATHOLOGY" | "RADIOLOGY" | "MICROBIOLOGY";
  resultValue: string;
  normalRange: string;
  orderDate: string;
  status: "PENDING_DOCTOR_REVIEW" | "VERIFIED" | "CRITICAL_PANIC";
  criticalNotice?: string;
}

export const LabResultsReviewInbox: React.FC = () => {
  const [results, setResults] = useState<LabResultRecord[]>([
    {
      id: "lab-101",
      orderNo: "LAB-2026-9901",
      uhid: "P-2026-9978",
      testName: "Serum Electrolytes (Potassium / K+)",
      category: "PATHOLOGY",
      resultValue: "6.2 mmol/L",
      normalRange: "3.5 - 5.1 mmol/L",
      orderDate: "2026-09-16 08:30 AM",
      status: "CRITICAL_PANIC",
      criticalNotice: "Hyperkalemia Panic Alert! High risk of cardiac arrhythmia. Immediate ECG advised.",
    },
    {
      id: "lab-102",
      orderNo: "LAB-2026-9915",
      uhid: "P-2026-9912",
      testName: "Cardiac Biomarkers (Troponin I)",
      category: "PATHOLOGY",
      resultValue: "4.8 ng/mL",
      normalRange: "< 0.04 ng/mL",
      orderDate: "2026-09-16 09:15 AM",
      status: "PENDING_DOCTOR_REVIEW",
    },
    {
      id: "lab-103",
      orderNo: "RAD-2026-4412",
      uhid: "P-2026-9944",
      testName: "Digital X-Ray Knee Joint (AP & Lateral)",
      category: "RADIOLOGY",
      resultValue: "Right TKA Implant in good alignment. No fracture or loosening.",
      normalRange: "Normal Alignment",
      orderDate: "2026-09-16 10:00 AM",
      status: "VERIFIED",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<LabResultRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [doctorComment, setDoctorComment] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("hms_lab_orders") || "[]");
        if (stored.length > 0) {
          setResults((prev) => {
            const map = new Map<string, LabResultRecord>();
            prev.forEach((item) => map.set(item.id, item));
            stored.forEach((item: LabResultRecord) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleSignOff = () => {
    if (!selectedResult) return;
    const profile = PatientProfileService.getPatientProfile(selectedResult.uhid);
    setResults((prev) =>
      prev.map((r) => (r.id === selectedResult.id ? { ...r, status: "VERIFIED" } : r))
    );
    message.success(`Diagnostic report for ${profile.fullName} verified and signed off!`);
    setModalOpen(false);
  };

  const filteredResults = results.filter((r) => {
    const profile = PatientProfileService.getPatientProfile(r.uhid);
    return (
      profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = [
    {
      title: "Order # & Date",
      key: "orderNo",
      render: (_: unknown, record: LabResultRecord) => (
        <div>
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {record.orderNo}
          </span>
          <p className="text-3xs text-slate-400 font-mono mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {record.orderDate}
          </p>
        </div>
      ),
    },
    {
      title: "Patient Details (Patient Store)",
      key: "patient",
      render: (_: unknown, record: LabResultRecord) => {
        const profile = PatientProfileService.getPatientProfile(record.uhid);
        return (
          <div>
            <span className="font-bold text-slate-900">{profile.fullName}</span>
            <p className="text-xs text-slate-500">
              {profile.age} Yrs / {profile.gender} | UHID: <span className="font-mono">{record.uhid}</span>
            </p>
          </div>
        );
      },
    },
    {
      title: "Test & Result",
      key: "test",
      render: (_: unknown, record: LabResultRecord) => (
        <div>
          <span className="font-semibold text-xs text-slate-800">{record.testName}</span>
          <p className="text-xs font-mono font-bold mt-0.5 text-slate-900">
            Result: <span className={record.status === "CRITICAL_PANIC" ? "text-rose-600 font-black" : "text-teal-700"}>{record.resultValue}</span>
          </p>
          <p className="text-3xs text-slate-400 font-mono">Ref Range: {record.normalRange}</p>
        </div>
      ),
    },
    {
      title: "Review Status",
      dataIndex: "status",
      key: "status",
      render: (s: LabResultRecord["status"]) => {
        if (s === "CRITICAL_PANIC")
          return <Tag color="rose" className="font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> CRITICAL PANIC</Tag>;
        if (s === "VERIFIED")
          return <Tag color="emerald" className="font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> VERIFIED</Tag>;
        return <Tag color="gold" className="font-bold">PENDING REVIEW</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: LabResultRecord) => (
        <HmsButton
          size="sm"
          variant={record.status === "CRITICAL_PANIC" ? "danger" : "secondary"}
          icon={<FileText className="w-3.5 h-3.5" />}
          onClick={() => {
            setSelectedResult(record);
            setDoctorComment("");
            setModalOpen(true);
          }}
        >
          {record.status === "VERIFIED" ? "View Report" : "Review & Sign"}
        </HmsButton>
      ),
    },
  ];

  const selectedProfile = selectedResult ? PatientProfileService.getPatientProfile(selectedResult.uhid) : null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Reports in Inbox</p>
              <h3 className="text-2xl font-bold text-teal-800 mt-1">{results.length} Lab Reports</h3>
            </div>
            <Microscope className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-rose-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Critical Panic Alerts</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">
                {results.filter((r) => r.status === "CRITICAL_PANIC").length} High Risk
              </h3>
            </div>
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Verified Reports</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {results.filter((r) => r.status === "VERIFIED").length} Verified
              </h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>
      </div>

      {/* Control Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Microscope className="w-5 h-5 text-teal-600" /> Diagnostic & Lab Results Review Inbox
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review pathology test values, radiology DICOM findings, and sign off patient diagnostic reports.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="Search patient, UHID or test name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={filteredResults} rowKey="id" pagination={false} />
      </div>

      {/* Review Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <Microscope className="w-5 h-5 text-teal-600" />
            <span>Lab Report Sign-Off: {selectedResult?.testName}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <div className="space-y-4 py-2 text-xs">
          {selectedResult?.status === "CRITICAL_PANIC" && (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> CRITICAL PANIC ALERT
              </span>
              <p>{selectedResult.criticalNotice}</p>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Patient: {selectedProfile?.fullName} ({selectedProfile?.age}Y/{selectedProfile?.gender})</span>
              <span>UHID: {selectedResult?.uhid}</span>
            </div>
            <div className="text-slate-700">Test: <strong>{selectedResult?.testName}</strong></div>
            <div className="text-slate-900 font-mono text-sm pt-1 border-t border-slate-200">
              Observed Value: <strong className="text-teal-700">{selectedResult?.resultValue}</strong> (Ref: {selectedResult?.normalRange})
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Doctor Clinical Comments & Advice</label>
            <Input.TextArea
              rows={3}
              placeholder="Add physician notes or follow-up orders..."
              value={doctorComment}
              onChange={(e) => setDoctorComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Close
            </HmsButton>
            {selectedResult?.status !== "VERIFIED" && (
              <HmsButton variant="emerald" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleSignOff}>
                Verify & Sign Off Report
              </HmsButton>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

