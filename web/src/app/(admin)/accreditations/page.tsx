import { HmsResourceConsole } from "@/common_components/HmsResourceConsole/HmsResourceConsole";

export default function AccreditationsPage() {
  return <HmsResourceConsole title="Facility Accreditations" subtitle="Maintain NABH, NABL, ISO and other facility accreditation records." storageKey="hms_admin_accreditations" addLabel="Add accreditation" fields={[{ key: "type", label: "Accreditation", options: ["NABH", "NABL", "ISO", "JCI", "Other"] }, { key: "certificate", label: "Certificate number" }, { key: "expires", label: "Expiry date" }]} seedRecords={[{ id: "acc-1", type: "NABH", certificate: "NABH-HOSP-2026-018", expires: "2028-03-31" }]} />;
}
