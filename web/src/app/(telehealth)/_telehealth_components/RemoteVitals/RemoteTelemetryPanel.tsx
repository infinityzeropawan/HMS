"use client";

import React from "react";
import { Tag } from "antd";
import { Activity, Heart, Wifi } from "lucide-react";

export const RemoteTelemetryPanel: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-600" /> Remote Patient Telemetry
        </h4>
        <Tag color="emerald" icon={<Wifi className="w-3 h-3 inline mr-1" />}>
          IOT CONNECTED
        </Tag>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-slate-500 block">BP Monitor</span>
          <span className="text-sm font-bold text-slate-900">128/82 mmHg</span>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-slate-500 block">Pulse Oximeter</span>
          <span className="text-sm font-bold text-emerald-700">98% SPO2</span>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-slate-500 block">Heart Rate</span>
          <span className="text-sm font-bold text-rose-600 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500" /> 74 BPM
          </span>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-slate-500 block">Body Temp</span>
          <span className="text-sm font-bold text-amber-600">98.4 °F</span>
        </div>
      </div>
    </div>
  );
};
