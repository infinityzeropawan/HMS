"use client";

import React from "react";
import { Select } from "antd";
import { useI18n } from "@/i18n/_i18n_context/I18nContext";
import { SUPPORTED_LANGUAGES } from "@/i18n/_i18n_dictionaries/i18n.dictionaries";
import { SupportedLanguage } from "@/i18n/_i18n_types/i18n.types";

export function HmsLanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="inline-flex items-center gap-2">
      <Select
        value={language}
        onChange={(val: SupportedLanguage) => setLanguage(val)}
        style={{ width: 140 }}
        options={SUPPORTED_LANGUAGES.map((lang) => ({
          value: lang.code,
          label: `${lang.flag} ${lang.nativeName}`,
        }))}
        className="rounded-lg shadow-sm"
      />
    </div>
  );
}
