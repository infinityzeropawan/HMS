"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface InvoiceItem {
  itemId: string;
  description: string;
  hsnSacCode: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  patientUhid: string;
  patientName: string;
  category?: "OPD" | "IPD" | "PHARMACY" | "LAB" | "ADVANCE";
  items: InvoiceItem[];
  paymentMode: "UPI" | "CASH" | "CARD" | "INSURANCE_TPA";
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: "PAID" | "PARTIALLY_PAID" | "UNPAID" | "REFUNDED" | "CLAIM_SUBMITTED";
  createdAt: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  invoiceNumber: string;
  patientUhid: string;
  patientName: string;
  amountPaid: number;
  paymentMode: "UPI" | "CASH" | "CARD" | "INSURANCE_TPA";
  transactionRef?: string;
  receivedBy: string;
  createdAt: string;
}

export interface CreditNoteRecord {
  id: string;
  creditNoteNo: string;
  invoiceNumber: string;
  patientUhid: string;
  patientName: string;
  refundAmount: number;
  reason: string;
  approvedBy: string;
  refundMode: "CASH" | "UPI" | "BANK_TRANSFER";
  status: "ISSUED" | "SETTLED";
  createdAt: string;
}

export interface AdvanceDepositRecord {
  id: string;
  depositNo: string;
  patientUhid: string;
  patientName: string;
  roomBedNo: string;
  admissionDate: string;
  initialDeposit: number;
  roomCharges: number;
  nursingCharges: number;
  labCharges: number;
  pharmacyCharges: number;
  currentBalance: number;
  status: "ACTIVE" | "SETTLED" | "REFUND_DUE";
  lastUpdated: string;
}

export interface OutstandingDueRecord {
  id: string;
  invoiceNumber: string;
  patientUhid: string;
  patientName: string;
  phone: string;
  department: string;
  totalBillAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  dueDate: string;
  lastPaymentDate: string;
  status: "OVERDUE" | "PARTIAL" | "DISPUTED";
}

interface BillingStoreState {
  invoices: InvoiceRecord[];
  payments: PaymentReceipt[];
  creditNotes: CreditNoteRecord[];
  advanceDeposits: AdvanceDepositRecord[];
  outstandingDues: OutstandingDueRecord[];

  addInvoice: (inv: Omit<InvoiceRecord, "id" | "createdAt" | "paidAmount" | "balanceDue" | "status"> & { paidAmount?: number; status?: InvoiceRecord["status"] }) => InvoiceRecord;
  issueCreditNote: (cn: Omit<CreditNoteRecord, "id" | "createdAt" | "creditNoteNo" | "status">) => CreditNoteRecord;
  recordAdvanceDeposit: (dep: Omit<AdvanceDepositRecord, "id" | "lastUpdated" | "currentBalance" | "status">) => AdvanceDepositRecord;
  collectOutstandingDue: (invoiceNumber: string, amount: number, paymentMode: "UPI" | "CASH" | "CARD") => void;
  refundPayment: (invoiceNumber: string, amount: number, reason: string, approvedBy: string) => void;

  resetToDefaults: () => void;
}

