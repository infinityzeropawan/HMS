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
