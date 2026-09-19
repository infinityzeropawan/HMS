"use client";

import React, { useState } from "react";
import { Tag, Modal, Form, Input, Switch, message, Tooltip } from "antd";
import { BedDouble, Stethoscope, CheckCircle2, AlertTriangle, FileText, Activity, Clock, User, HeartPulse, RefreshCw } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useIpdStore, IpdAdmissionRecord } from "@/app/(ipd)/_ipd_stores/ipd_store";

export const InpatientRoundsWorkspace: React.FC = () => {
  const admissions = useIpdStore((state) => state.admissions);
  const addRoundNote = useIpdStore((state) => state.addRoundNote);
  const resetToDefaults = useIpdStore((state) => state.resetToDefaults);

  const [selectedPatient, setSelectedPatient] = useState<IpdAdmissionRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [roundNoteInput, setRoundNoteInput] = useState("");
  const [dischargeReadyInput, setDischargeReadyInput] = useState(false);

  const activeInpatients = admissions.filter((a) => a.status !== "DISCHARGED");

  const handleOpenRoundModal = (patient: IpdAdmissionRecord) => {
    setSelectedPatient(patient);
    setRoundNoteInput(patient.lastRoundNote || "");
    setDischargeReadyInput(patient.dischargeReady || patient.status === "DISCHARGE_PENDING");
    setModalOpen(true);
  };

  const handleSaveRoundNote = () => {
    if (!selectedPatient) return;
    addRoundNote(selectedPatient.admissionNo, roundNoteInput, dischargeReadyInput);
    message.success(`Ward Round Note saved for ${selectedPatient.patientName} (${selectedPatient.bedNumber}). ADT & EMR synchronized.`);
    setModalOpen(false);
  };

  const totalPatients = activeInpatients.length;
  const completedRounds = activeInpatients.filter((p) => p.roundStatus === "COMPLETED" || p.status === "DISCHARGE_PENDING").length;
  const criticalPatients = activeInpatients.filter((p) => p.roundStatus === "CRITICAL").length;

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">My IPD Bed Count</p>
              <h3 className="text-2xl font-bold text-teal-800 mt-1">{totalPatients} Patients</h3>
            </div>
            <BedDouble className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Rounds Completed</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{completedRounds} Done</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-rose-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Critical Attention Needed</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{criticalPatients} High Priority</h3>
            </div>
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
        </HmsCard>
      </div>

      {/* Control Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" /> Daily Inpatient Ward Round List (Unified useIpdStore)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Select a patient bed card to review vitals, update status, and record SOAP progress notes.</p>
        </div>

        <Tooltip title="Reset inpatient list">
          <HmsButton size="sm" variant="ghost" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={resetToDefaults}>
            Reset List
          </HmsButton>
        </Tooltip>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeInpatients.map((patient) => {
          const roundStat = patient.roundStatus || (patient.status === "DISCHARGE_PENDING" ? "COMPLETED" : "DUE");
          const isCritical = roundStat === "CRITICAL";
          const isCompleted = roundStat === "COMPLETED";
          const vitals = patient.vitals || { bp: "128/82", pulse: 74, spO2: 98, temp: "98.4 °F" };

          return (
            <div
              key={patient.id}
              className={`p-5 rounded-2xl border transition-all duration-200 bg-white shadow-xs space-y-4 flex flex-col justify-between ${
                isCritical
                  ? "border-rose-300 ring-2 ring-rose-100"
                  : isCompleted
                  ? "border-emerald-200"
                  : "border-slate-200"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {patient.bedNumber}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1.5">{patient.patientName}</h4>
                    <p className="text-xs text-slate-500">
                      {patient.age} Yrs / {patient.gender} | UHID: <span className="font-mono">{patient.uhid}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Tag color={isCritical ? "rose" : isCompleted ? "emerald" : "gold"} className="font-bold text-3xs mr-0">
                      {isCritical ? "CRITICAL ALERT" : isCompleted ? "ROUND DONE" : "ROUND DUE"}
                    </Tag>
                    {patient.status === "DISCHARGE_PENDING" && (
                      <Tag color="volcano" className="text-3xs font-bold mr-0">DISCHARGE READY</Tag>
                    )}
                  </div>
                </div>

                {/* Diagnosis & Ward */}
                <div className="py-3 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-3xs uppercase font-semibold">Ward & Admission No:</span>
                    <p className="font-semibold text-slate-700">{patient.admittedWard} ({patient.admissionNo})</p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-3xs uppercase font-semibold">Primary Diagnosis:</span>
                    <p className="font-medium text-slate-900">{patient.primaryDiagnosis || "Inpatient Ward Care"}</p>
                  </div>

                  {/* Vitals Summary Strip */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 grid grid-cols-4 gap-1 text-center text-3xs font-mono">
                    <div>
                      <span className="text-slate-400 block">BP</span>
                      <strong className="text-slate-900">{vitals.bp}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Pulse</span>
                      <strong className="text-slate-900">{vitals.pulse} bpm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">SpO2</span>
                      <strong className={vitals.spO2 < 95 ? "text-rose-600" : "text-emerald-700"}>
                        {vitals.spO2}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Temp</span>
                      <strong className="text-slate-900">{vitals.temp}</strong>
                    </div>
                  </div>

                  {/* Last Round Note preview */}
                  {patient.lastRoundNote && (
                    <div className="bg-teal-50/60 p-2.5 rounded-xl border border-teal-100 text-3xs text-teal-950">
                      <span className="font-bold flex items-center gap-1 text-teal-800">
                        <Clock className="w-3 h-3" /> Last Note ({patient.lastRoundTime || patient.admissionDate}):
                      </span>
                      <p className="mt-0.5 italic line-clamp-2">{patient.lastRoundNote}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-3xs text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3" /> {patient.attendingNurse || "Duty Nurse"}
                </div>

                <HmsButton
                  size="sm"
                  variant={isCompleted ? "secondary" : "emerald"}
                  icon={<FileText className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenRoundModal(patient)}
                >
                  {isCompleted ? "Update SOAP Note" : "Record Round Note"}
                </HmsButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Round Note Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <span>Record Doctor Ward Round Note: {selectedPatient?.patientName} ({selectedPatient?.bedNumber})</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4 py-2">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span>Patient: <strong>{selectedPatient?.patientName}</strong></span>
              <span>UHID: <strong>{selectedPatient?.uhid}</strong></span>
            </div>
            <div className="flex justify-between">
              <span>Admission No: <strong>{selectedPatient?.admissionNo}</strong></span>
              <span>Attending: <strong>{selectedPatient?.attendingDoctor}</strong></span>
            </div>
            <div>Diagnosis: <strong>{selectedPatient?.primaryDiagnosis || "Inpatient Care"}</strong></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Doctor Daily SOAP Round Note (Subjective, Objective, Assessment, Plan)
            </label>
            <Input.TextArea
              rows={5}
              placeholder="e.g. Patient comfortable. Lungs clear bilaterally. Surgical site clean. Continue IV Antibiotics x 48 hrs..."
              value={roundNoteInput}
              onChange={(e) => setRoundNoteInput(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <div>
              <span className="font-bold text-emerald-900 text-xs block">Clear Patient for Discharge</span>
              <span className="text-3xs text-emerald-700">Updates ADT status to DISCHARGE_PENDING and syncs Patient360 / EMR timeline.</span>
            </div>
            <Switch checked={dischargeReadyInput} onChange={(val) => setDischargeReadyInput(val)} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" onClick={handleSaveRoundNote}>
              Save Ward Round Note & Sync ADT
            </HmsButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

