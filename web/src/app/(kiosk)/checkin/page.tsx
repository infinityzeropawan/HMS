"use client";

import React from "react";
import { KioskTokenScanner } from "../_kiosk_components/TouchscreenCheckin/KioskTokenScanner";

export default function KioskCheckinPage() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen flex flex-col justify-between items-center">
      <div className="text-center text-white">
        <h1 className="text-3xl font-extrabold text-teal-400">Apollo Super Speciality Hospital</h1>
        <p className="text-xs text-slate-400 mt-1">Touchscreen OPD Token & Self Check-in Kiosk</p>
      </div>

      <div className="w-full">
        <KioskTokenScanner />
      </div>

      <footer className="text-xs text-slate-500">
        ABDM Compliant Kiosk Portal &bull; Emergency OPD Desk
      </footer>
    </div>
  );
}
