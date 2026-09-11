"use client";

import React, { useState } from "react";
import { Input, message } from "antd";
import { QrCode, Ticket, CheckCircle2, User } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const KioskTokenScanner: React.FC = () => {
  const [tokenGenerated, setTokenGenerated] = useState<string | null>(null);

  const handleScanQr = () => {
    const token = `T-${Math.floor(10 + Math.random() * 90)}`;
    setTokenGenerated(token);
    message.success(`Token ${token} generated for ABHA user Sunil Verma!`);
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-2xl mx-auto text-center space-y-6">
      <div>
        <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Hospital Self Check-in Kiosk</h2>
        <p className="text-slate-500 text-sm mt-1">Scan ABHA QR Code or enter Mobile / UHID for instant OPD Token</p>
      </div>

      {tokenGenerated ? (
        <div className="p-6 bg-teal-50 border-2 border-teal-500 rounded-xl space-y-3">
          <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
          <h3 className="text-lg font-bold text-teal-900">CHECK-IN SUCCESSFUL</h3>
          <div className="text-4xl font-extrabold text-teal-700 tracking-wider font-mono">{tokenGenerated}</div>
          <p className="text-xs text-teal-800">Clinic: Cardiology OPD Clinic 3 &bull; Doctor: Dr. Rajesh Sharma</p>

          <div className="pt-3 border-t border-teal-200">
            <HmsButton onClick={() => setTokenGenerated(null)} variant="emerald" size="lg">
              Print Token & Finish
            </HmsButton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-3">
            <QrCode className="w-16 h-16 text-teal-600 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">Scan ABHA Health Card QR Code</span>
            <HmsButton type="primary" size="lg" onClick={handleScanQr} icon={<QrCode className="w-5 h-5" />}>
              Simulate ABHA Scan
            </HmsButton>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <span className="bg-white px-3 text-xs text-slate-400 uppercase font-semibold">OR ENTER UHID / MOBILE</span>
          </div>

          <div className="flex gap-2">
            <Input prefix={<User className="w-5 h-5 text-slate-400" />} placeholder="Enter Mobile Number or UHID" size="large" />
            <HmsButton type="primary" size="lg" onClick={handleScanQr}>
              Get Token
            </HmsButton>
          </div>
        </div>
      )}
    </div>
  );
};
