"use client";

import React, { useState } from "react";
import { HandoverForm } from "../_nurse_components/ShiftHandover/HandoverForm";
import { HandoverHistory } from "../_nurse_components/ShiftHandover/HandoverHistory";
import { ClipboardList, History, PlusCircle } from "lucide-react";

export default function ShiftHandoverPage() {
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab("history");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6 safe-area-padding safe-area-bottom">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                Nurse Shift Handover
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                NABH & US-NUR-02 Compliant Shift Continuity Register
              </p>
            </div>
          </div>

          {/* Smartphone Segmented Tab Control */}
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab("form")}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "form"
                  ? "bg-purple-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PlusCircle className="w-4 h-4" /> New Handover
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-purple-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="w-4 h-4" /> Logbook History
            </button>
          </div>
        </header>

        {/* Tab View */}
        {activeTab === "form" ? (
          <HandoverForm onSaved={handleSaved} />
        ) : (
          <HandoverHistory key={refreshKey} />
        )}
      </div>
    </div>
  );
}
