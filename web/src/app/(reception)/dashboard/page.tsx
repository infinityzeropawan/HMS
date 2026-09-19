"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Table, Tag, Input, Modal, message, Calendar as AntCalendar, Tabs, Tooltip } from "antd";
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
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { AppointmentBookingDrawer } from "../_reception_components/AppointmentBooking/AppointmentBookingDrawer";
import { RescheduleAppointmentModal } from "../_reception_components/AppointmentBooking/RescheduleAppointmentModal";
import { useAppointmentStore } from "../_reception_stores/appointment_store";
import { AppointmentService } from "../_reception_services/appointment_service";
import { HospitalAppointment } from "../_reception_types/appointment_types";
import { useI18n } from "@/i18n/_i18n_context/I18nContext";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import dayjs, { Dayjs } from "dayjs";

export default function ReceptionDashboard() {
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<HospitalAppointment | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlip, setSelectedSlip] = useState<HospitalAppointment | null>(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"LIST" | "CALENDAR" | "DOCTORS">("LIST");
  const { t } = useI18n();

  const { appointments, updateStatus, cancelAppointment } = useAppointmentStore();

  const handleCheckIn = (id: string) => {
    updateStatus(id, "IN_CONSULTATION");
    message.success("Patient status updated to IN CONSULTATION!");
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
    const res = AppointmentService.cancel(selectedAppointment.id, cancelReason || "Patient requested cancellation");
    if (res.success) {
      message.success(res.message);
      setCancelModalOpen(false);
    } else {
      message.error(res.message);
    }
  };

  const filteredAppointments = appointments.filter(
    (item) =>
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tokenNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
      render: (val: string, record: HospitalAppointment) => (
        <div>
          <strong className="text-slate-900 block">{val}</strong>
          <span className="text-[11px] text-slate-500">{record.ageGender}</span>
        </div>
      ),
    },
    {
      title: "Doctor & Room",
      key: "doctorName",
      render: (_: unknown, record: HospitalAppointment) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">{record.doctorName}</span>
          <span className="text-[11px] text-purple-700 font-mono">{record.departmentName} ({record.opdRoom})</span>
        </div>
      ),
    },
    {
      title: "Slot & Date",
      key: "slot",
      render: (_: unknown, record: HospitalAppointment) => (
        <div>
          <span className="font-medium text-slate-800 block text-xs">{record.slot}</span>
          <span className="text-[11px] text-slate-500 font-mono">{record.date}</span>
        </div>
      ),
    },
    {
      title: t.status || "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          WAITING: "orange",
          IN_CONSULTATION: "green",
          COMPLETED: "blue",
          CANCELLED: "red",
          RESCHEDULED: "purple",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: HospitalAppointment) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {record.status === "WAITING" && (
            <HmsButton
              size="sm"
              variant="emerald"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => handleCheckIn(record.id)}
            >
              Call In
            </HmsButton>
          )}
          <HmsButton
            size="sm"
            variant="secondary"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => handlePrintSlip(record)}
          >
            Slip
          </HmsButton>
          {record.status !== "CANCELLED" && (
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
      ),
    },
  ];

  // Calendar Cell Renderer
  const dateCellRender = (value: Dayjs) => {
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

  const doctorList = [
    { id: "DOC-101", name: "Dr. Rajesh Sharma", dept: "Cardiology", room: "OPD 3" },
    { id: "DOC-102", name: "Dr. Priya Nair", dept: "Orthopedics", room: "OPD 1" },
    { id: "DOC-103", name: "Dr. Vikram Seth", dept: "General Medicine", room: "OPD 5" },
    { id: "DOC-104", name: "Dr. Ananya Ray", dept: "Pediatrics", room: "OPD 2" },
  ];

  return (
    <HmsAppShell title="Reception & OPD Desk Console">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner Header & Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">OPD Patient Registration & Queue Dispatch</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Real-time OPD Token Queue, Appointments & Patient Desk</p>
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
              <p className="text-xs text-slate-500">Demographics, Vitals & ABHA Link</p>
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
              <p className="text-xs text-slate-500">Inter-Hospital Ambulance & Referrals</p>
            </div>
          </Link>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Today&apos;s OPD Queue Total</p>
                <h3 className="text-2xl font-bold text-teal-700 mt-1">{appointments.length} Patients</h3>
              </div>
              <Users className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Waiting in OPD</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">
                  {appointments.filter((q) => q.status === "WAITING").length} Waiting
                </h3>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </HmsCard>

          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">In Consultation</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  {appointments.filter((q) => q.status === "IN_CONSULTATION").length} Active
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
              <div className="flex justify-end">
                <Input
                  prefix={<Search className="w-4 h-4 text-slate-400" />}
                  placeholder="Search Token, Patient, UHID, Doctor, or Department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80"
                  allowClear
                />
              </div>
              <Table columns={columns} dataSource={filteredAppointments} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: true }} />
            </div>
          )}

          {/* Tab Content: Calendar View */}
          {activeTab === "CALENDAR" && (
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="p-3 bg-white rounded-lg border border-slate-200 mb-3 text-xs text-slate-600 flex items-center justify-between">
                <span>Interactive Calendar View — Click cells to review scheduled OPD consultations per day.</span>
                <Tag color="blue">Total Booked: {appointments.length}</Tag>
              </div>
              <AntCalendar dateCellRender={dateCellRender} className="bg-white p-2 rounded-lg" />
            </div>
          )}

          {/* Tab Content: Doctor Availability View */}
          {activeTab === "DOCTORS" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctorList.map((doc) => {
                const today = new Date().toISOString().split("T")[0];
                const avail = AppointmentService.checkDoctorAvailability(doc.id, today);
                const docApps = appointments.filter((a) => a.doctorId === doc.id);

                return (
                  <div key={doc.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-100 text-teal-800 rounded-lg font-bold">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                          <p className="text-xs text-slate-500">{doc.dept} • {doc.room}</p>
                        </div>
                      </div>
                      <Tag color={avail.available ? "green" : "volcano"}>
                        {avail.available ? "AVAILABLE" : "ON LEAVE / OFF"}
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
                      <span className="font-mono text-teal-700">Next Slot: 10:30 AM</span>
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
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer mr-2"
              >
                Close
              </button>,
              <button
                key="print"
                onClick={() => {
                  message.success(`Token slip for ${selectedSlip.tokenNo} sent to thermal receipt printer!`);
                  setSlipModalOpen(false);
                }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                🖨 Print Thermal Receipt
              </button>,
            ]}
            width={440}
          >
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl my-3 space-y-3 font-mono text-xs">
              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5">
                <h3 className="font-bold text-slate-900 text-sm uppercase">HMS MEDICAL CENTER</h3>
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
                  <span>Specialist Doctor:</span>
                  <strong className="text-purple-800">{selectedSlip.doctorName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Consultation Room:</span>
                  <span className="font-bold text-teal-700">{selectedSlip.opdRoom}</span>
                </div>
                <div className="flex justify-between">
                  <span>Appt Time Slot:</span>
                  <span>{selectedSlip.date} at {selectedSlip.slot}</span>
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

