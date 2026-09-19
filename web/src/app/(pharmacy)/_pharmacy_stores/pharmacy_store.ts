"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DrugStockItem {
  id: string;
  drugCode: string;
  name: string;
  drugName?: string;
  genericName: string;
  category: "TABLET" | "INJECTION" | "SYRUP" | "OINTMENT" | "CONTROLLED_H1";
  batchNumber: string;
  batchNo?: string;
  expiryDate: string;
  stockQuantity: number;
  unitPrice: number;
  reorderLevel: number;
  manufacturer: string;
  status: "IN_STOCK" | "LOW_STOCK" | "EXPIRED" | "FEFO_ALERT";
}

export interface PharmacyVendor {
  id: string;
  vendorCode: string;
  name: string;
  vendorName?: string; // alias
  supplierCode?: string; // alias
  gstin: string;
  category: string;
  paymentTerms?: string;
  creditDays: number;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface POItem {
  drugCode: string;
  drugName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  drugName?: string;
  orderQty?: number;
  orderDate: string;
  expectedDelivery: string;
  items: POItem[];
  totalAmount: number;
  estimatedCost?: number;
  notes?: string;
  createdAt?: string;
  status: "DRAFT" | "SENT" | "RECEIVED" | "CANCELLED" | "PENDING_APPROVAL" | "APPROVED";
}

export interface GRNItem {
  drugCode: string;
  drugName: string;
  batchNumber: string;
  expiryDate: string;
  quantityReceived: number;
  unitPrice: number;
  totalAmount: number;
}

export interface GRNRecord {
  id: string;
  grnNumber: string;
  invoiceNo?: string;
  poNumber: string;
  vendorName: string;
  drugName?: string;
  batchNo?: string;
  expiryDate?: string;
  receivedQty?: number;
  purchaseRate?: number;
  mrp?: number;
  taxPercent?: number;
  receivedDate: string;
  items: GRNItem[];
  totalAmount: number;
  status: "COMPLETED";
}

export interface StockTransferRecord {
  id: string;
  transferNo: string;
  fromLocation: string;
  toLocation: string;
  toDepartment?: string;
  drugCode: string;
  drugName: string;
  batchNumber: string;
  batchNo?: string;
  quantity: number;
  transferDate: string;
  transferredBy: string;
  requestedBy?: string;
  status: "TRANSFERRED" | "COMPLETED";
}

interface PharmacyStoreState {
  inventory: DrugStockItem[];
  vendors: PharmacyVendor[];
  purchaseOrders: PurchaseOrder[];
  grns: GRNRecord[];
  grnRecords: GRNRecord[]; // alias
  transfers: StockTransferRecord[];
  stockTransfers: StockTransferRecord[]; // alias

  addStockItem: (item: Omit<DrugStockItem, "id" | "status">) => void;
  updateStockQuantity: (id: string, qty: number) => void;
  deductStock: (drugNameOrCode: string, qty: number) => boolean;

  addVendor: (vendor: Partial<PharmacyVendor> & { name?: string; vendorName?: string }) => void;
  createPurchaseOrder: (poInput: { vendorName: string; drugName: string; orderQty: number; estimatedCost: number; notes?: string }) => PurchaseOrder;
  addGRNRecord: (grnInput: { grnNumber?: string; invoiceNo: string; vendorName: string; drugName: string; batchNo: string; expiryDate: string; receivedQty: number; purchaseRate: number; mrp: number; taxPercent: number }) => void;
  addStockTransfer: (transferInput: { transferNo?: string; fromLocation: string; toDepartment: string; drugName: string; batchNo: string; quantity: number; requestedBy: string }) => void;

