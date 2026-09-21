"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Table, Tag, Input, Modal, message, Calendar as AntCalendar, Tabs, Tooltip, Segmented } from "antd";
import {
  UserPlus,
  Calendar as CalendarIcon,
  Search,
  Users,
  Activity,
  Clock,
  Ticket,
  CheckCircle2,
  Printer,
  Building2,
  Smartphone,
  RefreshCw,
  XCircle,
  List,
  Stethoscope,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { AppointmentBookingDrawer } from "../_reception_components/AppointmentBooking/AppointmentBookingDrawer";
import { RescheduleAppointmentModal } from "../_reception_components/AppointmentBooking/RescheduleAppointmentModal";
import { PatientDispositionModal } from "../_reception_components/Disposition/PatientDispositionModal";
import { useAppointmentStore } from "../_reception_stores/appointment_store";
import { useReceptionVisitStore } from "../_reception_stores/reception_visit_store";
import { AppointmentService } from "../_reception_services/appointment_service";
import { ReceptionDoctorService } from "../_reception_services/reception_doctor_service";
import { HospitalAppointment } from "../_reception_types/appointment_types";
import {
  DISPOSITION_COLORS,
  ReceptionVisit,
  TRIAGE_PRIORITY_COLORS,
  TRIAGE_PRIORITY_LABELS,
} from "../_reception_types/visit_types";
import { useI18n } from "@/i18n/_i18n_context/I18nContext";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";
import type { Dayjs } from "dayjs";
import { formatDisplayDate, todayLocalDate } from "../_reception_utils/date_utils";

type QueueScope = "TODAY" | "UPCOMING" | "ALL";

const STATUS_COLORS: Record<string, string> = {
  WAITING: "orange",
  IN_CONSULTATION: "green",
  COMPLETED: "blue",
  CANCELLED: "red",
  RESCHEDULED: "purple",
};

export default function ReceptionDashboard() {
  const { t } = useI18n();
  const hospitalName = useAuthUserStore((s) => s.user?.hospitalName) || "HMS Medical Center";

  const appointments = useAppointmentStore((s) => s.appointments);
  const visits = useReceptionVisitStore((s) => s.visits);

  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<HospitalAppointment | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlip, setSelectedSlip] = useState<HospitalAppointment | null>(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"LIST" | "CALENDAR" | "DOCTORS">("LIST");
  const [queueScope, setQueueScope] = useState<QueueScope>("TODAY");
  const [dispositionTarget, setDispositionTarget] = useState<HospitalAppointment | null>(null);
  const [dispositionModalOpen, setDispositionModalOpen] = useState(false);

  const today = todayLocalDate();

  // Date-scoped queues: previously every appointment ever booked was counted as "today".
  const todayAppointments = useMemo(
    () => appointments.filter((a) => a.date === today),
    [appointments, today]
  );
  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.date > today),
    [appointments, today]
  );
  const scopedAppointments =
    queueScope === "TODAY"
      ? todayAppointments
      : queueScope === "UPCOMING"
        ? upcomingAppointments
        : appointments;

  // Latest triage visit per patient (drives the OPD vs IPD decision tags)
  const visitByUhid = useMemo(() => {
    const map = new Map<string, ReceptionVisit>();
    visits.forEach((visit) => {
      if (!map.has(visit.uhid)) map.set(visit.uhid, visit);
    });
    return map;
  }, [visits]);

  const handleCheckIn = (appointment: HospitalAppointment) => {
    const res = AppointmentService.callPatientIn(appointment.id);
    if (res.success) {
      message.success(res.message);
    } else {
      message.error(res.message);
    }
  };

  const handlePrintSlip = (app: HospitalAppointment) => {
    setSelectedSlip(app);
    setSlipModalOpen(true);
  };

  const handleOpenReschedule = (app: HospitalAppointment) => {
    setSelectedAppointment(app);
    setRescheduleModalOpen(true);
  };

  const handleOpenCancel = (app: HospitalAppointment) => {
    setSelectedAppointment(app);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedAppointment) return;
    const res = AppointmentService.cancel(
      selectedAppointment.id,
      cancelReason || "Patient requested cancellation"
    );
    if (res.success) {
      message.success(res.message);
      setCancelModalOpen(false);
    } else {
      message.error(res.message);
    }
  };

  const handlePrintSlipNow = () => {
    if (!selectedSlip) return;
    try {
      window.print();
      message.success(`Token slip ${selectedSlip.tokenNo} sent to the printer.`);
    } catch {
      message.error("Printing is not available in this browser context.");
    }
  };

  const filteredAppointments = scopedAppointments.filter((item) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      item.patientName.toLowerCase().includes(query) ||
      item.uhid.toLowerCase().includes(query) ||
      item.tokenNo.toLowerCase().includes(query) ||
      item.doctorName.toLowerCase().includes(query) ||
      item.departmentName.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      title: "Token #",
      dataIndex: "tokenNo",
      key: "tokenNo",
      render: (val: string) => (
        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
          {val}
        </span>
      ),
    },
    {
      title: "UHID",
      dataIndex: "uhid",
      key: "uhid",
      render: (val: string) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      title: "Patient & Triage",
      dataIndex: "patientName",
      key: "patientName",
      render: (val: string, record: HospitalAppointment) => {
        const visit = visitByUhid.get(record.uhid);
        return (
          <div>
            <strong className="text-slate-900 block">{val}</strong>
            <span className="text-[11px] text-slate-500">{record.ageGender}</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {visit && (
                <Tag color={TRIAGE_PRIORITY_COLORS[visit.triagePriority]} className="text-3xs m-0">
                  {TRIAGE_PRIORITY_LABELS[visit.triagePriority].split("·")[0].trim()}
                </Tag>
              )}
              {visit && visit.disposition !== "PENDING" && (
                <Tag color={DISPOSITION_COLORS[visit.disposition]} className="text-3xs m-0">
                  {visit.disposition === "IPD_ADMITTED"
                    ? `IPD ${visit.ipdBedNumber || ""}`
                    : visit.disposition}
                </Tag>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Doctor & Room",
      key: "doctorName",
      render: (_: unknown, record: HospitalAppointment) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">{record.doctorName}</span>
          <span className="text-[11px] text-purple-700 font-mono">
            {record.departmentCode} ({record.opdRoom})
          </span>
        </div>
      ),
    },
    {
      title: "Slot & Date",
      key: "slot",
      render: (_: unknown, record: HospitalAppointment) => (
        <div>
          <span className="font-medium text-slate-800 block text-xs">{record.slot}</span>
          <span className="text-[11px] text-slate-500 font-mono">{formatDisplayDate(record.date)}</span>
        </div>
      ),
    },
    {
      title: t.status || "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={STATUS_COLORS[status] || "default"}>{status}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: HospitalAppointment) => {
        const isToday = record.date === today;
        const visit = visitByUhid.get(record.uhid);
        const alreadyAdmitted = visit?.disposition === "IPD_ADMITTED";

        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {isToday && record.status === "WAITING" && (
              <HmsButton
                size="sm"
                variant="emerald"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => handleCheckIn(record)}
              >
                Call In
              </HmsButton>
            )}
            {record.status !== "CANCELLED" && record.status !== "COMPLETED" && !alreadyAdmitted && (
              <Tooltip title="Record OPD vs IPD decision">
                <HmsButton
                  size="sm"
                  variant="secondary"
                  icon={<ClipboardList className="w-3.5 h-3.5 text-purple-600" />}
                  onClick={() => {
                    setDispositionTarget(record);
                    setDispositionModalOpen(true);
                  }}
                >
                  Disposition
                </HmsButton>
              </Tooltip>
            )}
            <HmsButton
              size="sm"
              variant="secondary"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => handlePrintSlip(record)}
            >
              Slip
            </HmsButton>
            {record.status !== "CANCELLED" && record.status !== "COMPLETED" && (
              <>
                <Tooltip title="Reschedule Appointment">
                  <HmsButton
                    size="sm"
                    variant="secondary"
                    icon={<RefreshCw className="w-3.5 h-3.5 text-amber-600" />}
                    onClick={() => handleOpenReschedule(record)}
                  />
                </Tooltip>
                <Tooltip title="Cancel Appointment">
                  <HmsButton
                    size="sm"
                    variant="danger"
                    icon={<XCircle className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenCancel(record)}
                  />
                </Tooltip>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // Calendar cell renderer (antd 5 `cellRender`; `dateCellRender` is deprecated)
  const cellRender = (value: Dayjs, info: { type: string }) => {
    if (info.type !== "date") return null;
    const dateStr = value.format("YYYY-MM-DD");
    const dayApps = appointments.filter((a) => a.date === dateStr);
    if (dayApps.length === 0) return null;

    return (
      <ul className="m-0 p-0 list-none space-y-1 overflow-hidden">
        {dayApps.slice(0, 3).map((app) => (
          <li key={app.id} className="text-[10px] leading-tight p-0.5 rounded bg-teal-50 border border-teal-200 text-teal-900 truncate">
            <span className="font-bold font-mono mr-1">{app.tokenNo}</span>
            {app.patientName.split(" ")[0]} ({app.slot})
          </li>
        ))}
        {dayApps.length > 3 && (
          <li className="text-[9px] text-slate-500 font-semibold">+ {dayApps.length - 3} more</li>
        )}
      </ul>
    );
  };

  // Doctor availability is sourced from the staff master (single doctor master, no duplicates).
  const doctors = ReceptionDoctorService.getDoctors();

  return (
    <HmsAppShell title="Reception & OPD Desk Console">
      <div className="max-w-7xl mx-auto space-y-6 print:hidden">
        {/* Banner Header & Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">OPD Patient Registration & Queue Dispatch</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Entry point of the hospital: register, triage, issue the OPD token and record the OPD vs IPD decision
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            <HmsButton href="/patients/register" variant="emerald" size="md" icon={<UserPlus className="w-4 h-4" />}>
              Register New Patient
            </HmsButton>
            <HmsButton
              variant="primary"
              size="md"
              icon={<CalendarIcon className="w-4 h-4" />}
              onClick={() => setBookingDrawerOpen(true)}
            >
              Book OPD Appointment
            </HmsButton>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/patients/register"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Patient Registration</h3>
              <p className="text-xs text-slate-500">Demographics, Triage Vitals &amp; Priority</p>
            </div>
          </Link>

          <Link
            href="/checkin"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className="p-3 bg-teal-100 text-teal-700 rounded-lg group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Self-Checkin Kiosk</h3>
              <p className="text-xs text-slate-500">QR / Token Kiosk Terminal</p>
            </div>
          </Link>

          <Link
            href="/transfers"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className="p-3 bg-purple-100 text-purple-700 rounded-lg group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Branch Patient Transfers</h3>
              <p className="text-xs text-slate-500">Inter-Hospital Ambulance &amp; Referrals</p>
            </div>
          </Link>
        </div>


        {/* KPI Counter Cards — scoped to today's OPD (previously counted every booking ever made) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Today&apos;s OPD Queue ({formatDisplayDate(today)})</p>
                <h3 className="text-2xl font-bold text-teal-700 mt-1">{todayAppointments.length} Patients</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{upcomingAppointments.length} upcoming bookings</p>
              </div>
              <Users className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Waiting in OPD Today</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">
                  {todayAppointments.filter((q) => q.status === "WAITING").length} Waiting
                </h3>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </HmsCard>

          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">In Consultation Today</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  {todayAppointments.filter((q) => q.status === "IN_CONSULTATION").length} Active
                </h3>
              </div>
              <Activity className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>
        </div>

        {/* Console Mode View Switcher */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-teal-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">OPD Queue & Appointments Console</h2>
            </div>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as "LIST" | "CALENDAR" | "DOCTORS")}
              items={[
                { key: "LIST", label: <span className="flex items-center gap-1.5"><List className="w-4 h-4" /> List View</span> },
                { key: "CALENDAR", label: <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> OPD Calendar</span> },
                { key: "DOCTORS", label: <span className="flex items-center gap-1.5"><Stethoscope className="w-4 h-4" /> Doctor Availability</span> },
              ]}
            />
          </div>

          {/* Tab Content: List View */}
          {activeTab === "LIST" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <Segmented
                  value={queueScope}
                  onChange={(value) => setQueueScope(value as QueueScope)}
                  options={[
                    { value: "TODAY", label: `Today (${todayAppointments.length})` },
                    { value: "UPCOMING", label: `Upcoming (${upcomingAppointments.length})` },
                    { value: "ALL", label: `All (${appointments.length})` },
                  ]}
                />
                <Input
                  prefix={<Search className="w-4 h-4 text-slate-400" />}
                  placeholder="Search Token, Patient, UHID, Doctor, or Department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80"
                  allowClear
                />
              </div>
              <Table
                columns={columns}
                dataSource={filteredAppointments}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
              />
            </div>
          )}

          {/* Tab Content: Calendar View */}
          {activeTab === "CALENDAR" && (
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="p-3 bg-white rounded-lg border border-slate-200 mb-3 text-xs text-slate-600 flex items-center justify-between">
                <span>Interactive Calendar View — Click cells to review scheduled OPD consultations per day.</span>
                <Tag color="blue">Total Booked: {appointments.length}</Tag>
              </div>
              <AntCalendar cellRender={cellRender} className="bg-white p-2 rounded-lg" />
            </div>
          )}


          {/* Tab Content: Doctor Availability View (sourced from the staff master) */}
          {activeTab === "DOCTORS" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => {
                const avail = AppointmentService.checkDoctorAvailability(doc.id, today);
                const docApps = todayAppointments.filter((a) => a.doctorId === doc.id);

                return (
                  <div key={doc.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-100 text-teal-800 rounded-lg font-bold">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                          <p className="text-xs text-slate-500">{doc.departmentName} • {doc.room}</p>
                        </div>
                      </div>
                      <Tag color={avail.available ? "green" : "volcano"}>
                        {avail.available ? "AVAILABLE" : "NOT AVAILABLE"}
                      </Tag>
                    </div>

                    {!avail.available && (
                      <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{avail.reason}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>Scheduled Today: <strong>{docApps.length} Patients</strong></span>
                      <span className="font-mono text-teal-700">Next Slot: {docApps[0]?.slot || "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* Appointment Booking Drawer */}
        <AppointmentBookingDrawer
          open={bookingDrawerOpen}
          onClose={() => setBookingDrawerOpen(false)}
        />

        {/* OPD vs IPD Disposition Modal */}
        <PatientDispositionModal
          appointment={dispositionTarget}
          open={dispositionModalOpen}
          onClose={() => setDispositionModalOpen(false)}
        />

        {/* Reschedule Modal */}
        <RescheduleAppointmentModal
          appointment={selectedAppointment}
          open={rescheduleModalOpen}
          onClose={() => setRescheduleModalOpen(false)}
        />

        {/* Cancel Appointment Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-rose-700 font-bold">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Cancel Appointment ({selectedAppointment?.tokenNo})</span>
            </div>
          }
          open={cancelModalOpen}
          onCancel={() => setCancelModalOpen(false)}
          onOk={handleConfirmCancel}
          okText="Cancel Appointment"
          okButtonProps={{ danger: true }}
          destroyOnClose
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600">
              Are you sure you want to cancel the appointment for <strong>{selectedAppointment?.patientName}</strong> with <strong>{selectedAppointment?.doctorName}</strong>?
            </p>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason for Cancellation:</label>
              <Input.TextArea
                rows={3}
                placeholder="Enter cancellation reason (e.g., Patient requested cancellation, Doctor unavailable)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
        </Modal>


        {/* Print OPD Token Slip Modal */}
        {selectedSlip && (
          <Modal
            title={
              <div className="flex items-center gap-2 text-teal-700 font-bold border-b pb-2">
                <Ticket className="w-5 h-5 text-teal-600" />
                <span>OPD Consultation Token Slip</span>
              </div>
            }
            open={slipModalOpen}
            onCancel={() => setSlipModalOpen(false)}
            footer={[
              <button
                key="close"
                onClick={() => setSlipModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer mr-2 print:hidden"
              >
                Close
              </button>,
              <button
                key="print"
                onClick={handlePrintSlipNow}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs cursor-pointer print:hidden"
              >
                🖨 Print Token Slip
              </button>,
            ]}
            width={440}
          >
            <div id="hms-opd-token-slip" className="p-4 bg-slate-50 border border-slate-200 rounded-xl my-3 space-y-3 font-mono text-xs">
              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5">
                <h3 className="font-bold text-slate-900 text-sm uppercase">{hospitalName}</h3>
                <p className="text-[11px] text-slate-500">OPD Consultation Queue Slip</p>
                <p className="text-[10px] text-slate-400">{new Date().toLocaleString()}</p>
              </div>

              <div className="text-center py-2 bg-teal-100/70 border border-teal-300 rounded-lg">
                <span className="text-xs text-teal-800 uppercase block font-sans">Token Sequence</span>
                <span className="text-3xl font-black text-teal-900">{selectedSlip.tokenNo}</span>
              </div>

              <div className="space-y-1 text-slate-700 pt-1">
                <div className="flex justify-between">
                  <span>Patient Name:</span>
                  <strong className="text-slate-900">{selectedSlip.patientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>UHID:</span>
                  <span>{selectedSlip.uhid}</span>
                </div>
                <div className="flex justify-between">
                  <span>Age / Gender:</span>
                  <span>{selectedSlip.ageGender}</span>
                </div>
                <div className="flex justify-between">
                  <span>Specialist Doctor:</span>
                  <strong className="text-purple-800">{selectedSlip.doctorName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Consultation Room:</span>
                  <span className="font-bold text-teal-700">{selectedSlip.opdRoom}</span>
                </div>
                <div className="flex justify-between">
                  <span>Appt Time Slot:</span>
                  <span>{formatDisplayDate(selectedSlip.date)} at {selectedSlip.slot}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 border-t border-dashed border-slate-300 pt-2 font-sans">
                Please wait in front of {selectedSlip.opdRoom} display monitor when your token is announced.
              </div>
            </div>
          </Modal>
        )}
      </div>
    </HmsAppShell>
  );
}

