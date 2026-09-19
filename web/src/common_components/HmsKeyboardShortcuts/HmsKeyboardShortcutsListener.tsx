"use client";

import { useEffect } from "react";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/_i18n_context/I18nContext";

export function HmsKeyboardShortcutsListener() {
  const { toggleHighContrast } = useI18n();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        switch (e.key.toLowerCase()) {
          case "s":
            e.preventDefault();
            message.info("Shortcut: Doctor SOAP Notes (Ctrl+Alt+S)");
            router.push("/doctor/queue");
            break;
          case "p":
            e.preventDefault();
            message.info("Shortcut: e-Prescription & Pharmacy (Ctrl+Alt+P)");
            router.push("/dispense");
            break;
          case "f":
            e.preventDefault();
            message.info("Shortcut: Patient Search (Ctrl+Alt+F)");
            router.push("/dashboard");
            break;
          case "h":
            e.preventDefault();
            toggleHighContrast();
            message.success("Toggled High Contrast Mode");
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleHighContrast, router]);

  return null;
}
