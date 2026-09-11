import { HmsResourceConsole } from "@/common_components/HmsResourceConsole/HmsResourceConsole";

export default function PlatformAuditPage() {
  return <HmsResourceConsole title="Platform Audit Log" subtitle="Review platform-level tenant and configuration events across the SaaS environment." storageKey="hms_super_platform_audit" addLabel="Add audit event" fields={[{ key: "actor", label: "Actor" }, { key: "action", label: "Action" }, { key: "entity", label: "Entity" }]} seedRecords={[{ id: "audit-1", actor: "System Administrator", action: "Updated tenant subscription", entity: "Apollo Super Speciality Hospital" }, { id: "audit-2", actor: "Platform service", action: "Enabled feature flag", entity: "telehealth" }]} />;
}
