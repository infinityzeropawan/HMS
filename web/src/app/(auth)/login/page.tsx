"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthLoginForm } from "../_auth_components/LoginForm/AuthLoginForm";
import { AuthMfaOtpForm } from "../_auth_components/MfaStep/AuthMfaOtpForm";
import { useAuthUserStore } from "../_auth_stores/auth_user_store";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { Shield, Heart, Smartphone, User, LogOut, ArrowRight } from "lucide-react";

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
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden safe-area-padding safe-area-bottom">
      {/* Background Decorative Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 sm:w-96 sm:h-96 bg-primary-teal/10 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-green/10 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Form Centering */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-full px-4 sm:px-6 z-10 py-8 sm:py-12">
        <div className="w-full min-w-[280px] max-w-md sm:max-w-md md:max-w-lg space-y-4">
          {user ? (
            /* Active Session Card */
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary-light-teal border-2 border-primary-teal/30 flex items-center justify-center mx-auto text-primary-teal font-bold text-xl">
                {user.username.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">Active Session Found</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Signed in as <strong>{user.username}</strong> ({user.role})
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{user.hospitalName}</p>
              </div>

              <div className="space-y-3 pt-2">
                <HmsButton
                  variant="emerald"
                  size="lg"
                  fullWidth
                  onClick={handleContinueToDashboard}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Workspace ({user.role})
                </HmsButton>

                <HmsButton
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={logout}
                  icon={<LogOut className="w-4 h-4" />}
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

      {/* Footer */}
      <footer className="w-full py-5 sm:py-6 px-4 bg-white border-t border-slate-200 z-10">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-light-teal rounded-full border border-primary-teal/20">
              <Shield className="w-3.5 h-3.5 text-primary-teal" />
              <span className="text-xs font-medium text-primary-teal">HIPAA Compliant</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-light rounded-full border border-emerald-green/20">
              <Heart className="w-3.5 h-3.5 text-emerald-green" />
              <span className="text-xs font-medium text-emerald-green">ABDM Certified</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-light rounded-full border border-blue/20">
              <Smartphone className="w-3.5 h-3.5 text-blue" />
              <span className="text-xs font-medium text-blue">Mobile-Optimized</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Hospital Management System Enterprise
            </p>
            <p className="text-xs text-slate-400">
              Multi-tenant healthcare platform • DPDP 2023 compliant • © 2026 HMS Healthcare Solutions
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
