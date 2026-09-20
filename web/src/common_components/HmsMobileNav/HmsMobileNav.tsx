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
  ClipboardList,
  Droplet,
  HeartPulse,
  Microscope,
  Receipt,
  ShieldCheck,
  Building2,
  BedDouble,
  SlidersHorizontal,
  Package,
  Video,
  Database
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
      { id: "queue", label: "OPD Queue", icon: Users, path: "/doctor/queue", role: ["DOCTOR"], badge: 3 },
      { id: "encounter", label: "Encounter Workspace", icon: Stethoscope, path: "/encounter/P-2026-1049", role: ["DOCTOR"] },
      { id: "inpatient", label: "IPD Ward Rounds", icon: BedDouble, path: "/doctor/inpatient", role: ["DOCTOR"] },
      { id: "prescriptions", label: "e-Prescriptions", icon: FileText, path: "/doctor/prescriptions", role: ["DOCTOR"] },
      { id: "lab-results", label: "Lab Inbox", icon: Microscope, path: "/doctor/lab-results", role: ["DOCTOR"] },
      { id: "schedule", label: "Clinic Schedule", icon: Calendar, path: "/doctor/schedule", role: ["DOCTOR"] },
    ],
    NURSE: [
      { id: "station", label: "Nurse Station", icon: ClipboardCheck, path: "/station", role: ["NURSE"], badge: 5 },
      { id: "vitals", label: "Bedside Vitals", icon: HeartPulse, path: "/vitals", role: ["NURSE"] },
      { id: "worklist", label: "Doctor Orders Worklist", icon: ClipboardList, path: "/worklist", role: ["NURSE"] },
      { id: "mar", label: "MAR Checklist", icon: Pill, path: "/mar/IPD-8801", role: ["NURSE"] },
      { id: "fluid-chart", label: "Fluid I/O Chart", icon: Droplet, path: "/fluid-chart", role: ["NURSE"] },
      { id: "handover", label: "Shift Handover", icon: FileText, path: "/handover", role: ["NURSE"] },
      { id: "wards", label: "Ward Rounds", icon: Activity, path: "/wards", role: ["NURSE"] },
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
      { id: "dashboard", label: "Admin Dashboard", icon: Home, path: "/admin", role: ["ADMIN"] },
      { id: "users", label: "Staff & RBAC Users", icon: Users, path: "/users", role: ["ADMIN"] },
      { id: "departments", label: "Departments", icon: Building2, path: "/departments", role: ["ADMIN"] },
      { id: "beds", label: "Wards & Beds", icon: BedDouble, path: "/beds", role: ["ADMIN"] },
      { id: "settings", label: "Hospital Settings", icon: Settings, path: "/hospital-settings", role: ["ADMIN"] },
      { id: "tariffs", label: "Service Tariffs", icon: SlidersHorizontal, path: "/tariffs", role: ["ADMIN"] },
      { id: "templates", label: "Print Templates", icon: FileText, path: "/print-templates", role: ["ADMIN"] },
      { id: "accreditations", label: "Accreditations", icon: ShieldCheck, path: "/accreditations", role: ["ADMIN"] },
      { id: "audit", label: "Audit Logs (DPDP)", icon: ShieldCheck, path: "/audit-logs", role: ["ADMIN"] },
      { id: "roster", label: "Staff Duty Roster", icon: Calendar, path: "/roster", role: ["ADMIN"] },
      { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications", role: ["ADMIN"], badge: notificationCount },
      { id: "analytics", label: "Analytics Hub", icon: Activity, path: "/analytics", role: ["ADMIN"] },
      { id: "revenue-report", label: "Revenue Analytics", icon: Activity, path: "/revenue", role: ["ADMIN"] },
      { id: "inventory-forecast", label: "Inventory Forecast", icon: Package, path: "/analytics/inventory", role: ["ADMIN"] },
      { id: "payouts", label: "Doctor Payouts", icon: Receipt, path: "/payouts", role: ["ADMIN"] },
      { id: "equipment", label: "Biomedical Assets", icon: Settings, path: "/equipment", role: ["ADMIN"] },
      { id: "gateway", label: "ABDM Gateway", icon: Building2, path: "/gateway", role: ["ADMIN"] },
      { id: "schedule", label: "OT Surgery Schedule", icon: Stethoscope, path: "/ot/schedule", role: ["ADMIN"] },
    ],
    SUPER_ADMIN: [
      { id: "tenants", label: "Tenants & Onboarding", icon: Building2, path: "/tenants", role: ["SUPER_ADMIN"] },
      { id: "plans", label: "Subscription Plans", icon: Receipt, path: "/subscription-plans", role: ["SUPER_ADMIN"] },
      { id: "flags", label: "Feature Flags", icon: SlidersHorizontal, path: "/feature-flags", role: ["SUPER_ADMIN"] },
      { id: "roles", label: "Role Templates & RBAC", icon: ShieldCheck, path: "/role-templates", role: ["SUPER_ADMIN"] },
      { id: "compliance-governance", label: "Compliance & Governance", icon: ShieldCheck, path: "/compliance-governance", role: ["SUPER_ADMIN"] },
      { id: "masters", label: "Global Masters", icon: Database, path: "/global-masters", role: ["SUPER_ADMIN"] },
      { id: "platform-audit", label: "Platform Audit", icon: ShieldCheck, path: "/platform-audit", role: ["SUPER_ADMIN"] },
      { id: "support", label: "Support Tickets", icon: FileText, path: "/support-tickets", role: ["SUPER_ADMIN"] },
      { id: "users", label: "Hospital Staff & RBAC", icon: Users, path: "/users", role: ["SUPER_ADMIN"] },
      { id: "audit", label: "Hospital Audit Logs", icon: ShieldCheck, path: "/audit-logs", role: ["SUPER_ADMIN"] },
      { id: "revenue", label: "Hospital Revenue Analytics", icon: Activity, path: "/revenue", role: ["SUPER_ADMIN"] },
    ],
  };

  roleNavItems.HOSPITAL_ADMIN = roleNavItems.ADMIN.map((item) => ({
    ...item,
    role: ["HOSPITAL_ADMIN"],
  }));

  const navItems = roleNavItems[normalizedRole] || roleNavItems.DOCTOR;

  // Longest-prefix match helper for active item determination (R5 fix)
  const currentNavItem = (() => {
    const exact = navItems.find((item) => item.path === currentPath);
    if (exact) return exact;

    const matchingPrefixItems = navItems.filter((item) => currentPath.startsWith(`${item.path}/`));
    if (matchingPrefixItems.length > 0) {
      return matchingPrefixItems.sort((a, b) => b.path.length - a.path.length)[0];
    }

    const currentSection = currentPath.split("/").filter(Boolean)[0];
    if (currentSection) {
      const sectionMatch = navItems.find((item) => {
        const itemSection = item.path.split("/").filter(Boolean)[0];
        return itemSection === currentSection;
      });
      if (sectionMatch) return sectionMatch;
    }

    return navItems[0];
  })();

  const isItemActive = (item: NavItem) => currentNavItem.id === item.id;

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
    HOSPITAL_ADMIN: "bg-dark-slate",
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
            const isActive = isItemActive(item);
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
                    <span className="absolute -top-1 -right-2 px-1 min-w-4 h-4 bg-crimson text-white text-[10px] rounded-full flex items-center justify-center font-bold">
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
                const isActive = isItemActive(item);
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
                        <span className="px-2 py-0.5 bg-crimson text-white text-xs rounded-full font-bold">
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
            const isActive = isItemActive(item);
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
                  <span className="ml-auto px-2 py-0.5 bg-crimson text-white text-xs rounded-full font-bold">
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
