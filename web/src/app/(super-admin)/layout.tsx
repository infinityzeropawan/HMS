"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spin } from "antd";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";

/**
 * Super Admin route-group guard.
 *
 * The platform console is a privileged surface: it must never render with an
 * unauthenticated session (HmsAppShell falls back to the DOCTOR navigation when
 * `user` is null) nor with a hospital-scoped role. Every page under
 * `(super-admin)` is wrapped by this layout, so a single check protects all
 * `/tenants`, `/subscription-plans`, `/feature-flags`, `/role-templates`,
 * `/compliance-governance`, `/global-masters`, `/platform-audit` and
 * `/support-tickets` routes.
 */
export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
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

  const isAuthorized = user?.role === "SUPER_ADMIN";

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
          {!_hasHydrated ? "Restoring security session…" : "Verifying Super Admin privileges…"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}