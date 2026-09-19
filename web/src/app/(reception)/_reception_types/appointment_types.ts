"use client";

export type AppointmentStatus =
  | "WAITING"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED";

export interface HospitalAppointment {
  id: string;
  tokenNo: string;
  uhid: string;
  patientName: string;
  phone: string;
  ageGender: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  opdRoom: string;
  date: string; // YYYY-MM-DD
  slot: string; // e.g. "10:30 AM"
  status: AppointmentStatus;
  bookedAt: string;
  cancelReason?: string;
  rescheduledFromSlot?: string;
}
