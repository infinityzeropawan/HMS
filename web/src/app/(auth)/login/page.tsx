"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthLoginForm } from "../_auth_components/LoginForm/AuthLoginForm";
import { AuthMfaOtpForm } from "../_auth_components/MfaStep/AuthMfaOtpForm";
import { useAuthUserStore } from "../_auth_stores/auth_user_store";
import { getRoleHomePath } from "../_auth_constants/auth_redirect";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { Shield, Heart, Smartphone, LogOut, ArrowRight, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthUserStore((s) => s.user);
  const logout = useAuthUserStore((s) => s.logout);
  const mfaRequired = useAuthUserStore((s) => s.mfaRequired);

  const handleContinueToDashboard = () => {
    if (user) {
      router.push(getRoleHomePath(user.role));
    }
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("hms_user_auth_session");
      } catch { /* ignore */ }
    }
    logout();
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-slate-50 safe-area-padding">
      {/* Background Subtle Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.10),_transparent_30%)]" />

      <div className="relative mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-6xl items-center gap-8 py-6 sm:py-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
        <section className="order-2 lg:order-1">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-teal/20 bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary-teal shadow-sm">
              <Shield className="h-3.5 w-3.5" /> Secure clinical workspace
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">Care teams, connected in one place.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">Manage patient flow, clinical records, billing and operations from one secure workspace built for your hospital.</p>
            <div className="mt-7 grid gap-3 text-left sm:grid-cols-3 lg:mt-10">
              {["Clinical workflow", "Role-based access", "ABDM ready"].map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur sm:p-4">
                  <Shield className="h-5 w-5 text-primary-teal" />
                  <p className="mt-2 text-xs font-bold text-slate-800">{item}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Built for safe, connected care</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="order-1 w-full lg:order-2">
          <div className="w-full max-w-md mx-auto">
          {user ? (
            /* Active Session Card */
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 text-center space-y-4 animate-fade-in my-auto">
              <div className="w-14 h-14 rounded-full bg-primary-light-teal border border-primary-teal/30 flex items-center justify-center mx-auto text-primary-teal font-bold text-lg">
                <UserCheck className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">Active Session Found</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Signed in as <strong className="text-slate-900">{user.username}</strong>
                </p>
                <span className="inline-block px-2.5 py-0.5 mt-1 text-xs font-semibold rounded-full bg-primary-light-teal text-primary-teal uppercase tracking-wider">
                  {user.role}
                </span>
                <p className="text-xs text-slate-400 mt-1">{user.hospitalName}</p>
              </div>

              <div className="space-y-2.5 pt-2">
                <HmsButton
                  variant="emerald"
                  size="md"
                  fullWidth
                  onClick={handleContinueToDashboard}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Workspace
                </HmsButton>

                <HmsButton
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={handleSignOut}
                  icon={<LogOut className="w-3.5 h-3.5" />}
                  className="text-slate-700 border-slate-300 hover:text-rose-600 hover:border-rose-200"
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
        </section>
      </div>

      {/* Sleek Bottom Bar */}
      <footer className="relative pb-5 text-center text-xs text-slate-500 sm:pb-7">
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
