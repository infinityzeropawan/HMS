"use client";

import React from "react";
import { Form, Input, Select, Row, Col } from "antd";
import { ShieldCheck, CreditCard } from "lucide-react";

export const InsuranceStep: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-purple-600" /> Insurance & TPA Details
      </h3>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Insurance Provider / TPA Name" name="insuranceProvider">
            <Select placeholder="Select Provider (Optional)" size="large" allowClear>
              <Select.Option value="STAR_HEALTH">Star Health & Allied Insurance</Select.Option>
              <Select.Option value="HDFC_ERGO">HDFC ERGO Health</Select.Option>
              <Select.Option value="ICICI_LOMBARD">ICICI Lombard General Insurance</Select.Option>
              <Select.Option value="AYUSHMAN_BHARAT">Ayushman Bharat (PM-JAY)</Select.Option>
              <Select.Option value="CASH">Self-Pay / Cash Patient</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Policy / Health Card Number" name="policyNumber">
            <Input
              prefix={<CreditCard className="w-4 h-4 text-slate-400" />}
              placeholder="e.g. POL-88992201"
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
