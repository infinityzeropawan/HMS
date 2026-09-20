"use client";

import React from "react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { PrintTemplateStudio } from "../_admin_components/PrintTemplates/PrintTemplateStudio";
import { Printer } from "lucide-react";

export default function PrintTemplatesPage() {
  return (
    <HmsAppShell title="Print Templates & Document Customizer">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-6 h-6 text-teal-600" /> Print Template Studio & Document Customizer
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Customize printable letterheads, headers, footers, doctor signature blocks, and GST tax invoice layouts.
          </p>
        </div>

        <PrintTemplateStudio />
      </div>
    </HmsAppShell>
  );
}
