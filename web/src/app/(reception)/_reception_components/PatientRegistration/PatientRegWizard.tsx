"use client";

import React, { useState } from "react";
import { Steps, Form, message, Modal } from "antd";
import { DemographicsStep } from "./Steps/DemographicsStep";
import { VitalsStep } from "./Steps/VitalsStep";
import { InsuranceStep } from "./Steps/InsuranceStep";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { PatientRegInput, PatientRegSchema } from "../../_reception_schemas/patient_reg_schema";
import { AppointmentBookingDrawer } from "../AppointmentBooking/AppointmentBookingDrawer";
import { CheckCircle2 } from "lucide-react";

export const PatientRegWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<PatientRegInput>();
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);

  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(["fullName", "gender", "dob", "phone", "aadhaarNumber", "address", "emergencyContact"]);
      }
      setCurrentStep((prev) => prev + 1);
    } catch {
      // Validation error handled by AntD form
    }
  };

  const prev = () => setCurrentStep((prev) => prev - 1);

  const onFinish = (values: PatientRegInput) => {
    try {
      const validatedData = PatientRegSchema.parse(values);

      // Check duplicates in localStorage
      if (typeof window !== "undefined") {
        const saved = JSON.parse(localStorage.getItem("hms_patients") || "[]");
        const dup = saved.find(
          (p: { phone?: string; aadhaarNumber?: string }) =>
            (p.phone && p.phone === validatedData.phone) ||
            (p.aadhaarNumber && p.aadhaarNumber === validatedData.aadhaarNumber)
        );
        if (dup) {
          message.warning(`Patient with phone ${validatedData.phone} or Aadhaar ${validatedData.aadhaarNumber} is already registered (${dup.uhid})!`);
        }
      }

      // Generate sequential UHID
      let nextSeq = 1060;
      if (typeof window !== "undefined") {
        const last = localStorage.getItem("hms_last_uhid_seq");
        nextSeq = last ? parseInt(last, 10) + 1 : 1060;
        localStorage.setItem("hms_last_uhid_seq", nextSeq.toString());
      }
      const generatedUhid = `P-2026-${nextSeq}`;

      const patientRecord = {
        ...validatedData,
        uhid: generatedUhid,
        registeredAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        const saved = JSON.parse(localStorage.getItem("hms_patients") || "[]");
        saved.unshift(patientRecord);
        localStorage.setItem("hms_patients", JSON.stringify(saved));
      }

      Modal.success({
        title: "PATIENT REGISTRATION COMPLETE ✓",
        content: (
          <div className="space-y-3 mt-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
              <span className="text-xs text-emerald-700 uppercase font-semibold block">Assigned Permanent UHID</span>
              <span className="text-2xl font-mono font-bold text-emerald-800">{generatedUhid}</span>
            </div>
            <p className="text-xs text-slate-600">
              Patient <strong>{validatedData.fullName}</strong> successfully registered & ABHA linked under ABDM M1 protocol.
            </p>
          </div>
        ),
        okText: "Book Immediate OPD Appointment",
        onOk() {
          setBookingDrawerOpen(true);
        },
      });

      form.resetFields();
      setCurrentStep(0);
    } catch {
      message.error("Validation failed. Check inputs.");
    }
  };

  const items = [
    { title: "Demographics" },
    { title: "Triage Vitals" },
    { title: "Insurance / TPA" },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
      <Steps current={currentStep} items={items} className="mb-6 overflow-x-auto" />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ aadhaarNumber: "XXXX-XXXX-1234", gender: "MALE" }}
      >
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
      />
    </div>
  );
};

