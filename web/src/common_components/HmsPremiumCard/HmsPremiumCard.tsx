"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface HmsPremiumCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  variant?: "default" | "elevated" | "gradient" | "bordered";
  role?: "doctor" | "nurse" | "reception" | "billing" | "pharmacy" | "lab";
  compact?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

export const HmsPremiumCard: React.FC<HmsPremiumCardProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-primary-teal",
  iconBgColor = "bg-primary-light-teal",
  variant = "default",
  role,
  compact = false,
  fullWidth = false,
  onClick,
  className = "",
  loading = false,
}) => {
  // Role-based styling
  const roleStyles = {
    doctor: "border-l-4 border-doctor bg-gradient-doctor",
    nurse: "border-l-4 border-nurse bg-gradient-nurse",
    reception: "border-l-4 border-reception bg-gradient-reception",
    billing: "border-l-4 border-billing bg-gradient-billing",
    pharmacy: "border-l-4 border-pharmacy bg-amber-50",
    lab: "border-l-4 border-lab bg-crimson-light",
  };

  // Variant styling
  const variantStyles = {
    default: "bg-white border border-slate-200 shadow-sm",
    elevated: "bg-white border border-slate-200 shadow-md hover:shadow-lg hover-card",
    gradient: "bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm",
    bordered: "bg-white border-2 border-slate-300 shadow-sm",
  };

  // Size classes
  const sizeClasses = compact 
    ? "p-4 sm:p-5 rounded-xl" 
    : "p-5 sm:p-6 md:p-7 rounded-2xl";

  // Width classes
  const widthClass = fullWidth ? "w-full" : "";

  // Interactive classes
  const interactiveClass = onClick 
    ? "cursor-pointer active:scale-98 transition-all duration-200 hover-card" 
    : "";

  // Role class
  const roleClass = role ? roleStyles[role] : "";

  // Variant class
  const variantClass = variantStyles[variant];

  // Loading skeleton
  if (loading) {
    return (
      <div className={`${sizeClasses} ${widthClass} ${variantClass} ${roleClass} ${className} animate-pulse`}>
        {title && (
          <div className="flex items-center gap-3 mb-4">
            {Icon && (
              <div className={`w-10 h-10 ${iconBgColor} rounded-lg loading-shimmer`} />
            )}
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-slate-200 rounded loading-shimmer w-3/4" />
              {subtitle && (
                <div className="h-3 bg-slate-100 rounded loading-shimmer w-1/2" />
              )}
            </div>
          </div>
        )}
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded loading-shimmer" />
          <div className="h-4 bg-slate-200 rounded loading-shimmer w-5/6" />
          <div className="h-4 bg-slate-200 rounded loading-shimmer w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeClasses}
        ${widthClass}
        ${variantClass}
        ${roleClass}
        ${interactiveClass}
        ${className}
        transition-all duration-300
        animate-fade-in
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Header Section */}
      {(title || subtitle || Icon) && (
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
          {Icon && (
            <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 ${iconBgColor} rounded-xl flex items-center justify-center shadow-sm`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg sm:text-xl font-bold text-dark-slate mb-1 line-clamp-1">
                {title}
              </h3>
            )}
            
            {subtitle && (
              <p className="text-sm sm:text-base text-slate-600 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className={`${title || subtitle || Icon ? '' : 'pt-1'}`}>
        {children}
      </div>

      {/* Interactive Indicator */}
      {onClick && (
        <div className="mt-4 sm:mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary-teal">
              Tap to interact
            </span>
            <div className="w-6 h-6 rounded-full bg-primary-teal/10 flex items-center justify-center">
              <svg 
                className="w-3 h-3 text-primary-teal" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Utility component for card grids
export const HmsCardGrid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}> = ({ children, cols = 1, gap = "md", className = "" }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const gridGap = {
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-5 lg:gap-6",
    lg: "gap-5 sm:gap-6 lg:gap-8",
  };

  return (
    <div className={`grid ${gridCols[cols]} ${gridGap[gap]} ${className}`}>
      {children}
    </div>
  );
};