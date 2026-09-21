"use client";

import React, { useState, useMemo } from "react";
import { Modal, Form, Input, Tag, message } from "antd";
import { Calendar, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { EncounterService } from "../../_doctor_services/encounter_service";
import { DoctorOrderService } from "../../_doctor_services/doctor_order_service";
import { DoctorWorkspaceService } from "../../_doctor_services/doctor_workspace_service";

interface FollowUpModalProps {
  patientUhid: string;
  patientName: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_DAYS = [
  { label: "7 Days (1 Week)", days: 7, category: "ACUTE / CHEST PAIN" },
  { label: "14 Days (2 Weeks)", days: 14, category: "HYPERTENSION / CARDIAC" },
  { label: "30 Days (1 Month)", days: 30, category: "DIABETES / CHRONIC" },
  { label: "60 Days (2 Months)", days: 60, category: "STABLE ROUTINE REVIEW" },
];

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  patientUhid,
  patientName,
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  const wsCtx = useMemo(() => {
    return DoctorWorkspaceService.getWorkspaceContext(patientUhid);
  }, [patientUhid]);

  // Determine CDSS recommended revisit interval based on patient diagnosis / problems
  const cdssRecommendation = useMemo(() => {
    const problems = wsCtx.alerts.activeProblems.map((p) => p.conditionName.toLowerCase() + " " + p.icd10Code.toLowerCase());
    const complaints = (wsCtx.activeEncounter.chiefComplaints || "").toLowerCase();
    const combined = problems.join(" ") + " " + complaints;

    if (combined.includes("angina") || combined.includes("i20") || combined.includes("chest pain") || combined.includes("acute")) {
      return { days: 7, label: "7 Days", reason: "CDSS Recommended for Acute Coronary Syndrome / Angina" };
    }
    if (combined.includes("hypertension") || combined.includes("i10") || combined.includes("bp")) {
      return { days: 14, label: "14 Days", reason: "CDSS Recommended for Essential Hypertension Review" };
    }
    if (combined.includes("diabetes") || combined.includes("e11") || combined.includes("hba1c")) {
      return { days: 30, label: "30 Days", reason: "CDSS Recommended for Type 2 Diabetes Mellitus Monitoring" };
    }
    return { days: 30, label: "30 Days", reason: "Standard 30-Day OPD Consultation Follow-Up" };
  }, [wsCtx]);

  const getFutureDateStr = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(() => getFutureDateStr(cdssRecommendation.days));

  React.useEffect(() => {
    if (open) {
      const initialDate = getFutureDateStr(cdssRecommendation.days);
      setSelectedDate(initialDate);
      form.setFieldsValue({ revisitDate: initialDate });
    }
  }, [open, cdssRecommendation, form]);

  const handleSelectDays = (days: number) => {
    const dt = getFutureDateStr(days);
    setSelectedDate(dt);
    form.setFieldsValue({ revisitDate: dt });
  };

  const handleFinish = (values: { revisitDate: string; instructions?: string }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(values.revisitDate);
    target.setHours(0, 0, 0, 0);

    if (target.getTime() < today.getTime()) {
      message.warning("Please select a future date for follow-up consultation.");
      return;
    }

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    EncounterService.setFollowUp(patientUhid, {
      revisitDays: diffDays,
      revisitDate: values.revisitDate,
      instructions: values.instructions || "Bring recent lab reports for OPD review.",
    });

    DoctorOrderService.scheduleFollowUp(patientUhid, {
      revisitDate: values.revisitDate,
      notes: values.instructions,
    });

    message.success(`Follow-up consultation scheduled for ${patientName} on ${values.revisitDate} (~${diffDays} days). One-click OPD appointment created!`);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-teal-700 font-bold">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span>Schedule Patient Follow-up Revisit</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs mb-3 space-y-1 text-teal-900">
        <div><strong>Patient:</strong> {patientName} ({patientUhid})</div>
        <div>Setting a follow-up date creates a one-click appointment reservation in Reception Queue.</div>
      </div>

      {/* CDSS Recommendation Highlight */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs mb-4 flex items-start gap-2 text-purple-900">
        <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold flex items-center gap-2">
            <span>{cdssRecommendation.reason}</span>
            <Tag color="purple" className="font-bold text-3xs">CDSS SUGGESTION</Tag>
          </div>
          <p className="text-[11px] text-purple-700">Recommended revisit window: <strong>{cdssRecommendation.label}</strong>.</p>
        </div>
      </div>

      <div className="mb-4 space-y-1.5">
        <label className="block text-xs font-semibold text-slate-500 uppercase">Diagnosis-Based Revisit Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_DAYS.map((p) => {
            const isRecommended = p.days === cdssRecommendation.days;
            return (
              <button
                key={p.days}
                type="button"
                onClick={() => handleSelectDays(p.days)}
                className={`text-xs p-2 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                  isRecommended
                    ? "bg-purple-50 border-purple-300 text-purple-900 font-semibold ring-1 ring-purple-400"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span>{p.label}</span>
                  {isRecommended && <Tag color="purple" className="text-[9px] py-0 px-1 font-bold">CDSS</Tag>}
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1">{p.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          revisitDate: selectedDate,
          instructions: "Bring recent lab reports and empty stomach blood sugar readings.",
        }}
      >
        <Form.Item label="Follow-up Revisit Date" name="revisitDate" rules={[{ required: true }]}>
          <Input
            type="date"
            size="large"
            prefix={<Calendar className="w-4 h-4 text-slate-400 mr-1" />}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Special Follow-up Instructions" name="instructions">
          <Input.TextArea rows={3} placeholder="e.g. Check fasting blood sugar, repeat Lipid profile, bring ECG report..." />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <HmsButton variant="secondary" onClick={onClose}>
            Cancel
          </HmsButton>
          <HmsButton type="primary" htmlType="submit" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />}>
            Confirm One-Click Appointment Creation
          </HmsButton>
        </div>
      </Form>
    </Modal>
  );
};

