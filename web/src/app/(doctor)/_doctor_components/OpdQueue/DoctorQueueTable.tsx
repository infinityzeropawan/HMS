"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag, Badge, message } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { Stethoscope, PhoneCall, CheckCircle, XCircle, Clock, User } from "lucide-react";
import { useAppointmentStore } from "@/app/(reception)/_reception_stores/appointment_store";
import { DoctorWorkspaceService } from "../../_doctor_services/doctor_workspace_service";
import { EmrService } from "@/app/(patient)/_patient_services/emr_service";
import { PatientRegistryService } from "@/app/(reception)/_reception_services/patient_registry_service";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";
import { todayLocalDate } from "@/app/(reception)/_reception_utils/date_utils";

export type QueueStatus = "WAITING" | "CALLING" | "CONSULTING" | "COMPLETED" | "NO_SHOW";

export interface QueuePatient {
  key: string;
  tokenNo: string;
  uhid: string;
  name: string;
  ageGender: string;
  vitals: string;
  status: QueueStatus;
  waitMins: number;
}

const STATUS_COLORS: Record<QueueStatus, string> = {
  WAITING: "orange",
  CALLING: "blue",
  CONSULTING: "green",
  COMPLETED: "default",
  NO_SHOW: "red",
};

interface DoctorQueueTableProps {
  onQueueChange?: (waiting: number, completed: number) => void;
}

