# Frontend Code Collection

## File: /home/pawan/Desktop/hospital/web/src/app/globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  /* === PREMIUM HEALTHCARE DESIGN SYSTEM === */
  
  /* Enhanced Color Palette - Premium Healthcare */
  --color-primary-teal: #0D9488;        /* Primary brand - WCAG AA compliant */
  --color-primary-dark-teal: #0C7C71;   /* 15% darker for hover states */
  --color-primary-light-teal: #E6F7F5;  /* Light background */
  --color-emerald-green: #059669;       /* Success states */
  --color-emerald-light: #D1FAE5;       /* Success background */
  --color-crimson: #DC2626;             /* Error/Alert - improved contrast */
  --color-crimson-light: #FEE2E2;       /* Error background */
  --color-amber: #F59E0B;               /* Warning */
  --color-amber-light: #FEF3C7;         /* Warning background */
  --color-blue: #2563EB;                /* Info - better visibility */
  --color-blue-light: #DBEAFE;          /* Info background */
  --color-purple-accent: #7C3AED;       /* AI/Accent */
  --color-purple-light: #EDE9FE;        /* Accent background */
  
  /* Neutral Palette - Premium grayscale */
  --color-dark-slate: #1E293B;          /* Primary text - better contrast */
  --color-slate-700: #334155;           /* Secondary text */
  --color-slate-600: #475569;           /* Tertiary text - WCAG AA */
  --color-slate-500: #64748B;           /* Placeholder/hint - WCAG AA */
  --color-slate-400: #94A3B8;           /* Disabled/icon - WCAG AA */
  --color-slate-300: #CBD5E1;           /* Borders */
  --color-slate-200: #E2E8F0;           /* Dividers */
  --color-slate-100: #F1F5F9;           /* Backgrounds */
  --color-slate-50: #F8FAFC;            /* Page background */
  --color-white: #FFFFFF;               /* Cards/surfaces */
  
  /* Semantic Colors */
  --color-success: var(--color-emerald-green);
  --color-error: var(--color-crimson);
  --color-warning: var(--color-amber);
  --color-info: var(--color-blue);
  --color-accent: var(--color-purple-accent);
  
  /* Role-based Colors */
  --color-doctor: #0D9488;              /* Doctor role accent */
  --color-nurse: #7C3AED;               /* Nurse role accent */
  --color-reception: #2563EB;           /* Reception role accent */
  --color-billing: #059669;             /* Billing role accent */
  --color-pharmacy: #F59E0B;            /* Pharmacy role accent */
  --color-lab: #DC2626;                 /* Lab role accent */

  /* Mobile-First Responsive Breakpoints */
  --breakpoint-xs: 360px;   /* Small smartphones (iPhone SE, etc.) */
  --breakpoint-sm: 480px;   /* Standard smartphones */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Small laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1440px; /* Large screens */

  /* Premium Typography System */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  
  --text-xs: 0.75rem;      /* 12px - labels, microcopy */
  --text-sm: 0.875rem;     /* 14px - body small */
  --text-base: 1rem;       /* 16px - body regular */
  --text-lg: 1.125rem;     /* 18px - body large */
  --text-xl: 1.25rem;      /* 20px - subheading */
  --text-2xl: 1.5rem;      /* 24px - heading 3 */
  --text-3xl: 1.875rem;    /* 30px - heading 2 */
  --text-4xl: 2.25rem;     /* 36px - heading 1 */
  --text-5xl: 3rem;        /* 48px - display */

  /* Premium Spacing Scale */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */

  /* Touch-friendly Sizing (WCAG 2.1) */
  --size-touch-min: 44px;     /* Minimum touch target */
  --size-touch-ideal: 48px;   /* Ideal touch target */
  --spacing-touch: 8px;       /* Minimum spacing between touch targets */

  /* Border Radius System */
  --radius-sm: 0.375rem;   /* 6px - inputs, badges */
  --radius-md: 0.5rem;     /* 8px - cards, buttons */
  --radius-lg: 0.75rem;    /* 12px - modals, large cards */
  --radius-xl: 1rem;       /* 16px - premium cards */
  --radius-2xl: 1.5rem;    /* 24px - rounded containers */

  /* Shadows - Premium elevation system */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

  /* Animation Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}

:root {
  /* Component-specific tokens */
  --hms-alert-crimson: var(--color-crimson);
  --hms-info-blue: var(--color-blue);
  --hms-warning-amber: var(--color-amber);
  --hms-slate-hint: var(--color-slate-500);
  --hms-vital-normal: var(--color-emerald-green);
  --hms-border-subtle: var(--color-slate-200);
  --hms-surface-raised: var(--color-slate-100);
  --hms-surface-base: #FFFFFF;
  --hms-text-primary: #0F172A;
  --hms-accent-primary: #0D9488;
  --hms-dark-slate: #0F172A;
}

/* High Contrast Mode (WCAG 2.1 AAA Accessibility) */
html.high-contrast {
  --color-primary-teal: #00FFFF;
  --color-primary-dark-teal: #00CCCC;
  --color-emerald-green: #00FF00;
  --color-light-teal-bg: #000000;
  --color-dark-slate: #FFFF00;
  --color-alert-crimson: #FF0055;
  --color-warning-amber: #FFFF00;
  --color-info-blue: #00E5FF;
  --color-purple-accent: #E066FF;
  --color-bg-grey: #000000;
  --color-white-card: #111111;
  --color-border-slate: #FFFFFF;
  --color-text-muted: #E2E8F0;

  --hms-alert-crimson: #FF0055;
  --hms-info-blue: #00E5FF;
  --hms-warning-amber: #FFFF00;
  --hms-slate-hint: #E2E8F0;
  --hms-vital-normal: #00FF00;
  --hms-border-subtle: #FFFFFF;
  --hms-surface-raised: #1A1A1A;
  --hms-surface-base: #000000;
  --hms-text-primary: #FFFFFF;
  --hms-accent-primary: #00FFFF;
  --hms-dark-slate: #FFFF00;
  filter: contrast(125%);
}

/* === PREMIUM MOBILE-FIRST BASE STYLES === */

body {
  background-color: var(--color-slate-50);
  color: var(--color-dark-slate);
  font-family: var(--font-family-sans);
  margin: 0;
  padding: 0;
  font-size: var(--text-base);
  line-height: 1.625; /* Premium line height */
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  min-height: 100vh;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(13, 148, 136, 0.03) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.03) 0%, transparent 20%);
}

/* Premium Typography System */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.025em;
  margin-top: 0;
}

h1 {
  font-size: var(--text-3xl);
  font-weight: 700;
  letter-spacing: -0.03em;
}

h2 {
  font-size: var(--text-2xl);
  letter-spacing: -0.02em;
}

h3 {
  font-size: var(--text-xl);
}

/* Mobile-First Typography Scaling */
@media (max-width: 479px) { /* xs breakpoint */
  body {
    font-size: var(--text-sm);
  }
  
  h1 {
    font-size: var(--text-2xl);
    line-height: 1.2;
  }
  
  h2 {
    font-size: var(--text-xl);
    line-height: 1.3;
  }
  
  h3 {
    font-size: var(--text-lg);
    line-height: 1.4;
  }
}

/* Premium Container */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

