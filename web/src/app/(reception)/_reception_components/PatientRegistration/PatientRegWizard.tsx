"use client";

import React, { useState } from "react";
import { Steps, Form, message, Modal, Tag } from "antd";
import { DemographicsStep } from "./Steps/DemographicsStep";
import { VitalsStep } from "./Steps/VitalsStep";
import { InsuranceStep } from "./Steps/InsuranceStep";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { PatientRegInput, PatientRegSchema } from "../../_reception_schemas/patient_reg_schema";
import { AppointmentBookingDrawer } from "../AppointmentBooking/AppointmentBookingDrawer";
import { CheckCircle2 } from "lucide-react";
import { PatientRegistryService } from "../../_reception_services/patient_registry_service";
import { useReceptionVisitStore } from "../../_reception_stores/reception_visit_store";
import { TriagePriority, TRIAGE_PRIORITY_LABELS } from "../../_reception_types/visit_types";
import { todayLocalDate } from "../../_reception_utils/date_utils";

const DEMOGRAPHIC_FIELDS = [
  "fullName",
  "gender",
  "dob",
  "phone",
  "aadhaarNumber",
  "address",
  "emergencyContact",
];

const TRIAGE_FIELDS = ["triagePriority"];

export const PatientRegWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<PatientRegInput>();
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [registeredUhid, setRegisteredUhid] = useState<string | null>(null);
  const [registeredVisitId, setRegisteredVisitId] = useState<string | null>(null);

  const next = async () => {
    try {
      if (currentStep === 0) await form.validateFields(DEMOGRAPHIC_FIELDS);
      if (currentStep === 1) await form.validateFields(TRIAGE_FIELDS);
      setCurrentStep((prev) => prev + 1);
    } catch {
      // Validation errors are rendered by AntD next to each field
    }
  };

  const prev = () => setCurrentStep((prev) => prev - 1);

  const onFinish = (values: PatientRegInput) => {
    const parsed = PatientRegSchema.safeParse(values);
    if (!parsed.success) {
      message.error(parsed.error.issues[0]?.message || "Validation failed. Check the highlighted inputs.");
      return;
    }
    const data = parsed.data;

    // 1. Duplicate patients are BLOCKED (previously only warned about, then registered anyway).
    const duplicate = PatientRegistryService.checkDuplicate(data);
    if (duplicate) {
      Modal.warning({
        title: "Patient already registered",
        content: (
          <div className="space-y-2 mt-3 text-xs text-slate-600">
            <p>
              Mobile <strong>{data.phone}</strong> / Aadhaar <strong>{data.aadhaarNumber}</strong> already
              belongs to <strong>{duplicate.fullName}</strong>.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <span className="text-[11px] text-amber-700 uppercase font-semibold block">Existing UHID</span>
              <span className="text-xl font-mono font-bold text-amber-800">{duplicate.uhid}</span>
            </div>
            <p>Continue with the existing record — the queue token will be issued against this UHID.</p>
          </div>
        ),
        okText: "Use Existing Patient",
        onOk() {
          setRegisteredUhid(duplicate.uhid);
          setBookingDrawerOpen(true);
        },
      });
      return;
    }

    // 2. Allocate a collision-safe UHID and persist the record
    const result = PatientRegistryService.registerPatient(data);
    if (!result.success || !result.patient) {
      message.error(result.message);
      return;
    }
    const patient = result.patient;
    const triagePriority: TriagePriority = (data.triagePriority as TriagePriority) || "P4_STANDARD";

    // 3. Open the front-desk visit. Vitals + triage priority are the inputs of the
    //    OPD vs IPD decision that is recorded on the reception console.
    const visit = useReceptionVisitStore.getState().createVisit({
      uhid: patient.uhid,
      patientName: patient.fullName,
      ageGender: PatientRegistryService.toAgeGender(patient),
      phone: patient.phone,
      visitDate: todayLocalDate(),
      triagePriority,
      vitals: {
        systolicBp: data.systolicBp,
        diastolicBp: data.diastolicBp,
        pulseRate: data.pulseRate,
        temperatureF: data.temperatureF,
        weightKg: data.weightKg,
        spo2: data.spo2,
      },
    });

    setRegisteredUhid(patient.uhid);
    setRegisteredVisitId(visit.id);

    Modal.success({
      title: "PATIENT REGISTRATION COMPLETE ✓",
      okText: "Book OPD Appointment",
      content: (
        <div className="space-y-3 mt-3 text-xs text-slate-600">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <span className="text-[11px] text-emerald-700 uppercase font-semibold block">Assigned Permanent UHID</span>
            <span className="text-2xl font-mono font-bold text-emerald-800">{patient.uhid}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>Patient</span>
            <strong className="text-slate-900">
              {patient.fullName} · {PatientRegistryService.toAgeGender(patient)}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>Triage priority</span>
            <Tag color={triagePriority === "P1_CRITICAL" ? "red" : triagePriority === "P4_STANDARD" ? "green" : "orange"}>
              {TRIAGE_PRIORITY_LABELS[triagePriority]}
            </Tag>
          </div>
          <p className="text-slate-500">
            Vitals captured in visit <span className="font-mono">{visit.id}</span>. Record the OPD vs IPD
            disposition from the reception console after the consultation.
          </p>
        </div>
      ),
      onOk() {
        setBookingDrawerOpen(true);
      },
    });

    form.resetFields();
    setCurrentStep(0);
  };

  const items = [
    { title: "Demographics" },
    { title: "Triage Vitals" },
    { title: "Insurance / TPA" },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
      <Steps current={currentStep} items={items} className="mb-6 overflow-x-auto" />

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ gender: "MALE" }}>
        {currentStep === 0 && <DemographicsStep />}
        {currentStep === 1 && <VitalsStep />}
        {currentStep === 2 && <InsuranceStep />}

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 mt-8 pt-4 border-t border-slate-100">
          {currentStep > 0 ? (
            <HmsButton onClick={prev} variant="secondary" size="lg" fullWidth>
              Previous Step
            </HmsButton>
          ) : <div className="hidden sm:block" />}

          {currentStep < items.length - 1 ? (
            <HmsButton onClick={next} type="primary" size="lg" fullWidth>
              Next Step
            </HmsButton>
          ) : (
            <HmsButton type="primary" variant="emerald" htmlType="submit" size="lg" icon={<CheckCircle2 className="w-4 h-4" />} fullWidth>
              Complete Patient Registration
            </HmsButton>
          )}
        </div>
      </Form>

      <AppointmentBookingDrawer
        open={bookingDrawerOpen}
        onClose={() => setBookingDrawerOpen(false)}
        initialPatientUhid={registeredUhid}
        visitId={registeredVisitId}
      />
    </div>
  );
};
