"use client";

import React from "react";
import { Table } from "antd";
import { Trash2 } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { InvoiceItem } from "../../_billing_schemas/invoice_schema";

interface LineItemsTableProps {
  items: InvoiceItem[];
  onRemoveItem: (id: string) => void;
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
  items,
  onRemoveItem,
}) => {
  const columns = [
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "HSN/SAC", dataIndex: "hsnSacCode", key: "hsnSacCode" },
    { title: "Qty", dataIndex: "quantity", key: "quantity" },
    {
      title: "Rate (₹)",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (rate: number) => `₹${rate.toFixed(2)}`,
    },
    {
      title: "GST Rate",
      dataIndex: "gstRate",
      key: "gstRate",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "Total (₹)",
      key: "total",
      render: (_: unknown, record: InvoiceItem) => {
        const lineSubtotal = record.quantity * record.unitPrice;
        const lineTotal = lineSubtotal * (1 + record.gstRate / 100);
        return `₹${lineTotal.toFixed(2)}`;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: InvoiceItem) => (
        <HmsButton
          variant="danger"
          size="sm"
          onClick={() => onRemoveItem(record.itemId)}
          icon={<Trash2 className="w-3 h-3" />}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Desktop Main Table */}
      <div className="hidden sm:block overflow-x-auto border rounded-xl">
        <Table columns={columns} dataSource={items} pagination={false} rowKey="itemId" />
      </div>

      {/* Mobile Touch Cards (<640px) */}
      <div className="block sm:hidden space-y-3">
        {items.length === 0 ? (
          <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed text-xs">
            No charge items added yet.
          </div>
        ) : (
          items.map((item) => {
            const lineSubtotal = item.quantity * item.unitPrice;
            const lineTotal = lineSubtotal * (1 + item.gstRate / 100);
            return (
              <div key={item.itemId} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900">{item.description}</span>
                  <HmsButton
                    variant="danger"
                    size="sm"
                    onClick={() => onRemoveItem(item.itemId)}
                    icon={<Trash2 className="w-3 h-3" />}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100">
                  <div>HSN/SAC: <span className="font-mono font-semibold">{item.hsnSacCode}</span></div>
                  <div>Qty: <span className="font-bold">{item.quantity}</span></div>
                  <div>Rate: <span className="font-mono">₹{item.unitPrice}</span></div>
                  <div>GST Rate: <span className="font-bold text-amber-700">{item.gstRate}%</span></div>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-800 pt-1 border-t">
                  <span>Line Total:</span>
                  <span className="text-emerald-700 font-mono">₹{lineTotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
