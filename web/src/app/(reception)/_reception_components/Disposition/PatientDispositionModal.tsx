"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Select, InputNumber, Switch, Input, Tag, Alert, Divider } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { BedDouble, ClipboardList, Stethoscope, AlertTriangle, CheckCircle2 } from "lucide-react";
import { HospitalAppointment } from "../../_reception_types/appointment_types";
import {
  CareDisposition,
  DISPOSITION_LABELS,
  ReceptionVisit,
  TRIAGE_PRIORITY_COLORS,
  TRIAGE_PRIORITY_LABELS,
} from "../../_reception_types/visit_types";
import {
  VisitDispositionService,
  DispositionResult,
} from "../../_reception_services/visit_disposition_service";
import { ReceptionDoctor, ReceptionDoctorService } from "../../_reception_services/reception_doctor_service";
import { useAppointmentStore } from "../../_reception_stores/appointment_store";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";

interface PatientDispositionModalProps {
  appointment: HospitalAppointment | null;
  open: boolean;
  onClose: () => void;
  onDecided?: () => void;
}

interface HospitalBedOption {
  id: string;
  bedNumber: string;
  wardName: string;
  category: string;
  dailyRate: number;
}

/**
 * The OPD vs IPD decision point of the hospital entry flow.
 * Previously this decision did not exist anywhere in the app — reception could only issue OPD
 * tokens and the IPD admission desk re-typed the patient manually.
 */
