"use client";

import React, { useState } from "react";
import { Tag, Switch, message } from "antd";
import { IdCard, CheckCircle2 } from "lucide-react";

export const AbhaConsentManager: React.FC = () => {
  const [consents, setConsents] = useState([
    { id: "C-9910", requester: "Apollo Super Speciality Hospital", purpose: "Care Management & Clinical Records", granted: true, expiry: "2027-09-08" },
    { id: "C-9915", requester: "Star Health Insurance TPA", purpose: "Claim Cashless Verification", granted: false, expiry: "2026-10-31" },
  ]);

  const handleToggle = (id: string, checked: boolean) => {
    setConsents((prev) => prev.map((c) => (c.id === id ? { ...c, granted: checked } : c)));
    message.success(`ABHA Consent artifact ${id} ${checked ? "APPROVED" : "REVOKED"}. Logged to DPDP ledger.`);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
            <IdCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">ABHA Address: sunil.verma@abdm</h3>
            <p className="text-xs text-slate-500 font-mono">Linked Aadhaar: XXXX-XXXX-1234 &bull; ABHA ID: 91-8899-2201-4455</p>
          </div>
        </div>
        <Tag color="emerald" icon={<CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}>
          VERIFIED ABHA M1
        </Tag>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-3">Active Data Sharing Consent Artifacts</h4>
        <div className="space-y-3">
          {consents.map((c) => (
            <div key={c.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{c.requester}</span>
                  <Tag color={c.granted ? "teal" : "default"}>{c.granted ? "ACTIVE CONSENT" : "REVOKED"}</Tag>
                </div>
                <p className="text-xs text-slate-500 mt-1">Purpose: {c.purpose}</p>
                <p className="text-[10px] text-slate-400 font-mono">Valid until: {c.expiry} &bull; ID: {c.id}</p>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={c.granted} onChange={(checked) => handleToggle(c.id, checked)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
