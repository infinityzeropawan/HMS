import { HmsResourceConsole } from "@/common_components/HmsResourceConsole/HmsResourceConsole";

export default function DepartmentsPage() {
  return <HmsResourceConsole title="Departments" subtitle="Configure clinical and support departments for this hospital." storageKey="hms_admin_departments" addLabel="Add department" fields={[{ key: "name", label: "Department name" }, { key: "type", label: "Department type", options: ["OPD", "IPD", "Diagnostic", "Support"] }, { key: "head", label: "Department head" }]} seedRecords={[{ id: "dep-1", name: "Cardiology", type: "OPD", head: "Dr. Rajesh Sharma" }, { id: "dep-2", name: "General Ward", type: "IPD", head: "Dr. Priya Nair" }]} />;
}
