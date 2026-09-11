"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { HandoverRecord } from "./HandoverForm";
import { Clock, ShieldCheck, UserCheck } from "lucide-react";

const MOCK_HANDOVERS: HandoverRecord[] = [
  {
    id: "HO-884910",
    outgoingNurse: "Nurse Sunita Rao (Reg #NUR-4029)",
    incomingNurse: "Nurse Kavita Sharma (Reg #NUR-5102)",
    shift: "Morning (07:00 - 15:00)",
    ward: "IPD Ward 4A (Medical-Surgical)",
    criticalNotes: "Bed 402: Post-op monitoring required every 2h. SpO2 monitoring active.",
    pendingMedications: "Bed 405: Inj Ceftriaxone 1g IV due at 14:00.",
    signature: "Verified via PIN",
    createdAt: "2026-09-11T14:55:00.000Z",
  },
  {
    id: "HO-884892",
    outgoingNurse: "Nurse Rajesh Kumar (Reg #NUR-3011)",
    incomingNurse: "Nurse Sunita Rao (Reg #NUR-4029)",
    shift: "Night (23:00 - 07:00)",
    ward: "ICU Bed Station 2",
    criticalNotes: "Bed 201: Ventilator settings PEEP 5, FiO2 40%. ABG drawn at 06:00.",
    pendingMedications: "Bed 203: Infusion Noradrenaline 0.05 mcg/kg/min ongoing.",
    signature: "Verified via PIN",
    createdAt: "2026-09-11T06:50:00.000Z",
  },
];

export const HandoverHistory: React.FC = () => {
  const [history, setHistory] = useState<HandoverRecord[]>(MOCK_HANDOVERS);

  const loadHistory = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_nurse_handovers");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.length > 0) {
            setHistory(list);
          }
        } catch {
          /* use mock */
        }
      }
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const columns = [
    {
      title: "Handover ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => <span className="font-mono font-bold text-purple-700">{id}</span>,
    },
    {
      title: "Ward / Station",
      dataIndex: "ward",
      key: "ward",
      render: (ward: string) => <span className="font-semibold text-slate-800 text-xs">{ward}</span>,
    },
    {
      title: "Shift Routine",
      dataIndex: "shift",
      key: "shift",
      render: (shift: string) => <Tag color="purple">{shift}</Tag>,
    },
    {
      title: "Outgoing → Incoming",
      key: "nurses",
      render: (_: unknown, rec: HandoverRecord) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-600">Out: <span className="font-medium">{rec.outgoingNurse}</span></div>
          <div className="text-purple-700">In: <span className="font-medium">{rec.incomingNurse}</span></div>
        </div>
      ),
    },
    {
      title: "Critical Notes",
      dataIndex: "criticalNotes",
      key: "criticalNotes",
      render: (text: string) => <span className="text-xs text-slate-600 line-clamp-2 max-w-xs">{text}</span>,
    },
    {
      title: "Signed At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => (
        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" /> Historical Handover Logbook
        </h3>
        <span className="text-xs text-slate-500">{history.length} records logged</span>
      </div>

      {/* Mobile Smartphone Card View */}
      <div className="block sm:hidden space-y-3">
        {history.map(item => (
          <div key={item.id} className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-purple-800 text-sm">{item.id}</span>
              <Tag color="purple">{item.shift.split(" ")[0]}</Tag>
            </div>
            <p className="text-xs font-semibold text-slate-800">{item.ward}</p>
            <div className="text-xs text-slate-600 bg-white p-2 rounded border border-purple-100 space-y-1">
              <div className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-slate-400" /> Outgoing: {item.outgoingNurse}</div>
              <div className="flex items-center gap-1 text-purple-700 font-medium"><UserCheck className="w-3.5 h-3.5 text-purple-500" /> Incoming: {item.incomingNurse}</div>
            </div>
            <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded">
              <span className="font-semibold block text-[11px] text-slate-500 uppercase">Critical Notes:</span>
              {item.criticalNotes}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden sm:block overflow-x-auto">
        <Table columns={columns} dataSource={history} rowKey="id" pagination={{ pageSize: 5 }} />
      </div>
    </div>
  );
};
