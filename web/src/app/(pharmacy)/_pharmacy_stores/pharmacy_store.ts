"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DrugStockItem {
  id: string;
  drugCode: string;
  name: string;
  genericName: string;
  category: "TABLET" | "INJECTION" | "SYRUP" | "OINTMENT" | "CONTROLLED_H1";
  batchNumber: string;
  expiryDate: string;
  stockQuantity: number;
  unitPrice: number;
  reorderLevel: number;
  manufacturer: string;
  status: "IN_STOCK" | "LOW_STOCK" | "EXPIRED" | "FEFO_ALERT";
}

interface PharmacyStoreState {
  inventory: DrugStockItem[];
  addStockItem: (item: Omit<DrugStockItem, "id" | "status">) => void;
  updateStockQuantity: (id: string, qty: number) => void;
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
];

export const usePharmacyStore = create<PharmacyStoreState>()(
  persist(
    (set) => ({
      inventory: DEFAULT_INVENTORY,

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
          inventory: state.inventory.map((item) =>
            item.id === id
              ? {
                  ...item,
                  stockQuantity: qty,
                  status: qty <= item.reorderLevel ? "LOW_STOCK" : "IN_STOCK",
                }
              : item
          ),
        })),

      resetToDefaults: () => set({ inventory: DEFAULT_INVENTORY }),
    }),
    {
      name: "hms_pharmacy_inventory_store",
    }
  )
);
