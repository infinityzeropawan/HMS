"use client";

import React from "react";
import { KioskTokenScanner } from "../_kiosk_components/TouchscreenCheckin/KioskTokenScanner";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";

export default function KioskCheckinPage() {
  const user = useAuthUserStore((s) => s.user);
  const hospitalName = user?.hospitalName || "HMS Super Speciality Hospital";

  return (
    <div className="p-4 sm:p-8 bg-slate-900 min-h-screen flex flex-col justify-between items-center safe-area-padding">
      <div className="text-center text-white mt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-400">{hospitalName}</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Touchscreen OPD Token & Self Check-in Kiosk</p>
      </div>

      <div className="w-full my-6">
        <KioskTokenScanner />
      </div>

      <footer className="text-xs text-slate-500 mb-2 text-center">
        ABDM Compliant Kiosk Portal &bull; Emergency OPD Desk
      </footer>
    </div>
  );
}
