"use client";

import React, { useMemo } from "react";
import { Modal, Table, Tag, message } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { AlertTriangle, CheckCircle2, Calendar, Package } from "lucide-react";

import { usePharmacyStore } from "../../_pharmacy_stores/pharmacy_store";

interface BatchItem {
  key: string;
  batchNo: string;
  expiryDate: string;
  stock: number;
}

interface FefoBatchModalProps {
  open: boolean;
  onClose: () => void;
  drugName: string;
  customBatches?: BatchItem[];
  onSelectBatch?: (batch: BatchItem) => void;
}

const DEFAULT_BATCHES: BatchItem[] = [
  { key: "1", batchNo: "B-2025-02", expiryDate: "2027-03-31", stock: 120 },
  { key: "2", batchNo: "B-2024-09", expiryDate: "2026-10-31", stock: 45 },
  { key: "3", batchNo: "B-2025-06", expiryDate: "2027-08-31", stock: 80 },
];

export const FefoBatchModal: React.FC<FefoBatchModalProps> = ({
  open,
  onClose,
  drugName,
  customBatches,
  onSelectBatch,
}) => {
  const inventory = usePharmacyStore((s) => s.inventory);

  // Sort by earliest expiry date first (FEFO Algorithm)
  const sortedBatches = useMemo(() => {
    if (customBatches && customBatches.length > 0) {
      return [...customBatches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }
    const matching = inventory.filter((i) =>
      i.name.toLowerCase().includes(drugName.toLowerCase()) ||
      (i.drugName && i.drugName.toLowerCase().includes(drugName.toLowerCase()))
    );
    if (matching.length > 0) {
      const list = matching.map((i, idx) => ({
        key: i.id || String(idx),
        batchNo: i.batchNumber || "B-2025-01",
        expiryDate: i.expiryDate || "2027-06-30",
        stock: i.stockQuantity,
      }));
      return list.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }
    return [...DEFAULT_BATCHES].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [customBatches, drugName, inventory]);

  const handleSelect = (record: BatchItem, isFefo: boolean) => {
    if (onSelectBatch) {
      onSelectBatch(record);
    }
    if (isFefo) {
      message.success(`Batch ${record.batchNo} assigned under FEFO protocol.`);
    } else {
      message.warning(`Batch ${record.batchNo} selected (FEFO override applied).`);
    }
    onClose();
  };

  const columns = [
    { title: "Batch Number", dataIndex: "batchNo", key: "batchNo", render: (val: string) => <span className="font-bold text-slate-800">{val}</span> },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (val: string) => (
        <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {val}
        </span>
      ),
    },
    { title: "Available Stock", dataIndex: "stock", key: "stock", render: (stock: number) => <span className="font-semibold">{stock} units</span> },
    {
      title: "FEFO Protocol",
      key: "fefo",
      render: (_: unknown, __: BatchItem, index: number) =>
        index === 0 ? (
          <Tag color="emerald" icon={<CheckCircle2 className="w-3 h-3 inline mr-1" />}>
            RECOMMENDED (FEFO)
          </Tag>
        ) : (
          <Tag color="default">Standard</Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: BatchItem, index: number) => {
        const isFefo = index === 0;
        return (
          <HmsButton
            size="sm"
            variant={isFefo ? "primary" : "secondary"}
            onClick={() => handleSelect(record, isFefo)}
          >
            Select Batch
          </HmsButton>
        );
      },
    },
  ];

  return (
    <Modal
      title={`FEFO Batch Allocation: ${drugName}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      className="max-w-[95vw] sm:max-w-[680px]"
    >
      <div className="p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
        <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
        <span>First-Expiry, First-Out (FEFO) protocol forces allocation of earliest expiring batch first to prevent drug expiration losses.</span>
      </div>

      {/* Mobile Smartphone Card View */}
      <div className="block sm:hidden space-y-3 mb-2">
        {sortedBatches.map((batch, idx) => {
          const isFefo = idx === 0;
          return (
            <div key={batch.key} className={`p-3 rounded-xl border ${isFefo ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{batch.batchNo}</span>
                {isFefo ? (
                  <Tag color="emerald" icon={<CheckCircle2 className="w-3 h-3 inline mr-1" />}>
                    FEFO BEST
                  </Tag>
                ) : (
                  <Tag color="default">Standard</Tag>
                )}
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Expiry: {batch.expiryDate}</span>
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-slate-400" /> Stock: {batch.stock}</span>
              </div>
              <HmsButton
                size="lg"
                fullWidth
                variant={isFefo ? "primary" : "secondary"}
                onClick={() => handleSelect(batch, isFefo)}
              >
                Select {batch.batchNo}
              </HmsButton>
            </div>
          );
        })}
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <Table columns={columns} dataSource={sortedBatches} pagination={false} rowKey="key" />
      </div>
    </Modal>
  );
};