@media (min-width: 480px) {
  .container {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}

@media (min-width: 768px) {
  .container {
    padding-left: var(--spacing-xl);
    padding-right: var(--spacing-xl);
  }
}

/* Prevent text size adjustment on orientation change */
html {
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
  scroll-behavior: smooth;
}

/* Premium Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-slate-100);
  border-radius: var(--radius-md);
}

::-webkit-scrollbar-thumb {
  background: var(--color-slate-300);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-normal);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-slate-400);
}

/* Mobile scrollbar */
@media (max-width: 768px) {
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
}

/* Premium Touch-Friendly Helper Class */
.touch-target {
  min-height: var(--size-touch-ideal);
  min-width: var(--size-touch-ideal);
  touch-action: manipulation;
}

/* Premium Focus States (WCAG 2.1 compliant) */
:focus-visible {
  outline: 3px solid var(--color-primary-teal);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Premium Form Input Sizing (Prevent iOS zoom) */
@media (max-width: 768px) {
  input[type="text"],
  input[type="password"],
  input[type="email"],
  input[type="tel"],
  input[type="number"],
  input[type="search"],
  textarea {
    font-size: 16px !important; /* Prevents iOS zoom */
  }
}

/* === RESPONSIVE ANT DESIGN COMPONENTS === */
/*
 * Antd <Table> renders at its intrinsic width (often 700–1000px+ because of
 * many columns). Without a scroll container the whole page blows out of the
 * viewport ("meshed up" mobile layout) and content on the right is clipped
 * by `body { overflow-x: hidden }`. These rules constrain every table/tab
 * strip to its container and enable smooth horizontal scrolling instead.
 */
.ant-table-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-inline: contain;
}

.ant-table-wrapper .ant-table {
  min-width: 100%;
}

/* Prevent cells from wrapping into unreadable multi-line mush on small screens */
.ant-table-wrapper .ant-table-cell {
  white-space: nowrap;
}

/* Responsive antd Tabs — allow the tab strip to scroll horizontally */
.ant-tabs-nav-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.ant-tabs-nav-list {
  min-width: max-content;
}

/* Responsive antd Select/Input inside narrow containers */
.ant-select-in-form-item,
.ant-picker {
  max-width: 100%;
}

/* Page level safe max width for wide static content (e.g. code/pre) */
pre {
  max-width: 100%;
  overflow-x: auto;
}

/* Ensure flex/grid children can shrink so they never blow out the viewport */
#__next,
main,
section {
  min-width: 0;
}

/* Premium Safe Area Utility Classes */
@supports (padding: max(0px)) {
  .safe-area-padding {
    padding-left: max(var(--spacing-md), env(safe-area-inset-left));
    padding-right: max(var(--spacing-md), env(safe-area-inset-right));
  }
  
  .safe-area-bottom {
    padding-bottom: max(var(--spacing-md), env(safe-area-inset-bottom));
  }
  
  .safe-area-top {
    padding-top: max(var(--spacing-md), env(safe-area-inset-top));
  }
}

/* Premium Utility Classes */
.text-balance {
  text-wrap: balance;
}

.text-pretty {
  text-wrap: pretty;
}

/* Premium Loading Animation */
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.loading-shimmer {
  background: linear-gradient(90deg, 
    var(--color-slate-100) 25%, 
    var(--color-slate-200) 50%, 
    var(--color-slate-100) 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

/* Premium Pulse Animation */
@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Premium Fade In Animation */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in var(--duration-normal) ease-out;
}

/* Role-based Background Gradients */
.bg-gradient-doctor {
  background: linear-gradient(135deg, var(--color-primary-light-teal) 0%, var(--color-white) 100%);
}

.bg-gradient-nurse {
  background: linear-gradient(135deg, var(--color-purple-light) 0%, var(--color-white) 100%);
}

.bg-gradient-reception {
  background: linear-gradient(135deg, var(--color-blue-light) 0%, var(--color-white) 100%);
}

.bg-gradient-billing {
  background: linear-gradient(135deg, var(--color-emerald-light) 0%, var(--color-white) 100%);
}

/* Premium Card Hover Effects */
.hover-card {
  transition: all var(--duration-normal) ease;
  border: 1px solid var(--color-slate-200);
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-slate-300);
}

/* Premium Button Press Effect */
.active-scale:active {
  transform: scale(0.98);
  transition: transform var(--duration-fast) ease;
}

/* Healthcare-specific utility classes */
.vital-normal {
  color: var(--color-emerald-green);
  background-color: var(--color-emerald-light);
}

.vital-warning {
  color: var(--color-amber);
  background-color: var(--color-amber-light);
}

.vital-critical {
  color: var(--color-crimson);
  background-color: var(--color-crimson-light);
}

/* Premium Selection Styling */
::selection {
  background-color: var(--color-primary-teal);
  color: white;
}

/* Premium Placeholder Styling */
::placeholder {
  color: var(--color-slate-400);
  opacity: 1;
}

/* Premium Disabled State */
[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Premium Link Styling */
a {
  color: var(--color-primary-teal);
  text-decoration: none;
  transition: color var(--duration-normal);
}

a:hover {
  color: var(--color-primary-dark-teal);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Premium Code/Mono Styling */
code, pre, .font-mono {
  font-family: var(--font-family-mono);
  font-size: 0.875em;
}

/* Premium Image Optimization */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Premium List Styling */
ul, ol {
  padding-left: var(--spacing-lg);
}

li {
  margin-bottom: var(--spacing-sm);
}

/* Premium HR Styling */
hr {
  border: 0;
  height: 1px;
  background: var(--color-slate-200);
  margin: var(--spacing-xl) 0;
}

```

## File: /home/pawan/Desktop/hospital/web/src/app/layout.tsx

```tsx
import React from "react";
import type { Metadata, Viewport } from "next";
import { ConfigProvider } from "antd";
import { hmsAntdTheme } from "@/lib/antd_theme/antd_theme_config";
import { QueryProvider } from "@/lib/react_query/QueryProvider";
import { I18nProvider } from "@/i18n/_i18n_context/I18nContext";
import { HmsOfflineBanner } from "@/common_components/HmsOfflineBanner/HmsOfflineBanner";
import { HmsKeyboardShortcutsListener } from "@/common_components/HmsKeyboardShortcuts/HmsKeyboardShortcutsListener";
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
              {/* Global notification drawer — rendered once, shared across all pages */}
              <HmsNotificationDrawer />
              <div id="hms-global-notification-anchor" className="hidden" />
              {children}
            </I18nProvider>
          </QueryProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}

```

## File: /home/pawan/Desktop/hospital/web/src/app/page.tsx

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}

```

## File: /home/pawan/Desktop/hospital/web/src/app/(admin)/users/page.tsx

```tsx
"use client";

import React from "react";
import { StaffUserTable } from "../_admin_components/UserManagement/StaffUserTable";
import { Users, UserPlus } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsAppShell } from "@/common_components/HmsAppShell/HmsAppShell";

export default function AdminUsersPage() {
  return (
    <HmsAppShell title="Staff User & RBAC Management">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-teal-600" /> Staff & RBAC User Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">Hospital Multi-Tenant Staff Credentials & Role Access Control</p>
          </div>
          <HmsButton variant="emerald" icon={<UserPlus className="w-4 h-4" />}>
            Add New Staff User
          </HmsButton>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <StaffUserTable />
        </div>
      </div>
    </HmsAppShell>
  );
}

```

## File: /home/pawan/Desktop/hospital/web/src/app/(admin)/_admin_components/UserManagement/StaffUserTable.tsx

```tsx
"use client";

import React from "react";
import { Table, Tag, Switch, message } from "antd";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const StaffUserTable: React.FC = () => {
  const columns = [
    { title: "Staff ID", dataIndex: "staffId", key: "staffId" },
    { title: "Full Name", dataIndex: "name", key: "name" },
    { title: "Role", dataIndex: "role", key: "role", render: (r: string) => <Tag color="purple">{r}</Tag> },
    { title: "Department", dataIndex: "dept", key: "dept" },
    { title: "Contact Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Active Status",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <Switch defaultChecked={active} onChange={(checked) => message.info(`Staff account status updated: ${checked ? "Active" : "Disabled"}`)} />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <HmsButton size="sm" variant="secondary">
          Edit Roles
        </HmsButton>
      ),
    },
  ];

  const data = [
    { key: "1", staffId: "DOC-101", name: "Dr. Rajesh Sharma", role: "DOCTOR", dept: "Cardiology", phone: "9820011223", active: true },
    { key: "2", staffId: "REC-202", name: "Sunita Deshmukh", role: "RECEPTIONIST", dept: "OPD Desk", phone: "9820022334", active: true },
    { key: "3", staffId: "NUR-303", name: "Sr. Kavita R.", role: "NURSE", dept: "ICU Ward", phone: "9820033445", active: true },
    { key: "4", staffId: "BIL-404", name: "Vikram Patil", role: "BILLER", dept: "Accounts", phone: "9820044556", active: true },
  ];

  return <Table columns={columns} dataSource={data} pagination={false} />;
};

```

## File: /home/pawan/Desktop/hospital/web/src/common_components/HmsButton/HmsButton.tsx

```tsx
"use client";

import React from "react";
import { Button as AntdButton, ButtonProps } from "antd";

export interface HmsButtonProps extends Omit<ButtonProps, "variant" | "size"> {
  variant?: "primary" | "emerald" | "secondary" | "danger" | "ghost" | "outline";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  role?: "doctor" | "nurse" | "reception" | "billing" | "pharmacy" | "lab";
  fullWidth?: boolean;
  loadingText?: string;
}

export const HmsButton: React.FC<HmsButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  role,
  fullWidth = false,
  loadingText,
  className = "",
  disabled,
  loading,
  ...props
}) => {
  // Size mapping
  const sizeClasses = {
    xs: "h-8 px-3 text-xs min-w-[80px]",
    sm: "h-10 px-4 text-sm min-w-[96px]",
    md: "h-12 px-5 text-base min-w-[112px]",
    lg: "h-14 px-6 text-lg min-w-[128px]",
    xl: "h-16 px-7 text-xl min-w-[144px]",
  };

  // Variant mapping with premium styling
  const variantClasses = {
    primary: "bg-primary-teal hover:bg-primary-dark-teal text-white border-primary-teal hover:border-primary-dark-teal shadow-sm hover:shadow-md",
    emerald: "bg-emerald-green hover:bg-emerald-800 text-white border-emerald-green hover:border-emerald-800 shadow-sm hover:shadow-md",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 shadow-sm hover:shadow",
    danger: "bg-crimson hover:bg-rose-700 text-white border-crimson hover:border-rose-700 shadow-sm hover:shadow-md",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-300",
    outline: "bg-transparent hover:bg-primary-light-teal text-primary-teal border-primary-teal hover:border-primary-dark-teal",
  };

  // Role-based styling
  const roleClasses = {
    doctor: "bg-doctor hover:bg-primary-dark-teal border-doctor",
    nurse: "bg-nurse hover:bg-purple-700 border-nurse",
    reception: "bg-reception hover:bg-blue-700 border-reception",
    billing: "bg-billing hover:bg-emerald-800 border-billing",
    pharmacy: "bg-pharmacy hover:bg-amber-700 border-pharmacy",
    lab: "bg-lab hover:bg-rose-700 border-lab",
  };

  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  const roleClass = role ? roleClasses[role] : "";
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";
  const loadingClass = loading ? "cursor-wait" : "";

  // Combined classes with premium animations
  const customStyle = `
    ${sizeClass}
    ${variantClass}
    ${roleClass}
    ${widthClass}
    ${disabledClass}
    ${loadingClass}
    font-medium font-sans
    rounded-lg
    border
    transition-all
    duration-200
    ease-in-out
    transform
    active:scale-98
    focus-visible:outline-2
    focus-visible:outline-primary-teal
    focus-visible:outline-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:transform-none
    disabled:hover:shadow-none
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Determine Ant Design button type
  const antdType = variant === "primary" || variant === "emerald" || variant === "danger" 
    ? "primary" 
    : "default";

  // Determine Ant Design size
  const antdSize = size === "xs" ? "small" : 
                   size === "sm" ? "small" : 
                   size === "lg" ? "large" : 
                   size === "xl" ? "large" : "middle";

  return (
    <AntdButton
      type={antdType}
      size={antdSize}
      className={customStyle}
      disabled={disabled || Boolean(loading)}
      loading={loading}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </AntdButton>
  );
};

```

## File: /home/pawan/Desktop/hospital/web/src/common_components/HmsAppShell/HmsAppShell.tsx

```tsx
"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";
import { useNotificationStore } from "@/lib/notification_store/notification.store";
import { HmsMobileNav } from "../HmsMobileNav/HmsMobileNav";
import { HmsNotificationBell } from "../HmsNotificationBell/HmsNotificationBell";
import { HmsLanguageSwitcher } from "../HmsLanguageSwitcher/HmsLanguageSwitcher";
import { HmsHighContrastToggle } from "../HmsHighContrastToggle/HmsHighContrastToggle";
import { HmsButton } from "../HmsButton/HmsButton";
import { LogOut, Building2, ChevronRight } from "lucide-react";

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
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-xs">
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

```

## File: /home/pawan/Desktop/hospital/web/src/lib/antd_theme/antd_theme_config.ts

```ts
"use client";

import type { ThemeConfig } from "antd";

export const hmsAntdTheme: ThemeConfig = {
  token: {
    // Premium Color Palette
    colorPrimary: "#0D9488",           // Primary Teal
    colorSuccess: "#059669",           // Emerald Green
    colorWarning: "#F59E0B",           // Warning Amber
    colorError: "#DC2626",             // Error Crimson (improved contrast)
    colorInfo: "#2563EB",              // Info Blue (improved visibility)
    
    // Neutral Colors
    colorBgBase: "#FFFFFF",
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",
    colorBgLayout: "#F8FAFC",
    
    // Text Colors
    colorTextBase: "#1E293B",          // Dark Slate - WCAG AA
    colorTextSecondary: "#475569",     // Slate 600 - WCAG AA
    colorTextTertiary: "#64748B",      // Slate 500 - WCAG AA
    colorTextQuaternary: "#94A3B8",    // Slate 400 - WCAG AA
    
    // Border Colors
    colorBorder: "#E2E8F0",
    colorBorderSecondary: "#F1F5F9",
    
    // Typography
    fontFamily: "var(--font-family-sans)",
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 18,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    
    // Spacing & Sizing
    borderRadius: 8,                   // Medium radius
    borderRadiusLG: 12,                // Large radius
    borderRadiusSM: 6,                 // Small radius
    borderRadiusXS: 4,                 // Extra small radius
    
    // Control Heights
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
    controlHeightXS: 24,
    
    // Line Heights
    lineHeight: 1.625,
    lineHeightLG: 1.75,
    lineHeightSM: 1.5,
    
    // Motion
    motionDurationMid: "0.3s",
    motionDurationSlow: "0.5s",
    motionDurationFast: "0.15s",
    motionEaseInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    motionEaseOut: "cubic-bezier(0, 0, 0.2, 1)",
  },
  components: {
    // Button Component
    Button: {
      colorPrimary: "#0D9488",
      colorPrimaryHover: "#0C7C71",
      colorPrimaryActive: "#0B645D",
      controlHeight: 44,               // Touch-friendly height
      controlHeightLG: 52,
      controlHeightSM: 36,
      borderRadius: 8,
      borderRadiusLG: 12,
      borderRadiusSM: 6,
      fontWeight: 600,
      paddingInline: 20,
      paddingInlineLG: 24,
      paddingInlineSM: 16,
      algorithm: true,
    },
    
    // Card Component
    Card: {
      colorBgContainer: "#FFFFFF",
      borderRadiusLG: 16,
      borderRadius: 12,
      borderRadiusSM: 8,
      padding: 24,
      paddingLG: 32,
      paddingSM: 16,
      boxShadowTertiary: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      boxShadowSecondary: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    },
    
    // Input Components
    Input: {
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      borderRadius: 8,
      colorBorder: "#E2E8F0",
      colorPrimaryHover: "#0D9488",
      paddingInline: 12,
      paddingInlineLG: 16,
      paddingInlineSM: 8,
      algorithm: true,
    },
    
    // Form Components
    Form: {
      labelFontSize: 14,
      labelHeight: 32,
      verticalLabelPadding: "0 0 8px",
      itemMarginBottom: 20,
    },
    
    // Table Component
    Table: {
      headerBg: "#F8FAFC",
      headerColor: "#1E293B",
      headerSplitColor: "#E2E8F0",
      rowHoverBg: "#F1F5F9",
      borderColor: "#E2E8F0",
      cellPaddingInline: 16,
      cellPaddingBlock: 12,
      fontSize: 14,
      borderRadius: 8,
      algorithm: true,
    },
    
    // Tag Component
    Tag: {
      borderRadiusSM: 6,
      lineHeight: 1.5,
      fontSize: 12,
    },
    
    // Alert Component
    Alert: {
      borderRadiusLG: 12,
      borderRadius: 8,
      padding: 16,
      paddingLG: 20,
      fontSize: 14,
      fontSizeLG: 16,
      algorithm: true,
    },
    
    // Modal Component
    Modal: {
      borderRadiusLG: 16,
      paddingContentHorizontal: 24,
      paddingContentVertical: 20,
      paddingMD: 24,
      algorithm: true,
    },
    
    // Select Component
    Select: {
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      borderRadius: 8,
      optionSelectedBg: "#F0FDFA",
      optionActiveBg: "#E6F7F5",
      algorithm: true,
    },
    
    // Menu Component
    Menu: {
      itemHeight: 44,
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemMarginBlock: 4,
      itemSelectedBg: "#F0FDFA",
      itemSelectedColor: "#0D9488",
      itemHoverBg: "#F8FAFC",
      algorithm: true,
    },
    
    // Tabs Component
    Tabs: {
      cardHeight: 48,
      cardPadding: "12px 16px",
      horizontalItemPadding: "12px 16px",
      horizontalMargin: "0 0 16px 0",
      algorithm: true,
    },
    
    // Badge Component
    Badge: {
      statusSize: 8,
      dotSize: 8,
      textFontSize: 12,
      algorithm: true,
    },
    
    // Progress Component
    Progress: {
      defaultColor: "#0D9488",
      colorSuccess: "#059669",
      colorError: "#DC2626",
      colorWarning: "#F59E0B",
      colorInfo: "#2563EB",
      algorithm: true,
    },
    
    // Message Component
    Message: {
      contentPadding: "12px 16px",
      borderRadius: 8,
      algorithm: true,
    },
    
    // Notification Component
    Notification: {
      padding: 16,
      paddingMD: 20,
      borderRadius: 8,
      borderRadiusLG: 12,
      algorithm: true,
    },
  },
};

```

## File: /home/pawan/Desktop/hospital/web/src/lib/react_query/QueryProvider.tsx

```tsx
"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

```

## File: /home/pawan/Desktop/hospital/web/src/lib/notification_store/notification.store.ts

```ts
"use client";
import { create } from "zustand";
import type {
  HmsNotification,
  NotificationStoreActions,
  NotificationStoreState,
} from "./notification.types";

const SEED_NOTIFICATIONS: HmsNotification[] = [
  {
    id: "n-001",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-001",
    patientName: "Ramesh Kumar",
    channel: "system",
    priority: "critical",
    category: "LAB_PANIC",
    title: "Critical Lab Value — Hb 5.8 g/dL",
    body: "Patient Ramesh Kumar has a critically low haemoglobin. Immediate review required.",
    status: "unread",
    createdAt: '2026-09-11T23:55:00.000Z',
  },
  {
    id: "n-002",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-002",
    patientName: "Priya Sharma",
    channel: "system",
    priority: "normal",
    category: "MEDICATION_DUE",
    title: "MAR Due — Ward B, Bed 12",
    body: "Amoxicillin 500mg dose due in 10 minutes for Priya Sharma.",
    status: "unread",
    createdAt: '2026-09-11T23:50:00.000Z',
  },
  {
    id: "n-003",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-003",
    patientName: "Arjun Mehta",
    channel: "sms",
    priority: "normal",
    category: "APPOINTMENT_REMINDER",
    title: "Appointment Confirmed — Dr. Nair",
    body: "SMS sent to Arjun Mehta confirming OPD appointment at 11:00 AM.",
    status: "delivered",
    sentAt: '2026-09-11T23:30:00.000Z',
    createdAt: '2026-09-11T23:30:00.000Z',
  },
  {
    id: "n-004",
    tenantId: "t-001",
    hospitalId: "h-001",
    channel: "system",
    priority: "normal",
    category: "INVENTORY_ALERT",
    title: "Reorder Alert — Metformin 500mg",
    body: "Stock level below reorder threshold (12 strips remaining). Raise PO immediately.",
    status: "unread",
    createdAt: '2026-09-11T23:15:00.000Z',
  },
  {
    id: "n-005",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-003",
    channel: "system",
    priority: "normal",
    category: "DISCHARGE_READY",
    title: "Discharge Summary — Bed 7, Ward A",
    body: "Dr. Verma has signed the discharge summary for IPD patient Sunita Patel.",
    status: "read",
    readAt: '2026-09-11T23:00:00.000Z',
    createdAt: '2026-09-11T22:30:00.000Z',
  },
  {
    id: "n-006",
    tenantId: "t-001",
    hospitalId: "h-001",
    channel: "whatsapp",
    priority: "low",
    category: "APPOINTMENT_REMINDER",
    title: "WhatsApp Reminder Sent",
    body: "Appointment reminder sent via WhatsApp to Deepak Singh for tomorrow's follow-up.",
    status: "sent",
    sentAt: '2026-09-11T22:00:00.000Z',
    createdAt: '2026-09-11T22:00:00.000Z',
  },
  {
    id: "n-007",
    tenantId: "t-001",
    hospitalId: "h-001",
    channel: "system",
    priority: "critical",
    category: "OT_START",
    title: "OT-2 Starting in 15 mins",
    body: "Appendectomy for patient Kavita Rao is scheduled in OT-2 at 14:00. Pre-op checklist pending.",
    status: "unread",
    createdAt: '2026-09-11T23:55:00.000Z',
  },
  {
    id: "n-008",
    tenantId: "t-001",
    hospitalId: "h-001",
    channel: "system",
    priority: "normal",
    category: "CLAIM_STATUS",
    title: "TPA Query Raised — Claim #TPA-2024-0891",
    body: "Star Health Insurance raised a query on claim #TPA-2024-0891. Documents required within 48 hours.",
    status: "unread",
    createdAt: '2026-09-11T23:40:00.000Z',
  },
];

type NotificationStore = NotificationStoreState & NotificationStoreActions;

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: SEED_NOTIFICATIONS,
  unreadCount: SEED_NOTIFICATIONS.filter((n) => n.status === "unread").length,
  isDrawerOpen: false,

  addNotification: (partial) => {
    const n: HmsNotification = {
      ...partial,
      id: `n-${Date.now()}`,
      status: "unread",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, status: "read", readAt: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(
        0,
        state.notifications.filter((n) => n.status === "unread" && n.id !== id).length
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.status === "unread" ? { ...n, status: "read", readAt: new Date().toISOString() } : n
      ),
      unreadCount: 0,
    }));
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
}));

