import { HmsResourceConsole } from "@/common_components/HmsResourceConsole/HmsResourceConsole";

export default function PrintTemplatesPage() {
  return <HmsResourceConsole title="Print Templates" subtitle="Control the hospital templates used for prescriptions, invoices and clinical documents." storageKey="hms_admin_print_templates" addLabel="Add template" fields={[{ key: "template", label: "Template name" }, { key: "type", label: "Document type", options: ["Prescription", "Invoice", "Discharge Summary", "Lab Report", "Consent Form"] }, { key: "language", label: "Language", options: ["English", "Hindi"] }]} seedRecords={[{ id: "tpl-1", template: "Standard OPD Prescription", type: "Prescription", language: "English" }, { id: "tpl-2", template: "ABDM Discharge Summary", type: "Discharge Summary", language: "English" }]} />;
}
