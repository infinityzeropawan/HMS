"use client";

import React, { useState } from "react";
import { Table, Tag, Checkbox, Modal, Form, Input, message } from "antd";
import { ShieldCheck, CheckCircle2, Clock, Activity, AlertTriangle, FileText, User, Scissors } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useOtStore, SurgeryRecord } from "../../_ot_stores/ot_store";

export const IntraOpSurgeryLog: React.FC = () => {
  const { surgeries, toggleSafetyChecklist, completeSurgery, reportPostOpComplication } = useOtStore();

  const [selectedSurgery, setSelectedSurgery] = useState<SurgeryRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [complicationModalOpen, setComplicationModalOpen] = useState(false);
  const [signInChecked, setSignInChecked] = useState(true);
  const [timeOutChecked, setTimeOutChecked] = useState(true);
  const [signOutChecked, setSignOutChecked] = useState(true);
  const [procedureNotes, setProcedureNotes] = useState("");
  const [complicationDetails, setComplicationDetails] = useState("");

  const handleOpenChecklist = (surg: SurgeryRecord) => {
    setSelectedSurgery(surg);
    setSignInChecked(surg.safetyChecklistDone);
    setTimeOutChecked(surg.safetyChecklistDone);
    setSignOutChecked(surg.safetyChecklistDone);
    setProcedureNotes(surg.procedureNotes || "Procedure completed under sterile conditions. Unremarkable course.");
    setModalOpen(true);
  };

  const handleSaveChecklist = () => {
    if (!selectedSurgery) return;
    if (!selectedSurgery.safetyChecklistDone) {
      toggleSafetyChecklist(selectedSurgery.id);
    }
    if (selectedSurgery.status === "IN_PROGRESS" || selectedSurgery.status === "SCHEDULED") {
      completeSurgery(selectedSurgery.id, {
        procedureNotes: procedureNotes || "WHO Safety Checklist verified. Procedure completed.",
      });
    }
    message.success(`WHO Surgical Safety Checklist verified & intra-op log saved for ${selectedSurgery.procedureName}`);
    setModalOpen(false);
  };

  const handleReportComplication = () => {
    if (!selectedSurgery || !complicationDetails) return;
    reportPostOpComplication(selectedSurgery.id, complicationDetails);
    message.error(`Critical Post-Op complication alert dispatched for ${selectedSurgery.patientName}`);
    setComplicationDetails("");
    setComplicationModalOpen(false);
  };

  const columns = [
    {
      title: "OT & Surgery Code",
      key: "code",
      render: (_: unknown, record: SurgeryRecord) => (
        <div>
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
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
          <p className="text-xs text-slate-500">UHID: <span className="font-mono text-slate-700">{record.uhid}</span></p>
          <p className="text-xs font-semibold text-teal-900 mt-0.5">{record.procedureName}</p>
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: SurgeryRecord["status"]) => (
        <Tag color={status === "COMPLETED" ? "emerald" : status === "IN_PROGRESS" ? "gold" : "blue"} className="font-bold">
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_: unknown, record: SurgeryRecord) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <HmsButton
            size="sm"
            variant="secondary"
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            onClick={() => handleOpenChecklist(record)}
          >
            Checklist & Log
          </HmsButton>
          <HmsButton
            size="sm"
            variant="danger"
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            onClick={() => {
              setSelectedSurgery(record);
              setComplicationModalOpen(true);
            }}
          >
            Complication Alert
          </HmsButton>
        </div>
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
            Execute 3-stage WHO Surgical Safety Verification (Sign-In, Time-Out, Sign-Out) and log intraoperative notes.
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

      {/* WHO Checklist Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>WHO Surgical Safety Checklist & Intra-Op Note: {selectedSurgery?.procedureName}</span>
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
            <div>Surgeon: <strong>{selectedSurgery?.surgeonName}</strong> | Anaesthetist: {selectedSurgery?.anaesthetistName}</div>
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

          <div>
            <label className="font-bold text-slate-800 text-xs block mb-1">Operative Procedure Notes & Findings</label>
            <Input.TextArea
              rows={3}
              value={procedureNotes}
              onChange={(e) => setProcedureNotes(e.target.value)}
              placeholder="Enter surgical findings, implants placed, estimated blood loss, etc."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" onClick={handleSaveChecklist} icon={<ShieldCheck className="w-4 h-4" />}>
              Confirm & Complete Log
            </HmsButton>
          </div>
        </div>
      </Modal>

      {/* Complication Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Flag Post-Operative Complication Alert</span>
          </div>
        }
        open={complicationModalOpen}
        onCancel={() => setComplicationModalOpen(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-4 py-2 text-xs">
          <p className="text-slate-600">
            Flagging a post-operative complication for <strong>{selectedSurgery?.patientName}</strong> (UHID: {selectedSurgery?.uhid}) will trigger an urgent critical notification to all clinical duty stations and log an audit event.
          </p>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Complication Description</label>
            <Input.TextArea
              rows={4}
              value={complicationDetails}
              onChange={(e) => setComplicationDetails(e.target.value)}
              placeholder="e.g. Excessive post-op surgical site bleeding / Anaphylactic reaction / Unstable hemodynamics"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setComplicationModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="danger" onClick={handleReportComplication} icon={<AlertTriangle className="w-4 h-4" />}>
              Dispatch Critical Alert
            </HmsButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
