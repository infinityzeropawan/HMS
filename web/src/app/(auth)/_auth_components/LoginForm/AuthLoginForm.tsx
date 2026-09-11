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
    <div className="w-full bg-white p-5 xs:p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border-0 hover-card animate-fade-in">
      {/* Premium Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-teal to-emerald-green mb-4 shadow-lg">
          <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-dark-slate mb-2 tracking-tight">
          Hospital Management System
        </h2>
        <Text type="secondary" className="text-sm sm:text-base text-slate-600">
          Secure login for healthcare professionals
        </Text>
      </div>

      {/* Error Alert - Premium Styling */}
      {errorMessage && (
        <Alert
          message="Authentication Error"
          description={errorMessage}
          type="error"
          showIcon
          className="mb-5 sm:mb-6 rounded-lg border-l-4 border-crimson bg-crimson-light"
          icon={<Shield className="w-4 h-4" />}
        />
      )}

      {/* Premium Form */}
      <Form<AuthLoginInput>
        layout="vertical"
        onFinish={handleLoginSubmit}
        initialValues={{ tenantId: "TENANT-001" }}
        size="large"
        className="space-y-5 sm:space-y-6"
      >
        {/* Hospital ID Field */}
        <Form.Item
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Hospital / Tenant ID
            </span>
          }
          name="tenantId"
          rules={[{ required: true, message: "Hospital ID is required" }]}
          className="mb-0"
        >
          <Input
            prefix={<Building2 className="w-4 h-4 text-slate-400" />}
            placeholder="e.g., TENANT-001"
            size="large"
            className="h-12 sm:h-14 rounded-lg border-slate-300 hover:border-primary-teal focus:border-primary-teal transition-colors"
            allowClear
          />
        </Form.Item>

        {/* Username Field */}
        <Form.Item
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Staff ID / Email
            </span>
          }
          name="username"
          rules={[{ required: true, message: "Username is required" }]}
          className="mb-0"
        >
          <Input
            prefix={<User className="w-4 h-4 text-slate-400" />}
            placeholder="username@hospital.com"
            size="large"
            className="h-12 sm:h-14 rounded-lg border-slate-300 hover:border-primary-teal focus:border-primary-teal transition-colors"
            allowClear
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          label={
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password
            </span>
          }
          name="password"
          rules={[{ required: true, message: "Password is required" }]}
          className="mb-0"
        >
          <Input.Password
            prefix={<Lock className="w-4 h-4 text-slate-400" />}
            placeholder="Enter your password"
            size="large"
            className="h-12 sm:h-14 rounded-lg border-slate-300 hover:border-primary-teal focus:border-primary-teal transition-colors [&>input]:placeholder-slate-400"
            iconRender={(visible) => 
              visible ? 
                <Lock className="w-4 h-4 text-slate-500" /> : 
                <Lock className="w-4 h-4 text-slate-400" />
            }
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item className="mt-2">
          <HmsButton
            variant="primary"
            htmlType="submit"
            size="lg"
            fullWidth
            loading={loading}
            loadingText="Authenticating..."
            className="h-14 sm:h-16 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all duration-300"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </span>
            ) : (
              "Sign In to Dashboard"
            )}
          </HmsButton>
        </Form.Item>
      </Form>

      {/* Demo Credentials - Premium Styling */}
      <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Smartphone className="w-4 h-4 text-slate-500" />
          <Text className="text-xs font-medium text-slate-600">Mobile-Optimized Demo</Text>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-gradient-doctor rounded-lg border border-slate-200">
            <Text className="text-xs font-semibold text-slate-700 mb-1 block">Doctor Role</Text>
            <div className="font-mono text-sm text-primary-teal font-medium">
              doctor / doctor123
            </div>
          </div>
          
          <div className="p-3 bg-gradient-reception rounded-lg border border-slate-200">
            <Text className="text-xs font-semibold text-slate-700 mb-1 block">Reception Role</Text>
            <div className="font-mono text-sm text-blue font-medium">
              reception / rec123
            </div>
          </div>
        </div>
        
        <Text className="text-xs text-slate-500 text-center mt-3 block">
          Other roles: nurse/nurse123 • billing/bill123 • pharmacy/pharma123
        </Text>
      </div>

      {/* Security Note */}
      <div className="mt-5 sm:mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
          <Text className="text-xs text-slate-600">
            <strong>Security:</strong> All credentials are encrypted. Session expires after 30 minutes of inactivity.
          </Text>
        </div>
      </div>
    </div>
  );
};
