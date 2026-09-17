"use client";

import React, { useState } from "react";
import { Select, Switch, Input, Radio, message, Tooltip } from "antd";
import { Printer, FileText, CheckCircle2, Eye, Layout, ShieldCheck, Download, RefreshCw } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useAdminSettingsStore } from "../../_admin_stores/admin_settings_store";

type TemplateType = "OPD_PRESCRIPTION" | "DISCHARGE_SUMMARY" | "TAX_INVOICE" | "LAB_REPORT" | "ABHA_CONSENT";

export const PrintTemplateStudio: React.FC = () => {
  const hospitalSettings = useAdminSettingsStore();

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("OPD_PRESCRIPTION");
  const [logoPosition, setLogoPosition] = useState<"LEFT" | "CENTER" | "RIGHT">("LEFT");
  const [showWatermark, setShowWatermark] = useState(true);
  const [showDoctorRegNo, setShowDoctorRegNo] = useState(true);
  const [showGstinOnInvoice, setShowGstinOnInvoice] = useState(true);
  const [pageSize, setPageSize] = useState<"A4" | "LETTER" | "THERMAL_80MM">("A4");
  const [disclaimerFooter, setDisclaimerFooter] = useState(
    "This is a computer-generated medical record under IT Act 2000. Valid without physical signature when digitally verified."
  );

  const handleSaveTemplate = () => {
    message.success(`Print template layout for ${selectedTemplate} saved successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-600" /> Document & Print Template Studio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure letterheads, headers, footers, logos, and printable formats for prescriptions, invoices, and summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Trigger browser print preview of live template">
            <HmsButton size="sm" variant="secondary" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => window.print()}>
              Test Print Preview
            </HmsButton>
          </Tooltip>
          <HmsButton variant="emerald" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleSaveTemplate}>
            Save Template Config
          </HmsButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Customization Panel (5 Columns) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Document Template Type
            </label>
            <Select
              value={selectedTemplate}
              onChange={(val) => setSelectedTemplate(val)}
              className="w-full"
              size="large"
              options={[
                { value: "OPD_PRESCRIPTION", label: "OPD Doctor Prescription Letterhead" },
                { value: "DISCHARGE_SUMMARY", label: "IPD Discharge Summary Certificate" },
                { value: "TAX_INVOICE", label: "GST Tax Invoice & Payment Receipt" },
                { value: "LAB_REPORT", label: "Pathology & Radiology Diagnostic Report" },
                { value: "ABHA_CONSENT", label: "ABDM Health Data Sharing Consent Form" },
              ]}
            />
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Header Logo Position</label>
              <Radio.Group
                value={logoPosition}
                onChange={(e) => setLogoPosition(e.target.value)}
                buttonStyle="solid"
                className="w-full"
              >
                <Radio.Button value="LEFT" className="w-1/3 text-center">Left</Radio.Button>
                <Radio.Button value="CENTER" className="w-1/3 text-center">Center</Radio.Button>
                <Radio.Button value="RIGHT" className="w-1/3 text-center">Right</Radio.Button>
              </Radio.Group>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Page Size</label>
              <Radio.Group
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                buttonStyle="solid"
                className="w-full"
              >
                <Radio.Button value="A4" className="w-1/3 text-center">Standard A4</Radio.Button>
                <Radio.Button value="LETTER" className="w-1/3 text-center">US Letter</Radio.Button>
                <Radio.Button value="THERMAL_80MM" className="w-1/3 text-center">80mm Token</Radio.Button>
              </Radio.Group>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Display Hospital Watermark</span>
                <Switch checked={showWatermark} onChange={(val) => setShowWatermark(val)} />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Display Doctor Registration #</span>
                <Switch checked={showDoctorRegNo} onChange={(val) => setShowDoctorRegNo(val)} />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Display GSTIN & Tax Breakdown</span>
                <Switch checked={showGstinOnInvoice} onChange={(val) => setShowGstinOnInvoice(val)} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-700 mb-1">Legal Footer Disclaimer</label>
              <Input.TextArea
                rows={3}
                value={disclaimerFooter}
                onChange={(e) => setDisclaimerFooter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Live Document Preview Screen (7 Columns) */}
        <div className="lg:col-span-7 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white text-xs">
            <span className="font-bold flex items-center gap-1.5 text-teal-400">
              <Layout className="w-4 h-4 text-teal-400" /> Live Render Preview: {selectedTemplate}
            </span>
            <span className="font-mono text-3xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Size: {pageSize} | Logo: {logoPosition}
            </span>
          </div>

          {/* Simulated Printed Paper Container */}
          <div className="my-4 bg-white text-slate-900 p-8 rounded-xl shadow-2xl mx-auto w-full max-w-xl min-h-[480px] font-sans relative border border-slate-200">
            {/* Watermark Background */}
            {showWatermark && (
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <span className="text-4xl font-black uppercase rotate-[-30deg] tracking-widest text-slate-900">
                  {hospitalSettings.hospitalName}
                </span>
              </div>
            )}

            {/* Letterhead Header */}
            <div
              className={`flex items-start gap-4 pb-4 border-b-2 border-slate-900 ${
                logoPosition === "CENTER"
                  ? "flex-col items-center text-center"
                  : logoPosition === "RIGHT"
                  ? "flex-row-reverse text-right"
                  : "flex-row"
              }`}
            >
              <div className="w-12 h-12 bg-teal-700 text-white rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                A
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {hospitalSettings.hospitalName}
                </h3>
                <p className="text-3xs text-slate-600">{hospitalSettings.tagline}</p>
                <p className="text-3xs text-slate-500 font-mono mt-0.5">
                  Reg: {hospitalSettings.registrationNumber} | {hospitalSettings.address}, {hospitalSettings.city}
                </p>
                {showGstinOnInvoice && (
                  <p className="text-3xs text-teal-800 font-mono font-semibold">
                    GSTIN: {hospitalSettings.gstin} | Helpline: {hospitalSettings.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Title Bar */}
            <div className="my-4 py-1.5 px-3 bg-slate-100 rounded text-center border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {selectedTemplate.replace("_", " ")}
              </h4>
            </div>

            {/* Sample Body Content */}
            <div className="space-y-3 text-2xs text-slate-700 min-h-[220px]">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-100 font-mono text-3xs">
                <div>Patient Name: <strong>Sunil Verma (UHID: P-2026-9912)</strong></div>
                <div>Age / Gender: <strong>42 Yrs / Male</strong></div>
                <div>Date / Time: <strong>{new Date().toLocaleDateString()} 10:30 AM</strong></div>
                <div>Attending Doctor: <strong>Dr. Rajesh Sharma (MD)</strong></div>
              </div>

              {selectedTemplate === "OPD_PRESCRIPTION" && (
                <div className="space-y-2 pt-2">
                  <p className="font-bold text-slate-900">Rx / Prescribed Medication:</p>
                  <ol className="list-decimal pl-4 space-y-1 font-mono text-3xs">
                    <li>Tab. Paracetamol 650mg — 1-0-1 (After Food) x 5 Days</li>
                    <li>Tab. Amoxicillin 500mg — 1-0-1 (After Food) x 7 Days</li>
                    <li>Syr. Benadryl 10ml — 0-0-1 (At Bedtime) x 3 Days</li>
                  </ol>
                </div>
              )}

              {selectedTemplate === "TAX_INVOICE" && (
                <div className="space-y-2 pt-2">
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <div className="bg-slate-100 p-1.5 font-bold grid grid-cols-3 text-3xs">
                      <span>Service Particulars</span>
                      <span className="text-center">Rate</span>
                      <span className="text-right">Amount (₹)</span>
                    </div>
                    <div className="p-1.5 grid grid-cols-3 text-3xs border-t border-slate-100">
                      <span>Doctor Specialist Consultation</span>
                      <span className="text-center font-mono">₹ 800</span>
                      <span className="text-right font-mono">₹ 800.00</span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-emerald-800">
                    Total Amount Paid: ₹ 800.00 (GST Included)
                  </div>
                </div>
              )}

              {selectedTemplate === "DISCHARGE_SUMMARY" && (
                <div className="space-y-1.5 pt-2 text-3xs">
                  <p><strong>Primary Diagnosis:</strong> Acute Myocardial Infarction (Anterolateral)</p>
                  <p><strong>Procedure Performed:</strong> Primary Percutaneous Coronary Intervention (PTCA + Stent)</p>
                  <p><strong>Condition at Discharge:</strong> Hemodynamically Stable, Afebrile, Pain Free.</p>
                </div>
              )}
            </div>

            {/* Doctor Signature Block */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-3xs">
              <div className="text-slate-400 font-mono">
                {showDoctorRegNo && <span>Doctor Reg #: MMC-2012-99081</span>}
              </div>
              <div className="text-right font-mono">
                <div className="w-24 h-6 border-b border-slate-400 mb-1 border-dashed"></div>
                <p className="font-bold text-slate-900">Dr. Rajesh Sharma</p>
                <p className="text-slate-500">Authorized Medical Officer</p>
              </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="mt-4 pt-2 border-t border-slate-100 text-[9px] text-slate-400 text-center font-mono leading-tight">
              {disclaimerFooter}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
