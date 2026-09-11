import { HmsResourceConsole } from "@/common_components/HmsResourceConsole/HmsResourceConsole";

export default function SupportTicketsPage() {
  return <HmsResourceConsole title="Platform Support Tickets" subtitle="Track tenant-raised support requests and their resolution state." storageKey="hms_super_support_tickets" addLabel="Create ticket" fields={[{ key: "tenant", label: "Tenant" }, { key: "subject", label: "Subject" }, { key: "priority", label: "Priority", options: ["Low", "Medium", "High", "Critical"] }]} seedRecords={[{ id: "ticket-1", tenant: "Apollo Super Speciality Hospital", subject: "Need additional billing users", priority: "Medium" }]} />;
}
