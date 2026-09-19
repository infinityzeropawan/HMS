"use client";

import React, { useState } from "react";
import { Form, Input, Alert } from "antd";
import { Lock, User, Building2, Shield, Info, Key } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useAuthLoginForm } from "./useAuthLoginForm";
import { AuthLoginInput } from "../../_auth_schemas/auth_login_schema";

export const AuthLoginForm: React.FC = () => {
  const { loading, errorMessage, handleLoginSubmit } = useAuthLoginForm();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="w-full bg-white p-5 sm:p-7 rounded-2xl shadow-xl border border-slate-200 animate-fade-in my-auto">
      {/* Sleek Compact Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-teal text-white mb-2 shadow-sm">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          Hospital Management System
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Enterprise Portal Sign In
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert
          message="Authentication Error"
          description={errorMessage}
          type="error"
          showIcon
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-900 text-xs"
          icon={<Shield className="w-4 h-4 text-rose-600" />}
        />
      )}

      {/* Form */}
      <Form<AuthLoginInput>
        layout="vertical"
        onFinish={handleLoginSubmit}
        initialValues={{ tenantId: "TENANT-001" }}
        size="large"
        className="space-y-3.5"
      >
        {/* Hospital ID Field */}
        <Form.Item
          label={<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hospital / Tenant ID</span>}
          name="tenantId"
          rules={[{ required: true, message: "Hospital ID is required" }]}
          className="mb-0"
        >
          <Input
            prefix={<Building2 className="w-4 h-4 text-slate-400 mr-1" />}
            placeholder="e.g., TENANT-001"
            size="large"
            className="rounded-lg text-sm"
            allowClear
          />
        </Form.Item>

        {/* Username Field */}
        <Form.Item
          label={<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Staff ID / Email</span>}
          name="username"
          rules={[{ required: true, message: "Username is required" }]}
          className="mb-0"
        >
          <Input
            prefix={<User className="w-4 h-4 text-slate-400 mr-1" />}
            placeholder="doctor, reception, admin, etc."
            size="large"
            className="rounded-lg text-sm"
            allowClear
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          label={<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</span>}
          name="password"
          rules={[{ required: true, message: "Password is required" }]}
          className="mb-0"
        >
          <Input.Password
            prefix={<Lock className="w-4 h-4 text-slate-400 mr-1" />}
            placeholder="Enter password"
            size="large"
            className="rounded-lg text-sm"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item className="pt-1 mb-0">
          <HmsButton
            variant="primary"
            htmlType="submit"
            size="lg"
            fullWidth
            loading={loading}
            loadingText="Authenticating..."
            className="h-11 text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            Sign In to Workspace
          </HmsButton>
        </Form.Item>
      </Form>

      {/* Toggle Demo Credentials Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowDemo(!showDemo)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-primary-teal transition-colors py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-primary-teal" /> Demo Accounts Quick Reference
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
            {showDemo ? "Hide ▲" : "Show Demo Logins ▼"}
          </span>
        </button>

        {showDemo && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 animate-fade-in">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="font-semibold text-primary-teal block text-[11px]">Super Admin</span>
                <code className="text-[10px] text-slate-700 font-mono">superadmin / super123</code>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="font-semibold text-primary-teal block text-[11px]">Doctor</span>
                <code className="text-[10px] text-slate-700 font-mono">doctor / doctor123</code>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="font-semibold text-blue-600 block text-[11px]">Reception</span>
                <code className="text-[10px] text-slate-700 font-mono">reception / rec123</code>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="font-semibold text-slate-700 block text-[11px]">Hospital Admin</span>
                <code className="text-[10px] text-slate-700 font-mono">hospitaladmin / hospital123</code>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-200/60">
              Other logins: <code className="font-mono text-slate-700">nurse/nurse123</code> &bull; <code className="font-mono text-slate-700">billing/bill123</code> &bull; <code className="font-mono text-slate-700">admin/admin123</code>
            </div>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-400" />
        <span>DPDP 2023 & ABDM Compliant &bull; Multi-Tenant</span>
      </div>
    </div>
  );
};
