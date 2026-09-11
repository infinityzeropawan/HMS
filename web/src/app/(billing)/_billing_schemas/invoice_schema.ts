import { z } from "zod";

export const InvoiceItemSchema = z.object({
  itemId: z.string(),
  description: z.string().min(1, "Item description required"),
  hsnSacCode: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  gstRate: z.number().default(18), // 18% standard GST
});

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;

export const InvoiceSchema = z.object({
  invoiceNumber: z.string(),
  patientUhid: z.string(),
  patientName: z.string(),
  items: z.array(InvoiceItemSchema).min(1, "At least 1 invoice line item is required"),
  paymentMode: z.enum(["CASH", "CARD", "UPI", "INSURANCE_TPA"]),
  subtotal: z.number(),
  cgstAmount: z.number(),
  sgstAmount: z.number(),
  totalAmount: z.number(),
});

export type InvoiceInput = z.infer<typeof InvoiceSchema>;
