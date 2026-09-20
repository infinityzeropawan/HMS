"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spin } from "antd";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";

/**
 * Hospital Admin route-group guard (A1 fix).
 *
 * Protects all administrative surfaces under `(admin)`: `/admin`, `/users`,
 * `/departments`, `/tariffs`, `/beds`, `/roster`, `/print-templates`,
 * `/hospital-settings`, `/accreditations`, `/audit-logs`, and `/notifications`.
 *
 * Prevents unauthenticated access or access by non-administrative roles (e.g.
 * DOCTOR, NURSE, RECEPTIONIST, BILLER).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthUserStore((s) => s.user);
  const _hasHydrated = useAuthUserStore((s) => s._hasHydrated);
  const setHasHydrated = useAuthUserStore((s) => s.setHasHydrated);

  // Fallback for SSR / initial render if already hydrated
  useEffect(() => {
    if (!_hasHydrated && typeof window !== "undefined") {
      const isAlreadyHydrated = useAuthUserStore.persist?.hasHydrated?.();
      if (isAlreadyHydrated) {
        setHasHydrated(true);
      }
    }
  }, [_hasHydrated, setHasHydrated]);

  const isAuthorized =
    user?.role === "ADMIN" ||
    user?.role === "HOSPITAL_ADMIN" ||
    user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (_hasHydrated && !isAuthorized) {
      const redirectTarget = pathname && pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectTarget}`);
    }
  }, [_hasHydrated, isAuthorized, pathname, router]);

  // Avoid flashing privileged UI while store is rehydrating or redirect is in flight.
  if (!_hasHydrated || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <Spin size="large" />
        <p className="text-sm font-medium text-slate-500">
          {!_hasHydrated ? "Restoring security session…" : "Verifying Hospital Admin privileges…"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
