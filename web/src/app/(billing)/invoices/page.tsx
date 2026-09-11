"use client";

import React from "react";
import { GstInvoiceForm } from "../_billing_components/InvoiceGenerator/GstInvoiceForm";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function BillingInvoicesPage() {
  return (
    <HmsAppShell title="GST Invoice Generator">
      <div className="max-w-7xl mx-auto">
        <GstInvoiceForm />
      </div>
    </HmsAppShell>
  );
}
