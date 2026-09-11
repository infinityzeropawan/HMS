import { HmsResourceConsole } from "@/common_components/HmsResourceConsole/HmsResourceConsole";

export default function SubscriptionPlansPage() {
  return <HmsResourceConsole title="Subscription Plans" subtitle="Define platform subscription plans and the capacity available to each tenant." storageKey="hms_super_subscription_plans" addLabel="Add plan" fields={[{ key: "plan", label: "Plan name" }, { key: "code", label: "Plan code" }, { key: "users", label: "Included users" }]} seedRecords={[{ id: "plan-1", plan: "Professional", code: "PRO", users: "100" }, { id: "plan-2", plan: "Enterprise", code: "ENT", users: "Unlimited" }]} />;
}
