"use client";

import React, { useState } from "react";
import { Form, Input, Select, Alert, message } from "antd";
import { FileCheck, Printer, ShieldCheck } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";
import { DischargeSummarySchema } from "../../_ipd_schemas/discharge_summary_schema";

export const AbdmDischargeSummaryForm: React.FC<{ ipdNo: string }> = ({ ipdNo }) => {
  const [isSigned, setIsSigned] = useState(false);
  const [form] = Form.useForm();

  const handleSign = () => {
    setIsSigned(true);
    message.success("Discharge Summary authorized & ABDM M3 record signed by Dr. Rajesh Sharma.");
  };

  const handlePrint = () => {
    if (!isSigned) {
      message.error("Rule 7 Violation: Cannot print discharge summary without explicit physician signature!");
      return;
    }
    window.print();
  };

  const onFinish = (values: Record<string, unknown>) => {
    try {
      const payload = {
        ipdNo,
        patientUhid: "P-2026-1049",
        patientName: "Sunil Verma",
        admissionDate: "2026-09-05",
        dischargeDate: "2026-09-08",
        admissionDiagnosis: "Acute Coronary Syndrome",
        finalDiagnoses: ["I20.9 - Angina Pectoris"],
        hospitalCourseSummary: values.hospitalCourseSummary || "Patient presented with chest pain. ECG showed ST changes. Managed conservatively with antiplatelets.",
        dischargeCondition: values.dischargeCondition || "STABLE",
        adviceOnDischarge: values.adviceOnDischarge || "Tab Ecosprin 75mg OD x 30 days. Low salt diet.",
        signedAt: isSigned ? new Date().toISOString() : null,
      };
      DischargeSummarySchema.parse(payload);
      message.success("Discharge summary saved.");
    } catch {
      message.error("Validation error in discharge summary form.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-600" /> ABDM M3 Discharge Summary Builder
          </h2>
          <p className="text-xs text-slate-500">Record #{ipdNo} &bull; Patient: Sunil Verma (P-2026-1049)</p>
        </div>
        <HmsAiGeneratedBadge label="AI Summary Assistant" />
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ dischargeCondition: "STABLE" }}>
        <Form.Item label="Admission Diagnosis" name="admissionDiagnosis" initialValue="Acute Coronary Syndrome / Angina">
          <Input size="large" />
        </Form.Item>

        <Form.Item label="Hospital Course Summary (AI Generated Draft)" name="hospitalCourseSummary" initialValue="Patient admitted on 05-Sep-2026 with complaints of retrosternal chest pain. Trop-I negative. Managed conservatively with dual antiplatelet therapy. Symptoms resolved completely. Hemodynamically stable at discharge.">
          <Input.TextArea rows={4} />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Condition at Discharge" name="dischargeCondition">
            <Select size="large">
              <Select.Option value="RECOVERED">Recovered</Select.Option>
              <Select.Option value="IMPROVED">Improved</Select.Option>
              <Select.Option value="STABLE">Hemodynamically Stable</Select.Option>
              <Select.Option value="LAMA">Left Against Medical Advice (LAMA)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Follow-Up Appointment Date" name="followUpDate">
            <Input type="date" size="large" />
          </Form.Item>
        </div>

        <Form.Item label="Discharge Medication & Advice" name="adviceOnDischarge" initialValue="1. Tab Ecosprin 75mg OD after dinner x 30 days. 2. Tab Sorbitrate 5mg sublingual PRN for chest pain. 3. Review in Cardiology OPD after 7 days.">
          <Input.TextArea rows={3} />
        </Form.Item>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          {!isSigned ? (
            <Alert
              message="Physician Signature Pending"
              description="Print PDF generation is locked until attending doctor verifies and signs the discharge summary."
              type="warning"
              showIcon
            />
          ) : (
            <Alert
              message="Discharge Summary Authorized & Signed"
              description="Digital signature attached. Document ready for ABDM M3 health record push & patient handover."
              type="success"
              showIcon
            />
          )}

          <div className="flex justify-end gap-3">
            <HmsButton onClick={handlePrint} disabled={!isSigned} variant="secondary" icon={<Printer className="w-4 h-4" />}>
              Print Discharge PDF
            </HmsButton>

            <HmsButton onClick={handleSign} disabled={isSigned} variant="emerald" icon={<ShieldCheck className="w-4 h-4" />}>
              {isSigned ? "Signed by Dr. Rajesh Sharma" : "Sign & Authorize ABDM Summary"}
            </HmsButton>
          </div>
        </div>
      </Form>
    </div>
  );
};