```

## File: /home/pawan/Desktop/hospital/web/src/lib/notification_store/notification.types.ts

```ts
export type NotificationChannel = "sms" | "whatsapp" | "email" | "push" | "system";
export type NotificationPriority = "critical" | "normal" | "low";
export type NotificationStatus = "queued" | "sent" | "failed" | "delivered" | "unread" | "read";

export type NotificationCategory =
  | "LAB_PANIC"
  | "MEDICATION_DUE"
  | "APPOINTMENT_REMINDER"
  | "DISCHARGE_READY"
  | "OT_START"
  | "CLAIM_STATUS"
  | "INVENTORY_ALERT"
  | "PATIENT_REGISTERED"
  | "SHIFT_HANDOVER"
  | "SYSTEM";

export interface HmsNotification {
  id: string;
  tenantId: string;
  hospitalId: string;
  patientId?: string;
  patientName?: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  body: string;
  status: NotificationStatus;
  templateKey?: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationStoreState {
  notifications: HmsNotification[];
  unreadCount: number;
  isDrawerOpen: boolean;
}

export interface NotificationStoreActions {
  addNotification: (n: Omit<HmsNotification, "id" | "createdAt" | "status">) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

```

## File: /home/pawan/Desktop/hospital/web/src/app/(auth)/_auth_stores/auth_user_store.ts

```ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole =
  | "RECEPTIONIST"
  | "RECEPTION"
  | "DOCTOR"
  | "PHARMACIST"
  | "PHARMACY"
  | "LAB_TECH"
  | "LAB"
  | "BILLER"
  | "BILLING"
  | "NURSE"
  | "ADMIN"
  | "SUPER_ADMIN";

export interface UserSession {
  userId: string;
  username: string;
  role: UserRole;
  tenantId: string;
  hospitalName: string;
  token: string;
}

interface AuthState {
  user: UserSession | null;
  mfaRequired: boolean;
  mfaSessionToken: string | null;
  setUserSession: (session: UserSession) => void;
  setMfaChallenge: (sessionToken: string) => void;
  logout: () => void;
}

export const useAuthUserStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      mfaRequired: false,
      mfaSessionToken: null,
      setUserSession: (session) =>
        set({
          user: session,
          mfaRequired: false,
          mfaSessionToken: null,
        }),
      setMfaChallenge: (sessionToken) =>
        set({
          mfaRequired: true,
          mfaSessionToken: sessionToken,
        }),
      logout: () => {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("hms_user_auth_session");
            sessionStorage.clear();
          } catch {
            /* ignore storage errors */
          }
        }
        set({
          user: null,
          mfaRequired: false,
          mfaSessionToken: null,
        });
      },
    }),
    {
      name: "hms_user_auth_session",
    }
  )
);

