import { HmsResourceConsole } from "@/common_components/HmsResourceConsole/HmsResourceConsole";

export default function HospitalSettingsPage() {
  return <HmsResourceConsole title="Hospital Settings" subtitle="Manage facility-level operational settings, policies and contact details." storageKey="hms_admin_settings" addLabel="Add setting" fields={[{ key: "setting", label: "Setting" }, { key: "value", label: "Value" }, { key: "scope", label: "Scope", options: ["Facility", "Clinical", "Billing", "Security"] }]} seedRecords={[{ id: "set-1", setting: "Default consultation duration", value: "15 minutes", scope: "Clinical" }, { id: "set-2", setting: "GSTIN", value: "27AAACA1234A1Z5", scope: "Billing" }]} />;
}
