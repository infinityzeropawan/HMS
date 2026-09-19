"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tabs, Tag, message, Modal, Form, Input, Select } from "antd";
import { PatientReportViewer } from "../_patient_components/HealthRecords/PatientReportViewer";
import { AbhaConsentManager } from "../_patient_components/AbhaLinkage/AbhaConsentManager";
import {
  FileText,
  ShieldCheck,
  Pill,
  Calendar,
  Video,
  Ticket,
  Clock,
  AlertTriangle,
  Activity,
  Stethoscope,
  ShieldAlert,
  Filter,
  Plus,
  Archive,
  CheckCircle2,
  Info,
} from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { AppointmentBookingDrawer } from "@/app/(reception)/_reception_components/AppointmentBooking/AppointmentBookingDrawer";
import { EmrService } from "../_patient_services/emr_service";
import { useEmrStore } from "../_patient_stores/emr_store";
import { EmrCategory, AllergyType, AllergySeverity } from "../_patient_types/emr_types";

function PatientPortalContent() {
  const searchParams = useSearchParams();
  const uhidParam = searchParams.get("uhid") || "P-2026-1049";

  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<EmrCategory | "ALL">("ALL");

  // Modals state for Problem and Allergy CRUD
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [allergyModalOpen, setAllergyModalOpen] = useState(false);

  const [problemForm] = Form.useForm();
  const [allergyForm] = Form.useForm();

  // Force re-render state trigger when Zustand store updates
  const [storeVersion, setStoreVersion] = useState(0);
  const refreshStore = () => setStoreVersion((v) => v + 1);

  const profile = EmrService.getPatientEmrProfile(uhidParam);
  const demographics = profile.demographics;
  const snapshot = profile.snapshot;

  const filteredTimeline = timelineFilter === "ALL"
    ? profile.timeline
    : profile.timeline.filter((e) => e.category === timelineFilter);

  const categoryFilterOptions: Array<{ key: EmrCategory | "ALL"; label: string }> = [
    { key: "ALL", label: "All Events" },
    { key: "ENCOUNTER", label: "Encounters" },
    { key: "APPOINTMENT", label: "Appointments" },
    { key: "LAB", label: "Labs" },
    { key: "RADIOLOGY", label: "Radiology" },
    { key: "ADT", label: "Admissions" },
    { key: "BILLING", label: "Billing" },
  ];

  // Problem Form submit handler
  const handleAddProblem = (values: { icd10Code: string; conditionName: string; diagnosedBy: string }) => {
    useEmrStore.getState().addProblem(uhidParam, {
      icd10Code: values.icd10Code.toUpperCase(),
      conditionName: values.conditionName,
      status: "ACTIVE",
      onsetDate: new Date().toISOString().split("T")[0],
      diagnosedBy: values.diagnosedBy || "Attending Physician",
    });
    message.success(`Problem entry "${values.conditionName}" added to active problem list.`);
    problemForm.resetFields();
    setProblemModalOpen(false);
    refreshStore();
  };

  // Allergy Form submit handler (with duplicate and severity validation)
  const handleAddAllergy = (values: {
    allergen: string;
    type: AllergyType;
    severity: AllergySeverity;
    reaction: string;
  }) => {
    const res = useEmrStore.getState().addAllergy(uhidParam, {
      allergen: values.allergen,
      type: values.type,
      severity: values.severity,
      reaction: values.reaction,
      onsetDate: new Date().toISOString().split("T")[0],
    });

    if (!res.success) {
      message.error(res.error || "Failed to register allergy.");
      return;
    }

    message.success(`Allergy record for "${values.allergen}" added to registry.`);
    allergyForm.resetFields();
    setAllergyModalOpen(false);
    refreshStore();
  };

  const handleArchiveProblem = (problemId: string, conditionName: string) => {
    useEmrStore.getState().archiveProblem(uhidParam, problemId);
    message.info(`Problem "${conditionName}" resolved and archived.`);
    refreshStore();
  };

  const handleArchiveAllergy = (allergyId: string, allergen: string) => {
    useEmrStore.getState().archiveAllergy(uhidParam, allergyId);
    message.info(`Allergy record for "${allergen}" archived.`);
    refreshStore();
  };

  const handleMedicationStatusChange = (medId: string, status: "ACTIVE" | "COMPLETED" | "DISCONTINUED") => {
    useEmrStore.getState().updateMedicationStatus(uhidParam, medId, status);
    message.success(`Medication status updated to ${status}.`);
    refreshStore();
  };

  const items = [
    {
      key: "summary",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Activity className="w-4 h-4 text-emerald-600" /> Clinical Summary & Problems
        </span>
      ),
      children: (
        <div className="space-y-6 pt-2">
          {/* Problem List Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" /> Problem List (ICD-10 Diagnoses)
              </h3>
              <div className="flex items-center gap-2">
                <Tag color="cyan" className="font-semibold text-3xs">
                  {snapshot.activeProblems.length} Active Conditions
                </Tag>
                <HmsButton
                  size="sm"
                  variant="emerald"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setProblemModalOpen(true)}
                >
                  Add Problem
                </HmsButton>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {snapshot.activeProblems.map((prob) => (
                <div key={prob.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {prob.icd10Code}
                      </span>
                      <Tag color="processing" className="text-3xs font-semibold">ACTIVE</Tag>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mt-2">{prob.conditionName}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">Onset: {prob.onsetDate}</p>
                    <p className="text-[11px] text-slate-400 font-mono">By {prob.diagnosedBy}</p>
                  </div>
                  <button
                    onClick={() => handleArchiveProblem(prob.id, prob.conditionName)}
                    className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                    title="Mark as Resolved / Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {snapshot.resolvedProblems.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-semibold text-slate-500 mb-2">Resolved Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {snapshot.resolvedProblems.map((prob) => (
                    <Tag key={prob.id} color="default" className="text-xs py-1 px-2.5 bg-white border-slate-300">
                      <span className="font-mono font-bold text-slate-600 mr-1.5">{prob.icd10Code}</span>
                      <span className="text-slate-700">{prob.conditionName}</span>
                      <span className="text-slate-400 text-3xs ml-1.5">(Resolved {prob.resolvedDate})</span>
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Allergy Registry Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Comprehensive Allergy Registry
              </h3>
              <div className="flex items-center gap-2">
                <Tag color="rose" className="font-semibold text-3xs">
                  {snapshot.allergies.length} Recorded Allergies
                </Tag>
                <HmsButton
                  size="sm"
                  variant="emerald"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setAllergyModalOpen(true)}
                >
                  Add Allergy
                </HmsButton>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {snapshot.allergies.map((alg) => (
                <div
                  key={alg.id}
                  className={`p-4 rounded-xl border flex justify-between items-start ${
                    alg.severity === "ANAPHYLAXIS" || alg.severity === "SEVERE"
                      ? "bg-rose-50/70 border-rose-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag color={alg.type === "DRUG" ? "red" : alg.type === "LATEX" ? "orange" : "blue"}>
                        {alg.type} ALLERGY
                      </Tag>
                      <Tag color={alg.severity === "ANAPHYLAXIS" ? "error" : alg.severity === "MODERATE" ? "warning" : "default"}>
                        {alg.severity}
                      </Tag>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mt-2">{alg.allergen}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="font-medium text-slate-700">Reaction:</span> {alg.reaction}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">Recorded Onset: {alg.onsetDate}</p>
                  </div>
                  <button
                    onClick={() => handleArchiveAllergy(alg.id, alg.allergen)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Archive Allergy Record"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "records",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <FileText className="w-4 h-4 text-teal-600" /> My Health Records & Lab Reports
        </span>
      ),
      children: <PatientReportViewer uhid={uhidParam} />,
    },
    {
      key: "timeline",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="w-4 h-4 text-amber-600" /> Longitudinal Clinical Timeline
        </span>
      ),
      children: (
        <div className="space-y-4 pt-2">
          {/* Timeline Category Filters */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter Category:
            </span>
            {categoryFilterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTimelineFilter(opt.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  timelineFilter === opt.key
                    ? "bg-teal-700 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredTimeline.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                No events found matching category &quot;{timelineFilter}&quot;.
              </div>
            ) : (
              filteredTimeline.map((event) => (
                <div key={event.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag
                        color={
                          event.category === "ENCOUNTER"
                            ? "purple"
                            : event.category === "LAB"
                            ? "blue"
                            : event.category === "RADIOLOGY"
                            ? "cyan"
                            : event.category === "ADT"
                            ? "orange"
                            : event.category === "BILLING"
                            ? "emerald"
                            : "geekblue"
                        }
                        className="font-bold text-3xs"
                      >
                        {event.category}
                      </Tag>
                      <span className="text-xs text-slate-400 font-mono">{event.timestamp}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{event.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{event.subtitle}</p>
                    <p className="text-[11px] text-slate-500 font-mono">Provider: {event.provider}</p>
                  </div>
                  <Tag color={event.status === "PAID" || event.status === "VERIFIED" || event.status === "COMPLETED" ? "green" : "gold"}>
                    {event.status}
                  </Tag>
                </div>
              ))
            )}
          </div>
        </div>
      ),
    },
    {
      key: "abha",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-600" /> ABHA Linkage & Data Consents
        </span>
      ),
      children: <AbhaConsentManager />,
    },
    {
      key: "meds",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <Pill className="w-4 h-4 text-purple-600" /> Reconciled Medication History
        </span>
      ),
      children: (
        <div className="space-y-3 pt-2">
          {snapshot.currentMedications.map((med) => (
            <div key={med.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{med.drugName}</h4>
                  <Tag color={med.status === "ACTIVE" ? "processing" : med.status === "COMPLETED" ? "success" : "default"}>
                    {med.status}
                  </Tag>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">Dosage: {med.dosage} &bull; Frequency: {med.frequency}</p>
                <p className="text-[11px] text-slate-500 font-mono">Prescribed by {med.prescribedBy} on {med.prescribedDate}</p>
              </div>

              <div className="flex items-center gap-2">
                {med.status === "ACTIVE" ? (
                  <>
                    <button
                      onClick={() => handleMedicationStatusChange(med.id, "DISCONTINUED")}
                      className="text-xs text-slate-500 hover:text-rose-600 font-medium underline"
                    >
                      Discontinue
                    </button>
                    <button
                      onClick={() => handleMedicationStatusChange(med.id, "COMPLETED")}
                      className="text-xs text-slate-500 hover:text-emerald-600 font-medium underline"
                    >
                      Complete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleMedicationStatusChange(med.id, "ACTIVE")}
                    className="text-xs text-teal-700 hover:text-teal-900 font-medium underline"
                  >
                    Reactivate
                  </button>
                )}
                <HmsButton
                  size="sm"
                  variant="emerald"
                  onClick={() => message.success(`Refill request for ${med.drugName} submitted to Central Pharmacy!`)}
                >
                  Refill
                </HmsButton>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <HmsAppShell title="Patient Self-Service Portal">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Patient Profile Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center text-2xl font-bold">
              {demographics.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-0.5 rounded-full text-xs font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ABHA Verified Patient
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{demographics.fullName}</h1>
              <p className="text-slate-300 text-xs font-mono mt-0.5">
                UHID: {demographics.uhid} &bull; ABHA: {demographics.abhaId || `${demographics.fullName.toLowerCase().replace(/\s+/g, ".")}@abdm`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <HmsButton
              variant="emerald"
              icon={<Calendar className="w-4 h-4" />}
              onClick={() => setBookingDrawerOpen(true)}
            >
              Book OPD Appointment
            </HmsButton>
            <Link href="/consult/TELE-8801">
              <HmsButton variant="secondary" icon={<Video className="w-4 h-4" />}>
                Telehealth Consult
              </HmsButton>
            </Link>
          </div>
        </div>

        {/* Clinical Safety Alerts Section */}
        {(snapshot.allergyAlerts.length > 0 || snapshot.medicationAlerts.length > 0 || snapshot.followUpAlerts.length > 0) && (
          <div className="space-y-2">
            {snapshot.allergyAlerts.map((alert, idx) => (
              <div key={`alg-alt-${idx}`} className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-xs flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="font-semibold text-rose-900">{alert}</span>
              </div>
            ))}

            {snapshot.medicationAlerts.map((alert, idx) => (
              <div key={`med-alt-${idx}`} className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-semibold text-amber-900">{alert}</span>
              </div>
            ))}

            {snapshot.followUpAlerts.map((alert, idx) => (
              <div key={`flw-alt-${idx}`} className="bg-sky-50 p-3.5 rounded-xl border border-sky-200 text-xs flex items-center gap-3">
                <Info className="w-5 h-5 text-sky-600 shrink-0" />
                <span className="font-semibold text-sky-900">{alert}</span>
              </div>
            ))}
          </div>
        )}

        {/* Clinical Snapshot 360 Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" /> 360° Patient Clinical Snapshot
            </h2>
            <Tag color="red" className="font-bold text-3xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> CLINICAL SAFETY ALERTS ACTIVE
            </Tag>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium text-[11px] block">Blood Group & Demographics</span>
              <span className="font-bold text-teal-700 text-sm block mt-0.5">{snapshot.bloodGroup.replace("_", " ")}</span>
              <span className="text-slate-600 text-[11px] block mt-0.5">{demographics.gender}, Age {demographics.age || 45}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium text-[11px] block">Active Clinical Problems</span>
              <span className="font-bold text-slate-800 text-sm block mt-0.5">{snapshot.activeProblems.length} Active Diagnoses</span>
              <span className="text-slate-600 text-[11px] truncate block mt-0.5">
                {snapshot.activeProblems[0]?.conditionName || "None"}
              </span>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
              <span className="text-rose-600 font-medium text-[11px] block">Allergy Warnings</span>
              <span className="font-bold text-rose-800 text-sm block mt-0.5">{snapshot.allergies.length} Allergies Recorded</span>
              <span className="text-rose-700 text-[11px] truncate block mt-0.5 font-medium">
                {snapshot.allergies.find((a) => a.severity === "ANAPHYLAXIS")?.allergen || "Penicillin Allergy"}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium text-[11px] block">Outstanding Balances</span>
              <span className="font-bold text-amber-700 text-sm block mt-0.5">₹{snapshot.outstandingBalances.toLocaleString()}</span>
              <span className="text-slate-500 text-[11px] block mt-0.5">Pending Unbilled Charges</span>
            </div>
          </div>
        </div>

        {/* Live Token & Next Appointment Alert */}
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-900 block text-sm">Active OPD Appointment Today</span>
              <span className="text-amber-800">
                Token T-01 &bull; Dr. Rajesh Sharma (Cardiology - OPD 3) &bull; 10:30 AM Slot
              </span>
            </div>
          </div>
          <Tag color="orange" className="font-bold py-1 px-3 w-fit">WAITING IN QUEUE</Tag>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <Tabs defaultActiveKey="summary" items={items} />
        </div>

        {/* Modal: Add Problem Entry */}
        <Modal
          title="Add Active Problem Entry (ICD-10)"
          open={problemModalOpen}
          onCancel={() => setProblemModalOpen(false)}
          onOk={() => problemForm.submit()}
          okText="Save Problem Entry"
        >
          <Form form={problemForm} layout="vertical" onFinish={handleAddProblem} className="mt-4">
            <Form.Item name="icd10Code" label="ICD-10 Code" rules={[{ required: true, message: "Enter ICD-10 code (e.g. I20.9)" }]}>
              <Input placeholder="e.g. I20.9" />
            </Form.Item>
            <Form.Item name="conditionName" label="Condition Name" rules={[{ required: true, message: "Enter condition name" }]}>
              <Input placeholder="e.g. Angina Pectoris" />
            </Form.Item>
            <Form.Item name="diagnosedBy" label="Diagnosed By / Department">
              <Input placeholder="e.g. Dr. Rajesh Sharma (Cardiology)" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal: Add Allergy Entry */}
        <Modal
          title="Register New Allergy Entry"
          open={allergyModalOpen}
          onCancel={() => setAllergyModalOpen(false)}
          onOk={() => allergyForm.submit()}
          okText="Save Allergy Record"
        >
          <Form form={allergyForm} layout="vertical" onFinish={handleAddAllergy} className="mt-4">
            <Form.Item name="allergen" label="Allergen Name" rules={[{ required: true, message: "Enter allergen name" }]}>
              <Input placeholder="e.g. Sulfa Drugs / Latex / Peanuts" />
            </Form.Item>
            <Form.Item name="type" label="Allergy Type" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: "DRUG", label: "DRUG" },
                  { value: "FOOD", label: "FOOD" },
                  { value: "LATEX", label: "LATEX" },
                  { value: "ENVIRONMENTAL", label: "ENVIRONMENTAL" },
                ]}
              />
            </Form.Item>
            <Form.Item name="severity" label="Allergy Severity" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: "MILD", label: "MILD" },
                  { value: "MODERATE", label: "MODERATE" },
                  { value: "SEVERE", label: "SEVERE" },
                  { value: "ANAPHYLAXIS", label: "ANAPHYLAXIS" },
                ]}
              />
            </Form.Item>
            <Form.Item name="reaction" label="Clinical Reaction Details" rules={[{ required: true }]}>
              <Input placeholder="e.g. Severe Bronchospasm & Urticaria" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Appointment Drawer */}
        <AppointmentBookingDrawer
          open={bookingDrawerOpen}
          onClose={() => setBookingDrawerOpen(false)}
        />
      </div>
    </HmsAppShell>
  );
}

/**
 * `useSearchParams()` opts a page into client-side rendering and must be
 * wrapped in a Suspense boundary, otherwise static prerendering of `/portal`
 * fails at build time.
 */
export default function PatientPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
          <span className="text-sm font-medium text-slate-500">Loading patient portal…</span>
        </div>
      }
    >
      <PatientPortalContent />
    </Suspense>
  );
}