const DEFAULT_INVOICES: InvoiceRecord[] = [
  {
    id: "inv-101",
    invoiceNumber: "INV-2026-01049",
    patientUhid: "P-2026-1049",
    patientName: "Sunil Verma",
    category: "OPD",
    items: [
      { itemId: "it-1", description: "[SRV-CONS-OPD] General OPD Consultation", hsnSacCode: "999312", quantity: 1, unitPrice: 500, gstRate: 0 },
      { itemId: "it-2", description: "[SRV-DIAG-ECG] 12-Lead Electrocardiogram", hsnSacCode: "999313", quantity: 1, unitPrice: 750, gstRate: 0 },
    ],
    paymentMode: "UPI",
    subtotal: 1250,
    cgstAmount: 0,
    sgstAmount: 0,
    totalAmount: 1250,
    paidAmount: 1250,
    balanceDue: 0,
    status: "PAID",
    createdAt: "2026-09-17 10:15 AM",
  },
  {
    id: "inv-102",
    invoiceNumber: "INV-2026-01052",
    patientUhid: "P-2026-1052",
    patientName: "Anjali Gupta",
    category: "PHARMACY",
    items: [
      { itemId: "it-3", description: "Pediatric Antibiotic Syrup & Multi-Vitamins", hsnSacCode: "3004", quantity: 1, unitPrice: 828, gstRate: 12 },
    ],
    paymentMode: "CASH",
    subtotal: 828,
    cgstAmount: 21,
    sgstAmount: 21,
    totalAmount: 870,
    paidAmount: 870,
    balanceDue: 0,
    status: "PAID",
    createdAt: "2026-09-17 10:45 AM",
  },
  {
    id: "inv-103",
    invoiceNumber: "INV-2026-01058",
    patientUhid: "P-2026-1058",
    patientName: "Ramesh Kumar",
    category: "IPD",
    items: [
      { itemId: "it-4", description: "IPD Lumbar Spondylosis Pre-Auth Advance", hsnSacCode: "999311", quantity: 1, unitPrice: 25000, gstRate: 0 },
    ],
    paymentMode: "INSURANCE_TPA",
    subtotal: 25000,
    cgstAmount: 0,
    sgstAmount: 0,
    totalAmount: 25000,
    paidAmount: 0,
    balanceDue: 25000,
    status: "CLAIM_SUBMITTED",
    createdAt: "2026-09-17 11:00 AM",
  },
];

const DEFAULT_DEPOSITS: AdvanceDepositRecord[] = [
  {
    id: "dep-101",
    depositNo: "DEP-2026-4401",
    patientUhid: "P-2026-1058",
    patientName: "Ramesh Kumar",
    roomBedNo: "ICU Bed-04",
    admissionDate: "2026-09-15",
    initialDeposit: 50000,
    roomCharges: 14000,
    nursingCharges: 3500,
    labCharges: 4200,
    pharmacyCharges: 6100,
    currentBalance: 22200,
    status: "ACTIVE",
    lastUpdated: "2026-09-18 09:30 AM",
  },
  {
    id: "dep-102",
    depositNo: "DEP-2026-4405",
    patientUhid: "P-2026-1062",
    patientName: "Priya Sharma",
    roomBedNo: "Deluxe Ward 302",
    admissionDate: "2026-09-16",
    initialDeposit: 30000,
    roomCharges: 9000,
    nursingCharges: 2000,
    labCharges: 2500,
    pharmacyCharges: 1800,
    currentBalance: 14700,
    status: "ACTIVE",
    lastUpdated: "2026-09-18 11:15 AM",
  },
];

const DEFAULT_OUTSTANDING: OutstandingDueRecord[] = [
  {
    id: "due-101",
    invoiceNumber: "INV-2026-00980",
    patientUhid: "P-2026-1012",
    patientName: "Mahesh Joshi",
    phone: "+91 98204 11223",
    department: "Orthopedics & OT",
    totalBillAmount: 48000,
    paidAmount: 30000,
    outstandingBalance: 18000,
    dueDate: "2026-09-20",
    lastPaymentDate: "2026-09-10",
    status: "PARTIAL",
  },
  {
    id: "due-102",
    invoiceNumber: "INV-2026-00995",
    patientUhid: "P-2026-1025",
    patientName: "Kavita Rao",
    phone: "+91 98205 33445",
    department: "General Surgery",
    totalBillAmount: 35000,
    paidAmount: 15000,
    outstandingBalance: 20000,
    dueDate: "2026-09-18",
    lastPaymentDate: "2026-09-05",
    status: "OVERDUE",
  },
];

const DEFAULT_CREDIT_NOTES: CreditNoteRecord[] = [
  {
    id: "cn-101",
    creditNoteNo: "CN-2026-901",
    invoiceNumber: "INV-2026-01049",
    patientUhid: "P-2026-1049",
    patientName: "Sunil Verma",
    refundAmount: 750,
    reason: "Duplicate ECG test billing cancelled by Dr. Rajesh",
    approvedBy: "Sr. Billing Supervisor",
    refundMode: "UPI",
    status: "ISSUED",
    createdAt: "2026-09-17 02:30 PM",
  },
];