export const DoctorQueueTable: React.FC<DoctorQueueTableProps> = ({ onQueueChange }) => {
  const storeAppointments = useAppointmentStore((s) => s.appointments);
  const updateStoreStatus = useAppointmentStore((s) => s.updateStatus);
  const user = useAuthUserStore((s) => s.user);

  const [queue, setQueue] = useState<QueuePatient[]>([]);

  // Load and synchronize queue directly from useAppointmentStore
  useEffect(() => {
    if (!storeAppointments || storeAppointments.length === 0) {
      setQueue([]);
      return;
    }

    const today = todayLocalDate();
    // Filter for today's appointments (or fallback if all in demo are for today)
    const todayAppointments = storeAppointments.filter((a) => !a.date || a.date === today);
    const targetAppointments = todayAppointments.length > 0 ? todayAppointments : storeAppointments;

    const mapped: QueuePatient[] = targetAppointments.map((a, idx) => {
      let qStatus: QueueStatus = "WAITING";
      if (a.status === "IN_CONSULTATION") qStatus = "CONSULTING";
      else if (a.status === "COMPLETED") qStatus = "COMPLETED";
      else if (a.status === "CANCELLED") qStatus = "NO_SHOW";
      else if (a.status === "WAITING" || a.status === "RESCHEDULED") qStatus = "WAITING";

      const patientRecord = PatientRegistryService.findByUhid(a.uhid);
      let vitalsStr = "BP: 120/80 | Temp: 98.6°F | SpO₂: 98%";
      if (patientRecord && (patientRecord.systolicBp || patientRecord.temperatureF)) {
        const bp = patientRecord.systolicBp ? `${patientRecord.systolicBp}/${patientRecord.diastolicBp || 80}` : "120/80";
        const temp = patientRecord.temperatureF ? `${patientRecord.temperatureF}°F` : "98.6°F";
        const spo2 = patientRecord.spo2 ? `${patientRecord.spo2}%` : "98%";
        vitalsStr = `BP: ${bp} | Temp: ${temp} | SpO₂: ${spo2}`;
      }

      return {
        key: a.id || `q-${idx}`,
        tokenNo: a.tokenNo || `T-${String(idx + 1).padStart(2, "0")}`,
        uhid: a.uhid,
        name: a.patientName,
        ageGender: a.ageGender || (patientRecord ? PatientRegistryService.toAgeGender(patientRecord) : "45 / Male"),
        vitals: vitalsStr,
        status: qStatus,
        waitMins: 10 + (idx * 5),
      };
    });

    setQueue(mapped);
  }, [storeAppointments]);

  useEffect(() => {
    const waiting = queue.filter((p) => p.status === "WAITING" || p.status === "CALLING").length;
    const completed = queue.filter((p) => p.status === "COMPLETED").length;
    onQueueChange?.(waiting, completed);
  }, [queue, onQueueChange]);

  useEffect(() => {
    const handleCallNextEvent = () => {
      setQueue((prev) => {
        const nextWaiting = prev.find((p) => p.status === "WAITING");
        if (!nextWaiting) {
          message.info("No waiting patients left in queue!");
          return prev;
        }
        message.info({ content: `📢 Calling Token ${nextWaiting.tokenNo} — ${nextWaiting.name} to OPD Room 3`, duration: 3 });
        return prev.map((p) => (p.key === nextWaiting.key ? { ...p, status: "CALLING" } : p));
      });
    };

    window.addEventListener("hms_call_next_patient", handleCallNextEvent);
    return () => window.removeEventListener("hms_call_next_patient", handleCallNextEvent);
  }, []);

  const handleUpdateStatus = (key: string, newStatus: QueueStatus) => {
    const target = queue.find((p) => p.key === key);
    if (!target) return;

    // Map QueueStatus to AppointmentStatus
    let appStatus: "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED" | "RESCHEDULED" = "WAITING";
    if (newStatus === "CONSULTING") appStatus = "IN_CONSULTATION";
    else if (newStatus === "COMPLETED") appStatus = "COMPLETED";
    else if (newStatus === "NO_SHOW") appStatus = "CANCELLED";
    else if (newStatus === "CALLING" || newStatus === "WAITING") appStatus = "WAITING";

    // 1. Update Appointment Store
    updateStoreStatus(target.key, appStatus);

    // 2. Synchronize Encounter completion if COMPLETED
    if (newStatus === "COMPLETED") {
      DoctorWorkspaceService.signAndLockEncounter(target.uhid);
      message.success(`Consultation completed for ${target.name}. EMR timeline & queues synchronized.`);
    }

    // Update local UI queue
    setQueue((prev) => prev.map((p) => (p.key === key ? { ...p, status: newStatus } : p)));
  };

  const handleCall = (record: QueuePatient) => {
    handleUpdateStatus(record.key, "CALLING");
    message.info({ content: `📢 Calling Token ${record.tokenNo} — ${record.name} to OPD Room 3`, duration: 3 });
  };

  const handleNoShow = (record: QueuePatient) => {
    handleUpdateStatus(record.key, "NO_SHOW");
    message.warning(`${record.name} marked as No-Show.`);
  };

  const handleComplete = (key: string) => {
    handleUpdateStatus(key, "COMPLETED");
  };

  const columns = [
    {
      title: "Token #",
      dataIndex: "tokenNo",
      key: "tokenNo",
      render: (t: string) => <span className="font-bold text-teal-700 text-base">{t}</span>,
    },
    { title: "UHID", dataIndex: "uhid", key: "uhid", render: (v: string) => <span className="font-mono text-xs text-slate-500">{v}</span> },
    { title: "Patient Name", dataIndex: "name", key: "name", render: (v: string) => <span className="font-semibold text-slate-800">{v}</span> },
    { title: "Age / Sex", dataIndex: "ageGender", key: "ageGender" },
    {
      title: "Vitals",
      dataIndex: "vitals",
      key: "vitals",
      render: (v: string) => <span className="text-xs text-slate-500">{v}</span>,
    },
    {
      title: "Wait",
      dataIndex: "waitMins",
      key: "waitMins",
      render: (m: number, r: QueuePatient) =>
        r.status === "WAITING" || r.status === "CALLING" ? (
          <span className={`text-xs font-medium ${m > 30 ? "text-rose-600" : "text-amber-600"}`}>
            <Clock className="w-3 h-3 inline mr-0.5" />
            {m}m
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: QueueStatus) => (
        <Badge color={STATUS_COLORS[s] === "default" ? "grey" : STATUS_COLORS[s]}>
          <Tag color={STATUS_COLORS[s]}>{s}</Tag>
        </Badge>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_: unknown, record: QueuePatient) => {
        if (record.status === "COMPLETED" || record.status === "NO_SHOW") {
          return <span className="text-xs text-slate-400">{record.status === "COMPLETED" ? "✓ Done" : "✗ No-Show"}</span>;
        }
        if (record.status === "CONSULTING") {
          return (
            <HmsButton size="sm" variant="emerald" icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => handleComplete(record.key)}>
              Complete
            </HmsButton>
          );
        }
        if (record.status === "CALLING") {
          return (
            <div className="flex gap-1.5 flex-wrap">
              <HmsButton
                href={`/encounter/${record.uhid}`}
                size="sm"
                variant="primary"
                icon={<Stethoscope className="w-3.5 h-3.5" />}
                onClick={() => handleUpdateStatus(record.key, "CONSULTING")}
              >
                Start
              </HmsButton>
              <HmsButton size="sm" variant="danger" icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => handleNoShow(record)}>
                No-Show
              </HmsButton>
            </div>
          );
        }
        return (
          <HmsButton size="sm" variant="secondary" icon={<PhoneCall className="w-3.5 h-3.5" />} onClick={() => handleCall(record)}>
            Call
          </HmsButton>
        );
      },
    },
  ];

  const activeRows = queue.filter((p) => p.status !== "COMPLETED" && p.status !== "NO_SHOW");
  const doneRows = queue.filter((p) => p.status === "COMPLETED" || p.status === "NO_SHOW");

  return (
    <div className="space-y-4">
      {/* Smartphone Mobile Cards Layout */}
      <div className="block sm:hidden space-y-3">
        {activeRows.map((patient) => (
          <div
            key={patient.key}
            className={`p-4 rounded-xl border shadow-xs space-y-2 ${
              patient.status === "CALLING"
                ? "bg-blue-50/80 border-blue-200"
                : patient.status === "CONSULTING"
                ? "bg-emerald-50/80 border-emerald-200"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-teal-700">{patient.tokenNo}</span>
                <Tag color={STATUS_COLORS[patient.status]}>{patient.status}</Tag>
              </div>
              <span className="text-xs font-mono text-slate-500">{patient.uhid}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                {patient.name} ({patient.ageGender})
              </div>
              <span className="text-xs text-amber-600 font-medium flex items-center gap-0.5">
                <Clock className="w-3.5 h-3.5" /> {patient.waitMins}m
              </span>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">{patient.vitals}</div>
            <div className="pt-2 flex gap-2">
              {patient.status === "WAITING" && (
                <HmsButton size="lg" fullWidth variant="secondary" icon={<PhoneCall className="w-4 h-4" />} onClick={() => handleCall(patient)}>
                  Call Patient
                </HmsButton>
              )}
              {patient.status === "CALLING" && (
                <>
                  <HmsButton
                    href={`/encounter/${patient.uhid}`}
                    className="flex-1"
                    size="lg"
                    fullWidth
                    variant="primary"
                    icon={<Stethoscope className="w-4 h-4" />}
                    onClick={() => handleUpdateStatus(patient.key, "CONSULTING")}
                  >
                    Start
                  </HmsButton>
                  <HmsButton size="lg" variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={() => handleNoShow(patient)}>
                    No-Show
                  </HmsButton>
                </>
              )}
              {patient.status === "CONSULTING" && (
                <HmsButton size="lg" fullWidth variant="emerald" icon={<CheckCircle className="w-4 h-4" />} onClick={() => handleComplete(patient.key)}>
                  Complete Consultation
                </HmsButton>
              )}
            </div>
          </div>
        ))}
        {activeRows.length === 0 && (
          <div className="p-6 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
            ✓ All patients seen for today
          </div>
        )}
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <Table
          columns={columns}
          dataSource={activeRows}
          pagination={false}
          rowKey="key"
          rowClassName={(r) => (r.status === "CALLING" ? "bg-blue-50" : r.status === "CONSULTING" ? "bg-green-50" : "")}
          locale={{ emptyText: "✓ All patients seen for today" }}
        />
      </div>

      {doneRows.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-slate-400 cursor-pointer select-none hover:text-slate-600 font-medium">
            {doneRows.length} completed / no-show today ▸
          </summary>
          <div className="overflow-x-auto mt-2">
            <Table
              columns={columns.filter((c) => ["tokenNo", "name", "status", "action"].includes(c.key as string))}
              dataSource={doneRows}
              pagination={false}
              rowKey="key"
              size="small"
              className="opacity-60"
            />
          </div>
        </details>
      )}
    </div>
  );
};
