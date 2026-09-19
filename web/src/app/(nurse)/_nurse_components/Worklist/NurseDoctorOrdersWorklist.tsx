"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Input, message } from "antd";
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, User, BedDouble, Check, Play, AlertOctagon } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";
import { useNotificationStore } from "@/lib/notification_store/notification.store";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";

export type OrderExecutionStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ESCALATED";

export interface NurseDoctorOrder {
  orderId: string;
  patientUhid: string;
  ipdId: string;
  bedNumber: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  orderText: string;
  priority: "URGENT_STAT" | "HIGH" | "ROUTINE";
  category: "MEDICATION" | "IV_DRIP" | "DRESSING" | "LAB_SPECIMEN" | "BLOOD_TRANSFUSION";
  assignedNurse: string;
  orderedAt: string;
  status: OrderExecutionStatus;
  completedBy?: string;
  completedAt?: string;
  escalatedAt?: string;
  escalationReason?: string;
}

export const NurseDoctorOrdersWorklist: React.FC = () => {
  const admissions = useIpdStore((state) => state.admissions);
  const currentUser = useAuthUserStore((state) => state.user);
  const nurseName = currentUser?.username ? `Nurse ${currentUser.username}` : "Nurse Duty Station";

  const [orders, setOrders] = useState<NurseDoctorOrder[]>([
    {
      orderId: "ORD-2026-101",
      patientUhid: admissions[0]?.uhid || "P-2026-9912",
      ipdId: admissions[0]?.admissionNo || "IPD-2026-0881",
      bedNumber: admissions[0]?.bedNumber || "ICU-BED-01",
      patientName: admissions[0]?.patientName || "Sunil Verma",
      doctorId: "DOC-102",
      doctorName: admissions[0]?.attendingDoctor || "Dr. Rajesh Sharma",
      orderText: "Administer Inj. Heparin 5000 IU IV Bolus stat. Repeat ABG in 2 hours.",
      priority: "URGENT_STAT",
      category: "MEDICATION",
      assignedNurse: nurseName,
      orderedAt: "2026-09-16 09:30 AM",
      status: "PENDING",
    },
    {
      orderId: "ORD-2026-102",
      patientUhid: admissions[1]?.uhid || "P-2026-9944",
      ipdId: admissions[1]?.admissionNo || "IPD-2026-0895",
      bedNumber: admissions[1]?.bedNumber || "WARD-3B-04",
      patientName: admissions[1]?.patientName || "Anita Roy",
      doctorId: "DOC-105",
      doctorName: admissions[1]?.attendingDoctor || "Dr. Manoj Patil",
      orderText: "Perform sterile surgical dressing change on Right Knee operative wound.",
      priority: "HIGH",
      category: "DRESSING",
      assignedNurse: nurseName,
      orderedAt: "2026-09-16 10:15 AM",
      status: "IN_PROGRESS",
    },
    {
      orderId: "ORD-2026-103",
      patientUhid: admissions[2]?.uhid || "P-2026-9978",
      ipdId: admissions[2]?.admissionNo || "IPD-2026-0902",
      bedNumber: admissions[2]?.bedNumber || "DELUXE-402",
      patientName: admissions[2]?.patientName || "Rajesh Kulkarni",
      doctorId: "DOC-108",
      doctorName: admissions[2]?.attendingDoctor || "Dr. Priya Nair",
      orderText: "Collect repeat Venous Blood Sample for Serum Potassium & Creatinine re-check.",
      priority: "URGENT_STAT",
      category: "LAB_SPECIMEN",
      assignedNurse: nurseName,
      orderedAt: "2026-09-16 08:45 AM",
      status: "COMPLETED",
      completedAt: "2026-09-16 09:00 AM",
      completedBy: nurseName,
    },
  ]);

  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<NurseDoctorOrder | null>(null);
  const [escalationReason, setEscalationReason] = useState("");

  const handleStartProgress = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? { ...o, status: "IN_PROGRESS", assignedNurse: nurseName }
          : o
      )
    );
    message.info(`Order #${orderId} marked as IN_PROGRESS by ${nurseName}.`);
  };

  const handleCompleteOrder = (orderId: string) => {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const targetOrder = orders.find((o) => o.orderId === orderId);
    
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              status: "COMPLETED",
              completedAt: ts,
              completedBy: nurseName,
            }
          : o
      )
    );

    // EMR Timeline Event via useIpdStore
    if (targetOrder) {
      try {
        useIpdStore.getState().addRoundNote(
          targetOrder.ipdId,
          `[Doctor Order Executed] ${targetOrder.orderText} - Signed off by ${nurseName} at ${ts}`
        );
      } catch {
        /* store fallback */
      }

      // Platform Audit Logging
      PlatformAuditService.recordAuditEvent({
        actor: nurseName,
        actorRole: "CLINICAL_NURSE",
        action: `Doctor Order Executed: #${targetOrder.orderId}`,
        category: "COMPLIANCE_EVENT",
        entity: `Patient ${targetOrder.patientName} (${targetOrder.ipdId})`,
        ipAddress: "192.168.1.105",
        riskLevel: "INFO",
        details: JSON.stringify({
          orderId: targetOrder.orderId,
          orderText: targetOrder.orderText,
          completedBy: nurseName,
          completedAt: ts,
        }),
      });
    }

    message.success(`Doctor Order #${orderId} completed & signed off! EMR timeline updated.`);
  };

  const openEscalateModal = (order: NurseDoctorOrder) => {
    setSelectedOrder(order);
    setEscalationReason("");
    setEscalateModalOpen(true);
  };

  const handleConfirmEscalation = () => {
    if (!selectedOrder) return;
    const reasonText = escalationReason.trim() || "Patient condition change or order execution delay";
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === selectedOrder.orderId
          ? {
              ...o,
              status: "ESCALATED",
              escalatedAt: ts,
              escalationReason: reasonText,
            }
          : o
      )
    );

    // Create High Priority Clinical Alert Notification
    useNotificationStore.getState().addNotification({
      title: `CRITICAL ESCALATION: Order #${selectedOrder.orderId}`,
      body: `Bed ${selectedOrder.bedNumber} (${selectedOrder.patientName}): ${reasonText}. Order: "${selectedOrder.orderText}"`,
      channel: "system",
      category: "ESCALATION",
      priority: "critical",
      status: "unread",
      tenantId: "TNT-9014",
      hospitalId: "HOSP-01",
      patientId: selectedOrder.patientUhid,
      patientName: selectedOrder.patientName,
    });

    // Audit Logging for Escalation Event
    PlatformAuditService.recordAuditEvent({
      actor: nurseName,
      actorRole: "CLINICAL_NURSE",
      action: `Doctor Order Escalated: #${selectedOrder.orderId}`,
      category: "COMPLIANCE_EVENT",
      entity: `Patient ${selectedOrder.patientName} (${selectedOrder.ipdId})`,
      ipAddress: "192.168.1.105",
      riskLevel: "CRITICAL",
      details: JSON.stringify({
        orderId: selectedOrder.orderId,
        orderText: selectedOrder.orderText,
        reason: reasonText,
        escalatedBy: nurseName,
        escalatedAt: ts,
      }),
    });

    message.warning(`Order #${selectedOrder.orderId} ESCALATED! Doctor STAT notification dispatched.`);
    setEscalateModalOpen(false);
  };

  const columns = [
    {
      title: "Bed & Patient",
      key: "patient",
      render: (_: unknown, record: NurseDoctorOrder) => (
        <div>
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {record.bedNumber}
          </span>
          <h4 className="font-bold text-slate-900 text-sm mt-1">{record.patientName}</h4>
          <p className="text-3xs text-slate-400 font-mono">UHID: {record.patientUhid} &bull; {record.ipdId}</p>
        </div>
      ),
    },
    {
      title: "Doctor Order Detail",
      key: "order",
      render: (_: unknown, record: NurseDoctorOrder) => (
        <div>
          <p className="font-semibold text-xs text-slate-900">{record.orderText}</p>
          <p className="text-3xs text-slate-400 font-mono mt-0.5">
            Ordered by: <strong className="text-slate-700">{record.doctorName}</strong> ({record.orderedAt})
          </p>
          {record.escalationReason && (
            <p className="text-3xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 mt-1">
              Escalated: {record.escalationReason}
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (p: NurseDoctorOrder["priority"]) => {
        if (p === "URGENT_STAT")
          return <Tag color="rose" className="font-bold text-3xs"><AlertTriangle className="w-3 h-3 inline mr-1" /> URGENT STAT</Tag>;
        if (p === "HIGH") return <Tag color="gold" className="font-bold text-3xs">HIGH PRIORITY</Tag>;
        return <Tag color="blue" className="font-bold text-3xs">ROUTINE</Tag>;
      },
    },
    {
      title: "Execution Status",
      key: "status",
      render: (_: unknown, record: NurseDoctorOrder) => {
        if (record.status === "COMPLETED") {
          return (
            <div>
              <Tag color="emerald" className="font-bold text-3xs"><CheckCircle2 className="w-3 h-3 inline mr-1" /> COMPLETED</Tag>
              <p className="text-3xs text-slate-400 font-mono mt-0.5">{record.completedAt} by {record.completedBy}</p>
            </div>
          );
        }
        if (record.status === "IN_PROGRESS") {
          return (
            <div>
              <Tag color="processing" className="font-bold text-3xs"><Clock className="w-3 h-3 inline mr-1 animate-spin" /> IN PROGRESS</Tag>
              <p className="text-3xs text-slate-500 font-mono mt-0.5">Nurse: {record.assignedNurse}</p>
            </div>
          );
        }
        if (record.status === "ESCALATED") {
          return (
            <div>
              <Tag color="error" className="font-bold text-3xs"><AlertOctagon className="w-3 h-3 inline mr-1" /> ESCALATED</Tag>
              <p className="text-3xs text-rose-500 font-mono mt-0.5">{record.escalatedAt}</p>
            </div>
          );
        }
        return <Tag color="orange" className="font-bold text-3xs">PENDING ACTION</Tag>;
      },
    },
    {
      title: "Workflow Execution",
      key: "action",
      render: (_: unknown, record: NurseDoctorOrder) => {
        if (record.status === "PENDING") {
          return (
            <div className="flex items-center gap-1.5">
              <HmsButton size="sm" variant="emerald" icon={<Play className="w-3 h-3" />} onClick={() => handleStartProgress(record.orderId)}>
                Start
              </HmsButton>
              <HmsButton size="sm" variant="danger" icon={<AlertOctagon className="w-3 h-3" />} onClick={() => openEscalateModal(record)}>
                Escalate
              </HmsButton>
            </div>
          );
        }
        if (record.status === "IN_PROGRESS") {
          return (
            <div className="flex items-center gap-1.5">
              <HmsButton size="sm" variant="emerald" icon={<Check className="w-3.5 h-3.5" />} onClick={() => handleCompleteOrder(record.orderId)}>
                Complete
              </HmsButton>
              <HmsButton size="sm" variant="danger" icon={<AlertOctagon className="w-3 h-3" />} onClick={() => openEscalateModal(record)}>
                Escalate
              </HmsButton>
            </div>
          );
        }
        if (record.status === "COMPLETED") {
          return (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> EMR Signed
            </span>
          );
        }
        return (
          <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" /> Doctor Alert Active
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" /> Doctor Clinical Orders & Nursing Worklist Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time execution workflow for doctor STAT orders. Full EMR timeline logging and doctor escalation notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tag color="orange" className="font-bold px-3 py-1 text-xs">
            {orders.filter((o) => o.status === "PENDING" || o.status === "IN_PROGRESS").length} Active Worklist Tasks
          </Tag>
          <Tag color="rose" className="font-bold px-3 py-1 text-xs">
            {orders.filter((o) => o.status === "ESCALATED").length} Escalated
          </Tag>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={orders} rowKey="orderId" pagination={false} />
      </div>

      {/* Escalation Reason Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <AlertOctagon className="w-5 h-5" />
            <span>Escalate Doctor Order to Attending Physician</span>
          </div>
        }
        open={escalateModalOpen}
        onCancel={() => setEscalateModalOpen(false)}
        onOk={handleConfirmEscalation}
        okText="Confirm & Trigger STAT Doctor Alert"
        okButtonProps={{ danger: true }}
      >
        {selectedOrder && (
          <div className="space-y-3 mt-2">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-slate-800 space-y-1">
              <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
              <p><strong>Patient:</strong> {selectedOrder.patientName} ({selectedOrder.bedNumber})</p>
              <p><strong>Order:</strong> {selectedOrder.orderText}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Escalation / Clinical Delay:</label>
              <Input.TextArea
                rows={3}
                placeholder="e.g. Patient allergic response, sudden drop in BP, or medication unavailable in pharmacy..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

