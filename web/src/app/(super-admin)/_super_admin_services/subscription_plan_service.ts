import { FeatureSource } from "../_super_admin_types/feature_management";

export interface PlanConfig {
  id: string;
  code: string;
  name: string;
  monthlyFee: number;
  maxUsers: string;
  maxBeds: string;
  modules: string[];
  sla: string;
  status: "ACTIVE" | "DEPRECATED";
  includedFeatures: string[];
  restrictedFeatures: string[];
  optionalAddons: string[];
  description?: string;
}

export interface TenantSubscription {
  key: string;
  tenantId: string;
  tenantName: string;
  planCode: string;
  billingCycle: "MONTHLY" | "ANNUAL";
  userSeats: string;
  renewalDate: string;
  status: "ACTIVE" | "PAST_DUE" | "TRIAL";
}

const INITIAL_PLANS: PlanConfig[] = [
  {
    id: "plan-1",
    code: "BASIC",
    name: "OPD Essentials",
    monthlyFee: 14999,
    maxUsers: "15 Users",
    maxBeds: "10 Beds",
    modules: ["OPD Queue", "Patient Reg", "e-Prescriptions", "Basic Billing"],
    sla: "Standard (9x5)",
    status: "ACTIVE",
    includedFeatures: ["opd_queue", "patient_registration", "eprescriptions", "basic_billing"],
    restrictedFeatures: ["ipd_ward_matrix", "ot_scheduler", "pacs_viewer", "telemedicine", "abdm_gateway", "cdss_ai"],
    optionalAddons: ["telemedicine", "lab_pathology"],
    description: "Designed for small clinics and outpatient departments.",
  },
  {
    id: "plan-2",
    code: "PRO",
    name: "Professional Hospital",
    monthlyFee: 39999,
    maxUsers: "100 Users",
    maxBeds: "100 Beds",
    modules: ["OPD Queue", "IPD Ward Matrix", "OT Scheduler", "Pharmacy FEFO", "Lab Pathology", "ABDM Gateway"],
    sla: "Priority 24/7",
    status: "ACTIVE",
    includedFeatures: ["opd_queue", "patient_registration", "eprescriptions", "basic_billing", "ipd_ward_matrix", "ot_scheduler", "pharmacy_fefo", "lab_pathology", "abdm_gateway"],
    restrictedFeatures: ["pacs_viewer", "cdss_ai", "multi_branch"],
    optionalAddons: ["telemedicine", "pacs_viewer"],
    description: "Ideal for mid-sized multi-specialty hospitals.",
  },
  {
    id: "plan-3",
    code: "ENTERPRISE",
    name: "Enterprise Multi-Specialty",
    monthlyFee: 89999,
    maxUsers: "Unlimited",
    maxBeds: "500 Beds",
    modules: ["All Modules", "PACS DICOM Viewer", "CDSS AI Assist", "Multi-Branch Network", "DPDP Audit Ledger", "Dedicated Account Manager"],
    sla: "Dedicated 99.99% SLA",
    status: "ACTIVE",
    includedFeatures: ["opd_queue", "patient_registration", "eprescriptions", "basic_billing", "ipd_ward_matrix", "ot_scheduler", "pharmacy_fefo", "lab_pathology", "abdm_gateway", "pacs_viewer", "cdss_ai", "multi_branch", "telemedicine"],
    restrictedFeatures: [],
    optionalAddons: [],
    description: "Full suite for large hospital networks & teaching institutions.",
  },
];

