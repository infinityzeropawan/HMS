import React from "react";
import type { Metadata, Viewport } from "next";
import { ConfigProvider } from "antd";
import { hmsAntdTheme } from "@/lib/antd_theme/antd_theme_config";
import { QueryProvider } from "@/lib/react_query/QueryProvider";
import { I18nProvider } from "@/i18n/_i18n_context/I18nContext";
import { HmsOfflineBanner } from "@/common_components/HmsOfflineBanner/HmsOfflineBanner";
import { HmsKeyboardShortcutsListener } from "@/common_components/HmsKeyboardShortcuts/HmsKeyboardShortcutsListener";
import { HmsNotificationBell } from "@/common_components/HmsNotificationBell/HmsNotificationBell";
import { HmsNotificationDrawer } from "@/common_components/HmsNotificationDrawer/HmsNotificationDrawer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hospital Management System (HMS)",
  description: "Enterprise Multi-Tenant Hospital Management Platform",
  keywords: ["hospital", "healthcare", "EMR", "EHR", "medical", "clinic"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#0D9488",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-slate-50">
        <ConfigProvider theme={hmsAntdTheme}>
          <QueryProvider>
            <I18nProvider>
              <HmsKeyboardShortcutsListener />
              <HmsOfflineBanner />
              {/* Global notification bell — visible on every page via portal */}
              <div
                id="hms-global-notification-anchor"
                className="fixed top-3 right-3 sm:top-4 sm:right-4 md:top-14 md:right-20 z-1050 flex items-center gap-2"
              >
                <HmsNotificationBell />
              </div>
              {/* Global notification drawer — rendered once, shared across all pages */}
              <HmsNotificationDrawer />
              {children}
            </I18nProvider>
          </QueryProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
