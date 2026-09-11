"use client";

import React from "react";
import { Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useI18n } from "@/i18n/_i18n_context/I18nContext";

export function HmsHighContrastToggle() {
  const { highContrast, toggleHighContrast, t } = useI18n();

  return (
    <Button
      type={highContrast ? "primary" : "default"}
      icon={<EyeOutlined />}
      onClick={toggleHighContrast}
      style={
        highContrast
          ? { backgroundColor: "var(--hms-dark-slate)", color: "#ffffff", borderColor: "#ffffff" }
          : undefined
      }
    >
      {t.highContrast}
    </Button>
  );
}
