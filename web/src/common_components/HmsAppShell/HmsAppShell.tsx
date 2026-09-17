"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";
import { useNotificationStore } from "@/lib/notification_store/notification.store";
import { HmsMobileNav } from "../HmsMobileNav/HmsMobileNav";
import { HmsNotificationBell } from "../HmsNotificationBell/HmsNotificationBell";
import { HmsLanguageSwitcher } from "../HmsLanguageSwitcher/HmsLanguageSwitcher";
import { HmsHighContrastToggle } from "../HmsHighContrastToggle/HmsHighContrastToggle";
import { HmsButton } from "../HmsButton/HmsButton";
import { LogOut, Building2, ChevronRight, Database } from "lucide-react";

interface HmsAppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const HmsAppShell: React.FC<HmsAppShellProps> = ({
  children,
  title,
  subtitle,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthUserStore((s) => s.user);
  const logout = useAuthUserStore((s) => s.logout);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const userRole = user?.role || "DOCTOR";
  const userName = user?.username || "Hospital Staff";
  const hospitalName = user?.hospitalName || "HMS Medical Center";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Generate breadcrumb path text
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbText = pathSegments.length > 0 
    ? pathSegments[0].replace(/-/g, " ").toUpperCase() 
    : "DASHBOARD";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900">
      {/* Mobile & Desktop Sidebar Navigation */}
      <HmsMobileNav
        userRole={userRole}
        currentPath={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        notificationCount={unreadCount}
        userName={userName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 pt-16 lg:pt-0">
        {/* Top Header Bar for Desktop & Tablet */}
        <header className="hidden lg:block sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-xs">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
            {/* Left: Hospital Info & Breadcrumb */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-primary-teal" />
                <span className="truncate max-w-[180px]">{hospitalName}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-semibold text-primary-teal">{breadcrumbText}</span>
              </div>
              
              {title && (
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {title}
                </h1>
              )}
            </div>

            {/* Right: Actions (Language, Contrast, Notifications, Profile, Logout) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/demo-seed"
                  className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors flex items-center gap-1"
                >
                  <Database className="w-3.5 h-3.5 text-teal-600" /> Demo Seeder
                </Link>
                <HmsLanguageSwitcher />
                <HmsHighContrastToggle />
              </div>

              {/* Notification Bell Anchor */}
              <div className="relative flex items-center justify-center">
                <HmsNotificationBell />
              </div>

              {/* User Profile Badge & Logout (Desktop) */}
              <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-light-teal border border-primary-teal/30 flex items-center justify-center text-primary-teal font-bold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">{userName}</p>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">{userRole}</p>
                  </div>
                </div>

                <HmsButton
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-rose-600 hover:border-rose-200 p-2 h-8"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </HmsButton>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {subtitle && (
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
