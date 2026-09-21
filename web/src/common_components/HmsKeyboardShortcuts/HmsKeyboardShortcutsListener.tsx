"use client";

import { useEffect } from "react";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/_i18n_context/I18nContext";
import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";

export function HmsKeyboardShortcutsListener() {
  const { toggleHighContrast } = useI18n();
  const router = useRouter();
  const user = useAuthUserStore((s) => s.user);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        const role = user?.role?.toUpperCase() || "";
        switch (e.key.toLowerCase()) {
          case "s":
            e.preventDefault();
            if (role === "NURSE") {
              message.info("Shortcut: Nurse Station (Ctrl+Alt+S)");
              router.push("/station");
            } else {
              message.info("Shortcut: Doctor OPD Queue (Ctrl+Alt+S)");
              router.push("/doctor/queue");
            }
            break;
          case "p":
            e.preventDefault();
            if (role === "PHARMACY" || role === "PHARMACIST") {
              message.info("Shortcut: Pharmacy Dispense Desk (Ctrl+Alt+P)");
              router.push("/dispense");
            } else if (role === "DOCTOR") {
              message.info("Shortcut: e-Prescription History Vault (Ctrl+Alt+P)");
              router.push("/doctor/prescriptions");
            } else {
              message.info("Shortcut: Pharmacy Dispense (Ctrl+Alt+P)");
              router.push("/dispense");
            }
            break;
          case "f":
            e.preventDefault();
            if (role === "DOCTOR") {
              message.info("Shortcut: Active Inpatient Rounds (Ctrl+Alt+F)");
              router.push("/doctor/inpatient");
            } else if (role === "NURSE") {
              message.info("Shortcut: Bedside Vitals (Ctrl+Alt+F)");
              router.push("/vitals");
            } else {
              message.info("Shortcut: Patient Search (Ctrl+Alt+F)");
              router.push("/dashboard");
            }
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
  }, [toggleHighContrast, router, user]);

  return null;
}
