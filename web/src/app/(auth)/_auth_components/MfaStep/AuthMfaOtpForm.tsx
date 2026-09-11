"use client";

import React, { useState } from "react";
import { Form, Input, Alert } from "antd";
import { ShieldCheck } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useAuthUserStore } from "../../_auth_stores/auth_user_store";
import { authApiService } from "../../_auth_services/auth_api_service";

export const AuthMfaOtpForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mfaSessionToken = useAuthUserStore((s) => s.mfaSessionToken);
  const setUserSession = useAuthUserStore((s) => s.setUserSession);

  const onVerifyOtp = async (values: { otpCode: string }) => {
    if (!mfaSessionToken) return;
    setLoading(true);
    setError(null);
    try {
      const session = await authApiService.verifyMfa({
        otpCode: values.otpCode,
        mfaSessionToken,
      });
      setUserSession(session);
    } catch {
      setError("Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-w-[280px] max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">MFA Verification</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter the 6-digit authenticator code sent to your registered device
        </p>
      </div>

      {error && <Alert message={error} type="error" showIcon className="mb-4" />}

      <Form layout="vertical" onFinish={onVerifyOtp}>
        <Form.Item
          label="6-Digit Verification Code"
          name="otpCode"
          rules={[
            { required: true, message: "OTP is required" },
            { len: 6, message: "Code must be exactly 6 digits" },
          ]}
        >
          <Input
            placeholder="000000"
            maxLength={6}
            size="large"
            className="text-center font-mono text-xl tracking-widest"
          />
        </Form.Item>

        <Form.Item className="mt-6">
          <HmsButton type="primary" htmlType="submit" size="lg" block loading={loading}>
            Verify & Continue
          </HmsButton>
        </Form.Item>
      </Form>
    </div>
  );
};
