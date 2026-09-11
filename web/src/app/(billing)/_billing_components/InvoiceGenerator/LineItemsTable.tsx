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

  return <Table columns={columns} dataSource={items} pagination={false} rowKey="itemId" />;
};
