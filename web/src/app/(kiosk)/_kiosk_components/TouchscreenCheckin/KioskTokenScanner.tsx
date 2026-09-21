"use client";

import React, { useState } from "react";
import { Input, message, Tag } from "antd";
import { QrCode, Ticket, CheckCircle2, User } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { PatientRegistryService } from "@/app/(reception)/_reception_services/patient_registry_service";
import { useAppointmentStore } from "@/app/(reception)/_reception_stores/appointment_store";
import { todayLocalDate, formatDisplayDate } from "@/app/(reception)/_reception_utils/date_utils";

interface CheckinResult {
  tokenNo: string;
  patientName: string;
  uhid: string;
  doctorName: string;
  opdRoom: string;
  departmentName: string;
  date: string;
  slot: string;
}

/**
 * Self check-in kiosk.
 *
 * Previously this minted a random token (T-10..T-99) that never touched the appointment store,
 * so kiosk patients never appeared in the reception queue. It now verifies the patient against
 * the patient registry and checks them in against today's live appointment.
 */
export const KioskTokenScanner: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkIn = (rawIdentifier: string) => {
    setError(null);

    const query = (rawIdentifier || "").trim();
    if (!query) {
      setError("Enter your UHID or registered mobile number.");
      return;
    }

    // 1. Verify the patient against the hospital patient index
    const patient =
      PatientRegistryService.findByUhid(query) || PatientRegistryService.findByPhone(query);

    if (!patient) {
      setError(
        `No registered patient found for "${query}". Please visit the reception desk with your ID to register.`
      );
      return;
    }

    // 2. Check in against today's live OPD appointment
    const today = todayLocalDate();
    const appointment = useAppointmentStore
      .getState()
      .appointments.find(
        (a) =>
          a.uhid === patient.uhid &&
          a.date === today &&
          (a.status === "WAITING" || a.status === "IN_CONSULTATION" || a.status === "RESCHEDULED")
      );

    if (!appointment) {
      setError(
        `${patient.fullName} has no OPD appointment for ${formatDisplayDate(today)}. Please see the reception desk to book a token.`
      );
      return;
    }

    useAppointmentStore.getState().markCheckedIn(appointment.id);

    setResult({
      tokenNo: appointment.tokenNo,
      patientName: appointment.patientName,
      uhid: appointment.uhid,
      doctorName: appointment.doctorName,
      opdRoom: appointment.opdRoom,
      departmentName: appointment.departmentName,
      date: appointment.date,
      slot: appointment.slot,
    });
    message.success(`Checked in — token ${appointment.tokenNo} confirmed.`);
  };

  return (
    <div className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full mx-auto text-center space-y-6">
      <div>
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
          <Ticket className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
          Hospital Self Check-in Kiosk
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
          Scan ABHA QR Code or enter Mobile / UHID to confirm your OPD token
        </p>
      </div>

      {result ? (
        <div className="p-4 sm:p-6 bg-teal-50 border-2 border-teal-500 rounded-xl space-y-3">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-teal-600 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-teal-900">CHECK-IN CONFIRMED</h3>
          <div className="text-3xl sm:text-4xl font-extrabold text-teal-700 tracking-wider font-mono">
            {result.tokenNo}
          </div>
          <div className="text-xs text-teal-800 space-y-0.5">
            <p>
              <strong>{result.patientName}</strong> ({result.uhid})
            </p>
            <p>
              Clinic: {result.departmentName} &bull; Doctor: {result.doctorName}
            </p>
            <p className="font-mono">
              {result.opdRoom} · {formatDisplayDate(result.date)} at {result.slot}
            </p>
          </div>
          <Tag color="teal">Please take a seat in the OPD waiting area</Tag>

          <div className="pt-3 border-t border-teal-200">
            <HmsButton
              onClick={() => {
                setResult(null);
                setIdentifier("");
              }}
              variant="emerald"
              size="lg"
              fullWidth
            >
              Print Token &amp; Finish
            </HmsButton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 text-left">
              {error}
            </div>
          )}

          <div className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-3">
            <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-teal-600 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Scan ABHA Health Card QR Code</span>
            <HmsButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                // Demo ABHA card → the seeded patient, resolved through the real registry.
                setIdentifier("P-2026-1049");
                checkIn("P-2026-1049");
              }}
              icon={<QrCode className="w-5 h-5" />}
            >
              Simulate ABHA Scan
            </HmsButton>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-semibold">OR ENTER UHID / MOBILE</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <Input
              prefix={<User className="w-4 h-4 text-slate-400 mr-1" />}
              placeholder="Enter Mobile Number or UHID"
              size="large"
              className="rounded-lg text-sm"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onPressEnter={() => checkIn(identifier)}
            />
            <HmsButton
              variant="primary"
              size="lg"
              fullWidth
              className="sm:w-auto shrink-0"
              onClick={() => checkIn(identifier)}
            >
              Get Token
            </HmsButton>
          </div>
        </div>
      )}
    </div>
  );
};
