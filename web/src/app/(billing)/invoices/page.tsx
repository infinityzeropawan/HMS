"use client";

import React from "react";
import { GstInvoiceForm } from "../_billing_components/InvoiceGenerator/GstInvoiceForm";

export default function BillingInvoicesPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
      <GstInvoiceForm />
    </div>
  );
}
