"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Tag, Input, Modal, message, Space } from "antd";
import { UserPlus, Calendar, Search, Users, Activity, Clock, Ticket, CheckCircle2, Printer, Building2, Smartphone } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { AppointmentBookingDrawer } from "../_reception_components/AppointmentBooking/AppointmentBookingDrawer";
import { useI18n } from "@/i18n/_i18n_context/I18nContext";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

interface AppointmentRecord {
  key: string;
  tokenNo: string;
  uhid: string;
  name: string;
  ageGender: string;
  doctor: string;
  opdRoom: string;
  slot: string;
  status: "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED";
}

const INITIAL_QUEUE: AppointmentRecord[] = [
  { key: "1", tokenNo: "T-01", uhid: "P-2026-1049", name: "Sunil Verma", ageGender: "45 / Male", doctor: "Dr. Rajesh Sharma", opdRoom: "OPD 3", slot: "10:30 AM", status: "WAITING" },
  { key: "2", tokenNo: "T-02", uhid: "P-2026-1052", name: "Anjali Gupta", ageGender: "32 / Female", doctor: "Dr. Priya Nair", opdRoom: "OPD 1", slot: "10:45 AM", status: "IN_CONSULTATION" },
  { key: "3", tokenNo: "T-03", uhid: "P-2026-1058", name: "Ramesh Kumar", ageGender: "58 / Male", doctor: "Dr. Rajesh Sharma", opdRoom: "OPD 3", slot: "11:00 AM", status: "WAITING" },
  { key: "4", tokenNo: "T-04", uhid: "P-2026-1065", name: "Meena Joshi", ageGender: "29 / Female", doctor: "Dr. Ananya Roy", opdRoom: "OPD 5", slot: "11:15 AM", status: "WAITING" },
];

export default function ReceptionDashboard() {
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [queueData, setQueueData] = useState<AppointmentRecord[]>(INITIAL_QUEUE);
  const [selectedSlip, setSelectedSlip] = useState<AppointmentRecord | null>(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const { t } = useI18n();

  const loadAppointments = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_appointments");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped: AppointmentRecord[] = list.map((item: any, idx: number) => ({
              key: `saved-${idx}`,
              tokenNo: item.tokenNo || `T-0${idx + 5}`,
              uhid: item.patientSearch?.split("(")[1]?.replace(")", "") || `P-2026-10${60 + idx}`,
              name: item.patientSearch?.split("(")[0]?.trim() || "Patient",
              ageGender: "40 / M",
              doctor: item.doctorName || "Specialist",
              opdRoom: item.doctorId === "DOC-102" ? "OPD 1" : "OPD 3",
              slot: item.slot || "10:30 AM",
              status: "WAITING",
            }));
            setQueueData([...mapped, ...INITIAL_QUEUE]);
            return;
          }
        } catch { /* use initial */ }
      }
    }
    setQueueData(INITIAL_QUEUE);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCheckIn = (key: string) => {
    const updated = queueData.map((item) =>
      item.key === key ? { ...item, status: "IN_CONSULTATION" as const } : item
    );
    setQueueData(updated);
    message.success("Patient status updated to IN CONSULTATION!");
  };

  const handlePrintSlip = (record: AppointmentRecord) => {
    setSelectedSlip(record);
    setSlipModalOpen(true);
  };

  const filteredQueue = queueData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tokenNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.doctor.toLowerCase().includes(searchQuery.toLowerCase())
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
    { title: "UHID", dataIndex: "uhid", key: "uhid", render: (val: string) => <span className="font-mono text-xs">{val}</span> },
    { title: "Patient Name", dataIndex: "name", key: "name", render: (val: string) => <strong className="text-slate-900">{val}</strong> },
    { title: "Age / Gender", dataIndex: "ageGender", key: "ageGender" },
    {
      title: "Doctor & Room",
      key: "doctor",
      render: (_: unknown, record: AppointmentRecord) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">{record.doctor}</span>
          <span className="text-[11px] text-purple-700 font-mono">{record.opdRoom}</span>
        </div>
      ),
    },
    { title: "Time Slot", dataIndex: "slot", key: "slot" },
    {
      title: t.status || "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "WAITING" ? "orange" : status === "IN_CONSULTATION" ? "green" : "default"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: AppointmentRecord) => (
        <div className="flex items-center gap-1.5">
          {record.status === "WAITING" && (
            <HmsButton
              size="sm"
              variant="emerald"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => handleCheckIn(record.key)}
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
            Token Slip
          </HmsButton>
        </div>
      ),
    },
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
              icon={<Calendar className="w-4 h-4" />}
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
                <h3 className="text-2xl font-bold text-teal-700 mt-1">{queueData.length} Patients</h3>
              </div>
              <Users className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Waiting in OPD</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">
                  {queueData.filter((q) => q.status === "WAITING").length} Waiting
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
                  {queueData.filter((q) => q.status === "IN_CONSULTATION").length} Active
                </h3>
              </div>
              <Activity className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>
        </div>

        {/* Live OPD Queue Table */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-teal-600" /> Live OPD Token Queue
            </h2>
            <Input
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              placeholder="Search Token, Patient, UHID, or Doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72"
              allowClear
            />
          </div>
          <Table columns={columns} dataSource={filteredQueue} pagination={{ pageSize: 10 }} />
        </div>

        {/* Appointment Drawer */}
        <AppointmentBookingDrawer
          open={bookingDrawerOpen}
          onClose={() => {
            setBookingDrawerOpen(false);
            loadAppointments();
          }}
        />

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
                  <strong className="text-slate-900">{selectedSlip.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>UHID:</span>
                  <span>{selectedSlip.uhid}</span>
                </div>
                <div className="flex justify-between">
                  <span>Specialist Doctor:</span>
                  <strong className="text-purple-800">{selectedSlip.doctor}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Consultation Room:</span>
                  <span className="font-bold text-teal-700">{selectedSlip.opdRoom}</span>
                </div>
                <div className="flex justify-between">
                  <span>Appt Time Slot:</span>
                  <span>{selectedSlip.slot}</span>
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
