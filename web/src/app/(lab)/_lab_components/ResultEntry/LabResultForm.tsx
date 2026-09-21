"use client";

import React, { useState, useEffect } from "react";
import { Form, InputNumber, Alert, message, Modal, Select } from "antd";
import { FlaskConical, Send, MessageSquare } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useLabStore } from "../../_lab_stores/lab_store";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";
import { useNotificationStore } from "@/lib/notification_store/notification.store";
import { useBillingStore } from "@/app/(billing)/_billing_stores/billing_store";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";

export const LabResultForm: React.FC = () => {
  const admissions = useIpdStore((state) => state.admissions);
  const currentUser = useAuthUserStore((state) => state.user);
  const pathologistName = currentUser?.username ? `Dr. ${currentUser.username} (Pathologist)` : "Pathologist Duty Desk";

  const [storedLabOrders, setStoredLabOrders] = useState<any[]>([]);
  const [selectedOrderKey, setSelectedOrderKey] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("hms_lab_orders") || "[]");
        setStoredLabOrders(stored);
        if (stored.length > 0) {
          setSelectedOrderKey(`lab-${stored[0].id || stored[0].orderNo}`);
        } else if (admissions.length > 0) {
          setSelectedOrderKey(`ipd-${admissions[0].admissionNo}`);
        }
      } catch {
        /* ignore */
      }
    }
  }, [admissions]);

  // Combined options: OPD Lab Orders + IPD Admissions
  const selectedOrder = storedLabOrders.find((o) => `lab-${o.id || o.orderNo}` === selectedOrderKey);
  const selectedAdmission = admissions.find((a) => `ipd-${a.admissionNo}` === selectedOrderKey || `ipd-${a.id}` === selectedOrderKey) || admissions[0];

  const patientName = selectedOrder?.patientName || selectedAdmission?.patientName || "Walk-In Patient";
  const patientUhid = selectedOrder?.uhid || selectedAdmission?.uhid || "P-2026-9912";
  const displayOrderNo = selectedOrder?.orderNo || `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const ipdId = selectedAdmission?.admissionNo || "IPD-2026-0881";
  const orderId = selectedOrder?.id || displayOrderNo;

  const [panicAlert, setPanicAlert] = useState(false);
  const [hemoglobin, setHemoglobin] = useState<number | null>(13.5);
  const [potassium, setPotassium] = useState<number | null>(4.2);
  const [tlc, setTlc] = useState<number | null>(7200);
  const [platelets, setPlatelets] = useState<number | null>(2.4);
  const [fbs, setFbs] = useState<number | null>(98);
  const [simulatedSms, setSimulatedSms] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const checkPanicValues = (hb: number | null, k: number | null, sugar: number | null) => {
    const isHbPanic = hb !== null && hb < 7.0;
    const isKPanic = k !== null && k > 6.0;
    const isSugarPanic = sugar !== null && sugar > 400;
    setPanicAlert(isHbPanic || isKPanic || isSugarPanic);
  };

  const handleHbChange = (val: number | null) => {
    setHemoglobin(val);
    checkPanicValues(val, potassium, fbs);
  };

  const handleKChange = (val: number | null) => {
    setPotassium(val);
    checkPanicValues(hemoglobin, val, fbs);
  };

  const handleFbsChange = (val: number | null) => {
    setFbs(val);
    checkPanicValues(hemoglobin, potassium, val);
  };

  const handleSubmit = () => {
    const finalStatus = panicAlert ? "CRITICAL_PANIC" : "VERIFIED";
    const reportData = {
      id: orderId,
      orderNo: displayOrderNo,
      uhid: patientUhid,
      patientName,
      testName: selectedOrder?.testName || "Complete Blood Count & Electrolytes",
      category: selectedOrder?.category || "PATHOLOGY",
      hemoglobin,
      potassium,
      tlc,
      platelets,
      fbs,
      panicAlert,
      resultValue: `Hb: ${hemoglobin} g/dL | K+: ${potassium} mmol/L | FBS: ${fbs} mg/dL`,
      normalRange: "Hb: 12-16.5 | K: 3.5-5.1 | FBS: 70-110",
      orderDate: new Date().toLocaleString(),
      status: finalStatus,
      verifiedAt: new Date().toISOString(),
      pathologistName,
    };

    // Save/Update in localStorage hms_lab_orders so Doctor Review Inbox receives status VERIFIED
    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem("hms_lab_orders") || "[]");
        const matchIndex = existing.findIndex((o: any) => o.id === selectedOrder?.id || o.orderNo === displayOrderNo || o.uhid === patientUhid);
        if (matchIndex >= 0) {
          existing[matchIndex] = { ...existing[matchIndex], ...reportData };
        } else {
          existing.unshift(reportData);
        }
        localStorage.setItem("hms_lab_orders", JSON.stringify(existing));
        setStoredLabOrders(existing);
      } catch {
        /* ignore */
      }
    }

    // 1. EMR Timeline event via useIpdStore
    try {
      useIpdStore.getState().addRoundNote(
        ipdId,
        `[Lab Test Verified] ${reportData.testName}: ${reportData.resultValue} - Signed off by ${pathologistName}`
      );
    } catch {
      /* store fallback */
    }

    // 2. Billing invoice verification
    try {
      useBillingStore.getState().addInvoice({
        invoiceNumber: `INV-2026-${Math.floor(Math.random() * 90000 + 10000)}`,
        patientUhid,
        patientName,
        category: "LAB",
        paymentMode: "CASH",
        subtotal: 650,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: 650,
        paidAmount: 650,
        status: "PAID",
        items: [
          {
            itemId: `item-${Date.now()}`,
            description: "Complete Blood Count & Electrolytes Panel",
            hsnSacCode: "999312",
            quantity: 1,
            unitPrice: 650,
            gstRate: 0,
          },
        ],
      });
    } catch {
      /* billing fallback */
    }

    // 3. Platform Audit Event
    PlatformAuditService.recordAuditEvent({
      actor: pathologistName,
      actorRole: "PATHOLOGIST",
      action: `Lab Test Verified: #${orderId}`,
      category: "COMPLIANCE_EVENT",
      entity: `Patient ${patientName} (${ipdId})`,
      ipAddress: "192.168.1.105",
      riskLevel: panicAlert ? "CRITICAL" : "INFO",
      details: JSON.stringify(reportData),
    });

    // 4. Critical Panic Notification
    if (panicAlert) {
      const panicReason = hemoglobin && hemoglobin < 7.0
        ? `Hemoglobin dangerously low (${hemoglobin} g/dL < 7.0 threshold)`
        : potassium && potassium > 6.0
        ? `Serum Potassium hyperkalemia (${potassium} mmol/L > 6.0 threshold)`
        : `Blood Glucose severe hyperglycemia (${fbs} mg/dL > 400 threshold)`;

      const bedLabel = selectedAdmission?.bedNumber ? `Bed ${selectedAdmission.bedNumber}` : "OPD Walk-In";
      const smsText = `CRITICAL PANIC ALERT — Patient ${patientName} (${patientUhid}) ${bedLabel}: ${panicReason}. Immediate physician review required.`;
      setSimulatedSms(smsText);

      useNotificationStore.getState().addNotification({
        title: `CRITICAL LAB PANIC: ${patientName}`,
        body: `${bedLabel}: ${panicReason}`,
        channel: "system",
        category: "LAB_PANIC",
        priority: "critical",
        status: "unread",
        tenantId: "TNT-9014",
        hospitalId: "HOSP-01",
        patientId: patientUhid,
        patientName: patientName,
      });

      Modal.confirm({
        title: "CRITICAL PANIC VALUE ALERT DISPATCHED!",
        content: (
          <div className="space-y-2 mt-2">
            <p className="text-sm text-slate-700">{panicReason}</p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-mono flex items-start gap-2">
              <Send className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{smsText}</span>
            </div>
          </div>
        ),
        okText: "Acknowledge & Dispatch STAT Notification",
        okType: "danger",
        onOk() {
          message.success("Lab report published & STAT Panic Notification dispatched to Attending Physician & Duty Nurse!");
        },
      });
    } else {
      message.success(`Lab test results published & saved successfully for ${patientName}. EMR Timeline & Billing updated.`);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FlaskConical className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Lab Result Verification & Entry</h2>
          <p className="text-xs text-slate-500 mb-2">Order #{displayOrderNo} &bull; Patient: <strong className="text-slate-800">{patientName}</strong> ({patientUhid})</p>
          <div className="w-full sm:w-72">
            <Select
              className="w-full text-xs"
              value={selectedOrderKey}
              onChange={(val) => setSelectedOrderKey(val)}
              options={[
                ...storedLabOrders.map((o) => ({
                  value: `lab-${o.id || o.orderNo}`,
                  label: `[OPD/Doctor Order] ${o.orderNo} — ${o.patientName} (${o.testName})`,
                })),
                ...admissions.map((a) => ({
                  value: `ipd-${a.admissionNo}`,
                  label: `[IPD Admission] ${a.admissionNo} — ${a.patientName} (Bed ${a.bedNumber})`,
                })),
              ]}
              placeholder="Select Patient / Order"
            />
          </div>
        </div>
      </div>

      {panicAlert && (
        <Alert
          message="CRITICAL PANIC VALUE DETECTED"
          description="Hemoglobin level is dangerously low (< 7.0 g/dL). Emergency SMS broadcast to attending physician will trigger."
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {simulatedSms && (
        <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Automated Alert Dispatch Log:</span>
            <span>{simulatedSms}</span>
          </div>
        </div>
      )}

      <Form layout="vertical" onFinish={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item label="Hemoglobin (Hb - g/dL)">
            <InputNumber
              value={hemoglobin}
              onChange={handleHbChange}
              step={0.1}
              min={0}
              max={20}
              size="large"
              className="w-full"
            />
            <span className="text-xs text-slate-400">Normal Range: 12.0 - 16.5 g/dL (Valid: 0–20)</span>
          </Form.Item>

          <Form.Item label="Total Leucocyte Count (TLC - /cu mm)">
            <InputNumber
              value={tlc}
              onChange={(val) => setTlc(val)}
              min={1000}
              max={100000}
              size="large"
              className="w-full"
            />
            <span className="text-xs text-slate-400">Normal Range: 4,000 - 11,000 (Valid: 1k–100k)</span>
          </Form.Item>

          <Form.Item label="Platelet Count (lakhs/cu mm)">
            <InputNumber
              value={platelets}
              onChange={(val) => setPlatelets(val)}
              step={0.1}
              min={0.1}
              max={15.0}
              size="large"
              className="w-full"
            />
            <span className="text-xs text-slate-400">Normal Range: 1.5 - 4.5 lakhs</span>
          </Form.Item>

          <Form.Item label="Fasting Blood Sugar (mg/dL)">
            <InputNumber
              value={fbs}
              onChange={(val) => setFbs(val)}
              min={30}
              max={600}
              size="large"
              className="w-full"
            />
            <span className="text-xs text-slate-400">Normal Range: 70 - 100 mg/dL</span>
          </Form.Item>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <HmsButton
            type="primary"
            variant={panicAlert ? "danger" : "emerald"}
            htmlType="submit"
            size="lg"
            icon={<FlaskConical className="w-4 h-4" />}
          >
            Save & Publish Results
          </HmsButton>
          <button
            type="button"
            onClick={() => {
              useLabStore.getState().signoffReport({
                orderId: "LAB-8849",
                patientUhid: "P-2026-1049",
                patientName: "Sunil Verma",
                pathologistName: "Dr. Ananya Roy (MD Pathology)",
                registrationNo: "MCI-2014-99201",
              });
              message.success("Pathologist Electronic Sign-Off complete! Digital Signature Attached.");
              setShowReportModal(true);
            }}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm text-sm"
          >
            ✍ Pathologist Sign-off & Preview PDF
          </button>
        </div>
      </Form>

      {/* Printable NABL Diagnostic Report Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-purple-700 font-bold border-b pb-2">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            <span>NABL ACCREDITED DIAGNOSTIC REPORT (ISO 15189)</span>
          </div>
        }
        open={showReportModal}
        onCancel={() => setShowReportModal(false)}
        footer={[
          <button
            key="close"
            onClick={() => setShowReportModal(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer mr-2"
          >
            Close
          </button>,
          <button
            key="print"
            onClick={() => {
              message.success("Verified NABL Diagnostic Report PDF sent to printer!");
              setShowReportModal(false);
            }}
            className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs cursor-pointer"
          >
            🖨 Print NABL Report PDF
          </button>,
        ]}
        width={580}
      >
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl my-3 space-y-3 font-mono text-xs">
          <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5 font-sans">
            <h3 className="font-bold text-slate-900 text-base uppercase">HMS CENTRAL DIAGNOSTIC PATHLAB</h3>
            <p className="text-[11px] text-purple-700 font-bold">NABL ACCREDITED LAB &bull; ISO 15189:2022 CERTIFIED</p>
            <p className="text-[10px] text-slate-500">Order #LAB-8849 &bull; Sample Barcode: BC-2026-9901</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-700 font-sans border-b pb-2">
            <div><strong>Patient Name:</strong> Sunil Verma</div>
            <div><strong>UHID:</strong> P-2026-1049</div>
            <div><strong>Age/Gender:</strong> 48Y / Male</div>
            <div><strong>Ref. Doctor:</strong> Dr. Rajesh Sharma</div>
          </div>

          <div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-1.5">Test Parameter</th>
                  <th className="p-1.5">Observed Value</th>
                  <th className="p-1.5">Reference Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-1.5 font-bold">Hemoglobin (Hb)</td>
                  <td className={`p-1.5 font-bold ${hemoglobin && hemoglobin < 7.0 ? "text-rose-600 font-mono" : "text-slate-900"}`}>
                    {hemoglobin} g/dL {hemoglobin && hemoglobin < 7.0 && "(LOW - PANIC)"}
                  </td>
                  <td className="p-1.5 text-slate-600">12.0 - 16.5 g/dL</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold">TLC</td>
                  <td className="p-1.5 text-slate-900">{tlc} /cu mm</td>
                  <td className="p-1.5 text-slate-600">4,000 - 11,000</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold">Platelets</td>
                  <td className="p-1.5 text-slate-900">{platelets} lakhs</td>
                  <td className="p-1.5 text-slate-600">1.5 - 4.5 lakhs</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold">Fasting Blood Sugar</td>
                  <td className="p-1.5 text-slate-900">{fbs} mg/dL</td>
                  <td className="p-1.5 text-slate-600">70 - 100 mg/dL</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 font-sans text-xs flex justify-between items-center">
            <div>
              <p className="font-bold text-purple-950">ELECTRONICALLY SIGNED & VERIFIED BY:</p>
              <p className="text-purple-800 font-bold mt-0.5">Dr. Ananya Roy (MD Pathology)</p>
              <p className="text-[11px] text-purple-600">Reg No: MCI-2014-99201 &bull; Chief Consultant Pathologist</p>
            </div>
            <div className="px-3 py-1 bg-purple-700 text-white rounded font-mono text-[10px] font-bold uppercase">
              VERIFIED E-SIGN
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
