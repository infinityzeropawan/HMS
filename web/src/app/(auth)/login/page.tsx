"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthLoginForm } from "../_auth_components/LoginForm/AuthLoginForm";
import { AuthMfaOtpForm } from "../_auth_components/MfaStep/AuthMfaOtpForm";
import { useAuthUserStore } from "../_auth_stores/auth_user_store";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { Shield, Heart, Smartphone, LogOut, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthUserStore((s) => s.user);
  const logout = useAuthUserStore((s) => s.logout);
  const mfaRequired = useAuthUserStore((s) => s.mfaRequired);

  const redirectMap: Record<string, string> = {
    DOCTOR: "/queue",
    ADMIN: "/users",
    SUPER_ADMIN: "/tenants",
    PHARMACIST: "/dispense",
    PHARMACY: "/dispense",
    LAB_TECH: "/orders",
    LAB: "/orders",
    BILLER: "/invoices",
    BILLING: "/invoices",
    NURSE: "/station",
    RECEPTION: "/dashboard",
    RECEPTIONIST: "/dashboard",
  };

  const handleContinueToDashboard = () => {
    if (user) {
      const targetPath = redirectMap[user.role.toUpperCase()] || "/dashboard";
      router.push(targetPath);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between p-3 sm:p-6 overflow-y-auto">
      {/* Background Subtle Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary-light-teal/40 via-white to-slate-50 pointer-events-none" />

      <div className="flex-1 flex items-center justify-center w-full z-10 my-auto py-4">
        <div className="w-full max-w-md mx-auto">
          {user ? (
            /* Active Session Card */
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 text-center space-y-4 animate-fade-in my-auto">
              <div className="w-14 h-14 rounded-full bg-primary-light-teal border border-primary-teal/30 flex items-center justify-center mx-auto text-primary-teal font-bold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">Active Session Found</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Signed in as <strong>{user.username}</strong> ({user.role})
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{user.hospitalName}</p>
              </div>

              <div className="space-y-2.5 pt-2">
                <HmsButton
                  variant="emerald"
                  size="md"
                  fullWidth
                  onClick={handleContinueToDashboard}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Workspace ({user.role})
                </HmsButton>

                <HmsButton
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={logout}
                  icon={<LogOut className="w-3.5 h-3.5" />}
                  className="text-slate-600 border-slate-300 hover:text-rose-600 hover:border-rose-200"
                >
                  Sign Out / Switch Account
                </HmsButton>
              </div>
            </div>
          ) : (
            /* Standard Login Form */
            mfaRequired ? <AuthMfaOtpForm /> : <AuthLoginForm />
          )}
        </div>
      </div>

      {/* Sleek Bottom Bar */}
      <footer className="w-full py-3 px-4 z-10 text-center text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-1">
          <span className="flex items-center gap-1 text-primary-teal font-medium">
            <Shield className="w-3.5 h-3.5" /> HIPAA
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <Heart className="w-3.5 h-3.5" /> ABDM Certified
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-blue-600 font-medium">
            <Smartphone className="w-3.5 h-3.5" /> Mobile Ready
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          HMS Enterprise Platform &bull; Multi-Tenant Healthcare System v2.1.0
        </p>
      </footer>
    </main>
  );
}
