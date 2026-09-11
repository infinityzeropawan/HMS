"use client";

import React from "react";
import { Form, Input, Alert, Typography } from "antd";
import { Lock, User, Building2, Shield, Smartphone } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useAuthLoginForm } from "./useAuthLoginForm";
import { AuthLoginInput } from "../../_auth_schemas/auth_login_schema";

const { Text } = Typography;

export const AuthLoginForm: React.FC = () => {
  const { loading, errorMessage, handleLoginSubmit } = useAuthLoginForm();

  return (
    <div className="w-full min-w-[280px] bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-teal mb-4 shadow-md text-white">
          <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
          Hospital Management System
        </h2>
        <Text type="secondary" className="text-sm sm:text-base text-slate-600">
          Secure login for healthcare professionals
        </Text>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert
          message="Authentication Error"
          description={errorMessage}
          type="error"
          showIcon
          className="mb-5 sm:mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-900"
          icon={<Shield className="w-4 h-4 text-rose-600" />}
        />
      )}

      {/* Form */}
      <Form<AuthLoginInput>
        layout="vertical"
        onFinish={handleLoginSubmit}
        initialValues={{ tenantId: "TENANT-001" }}
        size="large"
        className="space-y-4 sm:space-y-5"
      >
        {/* Hospital ID Field */}
        <Form.Item
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" /> Hospital / Tenant ID
            </span>
          }
          name="tenantId"
          rules={[{ required: true, message: "Hospital ID is required" }]}
          className="mb-0"
        >
          <Input
            prefix={<Building2 className="w-4 h-4 text-slate-400 mr-1" />}
            placeholder="e.g., TENANT-001"
            size="large"
            className="rounded-lg"
            allowClear
          />
        </Form.Item>

        {/* Username Field */}
        <Form.Item
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" /> Staff ID / Email
            </span>
          }
          name="username"
          rules={[{ required: true, message: "Username is required" }]}
          className="mb-0"
        >
          <Input
            prefix={<User className="w-4 h-4 text-slate-400 mr-1" />}
            placeholder="username@hospital.com"
            size="large"
            className="rounded-lg"
            allowClear
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" /> Password
            </span>
          }
          name="password"
          rules={[{ required: true, message: "Password is required" }]}
          className="mb-0"
        >
          <Input.Password
            prefix={<Lock className="w-4 h-4 text-slate-400 mr-1" />}
            placeholder="Enter your password"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item className="pt-2 mb-0">
          <HmsButton
            variant="primary"
            htmlType="submit"
            size="lg"
            fullWidth
            loading={loading}
            loadingText="Authenticating..."
            className="h-12 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Sign In to Dashboard
          </HmsButton>
        </Form.Item>
      </Form>

      {/* Demo Credentials Section */}
      <div className="mt-6 pt-5 border-t border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Smartphone className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Demo Credentials</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-primary-light-teal rounded-xl border border-primary-teal/20">
            <span className="text-xs font-semibold text-primary-teal mb-1 block">Doctor Role</span>
            <div className="font-mono text-xs text-slate-800 font-semibold">
              doctor / doctor123
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-xs font-semibold text-blue-700 mb-1 block">Reception Role</span>
            <div className="font-mono text-xs text-slate-800 font-semibold">
              reception / rec123
            </div>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 text-center mt-3 leading-relaxed">
          Other demo logins: <code className="font-mono text-slate-700 font-bold">nurse/nurse123</code> &bull; <code className="font-mono text-slate-700 font-bold">billing/bill123</code> &bull; <code className="font-mono text-slate-700 font-bold">pharmacy/pharma123</code> &bull; <code className="font-mono text-slate-700 font-bold">admin/admin123</code>
        </p>
      </div>

      {/* Security Note */}
      <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
          <span className="text-xs text-slate-600 leading-snug">
            <strong>HIPAA & DPDP Compliant:</strong> Multi-tenant isolation active. All authentication attempts are logged.
          </span>
        </div>
      </div>
    </div>
  );
};
