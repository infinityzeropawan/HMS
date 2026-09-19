"use client";

import React, { useState } from "react";
import { Segmented, Tag } from "antd";
import {
  Monitor,
  LayoutDashboard,
  Menu,
  Maximize2,
  Lock,
  Building2,
  Bell,
  Search,
  UserCheck,
  Stethoscope,
  Users,
  Bed,
  Sparkles,
  Phone,
  Mail,
  ShieldAlert,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { LivePreviewMode } from "../../_super_admin_types/branding_types";
import { TenantBrandingConfig } from "../../_super_admin_types/tenant_management";
import { useBrandingStore } from "../../_super_admin_stores/branding_store";

interface LiveBrandingPreviewWorkspaceProps {
  branding: TenantBrandingConfig;
  hospitalName: string;
}

export const LiveBrandingPreviewWorkspace: React.FC<LiveBrandingPreviewWorkspaceProps> = ({
  branding,
  hospitalName,
}) => {
  const [activePreviewMode, setActivePreviewMode] = useState<LivePreviewMode>("login");
  const storeBranding = useBrandingStore((state) => state.brandingByTenant["TNT-9014"]);
  const activeBranding = storeBranding || branding;

  const primaryColor = activeBranding.primaryColor || "#0d9488";
  const secondaryColor = activeBranding.secondaryColor || "#0f766e";
  const logoUrl = activeBranding.logoUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80";
  const productName = activeBranding.whiteLabel?.productName || activeBranding.patientPortalTitle || `${hospitalName} Health Cloud`;

  return (
    <div className="space-y-4">
      {/* Header Bar & Preview Mode Controls */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">Live Tenant App Interface Preview</h3>
            <Tag color="cyan" className="!text-[10px] font-mono">Real-time Render</Tag>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulates dynamic brand accent styling, custom logos, and white-label titles across core tenant web layouts.
          </p>
        </div>

        <Segmented
          options={[
            {
              label: (
                <span className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-medium">
                  <Lock className="w-3.5 h-3.5" /> Login Page
                </span>
              ),
              value: "login",
            },
            {
              label: (
                <span className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-medium">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </span>
              ),
              value: "dashboard",
            },
            {
              label: (
                <span className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-medium">
                  <Menu className="w-3.5 h-3.5" /> Sidebar
                </span>
              ),
              value: "sidebar",
            },
            {
              label: (
                <span className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-medium">
                  <Maximize2 className="w-3.5 h-3.5" /> App Header
                </span>
              ),
              value: "header",
            },
          ]}
          value={activePreviewMode}
          onChange={(val) => setActivePreviewMode(val as LivePreviewMode)}
          className="bg-slate-800 text-slate-200"
        />
      </div>

      {/* Interactive Frame Container */}
      <div className="bg-slate-950 p-3 md:p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden min-h-[480px]">
        {/* Top Browser URL Bar Simulation */}
        <div className="bg-slate-900 px-4 py-2 rounded-t-xl border-b border-slate-800 flex items-center justify-between gap-3 text-xs mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex-1 max-w-xl bg-slate-950 px-3 py-1 rounded-md text-slate-400 font-mono text-[11px] truncate flex items-center gap-2 border border-slate-800">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>https://{branding.whiteLabel?.subdomain || "tenant"}.hospitalcore.in/{activePreviewMode}</span>
          </div>
          <Tag color="emerald" className="!m-0 font-mono text-[10px]">SSL Secured</Tag>
        </div>

        {/* 1. LOGIN PAGE PREVIEW */}
        {activePreviewMode === "login" && (
          <div className="bg-slate-900 rounded-xl p-8 flex items-center justify-center min-h-[400px] relative overflow-hidden border border-slate-800">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, ${primaryColor} 0%, transparent 70%)`,
              }}
            />

            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 relative z-10 border border-slate-100 text-slate-900">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-xs mb-1">
                  <img src={logoUrl} alt="Tenant Logo" className="h-10 w-auto object-contain max-w-[140px]" />
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">{productName}</h4>
                <p className="text-xs text-slate-500">{hospitalName} Staff Portal</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Employee ID / Email</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-400 font-mono">
                    dr.sharma@{hospitalName.toLowerCase().replace(/[^a-z]/g, "")}.org
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Security Password</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-400 font-mono">
                    ••••••••••••••••
                  </div>
                </div>

                <button
                  type="button"
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-3 rounded-lg text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" /> Sign In to Hospital Portal
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {branding.whiteLabel?.supportPhone || "+91 1800-425-9999"}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> Support</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. DASHBOARD PREVIEW */}
        {activePreviewMode === "dashboard" && (
          <div className="bg-slate-900 rounded-xl p-6 min-h-[400px] space-y-6 text-slate-100 border border-slate-800">
            {/* Top Dashboard Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="Logo" className="h-8 w-auto bg-white p-1 rounded border border-slate-700" />
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {hospitalName} <Tag style={{ borderColor: primaryColor, color: primaryColor }}>Clinical Operations</Tag>
                  </h4>
                  <p className="text-xs text-slate-400">Welcome back, Dr. Rajesh Sharma (Chief Medical Officer)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" /> Main Branch (OPD Wing)
                </div>
              </div>
            </div>

            {/* KPI Cards highlighting Brand Accent */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl opacity-20" style={{ backgroundColor: primaryColor }} />
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Today's OPD Registrations</span>
                  <Users className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <div className="text-2xl font-black text-white">428</div>
                <div className="text-[11px] text-emerald-400 font-medium">↑ 12% vs yesterday</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Occupied Beds (IPD)</span>
                  <Bed className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">184 / 220</div>
                <div className="text-[11px] text-amber-400 font-medium">83.6% Occupancy</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Surgeries Scheduled</span>
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-white">18</div>
                <div className="text-[11px] text-cyan-400 font-medium">4 OR Theatres Active</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Revenue Today</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">₹6,84,500</div>
                <div className="text-[11px] text-emerald-400 font-medium">Clearances 94%</div>
              </div>
            </div>

            {/* Quick Actions Panel Styled with Brand Color */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Primary Accent Color Theme:</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">{primaryColor}</span>
                <div className="w-6 h-6 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: primaryColor }} />
              </div>
            </div>
          </div>
        )}

        {/* 3. SIDEBAR PREVIEW */}
        {activePreviewMode === "sidebar" && (
          <div className="bg-slate-900 rounded-xl p-6 min-h-[400px] flex gap-6 text-slate-100 border border-slate-800">
            {/* Styled Left Navigation Sidebar */}
            <div className="w-64 bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col justify-between shrink-0 shadow-lg">
              <div className="space-y-6">
                {/* Sidebar Header Logo */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                  <img src={logoUrl} alt="Logo" className="h-7 w-auto bg-white p-0.5 rounded" />
                  <div className="truncate">
                    <div className="text-xs font-black text-white truncate">{productName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{hospitalName}</div>
                  </div>
                </div>

                {/* Sidebar Menu Items */}
                <div className="space-y-1 text-xs">
                  <div
                    style={{ backgroundColor: `${primaryColor}25`, borderLeftColor: primaryColor }}
                    className="p-2.5 rounded-r-lg border-l-4 text-white font-bold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" style={{ color: primaryColor }} /> Clinical Dashboard
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className="p-2.5 rounded-lg text-slate-400 hover:text-white flex items-center justify-between hover:bg-slate-900 transition-colors">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" /> Patient Registry
                    </span>
                    <Tag className="!m-0 text-[9px] border-slate-700 bg-slate-800 text-slate-300">1,240</Tag>
                  </div>

                  <div className="p-2.5 rounded-lg text-slate-400 hover:text-white flex items-center justify-between hover:bg-slate-900 transition-colors">
                    <span className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" /> OPD Consultations
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg text-slate-400 hover:text-white flex items-center justify-between hover:bg-slate-900 transition-colors">
                    <span className="flex items-center gap-2">
                      <Bed className="w-4 h-4" /> IPD Admissions
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar Footer User Card */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs">
                    DS
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">Dr. Sharma</div>
                    <div className="text-[9px] text-slate-400">Super Admin</div>
                  </div>
                </div>
                <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400 cursor-pointer" />
              </div>
            </div>

            {/* Sidebar Preview Main Area Explanation */}
            <div className="flex-1 bg-slate-950/60 rounded-xl p-6 border border-slate-800/80 flex flex-col justify-center space-y-3 text-slate-300">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Menu className="w-4 h-4 text-teal-400" /> Sidebar Navigation Highlights
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The vertical navigation rail adopts your tenant primary color (<span className="font-mono text-teal-400">{primaryColor}</span>) for active menu borders, background highlights, and product branding headers.
              </p>
            </div>
          </div>
        )}

        {/* 4. APP HEADER PREVIEW */}
        {activePreviewMode === "header" && (
          <div className="bg-slate-900 rounded-xl p-6 min-h-[400px] space-y-6 text-slate-100 border border-slate-800">
            {/* Top Navigation Bar Component */}
            <div
              style={{ borderTopColor: primaryColor }}
              className="bg-slate-950 p-4 rounded-xl border-t-4 border-b border-x border-slate-800 flex items-center justify-between gap-4 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <img src={logoUrl} alt="Logo" className="h-8 w-auto bg-white p-1 rounded" />
                <div className="h-6 w-[1px] bg-slate-800" />
                <div>
                  <h4 className="text-sm font-black text-white">{productName}</h4>
                  <p className="text-[11px] text-slate-400">{hospitalName}</p>
                </div>
              </div>

              {/* Header Search & Actions */}
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-slate-400 w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500" /> Search UHID, Patient Name, RX...
                </div>

                <div className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                </div>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-xs"
                  >
                    CM
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/40 p-6 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <span className="font-bold text-slate-200 block">Header Accent Styling:</span>
              <p>
                App header utilizes the tenant's primary brand accent line at top border (<span className="font-mono text-teal-400">{primaryColor}</span>), logo placeholder, white-label product title, and custom user avatar styling.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
