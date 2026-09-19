"use client";

import React, { useState, useEffect } from "react";
import { Drawer, Form, Input, Select, Tag, Alert, message } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { Clock, Calendar, Ticket, UserCheck, AlertTriangle } from "lucide-react";
import { AppointmentService, DoctorAvailabilityResult } from "../../_reception_services/appointment_service";

interface AppointmentBookingDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface PatientOption {
  uhid: string;
  mrn: string;
  name: string;
  phone: string;
  ageGender: string;
}

const DEFAULT_PATIENTS: PatientOption[] = [
  { uhid: "P-2026-1049", mrn: "MRN-8821", name: "Sunil Verma", phone: "+91 98765 43210", ageGender: "Male (45y)" },
  { uhid: "P-2026-1050", mrn: "MRN-8822", name: "Anjali Gupta", phone: "+91 98765 12345", ageGender: "Female (32y)" },
  { uhid: "P-2026-1051", mrn: "MRN-8823", name: "Ramesh Kumar", phone: "+91 99887 76655", ageGender: "Male (58y)" },
  { uhid: "P-2026-1052", mrn: "MRN-8824", name: "Meena Joshi", phone: "+91 98112 23344", ageGender: "Female (29y)" },
  { uhid: "P-2026-1053", mrn: "MRN-8825", name: "Rajesh Patel", phone: "+91 97123 45678", ageGender: "Male (50y)" },
];

const DOCTORS = [
  { id: "DOC-101", name: "Dr. Rajesh Sharma", dept: "CARDIOLOGY", deptName: "Cardiology", room: "OPD 3" },
  { id: "DOC-102", name: "Dr. Priya Nair", dept: "ORTHOPEDICS", deptName: "Orthopedics", room: "OPD 1" },
  { id: "DOC-103", name: "Dr. Vikram Seth", dept: "GENERAL_MEDICINE", deptName: "General Medicine", room: "OPD 5" },
  { id: "DOC-104", name: "Dr. Ananya Ray", dept: "PEDIATRICS", deptName: "Pediatrics", room: "OPD 2" },
];

const DOCTOR_SLOTS: Record<string, string[]> = {
  "DOC-101": ["09:30 AM", "10:00 AM", "10:30 AM", "11:15 AM", "02:00 PM"],
  "DOC-102": ["10:00 AM", "11:00 AM", "11:30 AM", "03:00 PM", "04:30 PM"],
  "DOC-103": ["09:00 AM", "10:15 AM", "11:30 AM", "02:30 PM", "04:00 PM"],
  "DOC-104": ["10:30 AM", "11:45 AM", "01:30 PM", "03:15 PM"],
};

export const AppointmentBookingDrawer: React.FC<AppointmentBookingDrawerProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [patients, setPatients] = useState<PatientOption[]>(DEFAULT_PATIENTS);
  const [selectedDoctor, setSelectedDoctor] = useState("DOC-101");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [availability, setAvailability] = useState<DoctorAvailabilityResult>({ available: true, status: "ACTIVE_SHIFT" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("hms_patients") || "[]");
        if (Array.isArray(saved) && saved.length > 0) {
          const mapped = saved.map((p: Record<string, string>) => ({
            uhid: p.uhid || `P-${Math.floor(1000 + Math.random() * 9000)}`,
            mrn: p.mrn || `MRN-${Math.floor(1000 + Math.random() * 9000)}`,
            name: p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient",
            phone: p.phone || p.mobile || "+91 99000 00000",
            ageGender: `${p.gender || "Patient"} (${p.age || "30"}y)`,
          }));
          setPatients([...mapped, ...DEFAULT_PATIENTS]);
        }
      } catch {
        // use default
      }
    }
  }, [open]);

  useEffect(() => {
    const res = AppointmentService.checkDoctorAvailability(selectedDoctor, selectedDate);
    setAvailability(res);
  }, [selectedDoctor, selectedDate]);

  const handleBook = (values: {
    patientUhid: string;
    doctorId: string;
    date: string;
    slot: string;
  }) => {
    const selectedPt = patients.find((p) => p.uhid === values.patientUhid) || patients[0];
    const selectedDoc = DOCTORS.find((d) => d.id === values.doctorId) || DOCTORS[0];

    const result = AppointmentService.bookAppointment({
      uhid: selectedPt.uhid,
      patientName: selectedPt.name,
      phone: selectedPt.phone,
      ageGender: selectedPt.ageGender,
      departmentId: selectedDoc.dept,
      departmentCode: selectedDoc.dept,
      departmentName: selectedDoc.deptName,
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      opdRoom: selectedDoc.room,
      date: values.date,
      slot: values.slot,
    });

    if (result.success) {
      message.success(result.message);
      form.resetFields();
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
      onClose={onClose}
      className="max-w-[100vw]"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleBook}
        initialValues={{
          patientUhid: "P-2026-1049",
          doctorId: "DOC-101",
          date: new Date().toISOString().split("T")[0],
          slot: "10:30 AM",
        }}
      >
        <Form.Item label="Search Patient (UHID / MRN / Name / Phone)" name="patientUhid" rules={[{ required: true }]}>
          <Select
            showSearch
            size="large"
            placeholder="Search by UHID, MRN, Name or Phone"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={patients.map((p) => ({
              value: p.uhid,
              label: `${p.name} | ${p.uhid} (${p.mrn}) | ${p.phone}`,
            }))}
          />
        </Form.Item>

        <Form.Item label="Attending Specialist Doctor" name="doctorId" rules={[{ required: true }]}>
          <Select
            placeholder="Select Specialist Doctor"
            size="large"
            onChange={(val) => setSelectedDoctor(val)}
          >
            {DOCTORS.map((d) => (
              <Select.Option key={d.id} value={d.id}>
                <div className="flex items-center justify-between">
                  <span>{d.name} ({d.deptName})</span>
                  <Tag color="blue">{d.room}</Tag>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Consultation Date" name="date" rules={[{ required: true }]}>
          <Input
            type="date"
            size="large"
            prefix={<Calendar className="w-4 h-4 text-slate-400 mr-1" />}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Form.Item>

        {!availability.available && (
          <Alert
            message="Doctor Unavailable"
            description={availability.reason}
            type="warning"
            showIcon
            icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
            className="mb-4"
          />
        )}

        <Form.Item label="Select Available Time Slot" name="slot" rules={[{ required: true }]}>
          <Select placeholder="Select Available Slot" size="large" disabled={!availability.available}>
            {(DOCTOR_SLOTS[selectedDoctor] || DOCTOR_SLOTS["DOC-101"]).map((s) => (
              <Select.Option key={s} value={s}>
                <span className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {s}</span>
                  <Tag color="green">Available</Tag>
                </span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800 space-y-1 my-4">
          <div className="font-semibold flex items-center gap-1"><UserCheck className="w-4 h-4 text-teal-600" /> Automated Appointment & Token Flow:</div>
          <div>Booking verifies doctor duty roster and dispatches automated SMS reminder notification to patient contact.</div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
          <HmsButton onClick={onClose} variant="secondary" size="lg" fullWidth>
            Cancel
          </HmsButton>
          <HmsButton
            type="primary"
            variant="primary"
            htmlType="submit"
            size="lg"
            fullWidth
            disabled={!availability.available}
          >
            Issue Queue Token
          </HmsButton>
        </div>
      </Form>
    </Drawer>
  );
};