```

## File: /home/pawan/Desktop/hospital/web/src/i18n/_i18n_context/I18nContext.tsx

```tsx
"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { SupportedLanguage, I18nDictionary } from "../_i18n_types/i18n.types";
import { DICTIONARIES } from "../_i18n_dictionaries/i18n.dictionaries";

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: I18nDictionary;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("hms_language") as SupportedLanguage | null;
    if (savedLang && DICTIONARIES[savedLang]) {
      setLanguageState(savedLang);
    }
    const savedHC = localStorage.getItem("hms_high_contrast");
    if (savedHC === "true") {
      setHighContrast(true);
      document.documentElement.classList.add("high-contrast");
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("hms_language", lang);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem("hms_high_contrast", String(next));
      if (next) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: DICTIONARIES[language],
      highContrast,
      toggleHighContrast,
    }),
    [language, setLanguage, highContrast, toggleHighContrast]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

```

## File: /home/pawan/Desktop/hospital/web/src/i18n/_i18n_types/i18n.types.ts

```ts
export type SupportedLanguage = "en" | "hi" | "mr" | "ta" | "te" | "bn";

export interface I18nDictionary {
  appTitle: string;
  searchPatient: string;
  registerPatient: string;
  demographics: string;
  vitals: string;
  prescriptions: string;
  billing: string;
  invoices: string;
  dispense: string;
  labOrders: string;
  bedMatrix: string;
  auditLogs: string;
  offlineNotice: string;
  highContrast: string;
  keyboardShortcuts: string;
  signOff: string;
  confirm: string;
  cancel: string;
  save: string;
  status: string;
  action: string;
  aiDraftBadge: string;
  aadhaarMaskedLabel: string;
  signedByDoctor: string;
}

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

