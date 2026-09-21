"use client";

import React from "react";
import { Form, Input, Select, Row, Col } from "antd";
import { User, Phone, Mail, IdCard, MapPin } from "lucide-react";

import { todayLocalDate } from "../../../_reception_utils/date_utils";

export const DemographicsStep: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-teal-600" /> Patient Demographics
      </h3>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Full Patient Name"
            name="fullName"
            rules={[{ required: true, message: "Full Name is required" }]}
          >
            <Input placeholder="e.g. Ramesh Kumar" size="large" />
          </Form.Item>
        </Col>
        <Col xs={12} sm={6}>
          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: "Select gender" }]}
          >
            <Select placeholder="Select" size="large">
              <Select.Option value="MALE">Male</Select.Option>
              <Select.Option value="FEMALE">Female</Select.Option>
              <Select.Option value="OTHER">Other</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={12} sm={6}>
          <Form.Item
            label="Date of Birth"
            name="dob"
            rules={[{ required: true, message: "DOB is required" }]}
          >
            {/* Future dates are impossible — the patient age/token derive from this field */}
            <Input type="date" size="large" max={todayLocalDate()} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Mobile Number"
            name="phone"
            rules={[
              { required: true, message: "Phone number is required" },
              { pattern: /^\d{10}$/, message: "Must be 10 digits" },
            ]}
          >
            <Input
              prefix={<Phone className="w-4 h-4 text-slate-400" />}
              placeholder="9876543210"
              size="large"
              maxLength={10}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Email Address" name="email">
            <Input
              prefix={<Mail className="w-4 h-4 text-slate-400" />}
              placeholder="patient@example.com"
              size="large"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Masked Aadhaar Number (DPDP Act Enforced)"
            name="aadhaarNumber"
            rules={[
              { required: true, message: "Masked Aadhaar is required" },
              { pattern: /^XXXX-XXXX-\d{4}$/, message: "Format: XXXX-XXXX-1234" },
            ]}
          >
            <Input
              prefix={<IdCard className="w-4 h-4 text-teal-600" />}
              placeholder="XXXX-XXXX-1234"
              maxLength={14}
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={16}>
          <Form.Item
            label="Full Address"
            name="address"
            rules={[{ required: true, message: "Address is required" }]}
          >
            <Input
              prefix={<MapPin className="w-4 h-4 text-slate-400" />}
              placeholder="House/Street, Area, City, Pin Code"
              size="large"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Emergency Contact Phone"
            name="emergencyContact"
            rules={[
              { required: true, message: "Emergency contact is required" },
              { pattern: /^\d{10}$/, message: "Must be 10 digits" },
            ]}
          >
            <Input
              prefix={<Phone className="w-4 h-4 text-rose-500" />}
              placeholder="Emergency Phone"
              size="large"
              maxLength={10}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

