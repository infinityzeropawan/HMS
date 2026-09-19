"use client";

import React from "react";
import Link from "next/link";
import { Tag, Alert } from "antd";
import {
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  Activity,
  Bed,
  ExternalLink,
  Eye,
  FileText,
  CreditCard,
  Building2,
  Pill,
  Stethoscope,
  TestTube,
} from "lucide-react";
import { DoctorWorkspaceService, ClinicalAlertsBundle } from "../../_doctor_services/doctor_workspace_service";

interface DoctorClinicalAlertsPanelProps {
  uhid: string;
}

export const DoctorClinicalAlertsPanel: React.FC<DoctorClinicalAlertsPanelProps> = ({ uhid }) => {
  const ctx = DoctorWorkspaceService.getWorkspaceContext(uhid);
  const alerts: ClinicalAlertsBundle = ctx.alerts;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-teal-600" /> Patient Clinical Intelligence & Safety Panel
        </h3>
        <span className="text-[11px] font-mono text-slate-400">UHID: {uhid}</span>
      </div>

      {/* Polypharmacy Risk Alert */}
      {alerts.polypharmacyAlert.isAlert && (
        <Alert
          message="POLYPHARMACY RISK WARNING"
          description={alerts.polypharmacyAlert.message}
          type="warning"
          showIcon
          icon={<Pill className="w-4 h-4 text-amber-600" />}
          className="text-xs"
        />
      )}

      {/* Active Allergies & Active Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Active Allergies */}
        <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg space-y-1">
          <div className="font-bold text-rose-900 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>ACTIVE ALLERGIES ({alerts.allAllergies.length})</span>
            </span>
            <Tag color="error" className="text-3xs py-0 px-1 font-bold">EMR REGISTRY</Tag>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {alerts.allAllergies.length > 0 ? (
              alerts.allAllergies.map((alg, idx) => (
                <Tag
                  color={alg.severity === "ANAPHYLAXIS" || alg.severity === "SEVERE" ? "error" : "warning"}
                  key={idx}
                  className="font-semibold text-3xs py-0.5 px-1.5"
                >
                  {alg.allergen} ({alg.severity})
                </Tag>
              ))
            ) : (
              <span className="text-slate-500 text-[11px] italic">No known active allergies recorded.</span>
            )}
          </div>
        </div>

        {/* Active Problems */}
        <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg space-y-1">
          <div className="font-bold text-teal-900 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
              <span>ACTIVE PROBLEM LIST ({alerts.activeProblems.length})</span>
            </span>
            <Tag color="teal" className="text-3xs py-0 px-1 font-bold">ICD-10</Tag>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {alerts.activeProblems.length > 0 ? (
              alerts.activeProblems.map((prob, idx) => (
                <Tag color="cyan" key={idx} className="font-medium text-3xs py-0.5 px-1.5">
                  {prob.conditionName} ({prob.icd10Code})
                </Tag>
              ))
            ) : (
              <span className="text-slate-500 text-[11px] italic">No active problems listed.</span>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Risk Flags & Outstanding Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
          <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>CLINICAL HIGH RISK FLAGS</span>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {alerts.highRiskFlags.length > 0 ? (
              alerts.highRiskFlags.map((flag, idx) => (
                <Tag color="warning" key={idx} className="font-bold text-3xs">
                  {flag}
                </Tag>
              ))
            ) : (
              <span className="text-slate-500 text-[11px] italic">No active risk flags.</span>
            )}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>OUTSTANDING BALANCE</span>
          </div>
          <div className="text-sm font-bold text-amber-700 mt-1">{alerts.outstandingBalanceText}</div>
          <p className="text-[10px] text-slate-400">Unbilled / Pending Cashier Receipts</p>
        </div>
      </div>

      {/* Recent Abnormal Labs & Recent Abnormal Radiology Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Critical Labs */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="font-bold text-slate-700 flex items-center gap-1 text-xs">
            <TestTube className="w-3.5 h-3.5 text-teal-600" />
            <span>Recent Lab Findings</span>
          </div>
          {alerts.criticalLabResults.length > 0 ? (
            alerts.criticalLabResults.map((lab, i) => (
              <div key={i} className="text-[11px] text-slate-700 flex justify-between pt-0.5 border-b border-slate-100 last:border-0 pb-1">
                <span className="font-medium truncate max-w-[140px]">{lab.testName}:</span>
                <span className="font-mono text-teal-700 font-bold">{lab.resultValue}</span>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-400 italic">No lab findings available.</p>
          )}
        </div>

        {/* Abnormal Radiology */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="font-bold text-slate-700 flex items-center gap-1 text-xs">
            <Eye className="w-3.5 h-3.5 text-purple-600" />
            <span>Recent PACS Radiology Findings</span>
          </div>
          {alerts.abnormalRadiology.length > 0 ? (
            alerts.abnormalRadiology.map((rad, i) => (
              <div key={i} className="text-[11px] text-slate-700 space-y-0.5 pt-0.5 border-b border-slate-100 last:border-0 pb-1">
                <div className="flex justify-between font-medium">
                  <span className="text-purple-900 font-semibold">{rad.modality} ({rad.bodyPart})</span>
                  <span className="text-slate-400 text-[10px]">{rad.date}</span>
                </div>
                <p className="text-[10px] text-slate-500 italic truncate">{rad.impression}</p>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-400 italic">No PACS radiology findings.</p>
          )}
        </div>
      </div>

      {/* Module Integration Routing Bar */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-500">Cross-Module Integration:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <Link href="/pacs">
            <button className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200 hover:bg-purple-100 transition-colors">
              <Eye className="w-3 h-3" /> PACS DICOM
            </button>
          </Link>
          <Link href={`/portal?uhid=${uhid}`}>
            <button className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-teal-50 text-teal-700 rounded border border-teal-200 hover:bg-teal-100 transition-colors">
              <FileText className="w-3 h-3" /> EMR Chart
            </button>
          </Link>
          <Link href="/billing">
            <button className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors">
              <CreditCard className="w-3 h-3" /> Billing Desk
            </button>
          </Link>
          <Link href="/ipd">
            <button className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-orange-50 text-orange-700 rounded border border-orange-200 hover:bg-orange-100 transition-colors">
              <Building2 className="w-3 h-3" /> IPD Ward
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