```

## File: /home/pawan/Desktop/hospital/web/src/i18n/_i18n_dictionaries/i18n.dictionaries.ts

```ts
import { SupportedLanguage, I18nDictionary, LanguageOption } from "../_i18n_types/i18n.types";

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
];

export const DICTIONARIES: Record<SupportedLanguage, I18nDictionary> = {
  en: {
    appTitle: "Hospital Management System",
    searchPatient: "Search Patient by UHID / Mobile",
    registerPatient: "Register New Patient",
    demographics: "Demographics",
    vitals: "Vitals Flowsheet",
    prescriptions: "e-Prescriptions",
    billing: "GST Invoices & Billing",
    invoices: "Invoices",
    dispense: "Pharmacy Dispense Queue",
    labOrders: "Laboratory Test Orders",
    bedMatrix: "IPD Bed Matrix",
    auditLogs: "DPDP Audit Trail Logs",
    offlineNotice: "You are offline. Actions queued locally.",
    highContrast: "High Contrast Mode",
    keyboardShortcuts: "Doctor EHR Keyboard Shortcuts",
    signOff: "Physician Sign-Off",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save Record",
    status: "Status",
    action: "Action",
    aiDraftBadge: "AI Draft — Review Required",
    aadhaarMaskedLabel: "Aadhaar (Masked)",
    signedByDoctor: "Digitally Signed by Physician",
  },
  hi: {
    appTitle: "अस्पताल प्रबंधन प्रणाली",
    searchPatient: "यूएचआईडी / मोबाइल से मरीज खोजें",
    registerPatient: "नया मरीज पंजीकृत करें",
    demographics: "जनसांख्यिकी",
    vitals: "महत्वपूर्ण लक्षण फ़्लोशीट",
    prescriptions: "ई-पर्चे (प्रिस्क्रिप्शन)",
    billing: "जीएसटी चालान और बिलिंग",
    invoices: "चालान",
    dispense: "फार्मेसी वितरण कतार",
    labOrders: "प्रयोगशाला परीक्षण आदेश",
    bedMatrix: "आईपीडी बिस्तर मैट्रिक्स",
    auditLogs: "डीपीडीपी ऑडिट ट्रेल लॉग",
    offlineNotice: "आप ऑफ़लाइन हैं। कार्रवाइयां स्थानीय रूप से कतारबद्ध हैं।",
    highContrast: "उच्च कंट्रास्ट मोड",
    keyboardShortcuts: "चिकित्सक ईएचआर कीबोर्ड शॉर्टकट",
    signOff: "चिकित्सक हस्ताक्षर",
    confirm: "पुष्टि करें",
    cancel: "रद्द करें",
    save: "रिकॉर्ड सहेजें",
    status: "स्थिति",
    action: "कार्रवाई",
    aiDraftBadge: "एआई ड्राफ्ट — समीक्षा आवश्यक",
    aadhaarMaskedLabel: "आधार (गुप्त)",
    signedByDoctor: "चिकित्सक द्वारा डिजिटल रूप से हस्ताक्षरित",
  },
  mr: {
    appTitle: "रुग्णालय व्यवस्थापन प्रणाली",
    searchPatient: "यूएचआयडी / मोबाईलद्वारे रुग्ण शोधा",
    registerPatient: "नवीन रुग्णाची नोंदणी करा",
    demographics: "लोकसंख्याशास्त्र",
    vitals: "महत्त्वपूर्ण चिन्हे फ्लोशीट",
    prescriptions: "ई-औषधोपचार",
    billing: "जीएसटी इनव्हॉइस आणि बिलिंग",
    invoices: "इनव्हॉइस",
    dispense: "फार्मसी वाटप रांग",
    labOrders: "प्रयोगशाळा तपासणी आदेश",
    bedMatrix: "आयपीडी बेड मॅट्रिक्स",
    auditLogs: "डीपीडीपी ऑडिट ट्रेल लॉग",
    offlineNotice: "तुम्ही ऑफलाइन आहात. कृती स्थानिक पातळीवर रांगेत आहेत.",
    highContrast: "हाय कॉन्ट्रास्ट मोड",
    keyboardShortcuts: "डॉक्टर ईएचआर कीबोर्ड शॉर्टकट",
    signOff: "डॉक्टर स्वाक्षरी",
    confirm: "खात्री करा",
    cancel: "रद्द करा",
    save: "नोंद जतन करा",
    status: "स्थिती",
    action: "कृती",
    aiDraftBadge: "एआय मसुदा — पुनरावलोकन आवश्यक",
    aadhaarMaskedLabel: "आधार (मास्क केलेले)",
    signedByDoctor: "डॉक्टरांनी डिजिटल स्वाक्षरी केली",
  },
  ta: {
    appTitle: "மருத்துவமனை மேலாண்மை அமைப்பு",
    searchPatient: "UHID / மொபைல் மூலம் நோயாளியைத் தேடுங்கள்",
    registerPatient: "புதிய நோயாளியைப் பதிவு செய்க",
    demographics: "மக்கள்வெளியியல்",
    vitals: "முக்கிய அறிகுறிகள்",
    prescriptions: "மின்-மருந்துச் சீட்டு",
    billing: "ஜிஎஸ்டி இன்வாய்ஸ்கள் & பில்லிங்",
    invoices: "இன்வாய்ஸ்கள்",
    dispense: "பார்மசி விநியோக வரிசை",
    labOrders: "ஆய்வக சோதனை ஆர்டர்கள்",
    bedMatrix: "IPD படுக்கை மேட்ரிக்ஸ்",
    auditLogs: "DPDP தணிக்கைப் பதிவு",
    offlineNotice: "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். செயல்கள் உள்ளூரில் வரிசைப்படுத்தப்பட்டுள்ளன.",
    highContrast: "அதிக மாறுபட்ட முறை",
    keyboardShortcuts: "மருத்துவர் EHR விசைப்பலகை குறுக்குவழிகள்",
    signOff: "மருத்துவர் கையொப்பம்",
    confirm: "உறுதிப்படுத்து",
    cancel: "ரத்து செய்",
    save: "பதிவைச் சேமிக்கவும்",
    status: "நிலை",
    action: "செயல்பாடுகள்",
    aiDraftBadge: "AI வரைவு — மதிப்பாய்வு தேவை",
    aadhaarMaskedLabel: "ஆதார் (மறைக்கப்பட்டது)",
    signedByDoctor: "மருத்துவரால் டிஜிட்டல் முறையில் கையொப்பமிடப்பட்டது",
  },
  te: {
    appTitle: "ఆసుపత్రి నిర్వాహణ వ్యవస్థ",
    searchPatient: "UHID / మొబైల్ ద్వారా రోగిని శోధించండి",
    registerPatient: "కొత్త రోగిని నమోదు చేయండి",
    demographics: "జనాభా వివరాలు",
    vitals: "ముఖ్యమైన లక్షణాల సమాచారం",
    prescriptions: "ఈ-మందుల చీటీ",
    billing: "జీఎస్‌టీ ఇన్‌వాయిస్‌లు & బిల్లింగ్",
    invoices: "ఇన్‌వాయిస్‌లు",
    dispense: "ఫార్మసీ పంపిణీ వరుస",
    labOrders: "లాబొరేటరీ పరీక్ష ఆర్డర్లు",
    bedMatrix: "IPD బెడ్ మ్యాట్రిక్స్",
    auditLogs: "DPDP ఆడిట్ ట్రయల్ లాగ్‌లు",
    offlineNotice: "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. చర్యలు స్థానికంగా నిల్వ చేయబడ్డాయి.",
    highContrast: "హై కాంట్రాస్ట్ మోడ్",
    keyboardShortcuts: "డాక్టర్ EHR కీబోర్డ్ షార్ట్‌కట్‌లు",
    signOff: "వైద్యుని సంతకం",
    confirm: "నిర్ధారించండి",
    cancel: "రద్దు చేయండి",
    save: "రికార్డు సేవ్ చేయండి",
    status: "స్థితి",
    action: "చర్య",
    aiDraftBadge: "AI డ్రాఫ్ట్ — పరిశీలన అవసరం",
    aadhaarMaskedLabel: "ఆధార్ (దాచబడింది)",
    signedByDoctor: "వైద్యుడు డిజిటల్‌గా సంతకం చేశారు",
  },
  bn: {
    appTitle: "হাসপাতাল ব্যবস্থাপনা পদ্ধতি",
    searchPatient: "UHID / মোবাইল দ্বারা রোগী খুঁজুন",
    registerPatient: "নতুন রোগী নিবন্ধন করুন",
    demographics: "জনসংখ্যাগত তথ্য",
    vitals: "ভাইটাল লক্ষণসমূহ",
    prescriptions: "ই-প্রেসক্রিপশন",
    billing: "জিএসটি চালান ও বিলিং",
    invoices: "চালানসমূহ",
    dispense: "ফার্মেসি বিতরণ সারি",
    labOrders: "ল্যাবরেটরি টেস্ট অর্ডার",
    bedMatrix: "আইপিডি বেড ম্যাট্রিক্স",
    auditLogs: "ডিপিপিডি অডিট ট্রেইল লগ",
    offlineNotice: "আপনি অফলাইনে আছেন। কাজগুলি স্থানীয়ভাবে সংরক্ষিত।",
    highContrast: "উচ্চ বৈসাদৃশ্য মোড",
    keyboardShortcuts: "ডাক্তার ইএইচআর কিবোর্ড শর্টকাট",
    signOff: "চিকিৎসকের স্বাক্ষর",
    confirm: "নিশ্চিত করুন",
    cancel: "বাতিল করুন",
    save: "সংরক্ষণ করুন",
    status: "অবস্থা",
    action: "পদক্ষেপ",
    aiDraftBadge: "এআই খসড়া — পর্যালোচনা আবশ্যক",
    aadhaarMaskedLabel: "আধার (আড়াল করা)",
    signedByDoctor: "চিকিৎসক দ্বারা ডিজিটালভাবে স্বাক্ষরিত",
  },
};

