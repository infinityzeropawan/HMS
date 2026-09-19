"use client";

import React, { useState } from "react";
import { Form, Input, Switch, Segmented, Button, message, Tooltip, Tag } from "antd";
import {
  FileText,
  Receipt,
  Stethoscope,
  TestTube,
  FileCheck,
  Palette,
  QrCode,
  Image as ImageIcon,
  Save,
  RefreshCw,
  Printer,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { PdfBrandingConfig, PdfDocumentType } from "../../_super_admin_types/branding_types";
import { WhiteLabelService } from "../../_super_admin_services/white_label_service";

import { useBrandingStore } from "../../_super_admin_stores/branding_store";

interface PdfBrandingWorkspaceProps {
  hospitalName: string;
  initialConfig?: PdfBrandingConfig;
  onSave: (config: PdfBrandingConfig) => void;
  loading?: boolean;
}

export const PdfBrandingWorkspace: React.FC<PdfBrandingWorkspaceProps> = ({
  hospitalName,
  initialConfig,
  onSave,
  loading = false,
}) => {
  const storeBranding = useBrandingStore((state) => state.brandingByTenant["TNT-9014"]);
  const defaultConfig = WhiteLabelService.getDefaultPdfBranding(hospitalName);
  const activePdfConfig: PdfBrandingConfig = storeBranding?.pdfBranding || {
    ...defaultConfig,
    ...initialConfig,
  };

  const [config, setConfig] = useState<PdfBrandingConfig>(activePdfConfig);
  const [activePdfDoc, setActivePdfDoc] = useState<PdfDocumentType>("invoice");
  const [form] = Form.useForm();

  const handleValuesChange = (_: unknown, allValues: Partial<PdfBrandingConfig>) => {
    setConfig((prev) => ({ ...prev, ...allValues }));
    useBrandingStore.getState().updatePdfBranding("TNT-9014", allValues);
  };

  const handleFinish = (values: PdfBrandingConfig) => {
    useBrandingStore.getState().updatePdfBranding("TNT-9014", values);
    onSave(values);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> PDF Document Branding & Letterhead Layout Engine
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure letterheads, watermarks, digital signature blocks, and QR code verification for clinical and financial documents.
          </p>
        </div>

        <Segmented
          options={[
            {
              label: (
                <span className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-medium">
                  <Receipt className="w-3.5 h-3.5" /> Invoice
                </span>
              ),
              value: "invoice",
            },
            {
              label: (
                <span className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-medium">
                  <Stethoscope className="w-3.5 h-3.5" /> Prescription
                </span>
              ),
              value: "prescription",
            },
            {
              label: (
                <span className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-medium">
                  <TestTube className="w-3.5 h-3.5" /> Lab Report
                </span>
              ),
              value: "lab_report",
            },
            {
              label: (
                <span className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-medium">
                  <FileCheck className="w-3.5 h-3.5" /> Discharge Summary
                </span>
              ),
              value: "discharge_summary",
            },
          ]}
          value={activePdfDoc}
          onChange={(val) => setActivePdfDoc(val as PdfDocumentType)}
          className="bg-slate-800 text-slate-200 shrink-0"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PDF Branding Settings (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <Form
            form={form}
            layout="vertical"
            initialValues={config}
            onValuesChange={handleValuesChange}
            onFinish={handleFinish}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">PDF Document Layout Settings</h4>
              <Tooltip title="Reset PDF parameters to default hospital layout">
                <Button
                  type="text"
                  size="small"
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const res = WhiteLabelService.getDefaultPdfBranding(hospitalName);
                    setConfig(res);
                    form.setFieldsValue(res);
                    message.info("PDF branding reset to defaults.");
                  }}
                >
                  Reset
                </Button>
              </Tooltip>
            </div>

            <Form.Item label="PDF Letterhead Logo URL" name="headerLogoUrl" rules={[{ required: true }]}>
              <Input prefix={<ImageIcon className="w-4 h-4 text-slate-400" />} />
            </Form.Item>

            <Form.Item label="Prescription Letterhead Title" name="prescriptionHeader" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Document Accent Color" name="accentColor" rules={[{ required: true }]}>
              <Input prefix={<Palette className="w-4 h-4 text-indigo-500" />} placeholder="#0d9488" />
            </Form.Item>

            <Form.Item label="Watermark Text (Diagonal Security Overlay)" name="watermarkText">
              <Input placeholder="OFFICIAL MEDICAL RECORD" />
            </Form.Item>

            <Form.Item label="Invoice Footer Disclaimer Text" name="invoiceFooterText">
              <Input.TextArea rows={2} />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <Form.Item label="Show Verification QR" name="showQrCode" valuePropName="checked" className="!mb-0">
                <Switch size="small" />
              </Form.Item>

              <Form.Item label="Digital Signature Stamp" name="showDigitalSignature" valuePropName="checked" className="!mb-0">
                <Switch size="small" />
              </Form.Item>
            </div>

            <div className="pt-3">
              <HmsButton
                variant="emerald"
                icon={<Save className="w-4 h-4" />}
                htmlType="submit"
                loading={loading}
                className="w-full"
              >
                Save PDF Branding Layout
              </HmsButton>
            </div>
          </Form>
        </div>

        {/* Live PDF Preview Render Container (Right 7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-3 min-h-[580px]">
          <div className="flex items-center justify-between text-slate-300 text-xs font-bold pb-2 border-b border-slate-800">
            <span className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-indigo-400" /> A4 Document Preview: <Tag color="indigo" className="uppercase font-mono">{activePdfDoc.replace("_", " ")}</Tag>
            </span>
            <span className="text-slate-400 text-[11px] font-mono">210mm x 297mm Standard Print Vector</span>
          </div>

          {/* Paper Sheet Preview Container */}
          <div className="bg-white text-slate-900 rounded-lg shadow-2xl p-8 max-w-xl mx-auto min-h-[500px] relative overflow-hidden flex flex-col justify-between font-serif text-xs border border-slate-300">
            {/* Diagonal Watermark Overlay */}
            {config.watermarkText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-10">
                <span className="text-4xl font-black uppercase text-slate-800 tracking-widest transform -rotate-45 font-sans whitespace-nowrap">
                  {config.watermarkText}
                </span>
              </div>
            )}

            {/* Document Header Bar */}
            <div className="space-y-4 pb-4 border-b-2" style={{ borderColor: config.accentColor || "#0d9488" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={config.headerLogoUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80"}
                    alt="Header Logo"
                    className="h-10 w-auto object-contain max-w-[140px]"
                  />
                  <div>
                    <h2 className="text-base font-black tracking-tight text-slate-900 font-sans">{config.prescriptionHeader || `${hospitalName.toUpperCase()} MEDICAL CENTER`}</h2>
                    <p className="text-[10px] text-slate-500 font-sans">NABH Accredited Tertiary Healthcare Facility | GSTIN: 27AAAAA0000A1Z5</p>
                  </div>
                </div>
                {config.showQrCode && (
                  <div className="shrink-0 text-center font-sans">
                    <div className="w-12 h-12 bg-slate-900 text-white p-1 rounded flex items-center justify-center">
                      <QrCode className="w-10 h-10" />
                    </div>
                    <span className="text-[8px] text-slate-400 font-mono block mt-0.5">ABDM Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Specific Dynamic Body */}
            <div className="py-4 space-y-4 font-sans flex-1">
              {/* 1. INVOICE PREVIEW */}
              {activePdfDoc === "invoice" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500">Invoice No:</span> <strong className="font-mono">INV-2026-88012</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Patient:</span> <strong>Ramesh Gupta (UHID: P-9041)</strong>
                    </div>
                  </div>

                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="p-2">Service Particulars</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2">Super Specialty Cardiology Consultation</td>
                        <td className="p-2 text-right">1</td>
                        <td className="p-2 text-right">1,500.00</td>
                      </tr>
                      <tr>
                        <td className="p-2">ECG 12-Lead Diagnostic Scan</td>
                        <td className="p-2 text-right">1</td>
                        <td className="p-2 text-right">850.00</td>
                      </tr>
                      <tr>
                        <td className="p-2">2D Echocardiography Study</td>
                        <td className="p-2 text-right">1</td>
                        <td className="p-2 text-right">3,200.00</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex justify-end pt-2">
                    <div className="w-48 space-y-1 text-right text-[11px]">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal:</span> <span>₹5,550.00</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>GST (18%):</span> <span>₹999.00</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-1 text-xs">
                        <span>Grand Total:</span> <span style={{ color: config.accentColor || "#0d9488" }}>₹6,549.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PRESCRIPTION PREVIEW */}
              {activePdfDoc === "prescription" && (
                <div className="space-y-3 text-[11px]">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div>
                      <span className="text-slate-500">Patient:</span> <strong>Suresh Kumar (45Y / Male)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Vitals:</span> <strong>BP: 120/80 mmHg | Pulse: 72 bpm</strong>
                    </div>
                  </div>

                  <div className="font-serif text-lg font-bold" style={{ color: config.accentColor || "#0d9488" }}>
                    ℞ Prescribed Medication
                  </div>

                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="p-1.5">Medicine Name</th>
                        <th className="p-1.5">Dosage</th>
                        <th className="p-1.5">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-1.5 font-bold">Tab. Telmisartan 40mg</td>
                        <td className="p-1.5">1-0-0 (After Food)</td>
                        <td className="p-1.5">30 Days</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-bold">Tab. Atorvastatin 10mg</td>
                        <td className="p-1.5">0-0-1 (Night)</td>
                        <td className="p-1.5">30 Days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3. LAB REPORT PREVIEW */}
              {activePdfDoc === "lab_report" && (
                <div className="space-y-3 text-[11px]">
                  <div className="flex justify-between items-center bg-purple-50 p-2 rounded border border-purple-200 text-purple-900 font-bold">
                    <span>NABL Accredited Pathology Wing</span>
                    <Tag color="purple">Report Verified</Tag>
                  </div>

                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="p-1.5">Test Parameter</th>
                        <th className="p-1.5">Observed Value</th>
                        <th className="p-1.5">Reference Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-1.5">Fasting Blood Sugar (FBS)</td>
                        <td className="p-1.5 font-bold text-rose-600">142 mg/dL High</td>
                        <td className="p-1.5 text-slate-500">70 - 100 mg/dL</td>
                      </tr>
                      <tr>
                        <td className="p-1.5">HbA1c (Glycated Hemoglobin)</td>
                        <td className="p-1.5 font-bold text-amber-600">6.8 %</td>
                        <td className="p-1.5 text-slate-500">&lt; 5.7 % Normal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* 4. DISCHARGE SUMMARY PREVIEW */}
              {activePdfDoc === "discharge_summary" && (
                <div className="space-y-2 text-[11px]">
                  <div className="bg-slate-100 p-2 rounded font-bold text-slate-800">
                    IPD Admission Summary | Ward: ICU Bed 04
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Patient admitted with acute chest discomfort. Successfully managed conservatively with anti-platelets and statins. Hemodynamically stable at discharge.
                  </p>
                </div>
              )}
            </div>

            {/* Document Footer & Digital Signature Block */}
            <div className="pt-3 border-t border-slate-200 space-y-2 font-sans text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 max-w-xs">{config.invoiceFooterText}</span>
                {config.showDigitalSignature && (
                  <div className="text-right border-l pl-3 border-slate-200">
                    <span className="font-serif italic font-bold block text-slate-800">Dr. Rajesh Sharma, MD</span>
                    <span className="text-[9px] text-slate-400 block">Digitally Signed Security Token</span>
                  </div>
                )}
              </div>
              <div className="text-center text-slate-400 text-[9px] pt-1 border-t border-slate-100">
                {config.hospitalAddressFooter}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
