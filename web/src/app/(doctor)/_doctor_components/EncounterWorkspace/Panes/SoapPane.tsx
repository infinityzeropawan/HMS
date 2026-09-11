"use client";

import React, { useEffect, useRef, useState } from "react";
import { Form, Input, message } from "antd";
import { FileText, Save, CheckCircle } from "lucide-react";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";

const STORAGE_KEY = "hms_soap_draft";

interface SoapValues {
  chiefComplaints: string;
  subjectiveNotes: string;
  objectiveNotes: string;
  assessmentNotes: string;
}

const TEMPLATES: Record<string, SoapValues> = {
  cardiology: {
    chiefComplaints: "Chest pain radiating to left arm × 3 hours, shortness of breath on exertion",
    subjectiveNotes: "Patient reports crushing retrosternal chest pain (8/10), onset at rest, relieved partially by sitting forward. Associated diaphoresis and mild nausea. No fever.",
    objectiveNotes: "Conscious, oriented, mild distress. Pulse 82 bpm irregular. BP 148/92 mmHg. RR 18/min. Creps at lung bases. S3 gallop heard.",
    assessmentNotes: "Probable ACS / Unstable Angina.\nPlan: Urgent ECG, Troponin I, Echo. DAPT (Aspirin 325mg + Clopidogrel 300mg loading). O2 via mask. Cardiology consult.",
  },
  general: {
    chiefComplaints: "Fever with chills × 3 days, generalized body ache, headache",
    subjectiveNotes: "Patient presents with high-grade fever 103°F, chills, myalgia. No rash. No bleeding. Denies travel history. Family members not affected.",
    objectiveNotes: "Temp 38.9°C, PR 96 bpm, BP 110/70, RR 18. Throat mildly congested. Cervical LN not palpable. Abdomen soft.",
    assessmentNotes: "Viral fever – likely Dengue / Influenza (pending NS1 Ag).\nPlan: CBC with platelet count, NS1 Ag, Malaria RDT. Tab PCM 650mg TDS, ORS sachets. Review in 48h.",
  },
};

export const SoapPane: React.FC = () => {
  const [form]         = Form.useForm<SoapValues>();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as { values: SoapValues; savedAt: string };
        form.setFieldsValue(draft.values);
        setSavedAt(draft.savedAt);
      }
    } catch { /* ignore */ }
  }, [form]);

  const saveDraft = (values: Partial<SoapValues>) => {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, savedAt: ts }));
    setSavedAt(ts);
    setIsDirty(false);
  };

  const handleValuesChange = (changed: Partial<SoapValues>, all: SoapValues) => {
    setIsDirty(true);
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = setTimeout(() => saveDraft(all), 30_000); // auto-save after 30s idle
  };

  const handleManualSave = () => {
    saveDraft(form.getFieldsValue());
    message.success({ content: "SOAP notes saved as draft", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, duration: 2 });
  };

  const applyTemplate = (key: keyof typeof TEMPLATES) => {
    form.setFieldsValue(TEMPLATES[key]);
    setIsDirty(true);
    message.info(`${key === "cardiology" ? "Cardiology" : "General Medicine"} SOAP template applied`);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" /> SOAP Clinical Notes
        </h3>
        <div className="flex items-center gap-2">
          <HmsAiGeneratedBadge label="AI SOAP Assistant" />
          <button
            onClick={handleManualSave}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
              isDirty ? "bg-teal-100 text-teal-700 hover:bg-teal-200" : "bg-slate-100 text-slate-400"
            }`}
          >
            <Save className="w-3 h-3" />
            {isDirty ? "Save Draft" : savedAt ? `Saved ${savedAt}` : "No changes"}
          </button>
        </div>
      </div>

      {/* Quick templates */}
      <div className="flex gap-2 mb-3">
        <span className="text-xs text-slate-500 self-center">Templates:</span>
        {(Object.keys(TEMPLATES) as Array<keyof typeof TEMPLATES>).map(k => (
          <button key={k} onClick={() => applyTemplate(k)}
            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-700 transition-colors capitalize border border-slate-200">
            {k}
          </button>
        ))}
      </div>

      <Form form={form} layout="vertical" className="space-y-2 flex-1" onValuesChange={handleValuesChange}>
        <Form.Item label="Chief Complaints" name="chiefComplaints" rules={[{ required: true, message: "Enter chief complaints" }]}>
          <Input.TextArea rows={2} placeholder="e.g. Chest pain radiating to left arm × 3 hours, shortness of breath" />
        </Form.Item>

        <Form.Item label="Subjective (S)" name="subjectiveNotes">
          <Input.TextArea rows={3} placeholder="Patient history, onset, duration, associated symptoms..." />
        </Form.Item>

        <Form.Item label="Objective (O)" name="objectiveNotes">
          <Input.TextArea rows={3} placeholder="Physical examination findings, vital observations, investigations..." />
        </Form.Item>

        <Form.Item label="Assessment & Plan (A/P)" name="assessmentNotes">
          <Input.TextArea rows={4} placeholder="Clinical diagnosis + treatment plan / referral..." />
        </Form.Item>
      </Form>

      {savedAt && !isDirty && (
        <p className="text-[11px] text-slate-400 mt-2 text-right flex items-center justify-end gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-500" /> Auto-saved at {savedAt}
        </p>
      )}
    </div>
  );
};
