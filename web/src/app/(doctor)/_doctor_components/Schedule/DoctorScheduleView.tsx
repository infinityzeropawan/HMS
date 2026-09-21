"use client";

import React from "react";
import { Tag, Switch, message } from "antd";
import { Calendar, Clock, MapPin, CheckCircle2, Lock, UserCheck } from "lucide-react";
import { useRosterStore } from "@/app/(admin)/_admin_stores/admin_roster_store";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";


export const DoctorScheduleView: React.FC = () => {
  const rosters = useRosterStore((state) => state.rosters);
  const doctorShifts = (rosters || []).filter((r) => r.role === "DOCTOR");
  const blockedSlots = useRosterStore((state) => state.blockedSlots) || {};
  const toggleStoreSlotBlock = useRosterStore((state) => state.toggleSlotBlock);

  // Canonical staff id of the signed-in doctor (e.g. "DOC-101"); never hard-code a doctor.
  const doctorStaffId = useAuthUserStore((state) => state.user?.userId) || "DOC-101";

  /**
   * Per-doctor clinic-day block. The legacy doctor-agnostic key (`dayName`) is only honoured
   * for DOC-101 — the doctor the old UI toggled for — so one doctor can no longer block the
   * whole hospital's OPD.
   */
  const isDayBlocked = (dayName: string): boolean => {
    const perDoctorKey = blockedSlots[`${doctorStaffId}-${dayName}`];
    const legacyKey = doctorStaffId === "DOC-101" ? blockedSlots[dayName] : undefined;
    return Boolean(perDoctorKey || legacyKey);
  };

  const baseSlots = [
    { day: "Monday", shift: "Morning OPD", hours: "09:00 AM - 01:00 PM", room: "OPD Clinic Room 104", totalTokens: 20 },
    { day: "Tuesday", shift: "Morning OPD", hours: "09:00 AM - 01:00 PM", room: "OPD Clinic Room 104", totalTokens: 20 },
    { day: "Wednesday", shift: "OT Surgical Roster", hours: "08:00 AM - 04:00 PM", room: "Operation Theatre OT-02", totalTokens: 0 },
    { day: "Thursday", shift: "Morning OPD", hours: "09:00 AM - 01:00 PM", room: "OPD Clinic Room 104", totalTokens: 20 },
    { day: "Friday", shift: "Evening OPD", hours: "04:00 PM - 08:00 PM", room: "Specialist Clinic 201", totalTokens: 15 },
    { day: "Saturday", shift: "Morning OPD", hours: "09:00 AM - 01:00 PM", room: "OPD Clinic Room 104", totalTokens: 20 },
  ];

  const handleToggleSlot = (dayName: string) => {
    const isCurrentlyBlocked = isDayBlocked(dayName);
    toggleStoreSlotBlock(dayName, doctorStaffId);
    message.info(!isCurrentlyBlocked ? `Clinic slot for ${dayName} BLOCKED in Roster Master.` : `Clinic slot for ${dayName} UNBLOCKED.`);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" /> Doctor Weekly Clinic Schedule & Roster
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your weekly OPD consultation hours, assigned clinic rooms, surgical OT shifts, and block emergency times.
          </p>
        </div>
      </div>

      {/* Active Central Roster Doctor Duty Shifts Banner */}
      {doctorShifts.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl space-y-2">
          <h4 className="font-bold text-teal-900 text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-600" /> Central Roster Doctor Duty Assignments
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {doctorShifts.map((shift) => (
              <div key={shift.id} className="bg-white p-3 rounded-lg border border-teal-100 shadow-2xs text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{shift.staffName}</span>
                  <Tag color="teal" className="text-3xs">{shift.shift}</Tag>
                </div>
                <div className="text-slate-500 font-mono text-3xs">{shift.departmentName}</div>
                <div className="text-slate-700 flex items-center gap-1 font-semibold">
                  <MapPin className="w-3 h-3 text-teal-600" /> {shift.assignedWardOrRoom}
                </div>
                <div className="text-slate-400 font-mono text-3xs">{shift.dutyDate} | {shift.shiftHours}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {baseSlots.map((slot, idx) => {
          const isBlocked = isDayBlocked(slot.day);
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all duration-200 bg-white shadow-xs space-y-4 ${
                isBlocked ? "bg-slate-50 border-rose-200" : "border-slate-200 hover:border-teal-400"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" /> {slot.day}
                </span>
                <Tag color={isBlocked ? "rose" : "emerald"} className="font-bold flex items-center gap-1">
                  {isBlocked ? <><Lock className="w-3 h-3" /> BLOCKED</> : <><CheckCircle2 className="w-3 h-3" /> ACTIVE</>}
                </Tag>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Clock className="w-4 h-4 text-purple-600" /> {slot.shift}: <span className="font-mono text-teal-700">{slot.hours}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" /> {slot.room}
                </div>

                {slot.totalTokens > 0 && (
                  <div className="text-3xs font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                    Capacity: {slot.totalTokens} Tokens Available (15 Min / Slot)
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Block Slot:</span>
                <Switch checked={isBlocked} onChange={() => handleToggleSlot(slot.day)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
