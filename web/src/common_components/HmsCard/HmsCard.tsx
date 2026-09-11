"use client";

import React from "react";
import { Card as AntdCard, CardProps } from "antd";

export interface HmsCardProps extends CardProps {
  elevated?: boolean;
}

export const HmsCard: React.FC<HmsCardProps> = ({
  children,
  elevated = false,
  className = "",
  ...props
}) => {
  const shadowClass = elevated
    ? "shadow-md hover:shadow-lg transition-shadow duration-200 border-slate-200"
    : "border-slate-200 shadow-sm";

  return (
    <AntdCard className={`${shadowClass} ${className}`} {...props}>
      {children}
    </AntdCard>
  );
};
