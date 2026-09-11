"use client";

import React from "react";

export interface HmsResponsiveCardProps {
  children: React.ReactNode;
  elevated?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const HmsResponsiveCard: React.FC<HmsResponsiveCardProps> = ({
  children,
  elevated = false,
  className = "",
  title,
  subtitle,
  actions,
}) => {
  const shadowClass = elevated
    ? "shadow-md hover:shadow-lg transition-shadow duration-200 border-slate-200"
    : "shadow-sm border-slate-100";

  return (
    <div className={`bg-white rounded-lg sm:rounded-xl border ${shadowClass} ${className}`}>
      {/* Header - responsive padding and typography */}
      {(title || subtitle || actions) && (
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content - responsive padding */}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};