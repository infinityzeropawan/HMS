"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag, message, Modal, Input, Radio, Space } from "antd";
import { SearchOutlined, CheckCircleOutlined, EyeOutlined, PrinterOutlined } from "@ant-design/icons";
import { Pill, CheckSquare, FileText, DollarSign, AlertCircle } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { FefoBatchModal } from "../FefoBatchSelector/FefoBatchModal";
import { PharmacyService } from "../../_pharmacy_services/pharmacy_service";

interface PrescribedItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  qty: number;
  unitPrice: number;
  batchNo: string;
}

interface PrescriptionRecord {
  key: string;
  rxId: string;
  uhid: string;
  patientName: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  allergies?: string;
  status: "PENDING" | "DISPENSED" | "ON_HOLD";
  items: PrescribedItem[];
  dispensedAt?: string;
  totalAmount: number;
}

const INITIAL_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    key: "1",
    rxId: "RX-9910",
    uhid: "P-2026-1049",
    patientName: "Sunil Verma",
    doctorName: "Dr. Rajesh Sharma",
    department: "Cardiology Clinic",
    diagnosis: "Acute Coronary Syndrome / Angina",
    allergies: "No known drug allergies (NKDA)",
    status: "PENDING",
    totalAmount: 480,
    items: [
      { name: "Tab Sorbitrate 5mg", dosage: "5mg Sublingual", frequency: "Stat & SOS", duration: "5 days", qty: 10, unitPrice: 12, batchNo: "BT-SOR-09" },
      { name: "Tab Ecosprin 75mg", dosage: "75mg Oral", frequency: "1-0-0 (Morning)", duration: "30 days", qty: 30, unitPrice: 4, batchNo: "BT-ECO-44" },
      { name: "Tab Atorvastatin 20mg", dosage: "20mg Oral", frequency: "0-0-1 (Night)", duration: "30 days", qty: 30, unitPrice: 8, batchNo: "BT-ATO-12" },
    ],
  },
  {
    key: "2",
    rxId: "RX-9912",
    uhid: "P-2026-1052",
    patientName: "Anjali Gupta",
    doctorName: "Dr. Priya Nair",
    department: "Pediatrics & OPD",
    diagnosis: "Acute Upper Respiratory Tract Infection",
    allergies: "Penicillin Mild Rash",
    status: "PENDING",
    totalAmount: 320,
    items: [
      { name: "Cap Amoxicillin 500mg", dosage: "500mg", frequency: "1-0-1", duration: "5 days", qty: 10, unitPrice: 18, batchNo: "BT-AMX-88" },
      { name: "Tab Paracetamol 650mg", dosage: "650mg", frequency: "1-1-1 SOS", duration: "3 days", qty: 10, unitPrice: 5, batchNo: "BT-PCM-02" },
      { name: "Syr Cetirizine 5ml", dosage: "5ml", frequency: "0-0-1", duration: "5 days", qty: 1, unitPrice: 90, batchNo: "BT-CET-19" },
    ],
  },
  {
    key: "3",
    rxId: "RX-9915",
    uhid: "P-2026-1058",
    patientName: "Ramesh Kumar",
    doctorName: "Dr. Rajesh Sharma",
    department: "Orthopedics",
    diagnosis: "Post-op Lumbar Spondylosis Pain",
    allergies: "None",
    status: "PENDING",
    totalAmount: 650,
    items: [
      { name: "Tab Tramadol 50mg", dosage: "50mg", frequency: "1-0-1", duration: "5 days", qty: 10, unitPrice: 25, batchNo: "BT-TRM-05" },
      { name: "Tab Pantoprazole 40mg", dosage: "40mg", frequency: "1-0-0 (Before Food)", duration: "10 days", qty: 10, unitPrice: 15, batchNo: "BT-PAN-11" },
      { name: "Cap Calcium D3 60k", dosage: "60,000 IU", frequency: "Once Weekly", duration: "4 weeks", qty: 4, unitPrice: 65, batchNo: "BT-CAL-33" },
    ],
  },
  {
    key: "4",
    rxId: "RX-9918",
    uhid: "P-2026-1062",
    patientName: "Priya Sharma",
    doctorName: "Dr. Ananya Roy",
    department: "Endocrinology",
    diagnosis: "Type-2 Diabetes Mellitus",
    allergies: "None",
    status: "DISPENSED",
    dispensedAt: "2026-09-16T14:30:00Z",
    totalAmount: 410,
    items: [
      { name: "Tab Metformin 500mg SR", dosage: "500mg", frequency: "1-0-1", duration: "30 days", qty: 60, unitPrice: 4, batchNo: "BT-MET-99" },
      { name: "Tab Glimepiride 2mg", dosage: "2mg", frequency: "1-0-0", duration: "30 days", qty: 30, unitPrice: 5.6, batchNo: "BT-GLI-21" },
    ],
  },
];

