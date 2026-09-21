"use client";

import React, { useState, useEffect } from "react";
import { Drawer, Form, Input, Select, Tag, Alert, message } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { Clock, Calendar, Ticket, UserCheck, AlertTriangle } from "lucide-react";
import { AppointmentService } from "../../_reception_services/appointment_service";
import {
  ReceptionDoctor,
  ReceptionDoctorService,
} from "../../_reception_services/reception_doctor_service";
import {
  PatientOption,
  PatientRegistryService,
} from "../../_reception_services/patient_registry_service";
import { todayLocalDate } from "../../_reception_utils/date_utils";

interface AppointmentBookingDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Pre-selects the patient just registered at the desk (never a hard-coded patient). */
  initialPatientUhid?: string | null;
  /** Links the issued token back to the reception triage visit. */
  visitId?: string | null;
}

export const AppointmentBookingDrawer: React.FC<AppointmentBookingDrawerProps> = ({
  open,
  onClose,
  initialPatientUhid,
  visitId,
}) => {
  const [form] = Form.useForm();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<ReceptionDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayLocalDate());

  const selectedPatientUhid = Form.useWatch("patientUhid", form) as string | undefined;

  // Re-read the patient index and the staff master every time the drawer opens
  useEffect(() => {
    if (!open) return;
    setPatients(PatientRegistryService.getOptions());
    setDoctors(ReceptionDoctorService.getDoctors());
  }, [open]);

  // Seed the form: the patient registered at the desk (or last registered), first active doctor, today.
  // There is deliberately NO default patient — staff must pick one.
  useEffect(() => {
    if (!open) return;
    const patientUhid = initialPatientUhid || PatientRegistryService.getLastRegisteredUhid() || undefined;
    const firstDoctorId = doctors[0]?.id || "";
    setSelectedDoctor(firstDoctorId);
    setSelectedDate(todayLocalDate());
    form.setFieldsValue({
      patientUhid,
      doctorId: firstDoctorId,
      date: todayLocalDate(),
      slot: undefined,
    });
  }, [open, initialPatientUhid, doctors, form]);

  // Availability + slots are derived on render so they can never go stale
  const availability = selectedDoctor
    ? AppointmentService.checkDoctorAvailability(selectedDoctor, selectedDate)
    : { available: false, status: "NOT_FOUND" as const, reason: "Select a doctor to check availability." };

  const slots = selectedDoctor
    ? AppointmentService.getAvailableSlots(selectedDoctor, selectedDate)
    : [];

  const selectedPatient = patients.find((p) => p.uhid === selectedPatientUhid);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleBook = (values: {
    patientUhid: string;
    doctorId: string;
    date: string;
    slot: string;
  }) => {
    const patient = patients.find((p) => p.uhid === values.patientUhid);
    if (!patient) {
      message.error("Select a registered patient before issuing a token.");
      return;
    }

    const doctor = ReceptionDoctorService.getDoctor(values.doctorId);
    if (!doctor) {
      message.error("Selected doctor is not present in the staff master.");
      return;
    }

    const result = AppointmentService.bookAppointment({
      uhid: patient.uhid,
      patientName: patient.name,
      phone: patient.phone,
      ageGender: patient.ageGender,
      departmentId: doctor.departmentId,
      departmentCode: doctor.departmentCode,
      departmentName: doctor.departmentName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      opdRoom: doctor.room,
      date: values.date,
      slot: values.slot,
      visitId: visitId || undefined,
    });

    if (result.success) {
      message.success(result.message);
      form.resetFields();
      setSelectedDate(todayLocalDate());
      onClose();
    } else {
      message.error(result.message);
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-teal-600" />
          <span>Book OPD Appointment & Generate Token</span>
        </div>
      }
      width={520}
      open={open}
      onClose={handleClose}
      className="max-w-[100vw]"
    >
      <Form form={form} layout="vertical" onFinish={handleBook}>
        <Form.Item
          label="Registered Patient (search by name, UHID or phone)"
          name="patientUhid"
          rules={[{ required: true, message: "Select the patient" }]}
        >
          <Select
            showSearch
            size="large"
            placeholder="Search and select a registered patient"
            optionFilterProp="label"
            filterOption={(input, option) =>
              String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={patients.map((p) => ({
              value: p.uhid,
              label: `${p.name} | ${p.uhid} (${p.mrn}) | ${p.phone}`,
            }))}
            notFoundContent="No registered patient matches — register the patient first."
          />
        </Form.Item>

        {selectedPatient && (
          <div className="p-3 -mt-2 mb-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Patient: <strong className="text-slate-900">{selectedPatient.name}</strong>
            </span>
            <span>{selectedPatient.ageGender}</span>
            <span className="font-mono">{selectedPatient.phone}</span>
          </div>
        )}

        <Form.Item label="Attending Specialist Doctor" name="doctorId" rules={[{ required: true, message: "Select a doctor" }]}>
          <Select
            placeholder="Select specialist doctor"
            size="large"
            onChange={(val: string) => setSelectedDoctor(val)}
            options={doctors.map((d) => ({
              value: d.id,
              label: `${d.name} · ${d.departmentName} · ${d.room}`,
            }))}
            notFoundContent="No doctor configured in the staff master."
          />
        </Form.Item>

        <Form.Item label="Consultation Date" name="date" rules={[{ required: true, message: "Select a date" }]}>
          <Input
            type="date"
            size="large"
            min={todayLocalDate()}
            prefix={<Calendar className="w-4 h-4 text-slate-400 mr-1" />}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Form.Item>

        {!availability.available && (
          <Alert
            message="Doctor unavailable"
            description={availability.reason}
            type="warning"
            showIcon
            icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
            className="mb-4"
          />
        )}

        <Form.Item label="Available Time Slot" name="slot" rules={[{ required: true, message: "Select a slot" }]}>
          <Select
            placeholder="Select an available slot"
            size="large"
            disabled={!availability.available}
            options={slots.map((s) => ({
              value: s.slot,
              disabled: s.taken || s.past,
              label: (
                <span className="flex items-center justify-between gap-2 w-full">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.slot}
                  </span>
                  {s.taken ? (
                    <Tag color="red">Booked {s.tokenNo ? `· ${s.tokenNo}` : ""}</Tag>
                  ) : s.past ? (
                    <Tag color="default">Elapsed</Tag>
                  ) : (
                    <Tag color="green">Available</Tag>
                  )}
                </span>
              ),
            }))}
          />
        </Form.Item>

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800 space-y-1 my-4">
          <div className="font-semibold flex items-center gap-1">
            <UserCheck className="w-4 h-4 text-teal-600" /> Automated appointment &amp; token flow
          </div>
          <div>
            Booking verifies the doctor duty roster for the selected date, blocks double-booked slots and
            dispatches the SMS reminder. The token then appears on the reception console and in the
            doctor&apos;s OPD queue.
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
          <HmsButton onClick={handleClose} variant="secondary" size="lg" fullWidth>
            Cancel
          </HmsButton>
          <HmsButton
            type="primary"
            variant="primary"
            htmlType="submit"
            size="lg"
            fullWidth
            disabled={!availability.available || !selectedPatientUhid}
          >
            Issue Queue Token
          </HmsButton>
        </div>
      </Form>
    </Drawer>
  );
};
