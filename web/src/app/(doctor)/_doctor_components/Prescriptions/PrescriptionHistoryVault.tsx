"use client";

import React, { useState } from "react";
import { Table, Tag, Modal, Input } from "antd";
import { FileText, Search, Printer, ShieldCheck, CheckCircle2, Calendar, Pill } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { PatientProfileService } from "@/app/(patient)/_patient_services/patient_profile_service";

interface PrescriptionRecord {
  id: string;
  rxNumber: string;
  uhid: string;
  date: string;
  diagnosis: string;
  medicines: string[];
  signatureHash: string;
  status: "SIGNED" | "DISPENSED";
}

export const PrescriptionHistoryVault: React.FC = () => {
  const [prescriptions] = useState<PrescriptionRecord[]>([
    {
      id: "rx-1",
      rxNumber: "RX-2026-8812",
      uhid: "P-2026-9912",
      date: "2026-09-16",
      diagnosis: "Essential Hypertension & Acute Coronary Syndrome",
      medicines: [
        "Tab. Paracetamol 650mg — 1-0-1 x 5 Days",
        "Tab. Atorvastatin 40mg — 0-0-1 x 30 Days",
        "Tab. Aspirin 75mg — 1-0-0 x 30 Days",
      ],
      signatureHash: "SHA256: 8f92a01...991a",
      status: "SIGNED",
    },
    {
      id: "rx-2",
      rxNumber: "RX-2026-8815",
      uhid: "P-2026-9944",
      date: "2026-09-16",
      diagnosis: "Post-op Osteoarthritis Knee Pain",
      medicines: [
        "Tab. Tramadol 50mg — 1-0-1 x 3 Days",
        "Tab. Pantoprazole 40mg — 1-0-0 x 7 Days",
      ],
      signatureHash: "SHA256: 7b11c09...442b",
      status: "DISPENSED",
    },
    {
      id: "rx-3",
      rxNumber: "RX-2026-8820",
      uhid: "P-2026-9978",
      date: "2026-09-15",
      diagnosis: "Type 2 Diabetes Mellitus & Bronchitis",
      medicines: [
        "Tab. Metformin 500mg — 1-0-1 x 30 Days",
        "Syr. Benadryl 10ml — 0-0-1 x 5 Days",
      ],
      signatureHash: "SHA256: 3c88a99...112e",
      status: "DISPENSED",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRx, setSelectedRx] = useState<PrescriptionRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredRx = prescriptions.filter((p) => {
    const profile = PatientProfileService.getPatientProfile(p.uhid);
    return (
      profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rxNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = [
    {
      title: "Rx Number & Date",
      key: "rxNumber",
      render: (_: unknown, record: PrescriptionRecord) => (
        <div>
          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {record.rxNumber}
          </span>
          <p className="text-3xs text-slate-400 font-mono mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {record.date}
          </p>
        </div>
      ),
    },
    {
      title: "Patient Details (Patient Store)",
      key: "patient",
      render: (_: unknown, record: PrescriptionRecord) => {
        const profile = PatientProfileService.getPatientProfile(record.uhid);
        return (
          <div>
            <span className="font-bold text-slate-900">{profile.fullName}</span>
            <p className="text-xs text-slate-500">
              {profile.age} Yrs / {profile.gender} | Blood Group: <span className="font-bold text-rose-600">{profile.bloodGroup}</span> | UHID: <span className="font-mono">{record.uhid}</span>
            </p>
          </div>
        );
      },
    },
    {
      title: "Diagnosis & Medicines",
      key: "medicines",
      render: (_: unknown, record: PrescriptionRecord) => (
        <div>
          <span className="font-semibold text-xs text-slate-800">{record.diagnosis}</span>
          <p className="text-3xs text-slate-500 mt-0.5 font-mono">
            {record.medicines.length} Drugs Prescribed ({record.medicines[0]})
          </p>
        </div>
      ),
    },
    {
      title: "Digital Signature",
      dataIndex: "signatureHash",
      key: "signatureHash",
      render: (hash: string) => (
        <span className="font-mono text-3xs text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-purple-600" /> {hash}
        </span>
      ),
    },
    {
      title: "Dispense Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={s === "DISPENSED" ? "emerald" : "blue"}>{s}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: PrescriptionRecord) => (
        <HmsButton
          size="sm"
          variant="secondary"
          icon={<FileText className="w-3.5 h-3.5" />}
          onClick={() => {
            setSelectedRx(record);
            setModalOpen(true);
          }}
        >
          View Rx
        </HmsButton>
      ),
    },
  ];

  const selectedProfile = selectedRx ? PatientProfileService.getPatientProfile(selectedRx.uhid) : null;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" /> Doctor e-Prescription History Vault
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View all digitally signed e-prescriptions written by you. Verify digital signatures and print copies.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="Search patient name, UHID or Rx #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Table columns={columns} dataSource={filteredRx} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      {/* Prescription Preview Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>Prescription Preview: {selectedRx?.rxNumber}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Patient: {selectedProfile?.fullName} ({selectedProfile?.age}Y/{selectedProfile?.gender}, Blood: {selectedProfile?.bloodGroup})</span>
              <span>UHID: {selectedRx?.uhid}</span>
            </div>
            <div className="text-slate-600">Diagnosis: <strong>{selectedRx?.diagnosis}</strong></div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1">
              <Pill className="w-4 h-4 text-teal-600" /> Prescribed Medications:
            </h4>
            <ul className="space-y-1.5 list-disc pl-5 font-mono text-slate-900">
              {selectedRx?.medicines.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-purple-900 text-3xs font-mono flex items-center justify-between">
            <span>Digital Signature Verified ({selectedRx?.signatureHash})</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
              Print Prescription
            </HmsButton>
            <HmsButton variant="emerald" onClick={() => setModalOpen(false)}>
              Close
            </HmsButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

