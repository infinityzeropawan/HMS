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
  Receipt
} from "lucide-react";
import { HmsButton } from "../HmsButton/HmsButton";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  role: string[];
  badge?: number;
  active?: boolean;
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
  const [activeSection, setActiveSection] = useState("dashboard");

  // Role-based navigation items
  const roleNavItems: Record<string, NavItem[]> = {
    DOCTOR: [
      { id: "dashboard", label: "Dashboard", icon: Home, path: "/doctor/dashboard", role: ["DOCTOR"] },
      { id: "queue", label: "OPD Queue", icon: Users, path: "/doctor/queue", role: ["DOCTOR"], badge: 3 },
      { id: "encounter", label: "Encounter", icon: Stethoscope, path: "/doctor/encounter", role: ["DOCTOR"] },
      { id: "schedule", label: "Schedule", icon: Calendar, path: "/doctor/schedule", role: ["DOCTOR"] },
      { id: "patients", label: "My Patients", icon: HeartPulse, path: "/doctor/patients", role: ["DOCTOR"] },
      { id: "telehealth", label: "Telehealth", icon: Activity, path: "/telehealth", role: ["DOCTOR"] },
    ],
    NURSE: [
      { id: "dashboard", label: "Dashboard", icon: Home, path: "/nurse/dashboard", role: ["NURSE"] },
      { id: "station", label: "Nurse Station", icon: ClipboardCheck, path: "/nurse/station", role: ["NURSE"], badge: 5 },
      { id: "wards", label: "Ward Rounds", icon: HeartPulse, path: "/nurse/wards", role: ["NURSE"] },
      { id: "vitals", label: "Vitals", icon: Activity, path: "/nurse/vitals", role: ["NURSE"] },
      { id: "mar", label: "MAR", icon: Pill, path: "/nurse/mar", role: ["NURSE"] },
    ],
    RECEPTION: [
      { id: "dashboard", label: "Dashboard", icon: Home, path: "/reception/dashboard", role: ["RECEPTION"] },
      { id: "registration", label: "Registration", icon: Users, path: "/reception/registration", role: ["RECEPTION"], badge: 2 },
      { id: "appointments", label: "Appointments", icon: Calendar, path: "/reception/appointments", role: ["RECEPTION"] },
      { id: "queue", label: "Token Queue", icon: Users, path: "/reception/queue", role: ["RECEPTION"] },
      { id: "patients", label: "Patients", icon: HeartPulse, path: "/reception/patients", role: ["RECEPTION"] },
    ],
    BILLING: [
      { id: "dashboard", label: "Dashboard", icon: Home, path: "/billing/dashboard", role: ["BILLING"] },
      { id: "invoices", label: "Invoices", icon: Receipt, path: "/billing/invoices", role: ["BILLING"], badge: 8 },
      { id: "claims", label: "TPA Claims", icon: FileText, path: "/billing/claims", role: ["BILLING"] },
      { id: "payments", label: "Payments", icon: Receipt, path: "/billing/payments", role: ["BILLING"] },
      { id: "reports", label: "Reports", icon: FileText, path: "/billing/reports", role: ["BILLING"] },
    ],
    PHARMACY: [
      { id: "dashboard", label: "Dashboard", icon: Home, path: "/pharmacy/dashboard", role: ["PHARMACY"] },
      { id: "dispense", label: "Dispense", icon: Pill, path: "/pharmacy/dispense", role: ["PHARMACY"], badge: 12 },
      { id: "inventory", label: "Inventory", icon: ClipboardCheck, path: "/pharmacy/inventory", role: ["PHARMACY"] },
      { id: "orders", label: "Orders", icon: FileText, path: "/pharmacy/orders", role: ["PHARMACY"] },
      { id: "controlled", label: "Controlled Drugs", icon: Pill, path: "/pharmacy/controlled", role: ["PHARMACY"] },
    ],
    LAB: [
      { id: "dashboard", label: "Dashboard", icon: Home, path: "/lab/dashboard", role: ["LAB"] },
      { id: "orders", label: "Orders", icon: Microscope, path: "/lab/orders", role: ["LAB"], badge: 7 },
      { id: "results", label: "Results", icon: FileText, path: "/lab/results", role: ["LAB"] },
      { id: "collection", label: "Collection", icon: Activity, path: "/lab/collection", role: ["LAB"] },
      { id: "reports", label: "Reports", icon: FileText, path: "/lab/reports", role: ["LAB"] },
    ],
  };

  const navItems = roleNavItems[userRole] || roleNavItems.DOCTOR;
  const currentNavItem = navItems.find(item => item.path === currentPath) || navItems[0];

  const handleNavClick = (item: NavItem) => {
    onNavigate(item.path);
    setIsOpen(false);
    setActiveSection(item.id);
  };

  const roleColors = {
    DOCTOR: "bg-doctor",
    NURSE: "bg-nurse", 
    RECEPTION: "bg-reception",
    BILLING: "bg-billing",
    PHARMACY: "bg-pharmacy",
    LAB: "bg-lab",
  };

  const roleColor = roleColors[userRole as keyof typeof roleColors] || "bg-primary-teal";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 safe-area-top">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left: Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          {/* Center: Current Page Title */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${roleColor} rounded-lg flex items-center justify-center`}>
              <currentNavItem.icon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">{currentNavItem.label}</span>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-2">
            <button
              className="relative w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-crimson text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            
            <button
              className="w-10 h-10 rounded-full bg-primary-light-teal flex items-center justify-center border-2 border-primary-teal/20"
              aria-label="User profile"
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
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center py-3 ${
                activeSection === item.id ? 'text-primary-teal' : 'text-slate-600'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5 mb-1" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-crimson text-white text-[10px] rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {activeSection === item.id && (
                <div className="absolute top-0 w-12 h-1 bg-primary-teal rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl animate-fade-in">
            {/* Header */}
            <div className={`${roleColor} p-6 text-white`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Hospital Portal</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{userName}</h3>
                  <p className="text-sm opacity-90 capitalize">{userRole.toLowerCase()}</p>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="p-4 overflow-y-auto h-[calc(100vh-200px)]">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      activeSection === item.id 
                        ? 'bg-primary-light-teal text-primary-teal' 
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeSection === item.id ? 'bg-primary-teal/10' : 'bg-slate-100'
                      }`}>
                        <item.icon className={`w-5 h-5 ${
                          activeSection === item.id ? 'text-primary-teal' : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500 capitalize">
                          {item.role[0].toLowerCase()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.badge && item.badge > 0 && (
                        <span className="px-2 py-1 bg-crimson text-white text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>

              {/* System Items */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 text-slate-700">
                  <Settings className="w-5 h-5 text-slate-600" />
                  <span className="font-medium">Settings</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 text-slate-700">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="font-medium">Notifications</span>
                  {notificationCount > 0 && (
                    <span className="ml-auto px-2 py-1 bg-crimson text-white text-xs rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-rose-50 text-rose-600 mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
              <div className="text-center text-xs text-slate-500">
                <p>Hospital Management System</p>
                <p className="mt-1">v2.1.0 • Secure Session</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 ${roleColor} rounded-xl flex items-center justify-center`}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-dark-slate">HMS Portal</h2>
              <p className="text-xs text-slate-500 capitalize">{userRole.toLowerCase()}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeSection === item.id 
                    ? 'bg-primary-light-teal text-primary-teal border-l-4 border-primary-teal' 
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto px-2 py-1 bg-crimson text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <HmsButton
              variant="outline"
              size="sm"
              fullWidth
              onClick={onLogout}
              className="text-slate-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </HmsButton>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop sidebar */}
      <div className="hidden lg:block w-64" />
    </>
  );
};