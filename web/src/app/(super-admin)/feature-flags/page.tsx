import { HmsResourceConsole } from "@/common_components/HmsResourceConsole/HmsResourceConsole";

export default function FeatureFlagsPage() {
  return <HmsResourceConsole title="Tenant Feature Flags" subtitle="Enable or disable controlled platform capabilities for individual tenants." storageKey="hms_super_feature_flags" addLabel="Add feature flag" fields={[{ key: "tenant", label: "Tenant" }, { key: "feature", label: "Feature key" }, { key: "status", label: "Status", options: ["Enabled", "Disabled"] }]} seedRecords={[{ id: "flag-1", tenant: "Apollo Super Speciality Hospital", feature: "telehealth", status: "Enabled" }, { id: "flag-2", tenant: "Apollo Super Speciality Hospital", feature: "abdm_gateway", status: "Enabled" }]} />;
}
