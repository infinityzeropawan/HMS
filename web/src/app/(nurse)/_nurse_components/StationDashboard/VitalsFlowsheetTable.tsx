"use client";

import React, { useState } from "react";
import { Table, Tag } from "antd";
import { Clock, UserCheck } from "lucide-react";
import { useNurseVitalsStore } from "../../_nurse_stores/nurse_vitals_store";
import { Patient360DrawerModal } from "../Patient360/Patient360DrawerModal";

interface VitalEntry {
  key: string;
  uhid: string;
  time: string;
  bp: string;
  pulse: number;
  spo2: number;
  temp: string;
  gcs: number;
  nurse: string;
  isAbnormal?: boolean;
}

export const VitalsFlowsheetTable: React.FC = () => {
  const vitalsLogs = useNurseVitalsStore((state) => state.vitalsLogs);
  const [selectedUhid, setSelectedUhid] = useState<string | null>(null);

  const mappedVitals: VitalEntry[] = vitalsLogs.map((log) => {
    let displayTime = log.recordedAt;
    if (log.recordedAt.includes("T")) {
      const d = new Date(log.recordedAt);
      displayTime = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return {
      key: log.id,
      uhid: log.uhid,
      time: displayTime,
      bp: `${log.bpSystolic}/${log.bpDiastolic}`,
      pulse: log.pulseRate,
      spo2: log.spO2Percent,
      temp: `${log.temperatureFahrenheit}°F`,
      gcs: 15,
      nurse: log.recordedBy,
      isAbnormal: log.isAbnormal,
    };
  });

  const columns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (t: string) => <span className="font-mono font-bold text-purple-800">{t}</span>,
    },
    {
      title: "BP (mmHg)",
      dataIndex: "bp",
      key: "bp",
      render: (bp: string) => {
        const systolic = parseInt(bp.split("/")[0] || "120", 10);
        const isHigh = systolic >= 140;
        return (
          <span className={`font-mono ${isHigh ? "text-rose-600 font-bold" : "text-slate-800"}`}>
            {bp} {isHigh && "⚠️"}
          </span>
        );
      },
    },
    { title: "Pulse (BPM)", dataIndex: "pulse", key: "pulse", render: (p: number) => <span className="font-mono">{p} bpm</span> },
    {
      title: "SpO₂ (%)",
      dataIndex: "spo2",
      key: "spo2",
      render: (val: number) => (
        <span className={val < 94 ? "text-rose-600 font-bold" : "text-emerald-700 font-medium"}>
          {val}% {val < 94 && "⚠️ Panic"}
        </span>
      ),
    },
    { title: "Temp (°F)", dataIndex: "temp", key: "temp" },
    { title: "GCS Score", dataIndex: "gcs", key: "gcs", render: (gcs: number) => <Tag color={gcs < 15 ? "warning" : "green"}>{gcs}/15</Tag> },
    { title: "Nurse", dataIndex: "nurse", key: "nurse", render: (n: string) => <span className="text-xs text-slate-500">{n}</span> },
  ];

  return (
    <div className="space-y-3">
      {/* Mobile Smartphone Card View */}
      <div className="block sm:hidden space-y-2">
        {mappedVitals.map((v) => {
          const sys = parseInt(v.bp.split("/")[0] || "120", 10);
          const isWarning = sys >= 140 || v.spo2 < 94;
          return (
            <div
              key={v.key}
              onClick={() => setSelectedUhid(v.uhid)}
              className={`p-3 rounded-xl border space-y-1 text-xs cursor-pointer ${
                isWarning ? "bg-rose-50/70 border-rose-200" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="font-mono text-purple-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-500" /> {v.time}
                </span>
                {isWarning && <Tag color="error">CRITICAL VITALS</Tag>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                <div>BP: <strong className={sys >= 140 ? "text-rose-600" : ""}>{v.bp}</strong></div>
                <div>Pulse: <strong>{v.pulse} bpm</strong></div>
                <div>SpO₂: <strong className={v.spo2 < 94 ? "text-rose-600" : "text-emerald-700"}>{v.spo2}%</strong></div>
                <div>Temp: <strong>{v.temp}</strong></div>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/50">
                <span>GCS: {v.gcs}/15</span>
                <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {v.nurse}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden sm:block overflow-x-auto">
        <Table
          columns={columns}
          dataSource={mappedVitals}
          pagination={false}
          size="small"
          rowKey="key"
          onRow={(record) => ({
            onClick: () => setSelectedUhid(record.uhid),
            style: { cursor: "pointer" },
          })}
        />
      </div>

      {selectedUhid && (
        <Patient360DrawerModal
          open={!!selectedUhid}
          onClose={() => setSelectedUhid(null)}
          uhid={selectedUhid}
        />
      )}
    </div>
  );
};