export const useBillingStore = create<BillingStoreState>()(
  persist(
    (set, get) => ({
      invoices: DEFAULT_INVOICES,
      payments: [],
      creditNotes: DEFAULT_CREDIT_NOTES,
      advanceDeposits: DEFAULT_DEPOSITS,
      outstandingDues: DEFAULT_OUTSTANDING,

      addInvoice: (input) => {
        const paid = input.paidAmount ?? input.totalAmount;
        const balance = Math.max(0, input.totalAmount - paid);
        const status: InvoiceRecord["status"] =
          input.status || (balance === 0 ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : "UNPAID");

        const newInvoice: InvoiceRecord = {
          ...input,
          id: `inv-${Date.now()}`,
          paidAmount: paid,
          balanceDue: balance,
          status,
          createdAt: new Date().toLocaleString(),
        };

        set((state) => {
          const updated = [newInvoice, ...state.invoices];
          if (typeof window !== "undefined") {
            localStorage.setItem("hms_invoices", JSON.stringify(updated));
          }
          return { invoices: updated };
        });

        return newInvoice;
      },

      issueCreditNote: (cnInput) => {
        const cnNo = `CN-2026-${Math.floor(100 + Math.random() * 900)}`;
        const newCn: CreditNoteRecord = {
          ...cnInput,
          id: `cn-${Date.now()}`,
          creditNoteNo: cnNo,
          status: "ISSUED",
          createdAt: new Date().toLocaleString(),
        };

        set((state) => {
          // Update invoice status to REFUNDED if fully refunded
          const updatedInvoices = state.invoices.map((inv) => {
            if (inv.invoiceNumber === cnInput.invoiceNumber) {
              const newBalance = Math.max(0, inv.balanceDue + cnInput.refundAmount);
              return {
                ...inv,
                status: "REFUNDED" as const,
                balanceDue: newBalance,
              };
            }
            return inv;
          });

          return {
            creditNotes: [newCn, ...state.creditNotes],
            invoices: updatedInvoices,
          };
        });

        return newCn;
      },

      recordAdvanceDeposit: (depInput) => {
        const currentBalance =
          depInput.initialDeposit -
          (depInput.roomCharges + depInput.nursingCharges + depInput.labCharges + depInput.pharmacyCharges);

        const newDep: AdvanceDepositRecord = {
          ...depInput,
          id: `dep-${Date.now()}`,
          depositNo: `DEP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          currentBalance,
          status: currentBalance > 0 ? "ACTIVE" : "REFUND_DUE",
          lastUpdated: new Date().toLocaleString(),
        };

        set((state) => ({ advanceDeposits: [newDep, ...state.advanceDeposits] }));
        return newDep;
      },

      collectOutstandingDue: (invoiceNumber, amount, paymentMode) => {
        set((state) => {
          const updatedDues = state.outstandingDues.map((due) => {
            if (due.invoiceNumber === invoiceNumber) {
              const newPaid = due.paidAmount + amount;
              const newBal = Math.max(0, due.totalBillAmount - newPaid);
              return {
                ...due,
                paidAmount: newPaid,
                outstandingBalance: newBal,
                lastPaymentDate: new Date().toISOString().split("T")[0],
                status: (newBal === 0 ? "PARTIAL" : "OVERDUE") as OutstandingDueRecord["status"],
              };
            }
            return due;
          });

          const newPayment: PaymentReceipt = {
            id: `pay-${Date.now()}`,
            receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            invoiceNumber,
            patientUhid: "P-DUE-COLLECTED",
            patientName: "Patient Outstanding",
            amountPaid: amount,
            paymentMode,
            receivedBy: "Central Cashier",
            createdAt: new Date().toLocaleString(),
          };

          return {
            outstandingDues: updatedDues,
            payments: [newPayment, ...state.payments],
          };
        });
      },

      refundPayment: (invoiceNumber, amount, reason, approvedBy) => {
        get().issueCreditNote({
          invoiceNumber,
          patientUhid: "P-REFUND",
          patientName: "Refund Customer",
          refundAmount: amount,
          reason,
          approvedBy,
          refundMode: "CASH",
        });
      },

      resetToDefaults: () =>
        set({
          invoices: DEFAULT_INVOICES,
          payments: [],
          creditNotes: DEFAULT_CREDIT_NOTES,
          advanceDeposits: DEFAULT_DEPOSITS,
          outstandingDues: DEFAULT_OUTSTANDING,
        }),
    }),
    {
      name: "hms_billing_master_store_v1",
    }
  )
);
