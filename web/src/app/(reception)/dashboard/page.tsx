"use client";

import React, { useState } from "react";
import { Table, Tag, Input } from "antd";
import { UserPlus, Calendar, Search, Users, Activity, Clock } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { AppointmentBookingDrawer } from "../_reception_components/AppointmentBooking/AppointmentBookingDrawer";
import { useI18n } from "@/i18n/_i18n_context/I18nContext";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import Link from "next/link";

export default function ReceptionDashboard() {
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const { t } = useI18n();

  const columns = [
    { title: "UHID", dataIndex: "uhid", key: "uhid" },
    { title: "Patient Name", dataIndex: "name", key: "name" },
    { title: "Age / Gender", dataIndex: "ageGender", key: "ageGender" },
    { title: "Doctor", dataIndex: "doctor", key: "doctor" },
    { title: "Time Slot", dataIndex: "slot", key: "slot" },
    {
      title: t.status,
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "WAITING" ? "orange" : "green"}>{status}</Tag>
      ),
    },
  ];

  const data = [
    { key: "1", uhid: "P-2026-1049", name: "Sunil Verma", ageGender: "45 / Male", doctor: "Dr. Rajesh Sharma", slot: "10:30 AM", status: "WAITING" },
    { key: "2", uhid: "P-2026-1052", name: "Anjali Gupta", ageGender: "32 / Female", doctor: "Dr. Priya Nair", slot: "10:45 AM", status: "IN_CONSULTATION" },
    { key: "3", uhid: "P-2026-1058", name: "Ramesh Kumar", ageGender: "58 / Male", doctor: "Dr. Rajesh Sharma", slot: "11:00 AM", status: "WAITING" },
  ];

  return (
    <HmsAppShell title="Reception OPD Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.appTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">Patient Check-in, OPD Registration & Queue Dispatch</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Link href="/patients/register">
              <HmsButton variant="emerald" icon={<UserPlus className="w-4 h-4" />}>
                {t.registerPatient}
              </HmsButton>
            </Link>
            <HmsButton
              variant="primary"
              icon={<Calendar className="w-4 h-4" />}
              onClick={() => setBookingDrawerOpen(true)}
            >
              Book Appointment
            </HmsButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Today&apos;s Registrations</p>
                <h3 className="text-2xl font-bold text-teal-700 mt-1">24</h3>
              </div>
              <Users className="w-8 h-8 text-teal-500" />
            </div>
          </HmsCard>

          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">OPD Waiting Queue</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">12</h3>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </HmsCard>

          <HmsCard elevated>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">In Consultation</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">5</h3>
              </div>
              <Activity className="w-8 h-8 text-emerald-500" />
            </div>
          </HmsCard>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-800">OPD Live Queue</h2>
            <Input
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              placeholder={t.searchPatient}
              className="w-full sm:w-72"
            />
          </div>
          <Table columns={columns} dataSource={data} pagination={false} />
        </div>

        <AppointmentBookingDrawer
          open={bookingDrawerOpen}
          onClose={() => setBookingDrawerOpen(false)}
        />
      </div>
    </HmsAppShell>
  );
}
