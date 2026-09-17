"use client";

import React from "react";
import Link from "next/link";
import { GstInvoiceForm } from "../_billing_components/InvoiceGenerator/GstInvoiceForm";
import { Receipt, ShieldCheck, SlidersHorizontal, LayoutDashboard, TrendingUp } from "lucide-react";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export default function BillingInvoicesPage() {
  return (
    <HmsAppShell title="GST Invoice Generator & Billing Desk">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-600" /> GST Tax Invoice Generator
            </h1>
            <p className="text-sm text-slate-500 mt-1">Create HSN/SAC Compliant Tax Invoices, Line Items & Print Receipts</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/billing">
              <HmsButton size="sm" variant="secondary" icon={<LayoutDashboard className="w-4 h-4" />}>
                Billing Hub
              </HmsButton>
            </Link>
            <Link href="/claims">
              <HmsButton size="sm" variant="secondary" icon={<ShieldCheck className="w-4 h-4" />}>
                TPA Claims
              </HmsButton>
            </Link>
            <Link href="/tariffs">
              <HmsButton size="sm" variant="secondary" icon={<SlidersHorizontal className="w-4 h-4" />}>
                Tariffs Master
              </HmsButton>
            </Link>
            <Link href="/revenue">
              <HmsButton size="sm" variant="secondary" icon={<TrendingUp className="w-4 h-4" />}>
                Revenue Analytics
              </HmsButton>
            </Link>
          </div>
        </div>

        <GstInvoiceForm />
      </div>
    </HmsAppShell>
  );
}