  resetToDefaults: () => void;
}

const DEFAULT_INVENTORY: DrugStockItem[] = [
  {
    id: "drg-101",
    drugCode: "DRG-PARA-650",
    name: "Paracetamol 650mg (Dolo 650)",
    genericName: "Paracetamol",
    category: "TABLET",
    batchNumber: "BT-2026-091",
    expiryDate: "2028-06-30",
    stockQuantity: 1450,
    unitPrice: 3.5,
    reorderLevel: 200,
    manufacturer: "Micro Labs Ltd",
    status: "IN_STOCK",
  },
  {
    id: "drg-102",
    drugCode: "DRG-AMOX-500",
    name: "Amoxicillin 500mg Caps",
    genericName: "Amoxicillin Trihydrate",
    category: "TABLET",
    batchNumber: "BT-2025-441",
    expiryDate: "2026-10-15",
    stockQuantity: 120,
    unitPrice: 12.0,
    reorderLevel: 150,
    manufacturer: "Cipla Healthcare",
    status: "FEFO_ALERT",
  },
  {
    id: "drg-103",
    drugCode: "DRG-HEPA-5000",
    name: "Inj. Heparin 5000 IU/mL",
    genericName: "Heparin Sodium",
    category: "INJECTION",
    batchNumber: "BT-2026-118",
    expiryDate: "2027-12-31",
    stockQuantity: 45,
    unitPrice: 240.0,
    reorderLevel: 50,
    manufacturer: "Gland Pharma",
    status: "LOW_STOCK",
  },
  {
    id: "drg-104",
    drugCode: "DRG-FENT-100",
    name: "Inj. Fentanyl 100mcg (Schedule H1)",
    genericName: "Fentanyl Citrate",
    category: "CONTROLLED_H1",
    batchNumber: "BT-NAR-2026-02",
    expiryDate: "2027-08-31",
    stockQuantity: 28,
    unitPrice: 450.0,
    reorderLevel: 30,
    manufacturer: "Troikaa Pharmaceuticals",
    status: "LOW_STOCK",
  },
  {
    id: "drg-001",
    drugCode: "DRUG-001",
    name: "Tab Sorbitrate 5mg (Isosorbide Dinitrate)",
    genericName: "Isosorbide Dinitrate",
    category: "TABLET",
    batchNumber: "BT-2026-SO5",
    expiryDate: "2027-11-30",
    stockQuantity: 500,
    unitPrice: 8.5,
    reorderLevel: 100,
    manufacturer: "Abbott Healthcare",
    status: "IN_STOCK",
  },
  {
    id: "drg-002",
    drugCode: "DRUG-002",
    name: "Tab Ecosprin 75mg (Aspirin)",
    genericName: "Aspirin",
    category: "TABLET",
    batchNumber: "BT-2026-EC75",
    expiryDate: "2028-04-15",
    stockQuantity: 1800,
    unitPrice: 4.0,
    reorderLevel: 300,
    manufacturer: "USV Private Ltd",
    status: "IN_STOCK",
  },
  {
    id: "drg-003",
    drugCode: "DRUG-003",
    name: "Tab Amlodipine 5mg",
    genericName: "Amlodipine Besylate",
    category: "TABLET",
    batchNumber: "BT-2026-AM5",
    expiryDate: "2027-09-30",
    stockQuantity: 35,
    unitPrice: 6.0,
    reorderLevel: 50,
    manufacturer: "Torrent Pharma",
    status: "LOW_STOCK",
  },
  {
    id: "drg-004",
    drugCode: "DRUG-004",
    name: "Tab Metoprolol 25mg",
    genericName: "Metoprolol Succinate",
    category: "TABLET",
    batchNumber: "BT-2026-MET25",
    expiryDate: "2027-06-30",
    stockQuantity: 0,
    unitPrice: 15.0,
    reorderLevel: 100,
    manufacturer: "AstraZeneca India",
    status: "LOW_STOCK",
  },
  {
    id: "drg-005",
    drugCode: "DRUG-005",
    name: "Inj Pantocid 40mg IV",
    genericName: "Pantoprazole",
    category: "INJECTION",
    batchNumber: "BT-2026-PAN40",
    expiryDate: "2027-10-31",
    stockQuantity: 650,
    unitPrice: 52.0,
    reorderLevel: 100,
    manufacturer: "Sun Pharma",
    status: "IN_STOCK",
  },
  {
    id: "drg-007",
    drugCode: "DRUG-007",
    name: "Cap Omeprazole 20mg",
    genericName: "Omeprazole",
    category: "TABLET",
    batchNumber: "BT-2026-OM20",
    expiryDate: "2028-01-31",
    stockQuantity: 850,
    unitPrice: 9.0,
    reorderLevel: 150,
    manufacturer: "Dr. Reddy's Labs",
    status: "IN_STOCK",
  },
  {
    id: "drg-009",
    drugCode: "DRUG-009",
    name: "Tab Metformin 500mg",
    genericName: "Metformin Hydrochloride",
    category: "TABLET",
    batchNumber: "BT-2026-MF500",
    expiryDate: "2027-12-15",
    stockQuantity: 920,
    unitPrice: 3.0,
    reorderLevel: 200,
    manufacturer: "Glycomet Labs",
    status: "IN_STOCK",
  },
  {
    id: "drg-010",
    drugCode: "DRUG-010",
    name: "Tab Atorvastatin 20mg",
    genericName: "Atorvastatin Calcium",
    category: "TABLET",
    batchNumber: "BT-2024-AT20",
    expiryDate: "2025-12-31",
    stockQuantity: 150,
    unitPrice: 18.0,
    reorderLevel: 100,
    manufacturer: "Lupin Ltd",
    status: "EXPIRED",
  },
  {
    id: "drg-011",
    drugCode: "DRUG-011",
    name: "Tab Warfarin 5mg",
    genericName: "Warfarin Sodium",
    category: "TABLET",
    batchNumber: "BT-2026-WF5",
    expiryDate: "2027-05-20",
    stockQuantity: 40,
    unitPrice: 11.5,
    reorderLevel: 50,
    manufacturer: "Abbott India",
    status: "LOW_STOCK",
  },
  {
    id: "drg-012",
    drugCode: "DRUG-012",
    name: "Tab Sildenafil 50mg",
    genericName: "Sildenafil Citrate",
    category: "TABLET",
    batchNumber: "BT-2026-SIL50",
    expiryDate: "2028-08-31",
    stockQuantity: 250,
    unitPrice: 42.0,
    reorderLevel: 50,
    manufacturer: "Pfizer India",
    status: "IN_STOCK",
  },
];

const DEFAULT_VENDORS: PharmacyVendor[] = [
  {
    id: "vnd-101",
    vendorCode: "VND-CIPLA-01",
    name: "Cipla Healthcare Distributors",
    gstin: "27AAACC1206H1ZD",
    category: "Antibiotics & Formulations",
    creditDays: 45,
    contactPerson: "Rajesh Malhotra",
    phone: "+91 98201 55443",
    email: "orders@cipla-distributors.com",
    address: "B-404, Pharma Zone, Andheri East, Mumbai",
    status: "ACTIVE",
  },
  {
    id: "vnd-102",
    vendorCode: "VND-MICRO-02",
    name: "Micro Labs Regional Depot",
    gstin: "27AABCM8821K1ZP",
    category: "Analgesics & Tablets",
    creditDays: 30,
    contactPerson: "Suresh Prabhu",
    phone: "+91 98202 66554",
    email: "depot@microlabs.in",
    address: "Plot 12, GIDC Chemical Zone, Thane",
    status: "ACTIVE",
  },
  {
    id: "vnd-103",
    vendorCode: "VND-GLAND-03",
    name: "Gland Specialty Injectables",
    gstin: "36AAACG9912E1ZQ",
    category: "Critical Care Injectables",
    creditDays: 60,
    contactPerson: "Dr. Anish Varma",
    phone: "+91 98203 77665",
    email: "supply@glandpharma.com",
    address: "Hyderabad Biotech Park, Telangana",
    status: "ACTIVE",
  },
];

const DEFAULT_POS: PurchaseOrder[] = [
  {
    id: "po-101",
    poNumber: "PO-2026-8801",
    vendorId: "vnd-101",
    vendorName: "Cipla Healthcare Distributors",
    orderDate: "2026-09-14",
    expectedDelivery: "2026-09-20",
    items: [
      { drugCode: "DRG-AMOX-500", drugName: "Amoxicillin 500mg Caps", quantity: 500, unitPrice: 12.0, totalAmount: 6000 },
    ],
    totalAmount: 6000,
    status: "SENT",
  },
];

const DEFAULT_GRNS: GRNRecord[] = [
  {
    id: "grn-101",
    grnNumber: "GRN-2026-4401",
    poNumber: "PO-2026-8801",
    vendorName: "Cipla Healthcare Distributors",
    receivedDate: "2026-09-15",
    items: [
      { drugCode: "DRG-AMOX-500", drugName: "Amoxicillin 500mg Caps", batchNumber: "BT-2026-881", expiryDate: "2028-09-30", quantityReceived: 500, unitPrice: 12.0, totalAmount: 6000 },
    ],
    totalAmount: 6000,
    status: "COMPLETED",
  },
];

const DEFAULT_TRANSFERS: StockTransferRecord[] = [
  {
    id: "trf-101",
    transferNo: "TRF-2026-101",
    fromLocation: "Central Pharmacy Store",
    toLocation: "Operation Theater Satellite Store",
    drugCode: "DRG-HEPA-5000",
    drugName: "Inj. Heparin 5000 IU/mL",
    batchNumber: "BT-2026-118",
    quantity: 10,
    transferDate: "2026-09-16 10:30 AM",
    transferredBy: "Pharm. Anjali Shah",
    status: "TRANSFERRED",
  },
];

export const usePharmacyStore = create<PharmacyStoreState>()(
  persist(
    (set, get) => ({
      inventory: DEFAULT_INVENTORY,
      vendors: DEFAULT_VENDORS,
      purchaseOrders: DEFAULT_POS,
      grns: DEFAULT_GRNS,
      get grnRecords() {
        return get()?.grns || DEFAULT_GRNS;
      },
      transfers: DEFAULT_TRANSFERS,
      get stockTransfers() {
        return get()?.transfers || DEFAULT_TRANSFERS;
      },

      addStockItem: (item) => {
        const isLow = item.stockQuantity <= item.reorderLevel;
        set((state) => ({
          inventory: [
            {
              ...item,
              id: `drg-${Date.now()}`,
              status: isLow ? "LOW_STOCK" : "IN_STOCK",
            },
            ...state.inventory,
          ],
        }));
      },

      updateStockQuantity: (id, qty) =>
        set((state) => ({
          inventory: state.inventory.map((item): DrugStockItem =>
            item.id === id
              ? {
                  ...item,
                  stockQuantity: qty,
                  status: (qty <= item.reorderLevel ? "LOW_STOCK" : "IN_STOCK") as "LOW_STOCK" | "IN_STOCK",
                }
              : item
          ),
        })),

      deductStock: (drugNameOrCode, qty) => {
        let success = false;
        set((state) => {
          const updated = state.inventory.map((item): DrugStockItem => {
            const matches =
              item.name.toLowerCase().includes(drugNameOrCode.toLowerCase()) ||
              item.drugCode.toLowerCase() === drugNameOrCode.toLowerCase();
            if (matches && !success) {
              const newQty = Math.max(0, item.stockQuantity - qty);
              success = true;
              return {
                ...item,
                stockQuantity: newQty,
                status: (newQty <= item.reorderLevel ? "LOW_STOCK" : "IN_STOCK") as "LOW_STOCK" | "IN_STOCK",
              };
            }
            return item;
          });
          return { inventory: updated };
        });
        return success;
      },

      addVendor: (vendor) => {
        const vName = vendor.name || vendor.vendorName || "Pharmaceutical Distributor";
        const vCode = vendor.vendorCode || vendor.supplierCode || `VND-${Math.floor(100 + Math.random() * 900)}`;
        const newVendor: PharmacyVendor = {
          id: `vnd-${Date.now()}`,
          vendorCode: vCode,
          name: vName,
          vendorName: vName,
          supplierCode: vCode,
          gstin: vendor.gstin || "27AAACB1234C1Z5",
          category: vendor.category || "DISTRIBUTOR",
          paymentTerms: vendor.paymentTerms || "Net 30 Days",
          creditDays: vendor.creditDays ?? 30,
          contactPerson: vendor.contactPerson || "Contact Person",
          phone: vendor.phone || "+91 98200 00000",
          email: vendor.email || "sales@vendor.com",
          address: vendor.address || "Main Warehouse City",
          status: vendor.status || "ACTIVE",
        };
        set((state) => ({ vendors: [newVendor, ...state.vendors] }));
      },

      createPurchaseOrder: (input) => {
        const newPo: PurchaseOrder = {
          id: `po-${Date.now()}`,
          poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          vendorId: "vnd-101",
          vendorName: input.vendorName,
          drugName: input.drugName,
          orderQty: input.orderQty,
          orderDate: new Date().toISOString().split("T")[0],
          expectedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          items: [
            {
              drugCode: "DRG-REORDER",
              drugName: input.drugName,
              quantity: input.orderQty,
              unitPrice: input.estimatedCost / (input.orderQty || 1),
              totalAmount: input.estimatedCost,
            },
          ],
          totalAmount: input.estimatedCost,
          estimatedCost: input.estimatedCost,
          notes: input.notes,
          createdAt: new Date().toISOString(),
          status: "PENDING_APPROVAL",
        };
        set((state) => ({ purchaseOrders: [newPo, ...state.purchaseOrders] }));
        return newPo;
      },

      addGRNRecord: (input) => {
        const grnNum = input.grnNumber || `GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const newRecord: GRNRecord = {
          id: `grn-${Date.now()}`,
          grnNumber: grnNum,
          invoiceNo: input.invoiceNo,
          poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          vendorName: input.vendorName,
          drugName: input.drugName,
          batchNo: input.batchNo,
          expiryDate: input.expiryDate,
          receivedQty: input.receivedQty,
          purchaseRate: input.purchaseRate,
          mrp: input.mrp,
          taxPercent: input.taxPercent,
          receivedDate: new Date().toISOString().split("T")[0],
          items: [
            {
              drugCode: "DRG-INWARD",
              drugName: input.drugName,
              batchNumber: input.batchNo,
              expiryDate: input.expiryDate,
              quantityReceived: input.receivedQty,
              unitPrice: input.purchaseRate,
              totalAmount: input.receivedQty * input.purchaseRate,
            },
          ],
          totalAmount: input.receivedQty * input.purchaseRate,
          status: "COMPLETED",
        };

        set((state) => {
          const newInventory = [...state.inventory];
          const existing = newInventory.find(
            (inv) => inv.name.toLowerCase().includes(input.drugName.toLowerCase())
          );
          if (existing) {
            existing.stockQuantity += input.receivedQty;
            existing.batchNumber = input.batchNo;
            existing.expiryDate = input.expiryDate;
            existing.status = (existing.stockQuantity <= existing.reorderLevel ? "LOW_STOCK" : "IN_STOCK") as "LOW_STOCK" | "IN_STOCK";
          } else {
            newInventory.unshift({
              id: `drg-${Date.now()}`,
              drugCode: `DRG-${Math.floor(100 + Math.random() * 900)}`,
              name: input.drugName,
              genericName: input.drugName,
              category: "TABLET",
              batchNumber: input.batchNo,
              expiryDate: input.expiryDate,
              stockQuantity: input.receivedQty,
              unitPrice: input.mrp,
              reorderLevel: 50,
              manufacturer: input.vendorName,
              status: "IN_STOCK" as const,
            });
          }
          return {
            grns: [newRecord, ...state.grns],
            inventory: newInventory,
          };
        });
      },

      addStockTransfer: (input) => {
        const transferNo = input.transferNo || `TRF-2026-${Math.floor(100 + Math.random() * 900)}`;
        const newTransfer: StockTransferRecord = {
          id: `trf-${Date.now()}`,
          transferNo,
          fromLocation: input.fromLocation,
          toLocation: input.toDepartment,
          toDepartment: input.toDepartment,
          drugCode: "DRG-TRF",
          drugName: input.drugName,
          batchNumber: input.batchNo,
          batchNo: input.batchNo,
          quantity: input.quantity,
          transferDate: new Date().toISOString().split("T")[0],
          transferredBy: input.requestedBy,
          requestedBy: input.requestedBy,
          status: "TRANSFERRED",
        };

        set((state) => {
          const updatedInventory = state.inventory.map((inv): DrugStockItem => {
            if (inv.name.toLowerCase().includes(input.drugName.toLowerCase())) {
              const newQty = Math.max(0, inv.stockQuantity - input.quantity);
              return {
                ...inv,
                stockQuantity: newQty,
                status: (newQty <= inv.reorderLevel ? "LOW_STOCK" : "IN_STOCK") as "LOW_STOCK" | "IN_STOCK",
              };
            }
            return inv;
          });
          return {
            transfers: [newTransfer, ...state.transfers],
            inventory: updatedInventory,
          };
        });
      },

      resetToDefaults: () =>
        set({
          inventory: DEFAULT_INVENTORY,
          vendors: DEFAULT_VENDORS,
          purchaseOrders: DEFAULT_POS,
          grns: DEFAULT_GRNS,
          transfers: DEFAULT_TRANSFERS,
        }),
    }),
    {
      name: "hms_pharmacy_master_store",
    }
  )
);