```

## File: /home/pawan/Desktop/hospital/web/src/common_components/HmsNotificationBell/HmsNotificationBell.tsx

```tsx
"use client";
import { BellOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import { useNotificationStore } from "@/lib/notification_store/notification.store";

export function HmsNotificationBell() {
  const { unreadCount, openDrawer } = useNotificationStore();

  return (
    <button
      id="hms-notification-bell"
      aria-label={`Notifications — ${unreadCount} unread`}
      onClick={openDrawer}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0 8px",
        display: "flex",
        alignItems: "center",
        color: "var(--hms-text-primary)",
      }}
    >
      <Badge
        count={unreadCount}
        size="small"
        style={{ backgroundColor: "var(--hms-alert-crimson)" }}
      >
        <BellOutlined style={{ fontSize: 20 }} />
      </Badge>
    </button>
  );
}

```

## File: /home/pawan/Desktop/hospital/web/src/common_components/HmsNotificationDrawer/HmsNotificationDrawer.tsx

```tsx
"use client";
import {
  AlertOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Empty, Space, Tag, Tooltip, Typography } from "antd";
import { useNotificationStore } from "@/lib/notification_store/notification.store";
import type { HmsNotification, NotificationCategory, NotificationPriority } from "@/lib/notification_store/notification.types";

const { Text, Title } = Typography;

function priorityColor(p: NotificationPriority): string {
  if (p === "critical") return "var(--hms-alert-crimson)";
  if (p === "normal") return "var(--hms-info-blue)";
  return "var(--hms-slate-hint)";
}

function categoryIcon(c: NotificationCategory) {
  const style = { fontSize: 16 };
  switch (c) {
    case "LAB_PANIC": return <AlertOutlined style={{ ...style, color: "var(--hms-alert-crimson)" }} />;
    case "MEDICATION_DUE": return <MedicineBoxOutlined style={{ ...style, color: "var(--hms-warning-amber)" }} />;
    case "OT_START": return <ExclamationCircleOutlined style={{ ...style, color: "var(--hms-alert-crimson)" }} />;
    case "CLAIM_STATUS": return <InfoCircleOutlined style={{ ...style, color: "var(--hms-info-blue)" }} />;
    case "INVENTORY_ALERT": return <ExclamationCircleOutlined style={{ ...style, color: "var(--hms-warning-amber)" }} />;
    case "DISCHARGE_READY": return <CheckCircleOutlined style={{ ...style, color: "var(--hms-vital-normal)" }} />;
    default: return <NotificationOutlined style={{ ...style, color: "var(--hms-slate-hint)" }} />;
  }
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationItem({ n }: { n: HmsNotification }) {
  const { markAsRead } = useNotificationStore();
  const isUnread = n.status === "unread";

  return (
    <div
      id={`hms-notif-item-${n.id}`}
      onClick={() => markAsRead(n.id)}
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 16px",
        cursor: "pointer",
        borderBottom: "1px solid var(--hms-border-subtle)",
        background: isUnread ? "var(--hms-surface-raised)" : "transparent",
        transition: "background 0.2s",
      }}
    >
      <div style={{ paddingTop: 2, flexShrink: 0 }}>{categoryIcon(n.category)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <Text
            strong={isUnread}
            style={{
              fontSize: 13,
              color: "var(--hms-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {n.title}
          </Text>
          {isUnread && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: priorityColor(n.priority),
                flexShrink: 0,
              }}
            />
          )}
        </div>
        <Text
          type="secondary"
          style={{ fontSize: 12, display: "block", marginTop: 2, lineHeight: 1.4 }}
        >
          {n.body}
        </Text>
        <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
          <Tag
            color={n.priority === "critical" ? "error" : n.priority === "normal" ? "processing" : "default"}
            style={{ fontSize: 10, padding: "0 6px", margin: 0 }}
          >
            {n.priority.toUpperCase()}
          </Tag>
          <Tag
            color="default"
            style={{ fontSize: 10, padding: "0 6px", margin: 0 }}
          >
            {n.channel.toUpperCase()}
          </Tag>
          {n.patientName && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {n.patientName}
            </Text>
          )}
          <Text type="secondary" style={{ fontSize: 11, marginLeft: "auto" }}>
            {timeAgo(n.createdAt)}
          </Text>
        </div>
      </div>
    </div>
  );
}

