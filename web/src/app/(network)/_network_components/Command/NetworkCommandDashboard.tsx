"use client";

import React, { useState } from "react";
import { Tag, Modal, Form, Input, Select, message } from "antd";
import { Network, Building2, BedDouble, Users, DollarSign, Activity, Truck, RefreshCw, ArrowRightLeft } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsCard } from "@/common_components/HmsCard/HmsCard";
import { useNetworkStore, NetworkBranch } from "../../_network_stores/network_store";

export const NetworkCommandDashboard: React.FC = () => {
  const { branches } = useNetworkStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const totalBeds = branches.reduce((acc, b) => acc + b.totalBeds, 0);
  const totalOccupied = branches.reduce((acc, b) => acc + b.occupiedBeds, 0);
  const totalRevenue = branches.reduce((acc, b) => acc + b.dailyRevenue, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFinish = (values: Record<string, any>) => {
    message.success(
      `Inter-hospital transfer request for ${values.patientName} created from ${values.fromBranch} to ${values.toBranch}`
    );
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Network KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HmsCard elevated className="border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Network Hospital Branches</p>
              <h3 className="text-2xl font-bold text-teal-800 mt-1">{branches.length} Active Campuses</h3>
            </div>
            <Building2 className="w-8 h-8 text-teal-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Network Beds</p>
              <h3 className="text-2xl font-bold text-purple-800 mt-1">{totalOccupied} / {totalBeds} Occupied</h3>
            </div>
            <BedDouble className="w-8 h-8 text-purple-500" />
          </div>
        </HmsCard>

        <HmsCard elevated className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Combined Network Revenue</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">₹ {(totalRevenue / 100000).toFixed(2)} Lakhs</h3>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
        </HmsCard>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-teal-600" /> Multi-Hospital Branch Network Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time bed capacity, ICU availability, ambulance fleet status, and inter-branch referrals.
          </p>
        </div>

        <HmsButton variant="emerald" icon={<ArrowRightLeft className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          New Inter-Branch Transfer
        </HmsButton>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => {
          const occupancyPct = Math.round((branch.occupiedBeds / branch.totalBeds) * 100);

          return (
            <div
              key={branch.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-teal-400 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {branch.branchCode}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5">{branch.branchName}</h3>
                    <p className="text-xs text-slate-500">{branch.locationCity}</p>
                  </div>
                  <Tag color="emerald" className="font-bold text-3xs mr-0">ONLINE</Tag>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Bed Occupancy:</span>
                    <strong className="font-mono text-slate-900">{branch.occupiedBeds} / {branch.totalBeds} ({occupancyPct}%)</strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ICU Beds Free:</span>
                    <strong className="font-mono text-emerald-700">{branch.icuBedsAvailable} Available</strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ambulance Fleet:</span>
                    <strong className="font-mono text-blue-700">{branch.ambulancesActive} Ready</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Daily Rev:</span>
                <strong className="text-emerald-700">₹ {branch.dailyRevenue.toLocaleString()}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <ArrowRightLeft className="w-5 h-5 text-teal-600" />
            <span>Initiate Inter-Hospital Patient Transfer</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <Form.Item label="Patient Name" name="patientName" rules={[{ required: true }]}>
            <Input placeholder="Sunil Verma" size="large" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Source Hospital Branch" name="fromBranch" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="City OPD Clinic">City OPD Clinic</Select.Option>
                <Select.Option value="Apollo Main Campus">Apollo Main Campus</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Destination Hospital Branch" name="toBranch" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="Fortis Heart Institute">Fortis Heart Institute</Select.Option>
                <Select.Option value="Apollo Main Campus">Apollo Main Campus</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Transfer Reason & Medical Notes" name="reason" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="e.g., Specialized Cardiac Surgery referral..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <HmsButton variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </HmsButton>
            <HmsButton variant="emerald" htmlType="submit">
              Dispatch Transfer Request
            </HmsButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
