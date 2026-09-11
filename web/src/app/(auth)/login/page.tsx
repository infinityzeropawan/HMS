"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLoginForm } from "../_auth_components/LoginForm/AuthLoginForm";
import { AuthMfaOtpForm } from "../_auth_components/MfaStep/AuthMfaOtpForm";
import { useAuthUserStore } from "../_auth_stores/auth_user_store";
import { Shield, Heart, Smartphone } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthUserStore((s) => s.user);
  const mfaRequired = useAuthUserStore((s) => s.mfaRequired);

  useEffect(() => {
    if (user) {
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
      
      const targetPath = redirectMap[user.role.toUpperCase()] || "/dashboard";
      router.push(targetPath);
    }
  }, [user, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-light-teal flex flex-col justify-between relative overflow-hidden safe-area-padding safe-area-bottom">
      {/* Background Decorative Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 sm:w-96 sm:h-96 bg-primary-teal/10 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-green/10 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-primary-teal/20 rounded-3xl rotate-12" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border-2 border-emerald-green/20 rounded-3xl -rotate-12" />
        </div>
      </div>

      {/* Main Form Centering */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-full px-4 sm:px-6 z-10 py-8 sm:py-12 md:py-16">
        <div className="w-full min-w-[280px] max-w-md sm:max-w-md md:max-w-lg animate-fade-in">
          {mfaRequired ? <AuthMfaOtpForm /> : <AuthLoginForm />}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-5 sm:py-6 px-4 xs:px-5 bg-white/80 backdrop-blur-sm border-t border-slate-200/50 safe-area-bottom z-10">
        <div className="container mx-auto">
          {/* Healthcare Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-light-teal rounded-full border border-primary-teal/20">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary-teal" />
              <span className="text-xs font-medium text-primary-teal">HIPAA Compliant</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-light rounded-full border border-emerald-green/20">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-green" />
              <span className="text-xs font-medium text-emerald-green">ABDM Certified</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-light rounded-full border border-blue/20">
              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-blue" />
              <span className="text-xs font-medium text-blue">Mobile-Optimized</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Hospital Management System Enterprise
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Multi-tenant healthcare platform • DPDP 2023 compliant • 
              Real-time clinical workflows • Secure patient data management
            </p>
            <p className="text-xs text-slate-400 pt-2">
              © 2026 HMS Healthcare Solutions • v2.1.0
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
