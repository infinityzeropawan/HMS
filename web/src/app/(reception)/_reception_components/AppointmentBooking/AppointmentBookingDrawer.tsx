"use client";

import React, { useState } from "react";
import { Drawer, Form, Input, Select, Tag, message } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { Clock, Calendar, Ticket, User } from "lucide-react";

interface AppointmentBookingDrawerProps {
  open: boolean;
  onClose: () => void;
}

const DOCTOR_SLOTS: Record<string, string[]> = {
  "DOC-101": ["09:30 AM", "10:00 AM", "10:30 AM", "11:15 AM", "02:00 PM"],
  "DOC-102": ["10:00 AM", "11:00 AM", "11:30 AM", "03:00 PM", "04:30 PM"],
};

export const AppointmentBookingDrawer: React.FC<AppointmentBookingDrawerProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [selectedDoctor, setSelectedDoctor] = useState("DOC-101");

  const handleBook = (values: Record<string, string>) => {
    let nextToken = 1;
    if (typeof window !== "undefined") {
      const last = localStorage.getItem("hms_last_token_num");
      nextToken = last ? parseInt(last, 10) + 1 : 1;
      localStorage.setItem("hms_last_token_num", nextToken.toString());
    }
    const tokenNo = `T-${String(nextToken).padStart(2, "0")}`;

    const appointment = {
      tokenNo,
      patientSearch: values.patientSearch || "Sunil Verma (P-2026-1049)",
      department: values.department || "Cardiology",
      doctorId: values.doctorId || "DOC-101",
      doctorName: values.doctorId === "DOC-102" ? "Dr. Priya Nair" : "Dr. Rajesh Sharma",
      date: values.date || new Date().toISOString().split("T")[0],
      slot: values.slot || "10:30 AM",
      bookedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("hms_appointments") || "[]");
      saved.unshift(appointment);
      localStorage.setItem("hms_appointments", JSON.stringify(saved));
    }

    message.success(`OPD Queue Token ${tokenNo} issued for ${appointment.doctorName} at ${appointment.slot}!`);
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-teal-600" />
          <span>Book OPD Appointment & Generate Token</span>
        </div>
      }
      width={480}
      open={open}
      onClose={onClose}
      className="max-w-[100vw]"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleBook}
        initialValues={{
          patientSearch: "Sunil Verma (P-2026-1049)",
          department: "CARDIOLOGY",
          doctorId: "DOC-101",
          date: new Date().toISOString().split("T")[0],
          slot: "10:30 AM",
        }}
      >
        <Form.Item label="Patient Name / UHID" name="patientSearch" rules={[{ required: true }]}>
          <Input prefix={<User className="w-4 h-4 text-slate-400 mr-1" />} placeholder="Enter UHID or Search Patient" size="large" />
        </Form.Item>

        <Form.Item label="OPD Department" name="department" rules={[{ required: true }]}>
          <Select placeholder="Select Department" size="large">
            <Select.Option value="CARDIOLOGY">Cardiology Clinic</Select.Option>
            <Select.Option value="ORTHOPEDICS">Orthopedics Clinic</Select.Option>
            <Select.Option value="GENERAL_MEDICINE">General Medicine</Select.Option>
            <Select.Option value="PEDIATRICS">Pediatrics Clinic</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Attending Specialist Doctor" name="doctorId" rules={[{ required: true }]}>
          <Select
            placeholder="Select Doctor"
            size="large"
            onChange={(val) => setSelectedDoctor(val)}
          >
            <Select.Option value="DOC-101">Dr. Rajesh Sharma (Cardiology - OPD 3)</Select.Option>
            <Select.Option value="DOC-102">Dr. Priya Nair (Orthopedics - OPD 1)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Consultation Date" name="date" rules={[{ required: true }]}>
          <Input type="date" size="large" prefix={<Calendar className="w-4 h-4 text-slate-400 mr-1" />} />
        </Form.Item>

        <Form.Item label="Select Available Time Slot" name="slot" rules={[{ required: true }]}>
          <Select placeholder="Select Available Slot" size="large">
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
          <div className="font-semibold flex items-center gap-1"><Ticket className="w-4 h-4 text-teal-600" /> Automated Token Sequence:</div>
          <div>Booking will generate next sequential token number (e.g. T-01, T-02) and add patient to OPD Queue.</div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
          <HmsButton onClick={onClose} variant="secondary" size="lg" fullWidth>
            Cancel
          </HmsButton>
          <HmsButton type="primary" variant="primary" htmlType="submit" size="lg" fullWidth>
            Issue Queue Token
          </HmsButton>
        </div>
      </Form>
    </Drawer>
  );
};

