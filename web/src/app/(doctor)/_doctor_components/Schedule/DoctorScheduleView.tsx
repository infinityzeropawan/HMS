"use client";

import React, { useState } from "react";
import { Tag, Switch, message } from "antd";
import { Calendar, Clock, MapPin, CheckCircle2, AlertTriangle, Lock, Unlock, Stethoscope } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";

interface ScheduleSlot {
  day: string;
  shift: string;
  hours: string;
  room: string;
  totalTokens: number;
  isBlocked: boolean;
}

export const DoctorScheduleView: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([
    { day: "Monday", shift: "Morning OPD", hours: "09:00 AM - 01:00 PM", room: "OPD Clinic Room 104", totalTokens: 20, isBlocked: false },
    { day: "Tuesday", shift: "Morning OPD", hours: "09:00 AM - 01:00 PM", room: "OPD Clinic Room 104", totalTokens: 20, isBlocked: false },
    { day: "Wednesday", shift: "OT Surgical Roster", hours: "08:00 AM - 04:00 PM", room: "Operation Theatre OT-02", totalTokens: 0, isBlocked: false },
    { day: "Thursday", shift: "Morning OPD", hours: "09:00 AM - 01:00 PM", room: "OPD Clinic Room 104", totalTokens: 20, isBlocked: false },
    { day: "Friday", shift: "Evening OPD", hours: "04:00 PM - 08:00 PM", room: "Specialist Clinic 201", totalTokens: 15, isBlocked: false },
    { day: "Saturday", shift: "Morning OPD", hours: "09:00 AM - 01:00 PM", room: "OPD Clinic Room 104", totalTokens: 20, isBlocked: false },
  ]);

  const toggleSlotBlock = (index: number) => {
    setSchedule((prev) =>
      prev.map((s, idx) => {
        if (idx === index) {
          const nextState = !s.isBlocked;
          message.info(nextState ? `Clinic slot for ${s.day} blocked.` : `Clinic slot for ${s.day} unblocked.`);
          return { ...s, isBlocked: nextState };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" /> Doctor Weekly Clinic Schedule & Slot Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your weekly OPD consultation hours, assigned clinic rooms, surgical OT slots, and block emergency times.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedule.map((slot, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border transition-all duration-200 bg-white shadow-xs space-y-4 ${
              slot.isBlocked ? "bg-slate-50 border-rose-200" : "border-slate-200 hover:border-teal-400"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" /> {slot.day}
              </span>
              <Tag color={slot.isBlocked ? "rose" : "emerald"} className="font-bold">
                {slot.isBlocked ? "BLOCKED" : "ACTIVE"}
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
              <Switch checked={slot.isBlocked} onChange={() => toggleSlotBlock(idx)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
