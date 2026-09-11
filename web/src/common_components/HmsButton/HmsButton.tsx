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
