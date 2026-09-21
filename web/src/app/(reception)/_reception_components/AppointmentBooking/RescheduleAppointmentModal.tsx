"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Tag, Alert } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { Clock, Calendar, AlertTriangle, RefreshCw } from "lucide-react";
import { HospitalAppointment } from "../../_reception_types/appointment_types";
import { AppointmentService } from "../../_reception_services/appointment_service";
import { todayLocalDate } from "../../_reception_utils/date_utils";

interface RescheduleAppointmentModalProps {
  appointment: HospitalAppointment | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  appointment,
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(todayLocalDate());
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Re-sync whenever a different appointment is opened: the previous implementation kept the
  // first appointment's date in state (stale availability banner + wrong slot list).
  useEffect(() => {
    if (!open || !appointment) return;
    setSubmitError(null);
    setSelectedDate(appointment.date);
    form.setFieldsValue({
      date: appointment.date,
      slot: appointment.slot,
    });
  }, [open, appointment, form]);


  if (!appointment) return null;

  const availability = AppointmentService.checkDoctorAvailability(
    appointment.doctorId,
    selectedDate
  );

  const slots = AppointmentService.getAvailableSlots(
    appointment.doctorId,
    selectedDate,
    appointment.id
  );

  const handleReschedule = (values: { date: string; slot: string }) => {
    const res = AppointmentService.reschedule(appointment.id, values.date, values.slot);
    if (res.success) {
      form.resetFields();
      if (onSuccess) onSuccess();
      onClose();
    } else {
      // Errors are surfaced by the service (unavailable doctor / slot already booked / same slot)
      setSubmitError(res.message);
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
        {appointment.rescheduledFromSlot && (
          <div className="text-amber-700"><strong>Previously:</strong> {appointment.rescheduledFromSlot}</div>
        )}
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
            min={todayLocalDate()}
            prefix={<Calendar className="w-4 h-4 text-slate-400 mr-1" />}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Form.Item>

        {!availability.available && (
          <Alert
            message="Doctor unavailable on selected date"
            description={availability.reason}
            type="warning"
            showIcon
            icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
            className="mb-4"
          />
        )}

        <Form.Item label="New Time Slot" name="slot" rules={[{ required: true }]}>
          <Select
            placeholder="Select time slot"
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
                  {appointment.date === selectedDate && s.slot === appointment.slot ? (
                    <Tag color="blue">Current</Tag>
                  ) : s.taken ? (
                    <Tag color="red">Booked</Tag>
                  ) : (
                    <Tag color="green">Available</Tag>
                  )}
                </span>
              ),
            }))}
          />
        </Form.Item>

        {submitError && (
          <Alert
            message="Reschedule failed"
            description={submitError}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

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

