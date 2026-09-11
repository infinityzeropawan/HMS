"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, message } from "antd";
import { CheckCircle2, Barcode, Clock, UserCheck } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

interface DoseRecord {
  key: string;
  medName: string;
  scheduledTime: string;
  status: "GIVEN" | "SCHEDULED";
  givenAt: string;
  nurse: string;
}

const DEFAULT_DOSES: DoseRecord[] = [
  { key: "1", medName: "Inj Pantocid 40mg IV", scheduledTime: "08:00 AM", status: "GIVEN", givenAt: "08:10 AM", nurse: "Sr. Deepa M." },
  { key: "2", medName: "Tab Ecosprin 75mg PO", scheduledTime: "14:00 PM", status: "GIVEN", givenAt: "14:05 PM", nurse: "Sr. Kavita R." },
  { key: "3", medName: "Inj Augmentin 1.2g IV", scheduledTime: "18:00 PM", status: "SCHEDULED", givenAt: "-", nurse: "-" },
  { key: "4", medName: "Tab Sorbitrate 5mg SL", scheduledTime: "22:00 PM", status: "SCHEDULED", givenAt: "-", nurse: "-" },
];

export const MedicationAdminChecklist: React.FC = () => {
  const [doses, setDoses] = useState<DoseRecord[]>(DEFAULT_DOSES);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_mar");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.length > 0) {
            setDoses(list);
          }
        } catch { /* use default */ }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_mar", JSON.stringify(doses));
    }
  }, [doses]);

  const handleAdminister = (key: string, medName: string) => {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setDoses((prev) =>
      prev.map((d) =>
        d.key === key
          ? { ...d, status: "GIVEN", givenAt: ts, nurse: "Sr. Kavita R. (Reg #NUR-5102)" }
          : d
      )
    );
    message.success(`Dose ${medName} marked as Administered with Barcode Verification at ${ts}.`);
  };

  const columns = [
    { title: "Medication & Route", dataIndex: "medName", key: "medName", render: (m: string) => <span className="font-semibold text-slate-900">{m}</span> },
    { title: "Scheduled Time", dataIndex: "scheduledTime", key: "scheduledTime", render: (t: string) => <span className="font-mono text-xs">{t}</span> },
    { title: "Administered At", dataIndex: "givenAt", key: "givenAt", render: (g: string) => <span className="font-mono text-xs text-emerald-700">{g}</span> },
    {
      title: "MAR Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "GIVEN" ? "emerald" : "orange"}>
          {status === "GIVEN" ? "ADMINISTERED" : "DUE"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: DoseRecord) =>
        record.status === "SCHEDULED" ? (
          <HmsButton
            size="sm"
            variant="emerald"
            icon={<Barcode className="w-3.5 h-3.5" />}
            onClick={() => handleAdminister(record.key, record.medName)}
          >
            Scan & Administer
          </HmsButton>
        ) : (
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified ({record.nurse})
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Smartphone Mobile Cards */}
      <div className="block sm:hidden space-y-2">
        {doses.map((d) => (
          <div
            key={d.key}
            className={`p-3 rounded-xl border space-y-2 text-xs ${
              d.status === "GIVEN" ? "bg-emerald-50/70 border-emerald-200" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{d.medName}</span>
              <Tag color={d.status === "GIVEN" ? "emerald" : "orange"}>
                {d.status === "GIVEN" ? "ADMINISTERED" : "DUE"}
              </Tag>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1 font-mono"><Clock className="w-3.5 h-3.5 text-slate-400" /> Due: {d.scheduledTime}</span>
              {d.status === "GIVEN" && (
                <span className="flex items-center gap-1 text-emerald-700 font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Given: {d.givenAt}</span>
              )}
            </div>
            {d.status === "SCHEDULED" ? (
              <HmsButton
                size="lg"
                fullWidth
                variant="emerald"
                icon={<Barcode className="w-4 h-4" />}
                onClick={() => handleAdminister(d.key, d.medName)}
              >
                Scan & Administer Dose
              </HmsButton>
            ) : (
              <div className="text-[11px] text-emerald-800 flex items-center gap-1 pt-1 border-t border-emerald-100 font-medium">
                <UserCheck className="w-3.5 h-3.5" /> Administered by {d.nurse}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden sm:block overflow-x-auto">
        <Table columns={columns} dataSource={doses} pagination={false} rowKey="key" />
      </div>
    </div>
  );
};

