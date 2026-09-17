"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { SpecimenCollectionQueue } from "../_lab_components/Specimens/SpecimenCollectionQueue";
import { TestTube } from "lucide-react";

export default function LabSpecimensPage() {
  return (
    <HmsAppShell title="Sample Collection & Barcoding">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TestTube className="w-6 h-6 text-purple-600" /> Phlebotomy Sample Collection & Barcoding Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate tube barcode labels (EDTA / Serum), track specimen collection, and dispatch to automated analyzers.
          </p>
        </div>

        <SpecimenCollectionQueue />
      </div>
    </HmsAppShell>
  );
}