export function HmsNotificationDrawer() {
  const { notifications, unreadCount, isDrawerOpen, closeDrawer, markAllAsRead } =
    useNotificationStore();

  return (
    <Drawer
      id="hms-notification-drawer"
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Space>
            <Title level={5} style={{ margin: 0, color: "var(--hms-text-primary)" }}>
              Notifications
            </Title>
            {unreadCount > 0 && (
              <Tag color="error" style={{ borderRadius: 10 }}>
                {unreadCount} unread
              </Tag>
            )}
          </Space>
        </div>
      }
      placement="right"
      width={420}
      open={isDrawerOpen}
      onClose={closeDrawer}
      closeIcon={<CloseOutlined />}
      styles={{
        body: { padding: 0, background: "var(--hms-surface-base)" },
        header: {
          background: "var(--hms-surface-raised)",
          borderBottom: "1px solid var(--hms-border-subtle)",
        },
      }}
      extra={
        unreadCount > 0 ? (
          <Tooltip title="Mark all as read">
            <Button
              id="hms-notif-mark-all-read"
              type="link"
              size="small"
              onClick={markAllAsRead}
              style={{ color: "var(--hms-accent-primary)" }}
            >
              Mark all read
            </Button>
          </Tooltip>
        ) : null
      }
      footer={
        <div style={{ textAlign: "center" }}>
          <Button
            id="hms-notif-view-all"
            type="link"
            href="/notifications"
            style={{ color: "var(--hms-accent-primary)" }}
          >
            View Full Notification Log →
          </Button>
        </div>
      }
    >
      {notifications.length === 0 ? (
        <Empty
          description="No notifications"
          style={{ paddingTop: 60 }}
        />
      ) : (
        <div>
          {notifications.map((n) => (
            <NotificationItem key={n.id} n={n} />
          ))}
        </div>
      )}
    </Drawer>
  );
}

```

## File: /home/pawan/Desktop/hospital/web/src/common_components/HmsOfflineBanner/HmsOfflineBanner.tsx

```tsx
"use client";

import React from "react";
import { AlertCircle, WifiOff } from "lucide-react";
import { useOfflineSync } from "@/lib/offline_db/useOfflineSync";
import { useI18n } from "@/i18n/_i18n_context/I18nContext";

export function HmsOfflineBanner() {
  const { isOnline, pendingCount } = useOfflineSync();
  const { t } = useI18n();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "var(--hms-alert-crimson)",
        color: "#ffffff",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }}
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-bounce" />
        <span>{!isOnline ? t.offlineNotice : "Syncing local database records..."}]</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>{pendingCount} Pending Sync</span>
      </div>
    </div>
  );
}

```

## File: /home/pawan/Desktop/hospital/web/src/common_components/HmsMobileNav/HmsMobileNav.tsx

```tsx
"use client";

import React, { useState } from "react";
import { 
  Home, 
  Users, 
  Stethoscope,
  Pill, 
  FileText, 
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
  Calendar,
  ClipboardCheck,
  HeartPulse,
  Microscope,
  Receipt,
  ShieldCheck,
  Building2,
  BedDouble,
  SlidersHorizontal,
  Package,
  Video
} from "lucide-react";
import { HmsButton } from "../HmsButton/HmsButton";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  role: string[];
  badge?: number;
}

interface HmsMobileNavProps {
  userRole: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  notificationCount?: number;
  userName?: string;
  userAvatar?: string;
}

