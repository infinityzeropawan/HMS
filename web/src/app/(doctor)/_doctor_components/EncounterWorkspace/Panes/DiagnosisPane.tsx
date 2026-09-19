"use client";

import React, { useState, useMemo } from "react";
import { Select, Tag, Button, message, Tooltip } from "antd";
import { Activity, Sparkles, TestTube, Eye, Clock, Pill, CheckCircle2, ArrowRight } from "lucide-react";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { CdssService } from "@/app/(cdss)/_cdss_services/cdss_service";
import { DoctorOrderService } from "@/app/(doctor)/_doctor_services/doctor_order_service";

interface DiagnosisPaneProps {
  patientUhid?: string;
}

export const DiagnosisPane: React.FC<DiagnosisPaneProps> = ({ patientUhid = "P-2026-1049" }) => {
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([
    "I20.9 - Angina pectoris, unspecified",
  ]);

  const icd10Options = [
    { value: "I20.9 - Angina pectoris, unspecified", label: "I20.9 - Angina pectoris, unspecified" },
    { value: "I10 - Essential (primary) hypertension", label: "I10 - Essential (primary) hypertension" },
    { value: "E11.9 - Type 2 diabetes mellitus without complications", label: "E11.9 - Type 2 diabetes mellitus without complications" },
    { value: "J45.909 - Unspecified asthma, uncomplicated", label: "J45.909 - Unspecified asthma, uncomplicated" },
  ];

  // CDSS Order Set Recommendations based on ICD-10 selection
  const recommendations = useMemo(() => {
    return CdssService.getOrderSetRecommendations(selectedDiagnoses);
  }, [selectedDiagnoses]);

  const handleOrderLab = (testName: string) => {
    const res = DoctorOrderService.createLabOrder(patientUhid, {
      testName,
      category: "PATHOLOGY",
      urgency: "STAT",
      clinicalNotes: `CDSS Recommended for ${selectedDiagnoses.join(", ")}`,
    });
    if (res.success) {
      message.success(`Lab order "${testName}" dispatched to Lab Queue & Billing!`);
    }
  };

  const handleOrderRadiology = (studyName: string) => {
    const modality = studyName.toUpperCase().includes("ECG")
      ? "ECG"
      : studyName.toUpperCase().includes("X-RAY")
      ? "XRAY"
      : studyName.toUpperCase().includes("ECHO")
      ? "ECHO"
      : "CT";

    const res = DoctorOrderService.createRadiologyOrder(patientUhid, {
      studyName,
      modality,
      urgency: "URGENT",
      clinicalNotes: `CDSS Recommended for ${selectedDiagnoses.join(", ")}`,
    });
    if (res.success) {
      message.success(`Radiology scan "${studyName}" dispatched to PACS Worklist & Billing!`);
    }
  };

  const handleOrderAllBundle = () => {
    let labCount = 0;
    let radCount = 0;

    recommendations.forEach((rec) => {
      rec.recommendedLabs.forEach((lab) => {
        DoctorOrderService.createLabOrder(patientUhid, { testName: lab, urgency: "STAT" });
        labCount++;
      });
      rec.recommendedRadiology.forEach((rad) => {
        DoctorOrderService.createRadiologyOrder(patientUhid, { studyName: rad, modality: "XRAY" });
        radCount++;
      });
    });

    message.success(`1-Click Bundle Dispatched: ${labCount} Lab Tests & ${radCount} Radiology Scans ordered!`);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" /> ICD-10 Diagnosis & CDSS Recommender
        </h3>
        <HmsAiGeneratedBadge label="CDSS Order Recommender" />
      </div>

      {/* ICD-10 Search */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Search & Add ICD-10 Codes</label>
        <Select
          mode="multiple"
          className="w-full"
          placeholder="Search ICD-10 Code or Disease Name..."
          value={selectedDiagnoses}
          onChange={(vals) => setSelectedDiagnoses(vals)}
          options={icd10Options}
          size="large"
        />
      </div>

      {/* Confirmed Diagnoses */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Confirmed Diagnoses</label>
        <div className="space-y-1.5">
          {selectedDiagnoses.map((diag) => (
            <div
              key={diag}
              className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-sm text-teal-900 font-medium"
            >
              <span>{diag}</span>
              <Tag color="teal" className="font-bold">PRIMARY</Tag>
            </div>
          ))}
        </div>
      </div>

      {/* CDSS Diagnosis-Driven Recommendations Panel */}
      <div className="pt-2 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
              CDSS Clinical Order-Set Recommendations
            </span>
          </div>
          {recommendations.length > 0 && (
            <button
              onClick={handleOrderAllBundle}
              className="text-xs font-bold px-2.5 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors shadow-xs flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> 1-Click Order All
            </button>
          )}
        </div>

        {recommendations.map((rec) => (
          <div key={rec.id} className="p-3 bg-slate-50 border border-purple-100 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">{rec.bundleTitle}</span>
              <Tag color="purple" className="text-3xs font-semibold">{rec.icd10Code}</Tag>
            </div>

            <p className="text-[11px] text-slate-500 italic">{rec.clinicalRationale}</p>

            {/* Recommended Labs */}
            {rec.recommendedLabs.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                  <TestTube className="w-3 h-3 text-teal-600" /> Recommended Laboratory Tests:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rec.recommendedLabs.map((lab, i) => (
                    <button
                      key={i}
                      onClick={() => handleOrderLab(lab)}
                      className="text-[11px] px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors flex items-center gap-1 font-medium"
                    >
                      <span>+ {lab}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Radiology */}
            {rec.recommendedRadiology.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                  <Eye className="w-3 h-3 text-purple-600" /> Recommended Radiology & Imaging:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rec.recommendedRadiology.map((rad, i) => (
                    <button
                      key={i}
                      onClick={() => handleOrderRadiology(rad)}
                      className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors flex items-center gap-1 font-medium"
                    >
                      <span>+ {rad}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Medication Templates */}
            {rec.recommendedMedications.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                  <Pill className="w-3 h-3 text-indigo-600" /> Recommended Medication Templates:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rec.recommendedMedications.map((med, i) => (
                    <Tag key={i} color="blue" className="text-3xs font-medium">
                      {med}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Follow-up */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Suggested Revisit Interval:</span>
              <strong className="text-slate-800 font-bold">
                {rec.icd10Code.includes("I20") ? "7 - 14 Days" : rec.icd10Code.includes("I10") ? "14 - 30 Days" : "30 Days"}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

