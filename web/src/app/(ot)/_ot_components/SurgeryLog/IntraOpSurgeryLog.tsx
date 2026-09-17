"use client";

import React, { useState } from "react";
import { Table, Tag, Checkbox, Modal, Form, Input, message } from "antd";
import { ShieldCheck, CheckCircle2, Clock, Activity, AlertTriangle, FileText, User, Scissors } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useOtStore, SurgeryRecord } from "../../_ot_stores/ot_store";

export const IntraOpSurgeryLog: React.FC = () => {
  const { surgeries, toggleSafetyChecklist } = useOtStore();

  const [selectedSurgery, setSelectedSurgery] = useState<SurgeryRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [signInChecked, setSignInChecked] = useState(true);
  const [timeOutChecked, setTimeOutChecked] = useState(true);
  const [signOutChecked, setSignOutChecked] = useState(true);

  const handleOpenChecklist = (surg: SurgeryRecord) => {
    setSelectedSurgery(surg);
    setSignInChecked(surg.safetyChecklistDone);
    setTimeOutChecked(surg.safetyChecklistDone);
    setSignOutChecked(surg.safetyChecklistDone);
    setModalOpen(true);
  };

  const handleSaveChecklist = () => {
    if (!selectedSurgery) return;
    if (!selectedSurgery.safetyChecklistDone) {
      toggleSafetyChecklist(selectedSurgery.id);
    }
    message.success(`WHO Surgical Safety Checklist verified for ${selectedSurgery.procedureName}`);
    setModalOpen(false);
  };

  const columns = [
    {
      title: "OT & Surgery Code",
      key: "code",
      render: (_: unknown, record: SurgeryRecord) => (
        <div>
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {record.otRoom}
          </span>
          <p className="text-3xs text-slate-400 font-mono mt-1">{record.surgeryCode}</p>
        </div>
      ),
    },
    {
      title: "Patient & Procedure",
      key: "procedure",
      render: (_: unknown, record: SurgeryRecord) => (
        <div>
          <span className="font-bold text-slate-900">{record.patientName}</span>
          <p className="text-xs text-slate-500">UHID: <span className="font-mono">{record.uhid}</span></p>
          <p className="text-xs font-semibold text-slate-800 mt-0.5">{record.procedureName}</p>
        </div>
      ),
    },
    {
      title: "Surgical Team",
      key: "team",
      render: (_: unknown, record: SurgeryRecord) => (
        <div className="text-xs space-y-0.5 text-slate-700">
          <div>Surgeon: <strong>{record.surgeonName}</strong></div>
          <div className="text-slate-500">Anaesthetist: {record.anaesthetistName}</div>
        </div>
      ),
    },
    {
      title: "WHO Safety Checklist",
      dataIndex: "safetyChecklistDone",
      key: "safetyChecklistDone",
      render: (done: boolean) => (
        <Tag color={done ? "emerald" : "volcano"} className="font-bold text-3xs">
          {done ? "WHO CHECKLIST VERIFIED" : "CHECKLIST PENDING"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: SurgeryRecord) => (
        <HmsButton
          size="sm"
          variant="secondary"
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
          onClick={() => handleOpenChecklist(record)}
        >
          WHO Safety Checklist
        </HmsButton>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-teal-600" /> WHO Surgical Safety Checklist & Intra-Op Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute 3-stage WHO Surgical Safety Verification (Sign-In, Time-Out, Sign-Out) before and after surgery.
          </p>
        </div>

        <Tag color="emerald" className="font-bold px-3 py-1 text-xs">
          {surgeries.filter((s) => s.safetyChecklistDone).length} / {surgeries.length} Verified
        </Tag>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={surgeries} rowKey="id" pagination={false} />
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>WHO Surgical Safety Checklist: {selectedSurgery?.procedureName}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={640}
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono space-y-1">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Patient: {selectedSurgery?.patientName}</span>
              <span>UHID: {selectedSurgery?.uhid}</span>
            </div>
            <div>Surgeon: <strong>{selectedSurgery?.surgeonName}</strong></div>
          </div>

          {/* 3-Stage Checklist */}
          <div className="space-y-3">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Stage 1: SIGN-IN (Before Induction of Anaesthesia)
              </h4>
              <Checkbox checked={signInChecked} onChange={(e) => setSignInChecked(e.target.checked)}>
                Patient Identity, Surgical Site, Procedure & Informed Consent Confirmed
              </Checkbox>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 space-y-2">
              <h4 className="font-bold text-amber-900 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600" /> Stage 2: TIME-OUT (Before Skin Incision)
              </h4>
              <Checkbox checked={timeOutChecked} onChange={(e) => setTimeOutChecked(e.target.checked)}>
                Team members introduced, Antibiotic prophylaxis administered within 60 mins
              </Checkbox>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Stage 3: SIGN-OUT (Before Patient Leaves OT)
              </h4>
              <Checkbox checked={signOutChecked} onChange={(e) => setSignOutChecked(e.target.checked)}>
                Instrument, sponge and needle counts verified correct. Specimen correctly labeled.
              </Checkbox>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" onClick={handleSaveChecklist}>
              Confirm & Sign Checklist
            </HmsButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