export const HmsMobileNav: React.FC<HmsMobileNavProps> = ({
  userRole,
  currentPath,
  onNavigate,
  onLogout,
  notificationCount = 0,
  userName = "Staff Member",
  userAvatar,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const normalizedRole = userRole.toUpperCase();

  // Corrected role-based navigation items pointing to real app routes
  const roleNavItems: Record<string, NavItem[]> = {
    DOCTOR: [
      { id: "queue", label: "OPD Queue", icon: Users, path: "/queue", role: ["DOCTOR"], badge: 3 },
      { id: "encounter", label: "Encounter Workspace", icon: Stethoscope, path: "/encounter/ENC-2026-8801", role: ["DOCTOR"] },
      { id: "telehealth", label: "Telehealth Consult", icon: Video, path: "/consult/TELE-8801", role: ["DOCTOR"] },
      { id: "alerts", label: "CDSS Alerts", icon: Activity, path: "/alerts", role: ["DOCTOR"] },
      { id: "pacs", label: "PACS DICOM Viewer", icon: FileText, path: "/viewer/STD-9901", role: ["DOCTOR"] },
    ],
    NURSE: [
      { id: "station", label: "Nurse Station", icon: ClipboardCheck, path: "/station", role: ["NURSE"], badge: 5 },
      { id: "wards", label: "Ward Rounds", icon: HeartPulse, path: "/wards", role: ["NURSE"] },
      { id: "mar", label: "MAR Checklist", icon: Pill, path: "/mar/IPD-8801", role: ["NURSE"] },
      { id: "discharge", label: "Discharge Summary", icon: FileText, path: "/discharge/IPD-8801", role: ["NURSE"] },
      { id: "beds", label: "Bed Management", icon: BedDouble, path: "/beds", role: ["NURSE"] },
    ],
    RECEPTION: [
      { id: "dashboard", label: "Reception Dashboard", icon: Home, path: "/dashboard", role: ["RECEPTION"] },
      { id: "registration", label: "Patient Registration", icon: Users, path: "/patients/register", role: ["RECEPTION"] },
      { id: "checkin", label: "Self-Checkin Kiosk", icon: Calendar, path: "/checkin", role: ["RECEPTION"] },
      { id: "transfers", label: "Branch Transfers", icon: Building2, path: "/transfers", role: ["RECEPTION"] },
      { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications", role: ["RECEPTION"], badge: notificationCount },
    ],
    RECEPTIONIST: [
      { id: "dashboard", label: "Reception Dashboard", icon: Home, path: "/dashboard", role: ["RECEPTIONIST"] },
      { id: "registration", label: "Patient Registration", icon: Users, path: "/patients/register", role: ["RECEPTIONIST"] },
      { id: "checkin", label: "Self-Checkin Kiosk", icon: Calendar, path: "/checkin", role: ["RECEPTIONIST"] },
      { id: "transfers", label: "Branch Transfers", icon: Building2, path: "/transfers", role: ["RECEPTIONIST"] },
    ],
    BILLING: [
      { id: "invoices", label: "Invoices & Billing", icon: Receipt, path: "/invoices", role: ["BILLING"], badge: 8 },
      { id: "claims", label: "TPA Insurance Claims", icon: FileText, path: "/claims", role: ["BILLING"] },
      { id: "tariffs", label: "Service Tariffs", icon: SlidersHorizontal, path: "/tariffs", role: ["BILLING"] },
      { id: "revenue", label: "Revenue Analytics", icon: Activity, path: "/revenue", role: ["BILLING"] },
    ],
    BILLER: [
      { id: "invoices", label: "Invoices & Billing", icon: Receipt, path: "/invoices", role: ["BILLER"], badge: 8 },
      { id: "claims", label: "TPA Insurance Claims", icon: FileText, path: "/claims", role: ["BILLER"] },
      { id: "tariffs", label: "Service Tariffs", icon: SlidersHorizontal, path: "/tariffs", role: ["BILLER"] },
      { id: "revenue", label: "Revenue Analytics", icon: Activity, path: "/revenue", role: ["BILLER"] },
    ],
    PHARMACY: [
      { id: "dispense", label: "Pharmacy Dispense", icon: Pill, path: "/dispense", role: ["PHARMACY"], badge: 12 },
      { id: "controlled", label: "Controlled Drugs", icon: ShieldCheck, path: "/controlled-drugs", role: ["PHARMACY"] },
      { id: "inventory", label: "Stock & Expiry Analytics", icon: Package, path: "/inventory", role: ["PHARMACY"] },
    ],
    PHARMACIST: [
      { id: "dispense", label: "Pharmacy Dispense", icon: Pill, path: "/dispense", role: ["PHARMACIST"], badge: 12 },
      { id: "controlled", label: "Controlled Drugs", icon: ShieldCheck, path: "/controlled-drugs", role: ["PHARMACIST"] },
      { id: "inventory", label: "Stock & Expiry Analytics", icon: Package, path: "/inventory", role: ["PHARMACIST"] },
    ],
    LAB: [
      { id: "orders", label: "Lab Orders & Panic Alerts", icon: Microscope, path: "/orders", role: ["LAB"], badge: 7 },
      { id: "masters", label: "Global Masters", icon: SlidersHorizontal, path: "/global-masters", role: ["LAB"] },
    ],
    LAB_TECH: [
      { id: "orders", label: "Lab Orders & Panic Alerts", icon: Microscope, path: "/orders", role: ["LAB_TECH"], badge: 7 },
      { id: "masters", label: "Global Masters", icon: SlidersHorizontal, path: "/global-masters", role: ["LAB_TECH"] },
    ],
    ADMIN: [
      { id: "users", label: "Staff & RBAC Users", icon: Users, path: "/users", role: ["ADMIN"] },
      { id: "audit", label: "Audit Logs (DPDP)", icon: ShieldCheck, path: "/audit-logs", role: ["ADMIN"] },
      { id: "roster", label: "Staff Duty Roster", icon: Calendar, path: "/roster", role: ["ADMIN"] },
      { id: "payouts", label: "Doctor Payouts", icon: Receipt, path: "/payouts", role: ["ADMIN"] },
      { id: "equipment", label: "Biomedical Assets", icon: Settings, path: "/equipment", role: ["ADMIN"] },
      { id: "gateway", label: "ABDM Gateway", icon: Building2, path: "/gateway", role: ["ADMIN"] },
      { id: "schedule", label: "OT Surgery Schedule", icon: Stethoscope, path: "/schedule", role: ["ADMIN"] },
    ],
    SUPER_ADMIN: [
      { id: "tenants", label: "Tenant Onboarding", icon: Building2, path: "/tenants", role: ["SUPER_ADMIN"] },
      { id: "users", label: "Staff & RBAC Users", icon: Users, path: "/users", role: ["SUPER_ADMIN"] },
      { id: "audit", label: "Audit Logs", icon: ShieldCheck, path: "/audit-logs", role: ["SUPER_ADMIN"] },
      { id: "revenue", label: "Revenue Analytics", icon: Activity, path: "/revenue", role: ["SUPER_ADMIN"] },
    ],
  };

  const navItems = roleNavItems[normalizedRole] || roleNavItems.DOCTOR;
  const currentNavItem = navItems.find(item => item.path === currentPath) || navItems[0];

  const handleNavClick = (item: NavItem) => {
    onNavigate(item.path);
    setIsOpen(false);
  };

  const roleColors: Record<string, string> = {
    DOCTOR: "bg-primary-teal",
    NURSE: "bg-purple-accent", 
    RECEPTION: "bg-info-blue",
    RECEPTIONIST: "bg-info-blue",
    BILLING: "bg-emerald-green",
    BILLER: "bg-emerald-green",
    PHARMACY: "bg-warning-amber",
    PHARMACIST: "bg-warning-amber",
    LAB: "bg-purple-accent",
    LAB_TECH: "bg-purple-accent",
    ADMIN: "bg-dark-slate",
    SUPER_ADMIN: "bg-dark-slate",
  };

  const roleColor = roleColors[normalizedRole] || "bg-primary-teal";

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 safe-area-top shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left: Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          {/* Center: Current Page Title */}
          <div className="flex items-center gap-2 max-w-[180px] sm:max-w-xs overflow-hidden">
            <div className={`w-8 h-8 ${roleColor} rounded-lg flex items-center justify-center shrink-0`}>
              <currentNavItem.icon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-sm sm:text-base truncate">{currentNavItem.label}</span>
          </div>

          {/* Right: User Avatar Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(true)}
              className="w-10 h-10 rounded-full bg-primary-light-teal flex items-center justify-center border-2 border-primary-teal/20 active:scale-95 transition-transform"
              aria-label="User profile & navigation"
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-primary-teal" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg safe-area-bottom">
        <div className="grid grid-cols-5">
          {navItems.slice(0, 5).map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center py-2.5 relative ${
                  isActive ? 'text-primary-teal font-semibold' : 'text-slate-600'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5 mb-0.5" />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 px-1 min-w-4 h-4 bg-alert-crimson text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px] truncate max-w-[64px]">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 w-10 h-1 bg-primary-teal rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col z-10 animate-fade-in">
            {/* Header */}
            <div className={`${roleColor} p-5 text-white shrink-0`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">HMS Hospital System</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg border border-white/30">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full" />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-sm truncate">{userName}</h3>
                  <p className="text-xs text-white/80 uppercase font-mono tracking-wider">{normalizedRole}</p>
                </div>
              </div>
            </div>

            {/* Navigation Items List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Module Navigation
              </div>
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-light-teal text-primary-teal font-semibold' 
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-primary-teal text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm text-left">{item.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.badge && item.badge > 0 ? (
                        <span className="px-2 py-0.5 bg-alert-crimson text-white text-xs rounded-full font-bold">
                          {item.badge}
                        </span>
                      ) : null}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}

              {/* Quick Switch Role Shortcuts for Demo */}
              <div className="pt-6 mt-6 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  System Actions
                </div>
                
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-rose-50 text-rose-600 font-medium text-sm transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
              <p className="text-xs text-center text-slate-500 font-medium">
                Hospital Management System • v2.1.0
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 flex-col">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${roleColor} rounded-xl flex items-center justify-center shadow-sm`}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-dark-slate text-base">HMS Portal</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{normalizedRole}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-light-teal text-primary-teal border-l-4 border-primary-teal font-semibold' 
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-teal' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="ml-auto px-2 py-0.5 bg-alert-crimson text-white text-xs rounded-full font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* User Info & Sign Out Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-teal/10 text-primary-teal flex items-center justify-center font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
              <p className="text-[11px] text-slate-500 truncate">{normalizedRole}</p>
            </div>
          </div>
          <HmsButton
            variant="outline"
            size="sm"
            fullWidth
            onClick={onLogout}
            className="text-slate-700 border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </HmsButton>
        </div>
      </aside>

      {/* Spacer for desktop layout */}
      <div className="hidden lg:block w-64 shrink-0" />
    </>
  );
};

```

## File: /home/pawan/Desktop/hospital/web/src/middleware.ts

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Publicly accessible paths that bypass auth checks
  const isPublicPath =
    pathname === "/login" ||
    pathname === "/checkin" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  // Check auth session indicator from cookie or header if present
  const authSessionCookie = request.cookies.get("hms_user_auth_session")?.value;

  if (!isPublicPath && !authSessionCookie) {
    // If no cookie exists, client-side Zustand store will handle redirection via HmsAppShell
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

```