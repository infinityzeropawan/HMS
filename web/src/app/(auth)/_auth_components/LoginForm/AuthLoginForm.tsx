"use client";

import React, { useState } from "react";
import { Form, Input, Alert, Select } from "antd";
import { Lock, User, Building2, Shield, Info, Key, CheckCircle2 } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useAuthLoginForm } from "./useAuthLoginForm";
import { AuthLoginInput } from "../../_auth_schemas/auth_login_schema";

const DEMO_ACCOUNTS_MAP: Record<string, { username: string; password: string; tenantId: string; label: string }> = {
  doctor: { username: "doctor", password: "doctor123", tenantId: "TENANT-001", label: "Doctor" },
  reception: { username: "reception", password: "rec123", tenantId: "TENANT-001", label: "Reception" },
  nurse: { username: "nurse", password: "nurse123", tenantId: "TENANT-001", label: "Nurse" },
  billing: { username: "billing", password: "bill123", tenantId: "TENANT-001", label: "Billing" },
  superadmin: { username: "superadmin", password: "super123", tenantId: "PLATFORM-SUPER-ADMIN", label: "Super Admin" },
  hospitaladmin: { username: "hospitaladmin", password: "hospital123", tenantId: "TENANT-001", label: "Hospital Admin" },
  admin: { username: "admin", password: "admin123", tenantId: "TENANT-001", label: "System Admin" },
};

export const AuthLoginForm: React.FC = () => {
  const { loading, errorMessage, handleLoginSubmit } = useAuthLoginForm();
  const [showDemo, setShowDemo] = useState(true);
  const [selectedRole, setSelectedRole] = useState("doctor");
  const [form] = Form.useForm<AuthLoginInput>();

  const selectDemoAccount = (roleKey: string) => {
    const acc = DEMO_ACCOUNTS_MAP[roleKey];
    if (acc) {
      setSelectedRole(roleKey);
      form.setFieldsValue({
        username: acc.username,
        password: acc.password,
        tenantId: acc.tenantId,
      });
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().trim();
    const matched = DEMO_ACCOUNTS_MAP[val];
    if (matched) {
      setSelectedRole(val);
      form.setFieldsValue({
        password: matched.password,
        tenantId: matched.tenantId,
      });
    }
  };

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

      {/* Quick Role Selector Buttons */}
      <div className="mb-4">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Select Role (Auto-fills Credentials)
        </label>
        <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
          {[
            { key: "doctor", label: "Doctor", color: "hover:border-teal-500 hover:text-teal-700" },
            { key: "nurse", label: "Nurse", color: "hover:border-purple-500 hover:text-purple-700" },
            { key: "reception", label: "Reception", color: "hover:border-blue-500 hover:text-blue-700" },
            { key: "billing", label: "Billing", color: "hover:border-emerald-500 hover:text-emerald-700" },
          ].map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => selectDemoAccount(r.key)}
              className={`px-2 py-1.5 rounded-lg border text-[11px] transition-all cursor-pointer font-bold ${
                selectedRole === r.key
                  ? "bg-teal-50 border-teal-600 text-teal-800 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 " + r.color
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <Form<AuthLoginInput>
        form={form}
        layout="vertical"
        onFinish={handleLoginSubmit}
        initialValues={{
          tenantId: "TENANT-001",
          username: "doctor",
          password: "doctor123",
        }}
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
            className="rounded-lg text-sm font-mono"
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
            placeholder="doctor, reception, nurse, superadmin, etc."
            size="large"
            className="rounded-lg text-sm font-medium"
            onChange={handleUsernameChange}
            allowClear
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          label={
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</span>
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-filled for {selectedRole}
              </span>
            </div>
          }
          name="password"
          rules={[{ required: true, message: "Password is required" }]}
          className="mb-0"
        >
          <Input.Password
            prefix={<Lock className="w-4 h-4 text-slate-400 mr-1" />}
            placeholder="Enter password"
            size="large"
            className="rounded-lg text-sm font-mono"
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
            <Key className="w-3.5 h-3.5 text-primary-teal" /> 1-Click Demo Account Autofill
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
            {showDemo ? "Hide ▲" : "Show All Demo Logins ▼"}
          </span>
        </button>

        {showDemo && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 animate-fade-in">
            <div className="grid grid-cols-2 gap-2 text-center">
              <button
                type="button"
                onClick={() => selectDemoAccount("doctor")}
                className="p-2 bg-white rounded border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left cursor-pointer"
              >
                <span className="font-semibold text-teal-800 block text-[11px]">Doctor</span>
                <code className="text-[10px] text-slate-600 font-mono">doctor / doctor123</code>
              </button>

              <button
                type="button"
                onClick={() => selectDemoAccount("reception")}
                className="p-2 bg-white rounded border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left cursor-pointer"
              >
                <span className="font-semibold text-blue-800 block text-[11px]">Reception</span>
                <code className="text-[10px] text-slate-600 font-mono">reception / rec123</code>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <button
                type="button"
                onClick={() => selectDemoAccount("nurse")}
                className="p-2 bg-white rounded border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left cursor-pointer"
              >
                <span className="font-semibold text-purple-800 block text-[11px]">Nurse</span>
                <code className="text-[10px] text-slate-600 font-mono">nurse / nurse123</code>
              </button>

              <button
                type="button"
                onClick={() => selectDemoAccount("billing")}
                className="p-2 bg-white rounded border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left cursor-pointer"
              >
                <span className="font-semibold text-emerald-800 block text-[11px]">Billing</span>
                <code className="text-[10px] text-slate-600 font-mono">billing / bill123</code>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <button
                type="button"
                onClick={() => selectDemoAccount("superadmin")}
                className="p-2 bg-white rounded border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left cursor-pointer"
              >
                <span className="font-semibold text-amber-800 block text-[11px]">Super Admin</span>
                <code className="text-[10px] text-slate-600 font-mono">superadmin / super123</code>
              </button>

              <button
                type="button"
                onClick={() => selectDemoAccount("hospitaladmin")}
                className="p-2 bg-white rounded border border-slate-200 hover:border-slate-500 hover:bg-slate-100 transition-all text-left cursor-pointer"
              >
                <span className="font-semibold text-slate-800 block text-[11px]">Hospital Admin</span>
                <code className="text-[10px] text-slate-600 font-mono">hospitaladmin / hospital123</code>
              </button>
            </div>

            <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-200/60">
              Click any role box to pre-fill credentials & sign in instantly.
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