export const PatientDispositionModal: React.FC<PatientDispositionModalProps> = ({
  appointment,
  open,
  onClose,
  onDecided,
}) => {
  const [form] = Form.useForm();
  const decidedBy = useAuthUserStore((s) => s.user?.username) || "Reception Desk";

  const [disposition, setDisposition] = useState<CareDisposition>("OPD");
  const [visit, setVisit] = useState<ReceptionVisit | undefined>();
  const [beds, setBeds] = useState<HospitalBedOption[]>([]);
  const [doctors, setDoctors] = useState<ReceptionDoctor[]>([]);
  const [result, setResult] = useState<DispositionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !appointment) return;
    setVisit(VisitDispositionService.getOpenVisit(appointment.uhid));
    setBeds(VisitDispositionService.getAvailableBeds());
    setDoctors(ReceptionDoctorService.getDoctors());
    setDisposition("OPD");
    setResult(null);
    form.setFieldsValue({
      disposition: "OPD",
      attendingDoctor: doctors[0]?.name || "",
      initialDepositAmount: 10000,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.id]);

  if (!appointment) return null;

  const admitted = VisitDispositionService.findActiveAdmission(appointment.uhid);

  const handleSubmit = async (values: {
    disposition: CareDisposition;
    note?: string;
    attendingDoctor?: string;
    bedId?: string;
    initialDepositAmount?: number;
    tpaCashlessApproved?: boolean;
    primaryDiagnosis?: string;
  }) => {
    setSubmitting(true);

    let outcome: DispositionResult;
    if (values.disposition === "IPD_ADMITTED") {
      outcome = VisitDispositionService.admitToIpd({
        visitId: visit?.id,
        uhid: appointment.uhid,
        patientName: appointment.patientName,
        attendingDoctor: values.attendingDoctor || "",
        bedId: values.bedId || "",
        initialDeposit: values.initialDepositAmount || 0,
        tpaCashlessApproved: Boolean(values.tpaCashlessApproved),
        primaryDiagnosis: values.primaryDiagnosis,
      });
      if (outcome.success) {
        // The OPD loop closes: the consultation that led to the admission is complete.
        useAppointmentStore.getState().updateStatus(appointment.id, "COMPLETED");
      }
    } else {
      outcome = VisitDispositionService.recordDisposition(
        visit,
        appointment.uhid,
        appointment.patientName,
        values.disposition,
        values.note || "",
        decidedBy
      );
    }

    setSubmitting(false);

    if (outcome.success) {
      setResult(outcome);
      if (onDecided) onDecided();
    } else {
      Modal.error({ title: "Disposition not recorded", content: outcome.message });
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <ClipboardList className="w-5 h-5 text-purple-600" />
          <span>Patient Disposition — OPD vs IPD ({appointment.tokenNo})</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={620}
      destroyOnClose
    >
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-4 space-y-1">
        <div className="flex justify-between gap-2">
          <span><strong>Patient:</strong> {appointment.patientName} ({appointment.uhid})</span>
          <span>{appointment.ageGender}</span>
        </div>
        <div><strong>Seen by:</strong> {appointment.doctorName} · {appointment.departmentName} ({appointment.opdRoom})</div>
      </div>

      <div className="mb-4 p-3 rounded-lg border bg-white border-slate-200 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">Triage (recorded at registration)</span>
          {visit ? (
            <Tag color={TRIAGE_PRIORITY_COLORS[visit.triagePriority]}>
              {TRIAGE_PRIORITY_LABELS[visit.triagePriority]}
            </Tag>
          ) : (
            <Tag>No triage visit</Tag>
          )}
        </div>
        {visit && (
          <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-0.5">
            <span>BP: {visit.vitals.systolicBp ?? "—"}/{visit.vitals.diastolicBp ?? "—"}</span>
            <span>Pulse: {visit.vitals.pulseRate ?? "—"}</span>
            <span>Temp: {visit.vitals.temperatureF ?? "—"} °F</span>
            <span>SpO₂: {visit.vitals.spo2 ?? "—"}%</span>
            <span>Weight: {visit.vitals.weightKg ?? "—"} kg</span>
          </div>
        )}
        {!visit && (
          <div className="text-amber-700 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>No triage visit exists for this token — the decision will be recorded on a new visit.</span>
          </div>
        )}
      </div>

      {admitted && (
        <Alert
          type="info"
          showIcon
          icon={<CheckCircle2 className="w-5 h-5 text-teal-600" />}
          message="Already an inpatient"
          description={`${admitted.patientName} is admitted (${admitted.admissionNo} — bed ${admitted.bedNumber}, ${admitted.admittedWard}).`}
          className="mb-4"
        />
      )}

      {result ? (
        <div className="space-y-4">
          <Alert
            type="success"
            showIcon
            message="Disposition recorded"
            description={
              <div className="space-y-1 text-xs">
                <p>{result.message}</p>
                {result.admissionNo && (
                  <p className="font-mono">Admission {result.admissionNo} · Bed {result.bedNumber} · {result.ward}</p>
                )}
              </div>
            }
          />
          <div className="flex justify-end">
            <HmsButton variant="primary" onClick={onClose}>
              Done
            </HmsButton>
          </div>
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Care disposition"
            name="disposition"
            rules={[{ required: true, message: "Select the disposition" }]}
          >
            <Select
              size="large"
              onChange={(val: CareDisposition) => setDisposition(val)}
              options={(Object.keys(DISPOSITION_LABELS) as CareDisposition[])
                .filter((key) => key !== "PENDING" && key !== "IPD_ADVISED")
                .map((key) => ({ value: key, label: DISPOSITION_LABELS[key] }))}
            />
          </Form.Item>

          <Form.Item label="Decision note" name="note">
            <Input.TextArea rows={2} placeholder="e.g. Stable vitals, continue OPD review in 7 days" />
          </Form.Item>

          {disposition === "IPD_ADMITTED" && (
            <>
              <Divider className="my-4" />
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                <BedDouble className="w-4 h-4 text-teal-600" /> Inpatient admission & bed placement
              </h4>

              <Form.Item
                label="Available bed (central bed engine)"
                name="bedId"
                rules={[{ required: true, message: "Select an available bed" }]}
              >
                <Select
                  size="large"
                  placeholder="Select available bed…"
                  options={beds.map((b) => ({
                    value: b.id,
                    label: `${b.bedNumber} — ${b.wardName} (${b.category}) [₹${b.dailyRate}/day]`,
                  }))}
                  notFoundContent="No vacant beds — free a bed or refer the patient out."
                />
              </Form.Item>

              <Form.Item
                label="Attending consultant"
                name="attendingDoctor"
                rules={[{ required: true, message: "Select the attending consultant" }]}
              >
                <Select
                  size="large"
                  options={doctors.map((d) => ({
                    value: d.name,
                    label: `${d.name} · ${d.departmentName}`,
                  }))}
                />
              </Form.Item>

              <Form.Item label="Working / provisional diagnosis" name="primaryDiagnosis">
                <Input size="large" placeholder="e.g. Acute gastroenteritis with dehydration" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item label="Advance deposit (₹)" name="initialDepositAmount" initialValue={10000}>
                  <InputNumber min={0} max={500000} className="w-full" size="large" />
                </Form.Item>
                <Form.Item label="TPA cashless pre-approval" name="tpaCashlessApproved" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </div>

              <div className="text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-lg p-3">
                Admission uses the registered demographics (age/gender from the patient index), locks the
                bed, posts the deposit to billing and notifies the ward.
              </div>
            </>
          )}

          {disposition === "EMERGENCY" && (
            <Alert
              className="mt-3"
              type="error"
              showIcon
              icon={<Stethoscope className="w-5 h-5 text-rose-600" />}
              message="Emergency hand-off"
              description="Escort the patient to the Emergency & Trauma department and hand over the triage sheet."
            />
          )}

          <div className="flex justify-end gap-2 mt-6">
            <HmsButton variant="secondary" onClick={onClose}>
              Cancel
            </HmsButton>
            <HmsButton type="primary" variant="emerald" htmlType="submit" loading={submitting}>
              Record Decision
            </HmsButton>
          </div>
        </Form>
      )}
    </Modal>
  );
};
