"use client";

import React, { useState } from "react";
import { Tag, Modal, Select, Form, message } from "antd";
import { FileText, Bed, ArrowRightLeft } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useIpdStore, IpdAdmissionRecord } from "../../_ipd_stores/ipd_store";
import { useBedStore } from "@/app/(admin)/_admin_stores/admin_bed_store";
import { BedService } from "@/app/(admin)/_admin_services/bed_service";

export const IpdPatientCardGrid: React.FC = () => {
  const admissions = useIpdStore((state) => state.admissions);
  const beds = useBedStore((state) => state.beds);
  const transferPatientBed = useIpdStore((state) => state.transferPatientBed);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<IpdAdmissionRecord | null>(null);
  const [form] = Form.useForm();

  const activeAdmissions = admissions.filter((a) => a.status !== "DISCHARGED");
  const availableBeds = BedService.getAvailableBeds();

  const handleOpenTransferModal = (record: IpdAdmissionRecord) => {
    setSelectedAdmission(record);
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = (values: { targetBedId: string }) => {
    if (!selectedAdmission) return;

    const sourceBed = beds.find(
      (b) => b.bedNumber === selectedAdmission.bedNumber || b.currentIpdNo === selectedAdmission.admissionNo
    );

    const targetBed = BedService.getBedById(values.targetBedId);

    if (!targetBed) {
      message.error("Target bed not found.");
      return;
    }

    try {
      if (sourceBed) {
        BedService.transferBed(
          sourceBed.id,
          targetBed.id,
          {
            uhid: selectedAdmission.uhid,
            ipdNo: selectedAdmission.admissionNo,
            patientName: selectedAdmission.patientName,
            admissionDate: selectedAdmission.admissionDate,
          },
          "Ward Nurse / Transfer Request"
        );
      }

      transferPatientBed(selectedAdmission.admissionNo, targetBed.bedNumber, targetBed.wardName);

      message.success(
        `Patient ${selectedAdmission.patientName} transferred to ${targetBed.bedNumber} (${targetBed.wardName}).`
      );
      setTransferModalOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Transfer failed";
      message.error(errMsg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeAdmissions.map((p) => {
          const matchingBed = beds.find(
            (b) => b.bedNumber === p.bedNumber || b.currentIpdNo === p.admissionNo
          );

          return (
            <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-teal-600" /> {p.admissionNo}
                  </span>
                  <div className="flex items-center gap-1">
                    <Tag color={p.status === "DISCHARGE_PENDING" ? "orange" : "blue"} className="font-bold">
                      {p.bedNumber}
                    </Tag>
                    {p.status === "DISCHARGE_PENDING" && (
                      <Tag color="volcano" className="text-3xs font-bold">DISCHARGE READY</Tag>
                    )}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{p.patientName}</h3>
                <p className="text-xs text-slate-500">{p.uhid} &bull; {p.age} Yrs / {p.gender}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                  <div>Ward: <strong>{p.admittedWard}</strong></div>
                  <div>Attending Doctor: <strong>{p.attendingDoctor}</strong></div>
                  <div>Admission Date: <strong>{p.admissionDate}</strong></div>
                  <div className="flex justify-between pt-1">
                    <span>Deposit: <strong className="text-emerald-700">₹{p.initialDepositAmount.toLocaleString()}</strong></span>
                    <span>Daily Tariff: <strong className="text-slate-800">₹{matchingBed?.dailyRate || 2500}/Day</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <HmsButton
                  size="sm"
                  variant="secondary"
                  icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenTransferModal(p)}
                >
                  Transfer Bed
                </HmsButton>
                <HmsButton href={`/discharge/${p.admissionNo}`} block size="sm" type="primary" icon={<FileText className="w-3.5 h-3.5" />}>
                  Discharge Summary
                </HmsButton>
              </div>
            </div>
          );
        })}
      </div>

      {activeAdmissions.length === 0 && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 italic">
          No active inpatients currently admitted.
        </div>
      )}

      {/* Transfer Bed Modal */}
      {selectedAdmission && (
        <Modal
          title={
            <div className="flex items-center gap-2 text-purple-700 font-bold border-b pb-2">
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
              <span>Inpatient Bed / Ward Transfer</span>
            </div>
          }
          open={transferModalOpen}
          onCancel={() => setTransferModalOpen(false)}
          footer={null}
          width={500}
        >
          <Form form={form} layout="vertical" onFinish={handleExecuteTransfer} className="mt-4 space-y-4">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs space-y-1">
              <div><strong>Patient:</strong> {selectedAdmission.patientName} ({selectedAdmission.uhid})</div>
              <div><strong>Current Bed:</strong> {selectedAdmission.bedNumber} &bull; {selectedAdmission.admittedWard}</div>
            </div>

            <Form.Item
              label="Select Available Destination Bed"
              name="targetBedId"
              rules={[{ required: true, message: "Please select target bed" }]}
            >
              <Select
                size="large"
                placeholder="Choose vacant destination bed..."
                options={availableBeds.map((b) => ({
                  value: b.id,
                  label: `${b.bedNumber} — ${b.wardName} (${b.category}) [Rate: ₹${b.dailyRate}/Day]`,
                }))}
              />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
              >
                Execute Bed Transfer
              </button>
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
};