export const PharmacyDispenseTable: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(INITIAL_PRESCRIPTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "DISPENSED">("PENDING");

  // FEFO Modal
  const [fefoOpen, setFefoOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState("");

  // Prescription View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeRx, setActiveRx] = useState<PrescriptionRecord | null>(null);

  // Dispense & Billing Modal
  const [dispenseModalOpen, setDispenseModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState("UPI");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_pharmacy_dispense");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.length > 0) {
            setPrescriptions(list);
          }
        } catch { /* use initial */ }
      }
    }
  }, []);

  const updateAndSaveState = (updated: PrescriptionRecord[]) => {
    setPrescriptions(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_pharmacy_dispense", JSON.stringify(updated));
    }
  };

  const handleOpenFefo = (drugName: string) => {
    setSelectedDrug(drugName);
    setFefoOpen(true);
  };

  const handleViewPrescription = (rx: PrescriptionRecord) => {
    setActiveRx(rx);
    setViewModalOpen(true);
  };

  const handleOpenDispenseModal = (rx: PrescriptionRecord) => {
    setActiveRx(rx);
    setDispenseModalOpen(true);
  };

  const handleConfirmDispense = () => {
    if (!activeRx) return;

    // Call PharmacyService to deduct stock, post billing invoice, record schedule audit, and send SMS
    PharmacyService.dispensePrescription({
      rxId: activeRx.rxId,
      patientName: activeRx.patientName,
      uhid: activeRx.uhid,
      doctorName: activeRx.doctorName,
      department: activeRx.department,
      totalAmount: activeRx.totalAmount,
      paymentMode,
      items: activeRx.items.map((i) => ({
        name: i.name,
        drugName: i.name,
        qty: i.qty,
        unitPrice: i.unitPrice,
        batchNo: i.batchNo,
      })),
    });

    const updated = prescriptions.map((p) => {
      if (p.rxId === activeRx.rxId) {
        return {
          ...p,
          status: "DISPENSED" as const,
          dispensedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    updateAndSaveState(updated);
    message.success(`Prescription ${activeRx.rxId} dispensed! ₹${activeRx.totalAmount} collected & stock updated.`);
    setDispenseModalOpen(false);
  };

  const filteredData = prescriptions.filter((item) => {
    const matchesSearch =
      item.rxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uhid.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterTab === "ALL" || item.status === filterTab;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "Rx ID",
      dataIndex: "rxId",
      key: "rxId",
      render: (val: string) => <span className="font-mono font-bold text-purple-700">{val}</span>,
    },
    {
      title: "Patient UHID & Name",
      key: "patient",
      render: (_: unknown, record: PrescriptionRecord) => (
        <div>
          <span className="font-bold text-slate-900 block">{record.patientName}</span>
          <span className="text-xs font-mono text-slate-500">{record.uhid}</span>
        </div>
      ),
    },
    {
      title: "Prescribing Doctor",
      key: "doctor",
      render: (_: unknown, record: PrescriptionRecord) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{record.doctorName}</span>
          <span className="text-[11px] text-slate-500">{record.department}</span>
        </div>
      ),
    },
    {
      title: "Prescribed Items Summary",
      key: "meds",
      render: (_: unknown, record: PrescriptionRecord) => (
        <div className="max-w-xs truncate text-xs text-slate-600">
          {record.items.map((i) => `${i.name} (${i.qty})`).join(", ")}
        </div>
      ),
    },
    {
      title: "Total Bill Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amt: number) => <span className="font-bold text-emerald-700 font-mono">₹{amt}</span>,
    },
    {
      title: "Dispense Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "PENDING" ? "volcano" : status === "DISPENSED" ? "green" : "gold"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_: unknown, record: PrescriptionRecord) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <HmsButton
            size="sm"
            variant="secondary"
            icon={<EyeOutlined />}
            onClick={() => handleViewPrescription(record)}
          >
            View Rx
          </HmsButton>
          <HmsButton
            size="sm"
            variant="secondary"
            icon={<Pill className="w-3.5 h-3.5" />}
            onClick={() => handleOpenFefo(record.items[0]?.name || "Medication")}
          >
            FEFO Batch
          </HmsButton>
          {record.status === "PENDING" ? (
            <HmsButton
              size="sm"
              type="primary"
              variant="emerald"
              icon={<CheckSquare className="w-3.5 h-3.5" />}
              onClick={() => handleOpenDispenseModal(record)}
            >
              Dispense & Bill
            </HmsButton>
          ) : (
            <Tag icon={<CheckCircleOutlined />} color="success" className="py-1 px-2">
              Completed
            </Tag>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <Input
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search Rx ID, Patient Name, or UHID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72"
          allowClear
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Queue Filter:</span>
          <Radio.Group
            value={filterTab}
            onChange={(e) => setFilterTab(e.target.value)}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="PENDING">Pending ({prescriptions.filter((p) => p.status === "PENDING").length})</Radio.Button>
            <Radio.Button value="DISPENSED">Dispensed ({prescriptions.filter((p) => p.status === "DISPENSED").length})</Radio.Button>
            <Radio.Button value="ALL">All ({prescriptions.length})</Radio.Button>
          </Radio.Group>
        </div>
      </div>

      {/* Desktop Main Table */}
      <div className="hidden sm:block overflow-x-auto">
        <Table columns={columns} dataSource={filteredData} rowKey="key" pagination={{ pageSize: 8 }} />
      </div>

      {/* Mobile Card List View (<640px) */}
      <div className="block sm:hidden space-y-3">
        {filteredData.length === 0 ? (
          <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed">
            No prescriptions found matching filter.
          </div>
        ) : (
          filteredData.map((record) => (
            <div key={record.key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-purple-700 text-xs block">{record.rxId}</span>
                  <h4 className="font-bold text-slate-900 text-sm">{record.patientName}</h4>
                  <span className="font-mono text-[11px] text-slate-500">{record.uhid}</span>
                </div>
                <Tag color={record.status === "PENDING" ? "volcano" : record.status === "DISPENSED" ? "green" : "gold"}>
                  {record.status}
                </Tag>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <p><strong>Doctor:</strong> {record.doctorName} ({record.department})</p>
                <p className="mt-1 font-semibold text-slate-800">
                  Meds: {record.items.map((i) => `${i.name} (x${i.qty})`).join(", ")}
                </p>
              </div>

              <div className="flex justify-between items-center pt-1 border-t">
                <span className="font-bold text-emerald-700 font-mono text-sm">₹{record.totalAmount}</span>
                <div className="flex items-center gap-1">
                  <HmsButton
                    size="sm"
                    variant="secondary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewPrescription(record)}
                  >
                    Rx
                  </HmsButton>
                  {record.status === "PENDING" && (
                    <HmsButton
                      size="sm"
                      type="primary"
                      variant="emerald"
                      icon={<CheckSquare className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenDispenseModal(record)}
                    >
                      Bill
                    </HmsButton>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FEFO Batch Picker Modal */}
      <FefoBatchModal
        open={fefoOpen}
        onClose={() => setFefoOpen(false)}
        drugName={selectedDrug}
      />

      {/* View e-Prescription Details Modal */}
      {activeRx && (
        <Modal
          title={
            <div className="flex items-center justify-between border-b pb-3 pr-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-slate-900">e-Prescription Details ({activeRx.rxId})</span>
              </div>
              <Tag color={activeRx.status === "PENDING" ? "volcano" : "green"}>{activeRx.status}</Tag>
            </div>
          }
          open={viewModalOpen}
          onCancel={() => setViewModalOpen(false)}
          footer={[
            <button
              key="close"
              onClick={() => setViewModalOpen(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer mr-2"
            >
              Close
            </button>,
            activeRx.status === "PENDING" && (
              <button
                key="dispense"
                onClick={() => {
                  setViewModalOpen(false);
                  handleOpenDispenseModal(activeRx);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Proceed to Dispense & Bill
              </button>
            ),
          ]}
          width={600}
        >
          <div className="space-y-4 py-2 text-xs">
            {/* Patient & Doctor Banner */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Patient Information</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeRx.patientName}</p>
                <p className="font-mono text-slate-600">{activeRx.uhid}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Prescriber</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeRx.doctorName}</p>
                <p className="text-slate-600">{activeRx.department}</p>
              </div>
            </div>

            {/* Diagnosis & Allergies */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
              <div><strong>Diagnosis:</strong> {activeRx.diagnosis}</div>
              <div className="text-rose-700 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Allergy Warning: {activeRx.allergies || "None Reported"}
              </div>
            </div>

            {/* Itemized Medications List */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Prescribed Medication Line Items</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-2">Medication</th>
                      <th className="p-2">Dosage</th>
                      <th className="p-2">Frequency</th>
                      <th className="p-2">Duration</th>
                      <th className="p-2 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeRx.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-medium text-slate-900">{item.name}</td>
                        <td className="p-2 text-slate-600">{item.dosage}</td>
                        <td className="p-2 text-slate-600">{item.frequency}</td>
                        <td className="p-2 text-slate-600">{item.duration}</td>
                        <td className="p-2 text-right font-bold text-slate-800">{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Dispense & Billing Confirmation Modal */}
      {activeRx && (
        <Modal
          title={
            <div className="flex items-center gap-2 text-emerald-700 font-bold border-b pb-3 pr-6">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Dispense Medication & Issue Bill Receipt ({activeRx.rxId})</span>
            </div>
          }
          open={dispenseModalOpen}
          onCancel={() => setDispenseModalOpen(false)}
          footer={null}
          width={580}
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 text-sm">{activeRx.patientName} ({activeRx.uhid})</p>
                <p className="text-slate-500">Prescribed by {activeRx.doctorName}</p>
              </div>
              <Tag color="volcano" className="text-xs font-bold py-0.5 px-2">FEFO VERIFIED</Tag>
            </div>

            {/* Bill Breakup Table */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Dispensing Line Items & Pricing</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-2">Item Name</th>
                      <th className="p-2">FEFO Batch</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeRx.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium text-slate-900">{item.name}</td>
                        <td className="p-2 font-mono text-purple-700">{item.batchNo}</td>
                        <td className="p-2 text-center font-bold">{item.qty}</td>
                        <td className="p-2 text-right">₹{item.unitPrice}</td>
                        <td className="p-2 text-right font-bold text-slate-800">₹{item.qty * item.unitPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Breakdown */}
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal (Excl. Tax):</span>
                <span>₹{(activeRx.totalAmount * 0.892).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>GST (Pharma Rate 12%):</span>
                <span>₹{(activeRx.totalAmount * 0.108).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-emerald-900 border-t border-emerald-200 pt-2">
                <span>Net Payable Amount:</span>
                <span className="font-mono text-lg">₹{activeRx.totalAmount}</span>
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">Select Counter Payment Mode:</label>
              <Radio.Group
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full grid grid-cols-3 gap-2"
              >
                <Radio.Button value="UPI" className="text-center font-bold">UPI / QR Code</Radio.Button>
                <Radio.Button value="CASH" className="text-center font-bold">Cash Counter</Radio.Button>
                <Radio.Button value="CARD" className="text-center font-bold">Credit/Debit Card</Radio.Button>
              </Radio.Group>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setDispenseModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispense}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <PrinterOutlined /> Confirm Dispense & Issue Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
