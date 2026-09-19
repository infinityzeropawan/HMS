"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, Tag, Alert, message } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { Clock, Calendar, AlertTriangle, RefreshCw } from "lucide-react";
import { HospitalAppointment } from "../../_reception_types/appointment_types";
import { AppointmentService } from "../../_reception_services/appointment_service";

interface RescheduleAppointmentModalProps {
  appointment: HospitalAppointment | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AVAILABLE_SLOTS = [
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:15 AM",
  "02:00 PM",
  "03:30 PM",
  "04:15 PM",
];

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  appointment,
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(
    appointment?.date || new Date().toISOString().split("T")[0]
  );

  if (!appointment) return null;

  const availability = AppointmentService.checkDoctorAvailability(appointment.doctorId, selectedDate);

  const handleReschedule = (values: { date: string; slot: string }) => {
    const res = AppointmentService.reschedule(appointment.id, values.date, values.slot);
    if (res.success) {
      message.success(res.message);
      if (onSuccess) onSuccess();
      onClose();
    } else {
      message.error(res.message);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <RefreshCw className="w-5 h-5 text-amber-600" />
          <span>Reschedule Appointment ({appointment.tokenNo})</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-4 space-y-1">
        <div><strong>Patient:</strong> {appointment.patientName} ({appointment.uhid})</div>
        <div><strong>Doctor:</strong> {appointment.doctorName} ({appointment.departmentName})</div>
        <div><strong>Current Slot:</strong> {appointment.date} at {appointment.slot}</div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleReschedule}
        initialValues={{
          date: appointment.date,
          slot: appointment.slot,
        }}
      >
        <Form.Item label="New Consultation Date" name="date" rules={[{ required: true }]}>
          <Input
            type="date"
            size="large"
            prefix={<Calendar className="w-4 h-4 text-slate-400 mr-1" />}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Form.Item>

        {!availability.available && (
          <Alert
            message="Doctor Unavailable on Selected Date"
            description={availability.reason}
            type="warning"
            showIcon
            icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
            className="mb-4"
          />
        )}

        <Form.Item label="New Time Slot" name="slot" rules={[{ required: true }]}>
          <Select placeholder="Select Time Slot" size="large" disabled={!availability.available}>
            {AVAILABLE_SLOTS.map((s) => (
              <Select.Option key={s} value={s}>
                <span className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {s}
                  </span>
                  <Tag color={s === appointment.slot ? "blue" : "green"}>
                    {s === appointment.slot ? "Current" : "Available"}
                  </Tag>
                </span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <HmsButton onClick={onClose} variant="secondary">
            Cancel
          </HmsButton>
          <HmsButton
            type="primary"
            variant="primary"
            htmlType="submit"
            disabled={!availability.available}
          >
            Confirm Reschedule
          </HmsButton>
        </div>
      </Form>
    </Modal>
  );
};