const INITIAL_TENANT_SUBSCRIPTIONS: TenantSubscription[] = [
  { key: "0a", tenantId: "TENANT-001", tenantName: "Apollo Super Speciality Hospital", planCode: "ENTERPRISE", billingCycle: "ANNUAL", userSeats: "342 / 500", renewalDate: "2027-04-01", status: "ACTIVE" },
  { key: "0b", tenantId: "TENANT-002", tenantName: "Fortis Heart & Vascular Institute", planCode: "PRO", billingCycle: "ANNUAL", userSeats: "120 / 200", renewalDate: "2027-05-15", status: "ACTIVE" },
  { key: "1", tenantId: "TNT-9014", tenantName: "Apollo Super Speciality Hospital", planCode: "ENTERPRISE", billingCycle: "ANNUAL", userSeats: "342 / 500", renewalDate: "2027-04-01", status: "ACTIVE" },
  { key: "2", tenantId: "TNT-1042", tenantName: "Fortis Heart & Vascular Institute", planCode: "ENTERPRISE", billingCycle: "ANNUAL", userSeats: "210 / 500", renewalDate: "2027-03-12", status: "ACTIVE" },
  { key: "3", tenantId: "TNT-2088", tenantName: "Max Super Speciality Hospital", planCode: "ENTERPRISE", billingCycle: "ANNUAL", userSeats: "295 / 500", renewalDate: "2027-02-01", status: "ACTIVE" },
  { key: "4", tenantId: "TNT-3105", tenantName: "Manipal Hospital Whitefield", planCode: "PRO", billingCycle: "ANNUAL", userSeats: "88 / 100", renewalDate: "2027-06-01", status: "ACTIVE" },
  { key: "5", tenantId: "TNT-4412", tenantName: "Narayana Health City", planCode: "ENTERPRISE", billingCycle: "ANNUAL", userSeats: "380 / 500", renewalDate: "2027-11-01", status: "ACTIVE" },
  { key: "6", tenantId: "TENANT-003", tenantName: "City Diagnostics & OPD Clinic", planCode: "BASIC", billingCycle: "ANNUAL", userSeats: "12 / 15", renewalDate: "2026-12-31", status: "ACTIVE" },
  { key: "7", tenantId: "TNT-5611", tenantName: "Sir Ganga Ram Hospital", planCode: "ENTERPRISE", billingCycle: "ANNUAL", userSeats: "0 / 500", renewalDate: "2026-10-05", status: "PAST_DUE" },
];

let plansStore: PlanConfig[] = [...INITIAL_PLANS];
let tenantSubscriptionsStore: TenantSubscription[] = [...INITIAL_TENANT_SUBSCRIPTIONS];
const listeners: (() => void)[] = [];

export class SubscriptionPlanService {
  public static getPlans(): PlanConfig[] {
    return [...plansStore];
  }

  public static savePlan(plan: PlanConfig): PlanConfig {
    const idx = plansStore.findIndex((p) => p.id === plan.id || p.code === plan.code);
    if (idx >= 0) {
      plansStore[idx] = { ...plan };
    } else {
      plansStore = [...plansStore, plan];
    }
    listeners.forEach((l) => l());
    return plan;
  }

  public static getTenantSubscriptions(): TenantSubscription[] {
    return [...tenantSubscriptionsStore];
  }

  public static updateTenantSubscription(sub: TenantSubscription): TenantSubscription {
    const idx = tenantSubscriptionsStore.findIndex((s) => s.key === sub.key || s.tenantId === sub.tenantId);
    if (idx >= 0) {
      tenantSubscriptionsStore[idx] = { ...sub };
    } else {
      tenantSubscriptionsStore = [...tenantSubscriptionsStore, sub];
    }
    listeners.forEach((l) => l());
    return sub;
  }

  public static getPlan(planCode: string): PlanConfig | undefined {
    return plansStore.find((p) => p.code === planCode || p.id === planCode);
  }

  public static getPlanByTenant(tenantId: string): PlanConfig | undefined {
    const sub = tenantSubscriptionsStore.find((s) => s.tenantId === tenantId || s.key === tenantId);
    if (sub) {
      return this.getPlan(sub.planCode);
    }
    return undefined;
  }


  public static getFeatureSource(planCode: string, featureId: string): FeatureSource {
    const plan = this.getPlan(planCode);
    if (!plan) return "Restricted";
    if (plan.includedFeatures?.includes(featureId) || plan.modules?.includes("All Modules")) return "Included By Plan";
    if (plan.optionalAddons?.includes(featureId) || featureId.includes("addon") || featureId.includes("telemedicine")) return "Optional Add-on";
    return "Restricted";
  }

  public static getRecommendedUpgradePlan(currentPlanCode: string, featureId: string): PlanConfig | undefined {
    return plansStore.find(
      (p) => p.code !== currentPlanCode && (p.includedFeatures?.includes(featureId) || p.optionalAddons?.includes(featureId))
    ) || plansStore.find((p) => p.code === "ENTERPRISE");
  }

  public static getRestrictionReason(planCode: string, featureId: string): string {
    return `Feature '${featureId}' is not included in the ${planCode} plan tier. Upgrade subscription to unlock.`;
  }

  public static subscribe(listener: () => void): () => void {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }
}

export const SUBSCRIPTION_PLAN_DEFINITIONS = INITIAL_PLANS;

export function getPlanByTenant(tenantId: string): PlanConfig | undefined {
  return SubscriptionPlanService.getPlanByTenant(tenantId);
}
