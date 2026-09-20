import {
  Tenant,
  TenantFilterParams,
  TenantSortParams,
  PaginatedTenantResponse,
  TenantStats,
  TenantUsageMetrics,
  TenantAuditLog,
  TenantBrandingConfig,
  SuspensionReason,
  SuspensionRecord,
  TenantHealthTelemetry,
  HealthLevel,
  ServiceDiagnosticIncident,
} from "../_super_admin_types/tenant_management";
import { GovernanceEventBus } from "./governance_event_bus";


const MOCK_TENANTS: Tenant[] = [
  {
    id: "TNT-9014",
    hospitalName: "Apollo Super Speciality Hospital",
    hospitalType: "Multi-Specialty",
    city: "Chennai",
    state: "Tamil Nadu",
    address: "21 Greams Lane, Thousand Lights, Chennai, Tamil Nadu 600006",
    contactPerson: "Dr. K. Prathap C. Reddy",
    subscriptionPlan: "Enterprise",
    status: "Active",
    activeUsers: 342,
    maxUsers: 500,
    bedCount: 650,
    maxBeds: 750,
    storageUsedGB: 480,
    maxStorageGB: 1000,
    lastActivity: "2 mins ago",
    lastLogin: "Today at 14:22 by admin@apollo.hms.com",
    createdDate: "2024-01-10",
    expiryDate: "2027-04-15",
    healthStatus: "Healthy",
    subdomain: "apollo-chennai",
    adminEmail: "admin@apollo.hms.com",
    adminPhone: "+91 98400 12345",
    gstin: "33AAAAA0000A1Z5",
    mrr: 450000,
    joinedDate: "2024-01-10",
    slaUptime: 99.98,
    enabledModules: ["OPD", "IPD", "OT", "Lab", "Pharmacy", "Radiology", "Blood Bank", "Telemedicine", "ABDM"],
    compliance: {
      nabh: "Full Accreditation",
      nabl: "Accredited Lab",
      hfr: "Registered & Verified",
      abdm: "Level M1, M2 & M3 Certified",
      nabhCertNo: "NABH-HOSP-2024-0891",
      nablCertNo: "NABL-LAB-2024-3312",
      hfrId: "IN331000291",
      abdmGatewayId: "ABDM-GW-9014-TN",
    },
    branding: {
      logoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop",
      primaryColor: "#0d9488",
      secondaryColor: "#0f766e",
      customDomain: "emr.apollohospitals.com",
      prescriptionHeader: "Apollo Super Speciality Healthcare Group",
      patientPortalTitle: "Apollo Patient Care & Telehealth Portal",
      watermarkText: "APOLLO HEALTHCARE OFFICIAL RECORD",
    },
    subscriptionDetail: {
      currentPlan: "Enterprise",
      startDate: "2024-01-10",
      expiryDate: "2027-04-15",
      autoRenewal: true,
      paymentStatus: "Paid",
      lastInvoice: "INV-2026-0891 (₹4,50,000)",
      billingCycle: "Annual",
    },
    suspensionHistory: [],
  },
  {
    id: "TNT-5611",
    hospitalName: "Sir Ganga Ram Hospital",
    hospitalType: "Teaching Hospital",
    city: "New Delhi",
    state: "Delhi NCR",
    address: "Rajinder Nagar, New Delhi, Delhi 110060",
    contactPerson: "Dr. Ajay Swaroop",
    subscriptionPlan: "Enterprise",
    status: "Suspended",
    activeUsers: 0,
    maxUsers: 500,
    bedCount: 675,
    maxBeds: 700,
    storageUsedGB: 510,
    maxStorageGB: 1000,
    lastActivity: "3 days ago",
    lastLogin: "3 days ago by security@sgrh.org",
    createdDate: "2023-10-10",
    expiryDate: "2026-10-05",
    healthStatus: "Offline",
    subdomain: "sgrh-delhi",
    adminEmail: "security@sgrh.org",
    adminPhone: "+91 98110 33445",
    gstin: "07AAAAA5555E1Z2",
    mrr: 0,
    joinedDate: "2023-10-10",
    slaUptime: 0,
    enabledModules: [],
    compliance: {
      nabh: "Full Accreditation",
      nabl: "Accredited Lab",
      hfr: "Registered & Verified",
      abdm: "Level M1, M2 & M3 Certified",
    },
    branding: {
      primaryColor: "#0f172a",
      secondaryColor: "#334155",
      customDomain: "emr.sgrh.org",
      prescriptionHeader: "Sir Ganga Ram Hospital",
      patientPortalTitle: "SGRH Patient Portal",
      watermarkText: "SGRH OFFICIAL RECORD",
    },
    subscriptionDetail: {
      currentPlan: "Enterprise",
      startDate: "2023-10-10",
      expiryDate: "2026-10-05",
      autoRenewal: false,
      paymentStatus: "Overdue",
      lastInvoice: "INV-2026-0012 (₹5,00,000)",
      billingCycle: "Annual",
    },
    suspensionHistory: [
      {
        id: "SUSP-1001",
        action: "SUSPEND",
        adminName: "SuperAdmin Audit Sentinel",
        date: "2026-09-15",
        time: "16:45:10",
        timestamp: "2026-09-15T16:45:10Z",
        reason: "Compliance Issue",
        reasonNotes: "NABH Certificate renewal verification pending from hospital legal team.",
      },
    ],
  },
  {
    id: "TNT-1042",
    hospitalName: "Fortis Heart & Vascular Institute",
    hospitalType: "Super-Specialty",
    city: "Gurugram",
    state: "Haryana",
    address: "Sector 44, Gurugram, Haryana 122002",
    contactPerson: "Dr. T.S. Kler",
    subscriptionPlan: "Enterprise",
    status: "Active",
    activeUsers: 210,
    maxUsers: 500,
    bedCount: 260,
    maxBeds: 350,
    storageUsedGB: 310,
    maxStorageGB: 800,
    lastActivity: "5 mins ago",
    lastLogin: "Today at 13:10 by admin@fortis.hms.com",
    createdDate: "2024-03-12",
    expiryDate: "2027-03-12",
    healthStatus: "Healthy",
    subdomain: "fortis-gurugram",
    adminEmail: "admin@fortis.hms.com",
    adminPhone: "+91 98111 44556",
    gstin: "06AAAAA1234A1Z3",
    mrr: 380000,
    joinedDate: "2024-03-12",
    slaUptime: 99.97,
    enabledModules: ["OPD", "IPD", "OT", "Lab", "Pharmacy", "Radiology", "Telemedicine", "ABDM"],
    compliance: {
      nabh: "Full Accreditation",
      nabl: "Accredited Lab",
      hfr: "Registered & Verified",
      abdm: "Level M1, M2 & M3 Certified",
      nabhCertNo: "NABH-HOSP-2024-1044",
      nablCertNo: "NABL-LAB-2024-4411",
      hfrId: "IN061000310",
      abdmGatewayId: "ABDM-GW-1042-HR",
    },
    branding: {
      logoUrl: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=150&auto=format&fit=crop",
      primaryColor: "#1d4ed8",
      secondaryColor: "#1e40af",
      customDomain: "emr.fortis.hms.com",
      prescriptionHeader: "Fortis Heart & Vascular Institute",
      patientPortalTitle: "Fortis Patient Care Portal",
      watermarkText: "FORTIS OFFICIAL MEDICAL RECORD",
    },
    subscriptionDetail: {
      currentPlan: "Enterprise",
      startDate: "2024-03-12",
      expiryDate: "2027-03-12",
      autoRenewal: true,
      paymentStatus: "Paid",
      lastInvoice: "INV-2026-1044 (₹3,80,000)",
      billingCycle: "Annual",
    },
    suspensionHistory: [],
  },
  {
    id: "TNT-2088",
    hospitalName: "Max Super Speciality Hospital",
    hospitalType: "Multi-Specialty",
    city: "Saket",
    state: "Delhi NCR",
    address: "1 Press Enclave Road, Saket, New Delhi 110017",
    contactPerson: "Dr. Sandeep Budhiraja",
    subscriptionPlan: "Enterprise",
    status: "Active",
    activeUsers: 295,
    maxUsers: 500,
    bedCount: 430,
    maxBeds: 500,
    storageUsedGB: 520,
    maxStorageGB: 1000,
    lastActivity: "2 mins ago",
    lastLogin: "Today at 12:55 by admin@max.hms.com",
    createdDate: "2024-02-01",
    expiryDate: "2027-02-01",
    healthStatus: "Healthy",
    subdomain: "max-saket",
    adminEmail: "admin@max.hms.com",
    adminPhone: "+91 98100 22334",
    gstin: "07AAAAA2088B1Z8",
    mrr: 420000,
    joinedDate: "2024-02-01",
    slaUptime: 99.99,
    enabledModules: ["OPD", "IPD", "OT", "Lab", "Pharmacy", "Radiology", "Blood Bank", "Telemedicine", "ABDM", "CDSS AI"],
    compliance: {
      nabh: "Full Accreditation",
      nabl: "Accredited Lab",
      hfr: "Registered & Verified",
      abdm: "Level M1, M2 & M3 Certified",
      nabhCertNo: "NABH-HOSP-2024-2088",
      nablCertNo: "NABL-LAB-2024-5510",
      hfrId: "IN071002088",
      abdmGatewayId: "ABDM-GW-2088-DL",
    },
    branding: {
      logoUrl: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=150&auto=format&fit=crop",
      primaryColor: "#dc2626",
      secondaryColor: "#b91c1c",
      customDomain: "emr.maxhealthcare.in",
      prescriptionHeader: "Max Super Speciality Hospital",
      patientPortalTitle: "Max Patient Health Portal",
      watermarkText: "MAX HEALTHCARE OFFICIAL RECORD",
    },
    subscriptionDetail: {
      currentPlan: "Enterprise",
      startDate: "2024-02-01",
      expiryDate: "2027-02-01",
      autoRenewal: true,
      paymentStatus: "Paid",
      lastInvoice: "INV-2026-2088 (₹4,20,000)",
      billingCycle: "Annual",
    },
    suspensionHistory: [],
  },
  {
    id: "TNT-3105",
    hospitalName: "Manipal Hospital Whitefield",
    hospitalType: "Multi-Specialty",
    city: "Bengaluru",
    state: "Karnataka",
    address: "EPIP Zone, Whitefield, Bengaluru, Karnataka 560066",
    contactPerson: "Dr. H. Sudarshan Ballal",
    subscriptionPlan: "Professional",
    status: "Active",
    activeUsers: 88,
    maxUsers: 100,
    bedCount: 95,
    maxBeds: 100,
    storageUsedGB: 180,
    maxStorageGB: 500,
    lastActivity: "20 mins ago",
    lastLogin: "Today at 11:30 by admin@manipal.hms.com",
    createdDate: "2024-06-01",
    expiryDate: "2027-06-01",
    healthStatus: "Warning",
    subdomain: "manipal-whitefield",
    adminEmail: "admin@manipal.hms.com",
    adminPhone: "+91 80 2222 3333",
    gstin: "29AAAAA3105C1Z1",
    mrr: 120000,
    joinedDate: "2024-06-01",
    slaUptime: 99.82,
    enabledModules: ["OPD", "IPD", "Lab", "Pharmacy", "ABDM"],
    compliance: {
      nabh: "In Progress",
      nabl: "Accredited Lab",
      hfr: "Registered & Verified",
      abdm: "Level 2 Certified",
      nabhCertNo: "NABH-PEND-2026-3105",
      nablCertNo: "NABL-LAB-2024-6622",
      hfrId: "IN291003105",
      abdmGatewayId: "ABDM-GW-3105-KA",
    },
    branding: {
      logoUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=150&auto=format&fit=crop",
      primaryColor: "#7c3aed",
      secondaryColor: "#6d28d9",
      customDomain: "emr.manipal.hms.com",
      prescriptionHeader: "Manipal Hospital Whitefield",
      patientPortalTitle: "Manipal Patient Care Portal",
      watermarkText: "MANIPAL HEALTHCARE OFFICIAL RECORD",
    },
    subscriptionDetail: {
      currentPlan: "Professional",
      startDate: "2024-06-01",
      expiryDate: "2027-06-01",
      autoRenewal: true,
      paymentStatus: "Paid",
      lastInvoice: "INV-2026-3105 (₹1,20,000)",
      billingCycle: "Annual",
    },
    suspensionHistory: [],
  },
  {
    id: "TNT-4412",
    hospitalName: "Narayana Health City",
    hospitalType: "Multi-Specialty",
    city: "Bengaluru",
    state: "Karnataka",
    address: "258/A Bommasandra Industrial Area, Bengaluru, Karnataka 560099",
    contactPerson: "Dr. Devi Prasad Shetty",
    subscriptionPlan: "Enterprise",
    status: "Active",
    activeUsers: 380,
    maxUsers: 500,
    bedCount: 1400,
    maxBeds: 1500,
    storageUsedGB: 720,
    maxStorageGB: 2000,
    lastActivity: "1 min ago",
    lastLogin: "Today at 14:05 by admin@narayana.hms.com",
    createdDate: "2023-11-01",
    expiryDate: "2027-11-01",
    healthStatus: "Healthy",
    subdomain: "narayana-health",
    adminEmail: "admin@narayana.hms.com",
    adminPhone: "+91 80 7177 8000",
    gstin: "29AAAAA4412D1Z9",
    mrr: 500000,
    joinedDate: "2023-11-01",
    slaUptime: 99.99,
    enabledModules: ["OPD", "IPD", "OT", "Lab", "Pharmacy", "Radiology", "Blood Bank", "Telemedicine", "ABDM", "CDSS AI", "PACS"],
    compliance: {
      nabh: "Full Accreditation",
      nabl: "Accredited Lab",
      hfr: "Registered & Verified",
      abdm: "Level M1, M2 & M3 Certified",
      nabhCertNo: "NABH-HOSP-2024-4412",
      nablCertNo: "NABL-LAB-2024-7733",
      hfrId: "IN291004412",
      abdmGatewayId: "ABDM-GW-4412-KA",
    },
    branding: {
      logoUrl: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=150&auto=format&fit=crop",
      primaryColor: "#059669",
      secondaryColor: "#047857",
      customDomain: "emr.narayanahealth.org",
      prescriptionHeader: "Narayana Health City",
      patientPortalTitle: "Narayana Health Patient Portal",
      watermarkText: "NARAYANA HEALTH OFFICIAL RECORD",
    },
    subscriptionDetail: {
      currentPlan: "Enterprise",
      startDate: "2023-11-01",
      expiryDate: "2027-11-01",
      autoRenewal: true,
      paymentStatus: "Paid",
      lastInvoice: "INV-2026-4412 (₹5,00,000)",
      billingCycle: "Annual",
    },
    suspensionHistory: [],
  },
  {
    id: "TENANT-003",
    hospitalName: "City Diagnostics & OPD Clinic",
    hospitalType: "Clinic Chain",
    city: "Pune",
    state: "Maharashtra",
    address: "42 FC Road, Shivajinagar, Pune, Maharashtra 411005",
    contactPerson: "Dr. Amol Deshmukh",
    subscriptionPlan: "Basic",
    status: "Active",
    activeUsers: 12,
    maxUsers: 15,
    bedCount: 0,
    maxBeds: 10,
    storageUsedGB: 18,
    maxStorageGB: 50,
    lastActivity: "1 hour ago",
    lastLogin: "Today at 09:45 by admin@citydiag.hms.com",
    createdDate: "2025-01-10",
    expiryDate: "2026-12-31",
    healthStatus: "Healthy",
    subdomain: "city-diagnostics",
    adminEmail: "admin@citydiag.hms.com",
    adminPhone: "+91 20 2560 7788",
    gstin: "27AAAAA0030E1Z5",
    mrr: 14999,
    joinedDate: "2025-01-10",
    slaUptime: 99.88,
    enabledModules: ["OPD", "Lab", "Pharmacy"],
    compliance: {
      nabh: "Not Applied",
      nabl: "Accredited Lab",
      hfr: "Registered & Verified",
      abdm: "Level 2 Certified",
      nablCertNo: "NABL-LAB-2025-0030",
      hfrId: "IN270030010",
    },
    branding: {
      logoUrl: "",
      primaryColor: "#0891b2",
      secondaryColor: "#0e7490",
      customDomain: "emr.citydiag.hms.com",
      prescriptionHeader: "City Diagnostics & OPD Clinic",
      patientPortalTitle: "City Diagnostics Patient Portal",
      watermarkText: "CITY DIAGNOSTICS OFFICIAL RECORD",
    },
    subscriptionDetail: {
      currentPlan: "Basic",
      startDate: "2025-01-10",
      expiryDate: "2026-12-31",
      autoRenewal: true,
      paymentStatus: "Paid",
      lastInvoice: "INV-2026-0030 (₹14,999)",
      billingCycle: "Annual",
    },
    suspensionHistory: [],
  },
];

const enrichTenantDetails = (t: Partial<Tenant>): Tenant => {
  return {
    id: t.id || "TNT-0000",
    hospitalName: t.hospitalName || "General Healthcare Hospital",
    hospitalType: t.hospitalType || "Multi-Specialty",
    city: t.city || "Mumbai",
    state: t.state || "Maharashtra",
    address: t.address || `${t.city || "Mumbai"} Medical Enclave, Central Rd`,
    contactPerson: t.contactPerson || "Chief Medical Officer",
    subscriptionPlan: t.subscriptionPlan || "Enterprise",
    status: t.status || "Active",
    activeUsers: t.activeUsers || 50,
    maxUsers: t.maxUsers || 100,
    bedCount: t.bedCount || 150,
    maxBeds: t.maxBeds || 200,
    storageUsedGB: t.storageUsedGB || 120,
    maxStorageGB: t.maxStorageGB || 500,
    lastActivity: t.lastActivity || "10 mins ago",
    lastLogin: t.lastLogin || "Today at 10:15 AM",
    createdDate: t.createdDate || "2024-01-15",
    expiryDate: t.expiryDate || "2027-01-15",
    healthStatus: t.healthStatus || "Healthy",
    subdomain: t.subdomain || "hospital-subdomain",
    adminEmail: t.adminEmail || "admin@hospital.com",
    adminPhone: t.adminPhone || "+91 98000 11111",
    gstin: t.gstin || "27AAAAA0000A1Z5",
    mrr: t.mrr || 200000,
    joinedDate: t.joinedDate || "2024-01-15",
    slaUptime: t.slaUptime || 99.90,
    enabledModules: t.enabledModules || ["OPD", "IPD", "Pharmacy", "ABDM"],
    compliance: t.compliance || {
      nabh: "Full Accreditation",
      nabl: "Accredited Lab",
      hfr: "Registered & Verified",
      abdm: "Level M1, M2 & M3 Certified",
      nabhCertNo: "NABH-GEN-2024-88",
      hfrId: "IN27100088",
    },
    branding: t.branding || {
      primaryColor: "#0d9488",
      secondaryColor: "#0f766e",
      customDomain: `emr.${t.subdomain || "hospital"}.com`,
      prescriptionHeader: `${t.hospitalName || "Hospital"} Healthcare Group`,
      patientPortalTitle: `${t.hospitalName || "Hospital"} Patient Care Portal`,
      watermarkText: "OFFICIAL MEDICAL RECORD",
    },
    subscriptionDetail: t.subscriptionDetail || {
      currentPlan: t.subscriptionPlan || "Enterprise",
      startDate: t.joinedDate || "2024-01-15",
      expiryDate: t.expiryDate || "2027-01-15",
      autoRenewal: true,
      paymentStatus: "Paid",
      lastInvoice: "INV-2026-1002 (₹2,00,000)",
      billingCycle: "Annual",
    },
    suspensionHistory: t.suspensionHistory || [],
  };
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class TenantApiService {
  private static tenants: Tenant[] = MOCK_TENANTS.map(enrichTenantDetails);

  static async fetchTenants(
    filters: TenantFilterParams = {},
    sort: TenantSortParams = { field: "hospitalName", order: "asc" },
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedTenantResponse> {
    await delay(300);

    let result = [...this.tenants];

    if (filters.searchName && filters.searchName.trim() !== "") {
      const q = filters.searchName.trim().toLowerCase();
      result = result.filter((t) => t.hospitalName.toLowerCase().includes(q));
    }

    if (filters.searchId && filters.searchId.trim() !== "") {
      const q = filters.searchId.trim().toLowerCase();
      result = result.filter((t) => t.id.toLowerCase().includes(q));
    }

    if (filters.plan && filters.plan !== "ALL") {
      result = result.filter(
        (t) => t.subscriptionPlan.toLowerCase() === filters.plan?.toLowerCase()
      );
    }

    if (filters.status && filters.status !== "ALL") {
      result = result.filter(
        (t) => t.status.toLowerCase() === filters.status?.toLowerCase()
      );
    }

    if (filters.state && filters.state !== "ALL") {
      result = result.filter(
        (t) => t.state.toLowerCase() === filters.state?.toLowerCase()
      );
    }

    if (filters.hospitalType && filters.hospitalType !== "ALL") {
      result = result.filter(
        (t) => t.hospitalType.toLowerCase() === filters.hospitalType?.toLowerCase()
      );
    }

    if (filters.expiryFilter && filters.expiryFilter !== "all") {
      const today = new Date();
      result = result.filter((t) => {
        const exp = new Date(t.expiryDate);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (filters.expiryFilter === "expired") return diffDays < 0;
        if (filters.expiryFilter === "7days") return diffDays >= 0 && diffDays <= 7;
        if (filters.expiryFilter === "30days") return diffDays >= 0 && diffDays <= 30;
        if (filters.expiryFilter === "90days") return diffDays >= 0 && diffDays <= 90;
        return true;
      });
    }

    result.sort((a, b) => {
      let valA: string | number = a[sort.field] ?? "";
      let valB: string | number = b[sort.field] ?? "";

      if (sort.field === "expiryDate") {
        valA = new Date(a.expiryDate).getTime();
        valB = new Date(b.expiryDate).getTime();
      }

      if (valA < valB) return sort.order === "asc" ? -1 : 1;
      if (valA > valB) return sort.order === "asc" ? 1 : -1;
      return 0;
    });

    const total = result.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedTenants = result.slice(startIndex, startIndex + pageSize);

    const stats = this.calculateStats();

    return {
      tenants: paginatedTenants,
      total,
      page,
      pageSize,
      stats,
    };
  }

  static calculateStats(): TenantStats {
    const totalHospitals = this.tenants.length;
    const activeHospitals = this.tenants.filter((t) => t.status === "Active").length;
    const trialHospitals = this.tenants.filter((t) => t.status === "Trial").length;
    const expiredHospitals = this.tenants.filter((t) => t.status === "Expired").length;
    const suspendedHospitals = this.tenants.filter((t) => t.status === "Suspended").length;
    const monthlyRevenue = this.tenants.reduce((acc, curr) => acc + (curr.mrr || 0), 0);

    return {
      totalHospitals,
      activeHospitals,
      trialHospitals,
      expiredHospitals,
      suspendedHospitals,
      monthlyRevenue,
    };
  }

  static async fetchTenantById(id: string): Promise<Tenant | null> {
    await delay(200);
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) return null;
    return { ...tenant };
  }

  // --- Dynamic Tenant Health Telemetry Fetcher ---
  static async fetchTenantHealthTelemetry(id: string): Promise<TenantHealthTelemetry> {
    await delay(350);
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) throw new Error("Tenant not found");

    const isSuspendedOrOffline = tenant.status === "Suspended" || tenant.healthStatus === "Offline";
    const isWarning = tenant.healthStatus === "Warning";

    const userUtil = Math.round((tenant.activeUsers / Math.max(tenant.maxUsers, 1)) * 100);
    const bedUtil = Math.round((tenant.bedCount / Math.max(tenant.maxBeds, 1)) * 100);
    const storageUtil = Math.round((tenant.storageUsedGB / Math.max(tenant.maxStorageGB, 1)) * 100);
    const apiUtil = Math.min(100, Math.round(userUtil * 1.05));

    const incidents: ServiceDiagnosticIncident[] = [];

    if (isSuspendedOrOffline) {
      incidents.push({
        id: "INC-9001",
        serviceId: "srv-db",
        serviceName: "Isolated PostgreSQL Database Cluster",
        status: "Offline",
        errorTrace: "FATAL: Connection refused to pg-primary.tenant-isolated.internal:5432 (Governance Lockout Enforced)",
        affectedNodes: ["pg-node-01.ap-south-1", "pg-replica-02.ap-south-1"],
        lastPing: "3 mins ago",
        recommendedAction: "Restore Tenant Status to Active from Governance Console.",
      });
      incidents.push({
        id: "INC-9002",
        serviceId: "srv-api",
        serviceName: "REST & ABDM Gateway API Cluster",
        status: "Offline",
        errorTrace: "HTTP 503 Service Unavailable: Tenant Gateway Router Disabled",
        affectedNodes: ["api-gateway-node-04", "api-gateway-node-05"],
        lastPing: "1 min ago",
        recommendedAction: "Verify Tenant SSL Cert and re-enable API router.",
      });
    } else if (isWarning) {
      incidents.push({
        id: "INC-4022",
        serviceId: "srv-jobs",
        serviceName: "Background Redis Queue & Job Workers",
        status: "Warning",
        errorTrace: "WARN: Redis queue latency spike (1,420ms > 200ms threshold). 42 pending lab report sync jobs delayed.",
        affectedNodes: ["redis-worker-node-02"],
        lastPing: "30 seconds ago",
        recommendedAction: "Flush stale worker queue or scale worker pool count.",
      });
    }

    return {
      tenantId: id,
      overallStatus: isSuspendedOrOffline ? "Offline" : isWarning ? "Warning" : "Healthy",
      infrastructure: {
        database: {
          id: "srv-db",
          name: "Isolated PostgreSQL Database Cluster",
          status: isSuspendedOrOffline ? "Offline" : "Healthy",
          pingMs: isSuspendedOrOffline ? 0 : 12,
          lastCheck: "30s ago",
          errorTrace: isSuspendedOrOffline ? "Connection refused (Governance Lockout)" : undefined,
          affectedNodes: ["pg-node-01", "pg-node-02"],
          recommendedAction: isSuspendedOrOffline ? "Restore tenant status" : "Normal operations",
        },
        api: {
          id: "srv-api",
          name: "REST & ABDM Gateway API Router",
          status: isSuspendedOrOffline ? "Offline" : "Healthy",
          pingMs: isSuspendedOrOffline ? 0 : 38,
          lastCheck: "10s ago",
        },
        backgroundJobs: {
          id: "srv-jobs",
          name: "Background Worker Queue & Jobs",
          status: isSuspendedOrOffline ? "Offline" : isWarning ? "Warning" : "Healthy",
          pingMs: isWarning ? 420 : 24,
          lastCheck: "15s ago",
          errorTrace: isWarning ? "High queue latency spike detected" : undefined,
          affectedNodes: ["worker-node-02"],
          recommendedAction: "Scale worker concurrency pool",
        },
        notificationService: {
          id: "srv-notify",
          name: "SMS & WhatsApp Notification Gateway",
          status: isSuspendedOrOffline ? "Offline" : "Healthy",
          pingMs: isSuspendedOrOffline ? 0 : 45,
          lastCheck: "45s ago",
        },
        storageService: {
          id: "srv-storage",
          name: "S3 EMR & DICOM PACS Storage Bucket",
          status: isSuspendedOrOffline ? "Offline" : "Healthy",
          pingMs: isSuspendedOrOffline ? 0 : 18,
          lastCheck: "1 min ago",
        },
      },
      dataProtection: {
        lastBackupTime: isSuspendedOrOffline ? "3 days ago" : "Today at 03:00 AM (Automated)",
        backupStatus: isSuspendedOrOffline ? "Warning" : "Healthy",
        lastRestoreTest: "2026-09-01 (Passed 100% data integrity check)",
        backupRetentionStatus: "30-Day Immutable Point-in-Time Active",
        backupSizeBytes: `${(tenant.storageUsedGB * 1.12).toFixed(1)} GB`,
      },
      performance: {
        avgApiResponseTimeMs: isSuspendedOrOffline ? 0 : isWarning ? 145 : 38,
        activeSessions: isSuspendedOrOffline ? 0 : Math.round(tenant.activeUsers * 0.42),
        concurrentUsers: isSuspendedOrOffline ? 0 : Math.round(tenant.activeUsers * 0.28),
        errorRatePct: isSuspendedOrOffline ? 100 : isWarning ? 2.4 : 0.02,
      },
      usage: {
        userUtilizationPct: userUtil,
        bedUtilizationPct: bedUtil,
        storageUtilizationPct: storageUtil,
        apiUtilizationPct: apiUtil,
      },
      incidents,
    };
  }

  static async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    await delay(300);
    const index = this.tenants.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Tenant not found");

    this.tenants[index] = {
      ...this.tenants[index],
      ...updates,
    };
    return this.tenants[index];
  }

  static async suspendTenant(
    id: string,
    reason: SuspensionReason,
    reasonNotes: string,
    adminName: string = "Super Admin Console"
  ): Promise<Tenant> {
    await delay(400);
    const index = this.tenants.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Tenant not found");

    const targetTenant = this.tenants[index];

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);

    const record: SuspensionRecord = {
      id: `SUSP-${Math.floor(1000 + Math.random() * 9000)}`,
      action: "SUSPEND",
      adminName,
      date: dateStr,
      time: timeStr,
      timestamp: now.toISOString(),
      reason,
      reasonNotes,
    };

    const currentHistory = targetTenant.suspensionHistory || [];

    const updatedTenant = {
      ...targetTenant,
      status: "Suspended" as const,
      healthStatus: "Offline" as const,
      suspensionHistory: [record, ...currentHistory],
    };

    this.tenants[index] = updatedTenant;

    // Dispatch exactly one canonical audit & governance event
    GovernanceEventBus.emit({
      eventType: "TENANT_SUSPENDED",
      tenantId: id,
      tenantName: targetTenant.hospitalName,
      actor: adminName,
      actorRole: "SUPER_ADMIN",
      action: `Suspended hospital tenant: ${reason}`,
      riskLevel: "CRITICAL",
      details: {
        suspensionId: record.id,
        reason,
        reasonNotes,
        suspendedAt: record.timestamp,
      },
    });

    return this.tenants[index];
  }

  static async restoreTenant(
    id: string,
    adminName: string = "Super Admin Console"
  ): Promise<Tenant> {
    await delay(400);
    const index = this.tenants.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Tenant not found");

    const targetTenant = this.tenants[index];

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);

    const record: SuspensionRecord = {
      id: `REST-${Math.floor(1000 + Math.random() * 9000)}`,
      action: "RESTORE",
      adminName,
      date: dateStr,
      time: timeStr,
      timestamp: now.toISOString(),
      reason: "Requested by Customer",
      reasonNotes: "Tenant status restored to Active by Super Admin Console",
    };

    const currentHistory = targetTenant.suspensionHistory || [];

    const updatedTenant = {
      ...targetTenant,
      status: "Active" as const,
      healthStatus: "Healthy" as const,
      suspensionHistory: [record, ...currentHistory],
    };

    this.tenants[index] = updatedTenant;

    // Dispatch exactly one canonical audit & governance event
    GovernanceEventBus.emit({
      eventType: "TENANT_RESTORED",
      tenantId: id,
      tenantName: targetTenant.hospitalName,
      actor: adminName,
      actorRole: "SUPER_ADMIN",
      action: "Restored hospital tenant status to Active",
      riskLevel: "INFO",
      details: {
        restorationId: record.id,
        restoredAt: record.timestamp,
      },
    });

    return this.tenants[index];
  }


  static async toggleTenantModule(id: string, moduleName: string): Promise<string[]> {
    await delay(250);
    const index = this.tenants.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Tenant not found");

    const currentModules = this.tenants[index].enabledModules;
    const hasModule = currentModules.includes(moduleName);
    const newModules = hasModule
      ? currentModules.filter((m) => m !== moduleName)
      : [...currentModules, moduleName];

    this.tenants[index].enabledModules = newModules;
    return newModules;
  }

  static async updateTenantBranding(id: string, branding: Partial<TenantBrandingConfig>): Promise<TenantBrandingConfig> {
    await delay(300);
    const index = this.tenants.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Tenant not found");

    this.tenants[index].branding = {
      ...this.tenants[index].branding,
      ...branding,
    };
    return this.tenants[index].branding;
  }

  static async bulkUpdateStatus(
    ids: string[],
    newStatus: "Active" | "Suspended" | "Archived"
  ): Promise<number> {
    await delay(300);
    let count = 0;
    this.tenants = this.tenants.map((t) => {
      if (ids.includes(t.id)) {
        count++;
        return {
          ...t,
          status: newStatus,
          healthStatus: newStatus === "Suspended" || newStatus === "Archived" ? "Offline" : "Healthy",
        };
      }
      return t;
    });
    return count;
  }

  static async addTenant(newTenant: Partial<Tenant>): Promise<Tenant> {
    await delay(300);
    const id = `TNT-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullRecord = enrichTenantDetails({ ...newTenant, id });
    this.tenants.unshift(fullRecord);
    return fullRecord;
  }

  static async fetchTenantUsage(id: string): Promise<TenantUsageMetrics> {
    await delay(200);
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) throw new Error("Tenant not found");

    return {
      tenantId: id,
      activeUserSeats: { used: tenant.activeUsers, total: tenant.maxUsers },
      bedCapacity: { allocated: tenant.bedCount, total: tenant.maxBeds },
      storageUsage: { usedGB: tenant.storageUsedGB, totalGB: tenant.maxStorageGB },
      apiThroughput: `${(tenant.activeUsers * 14.5).toFixed(1)} req/sec`,
      dbSizeBytes: `${(tenant.storageUsedGB * 0.42).toFixed(1)} GB`,
      monthlyConsultations: tenant.activeUsers * 280,
      monthlyLabOrders: tenant.activeUsers * 160,
      monthlyActiveUsers: Math.round(tenant.activeUsers * 0.92),
      monthlyApiRequests: tenant.activeUsers * 12500,
    };
  }

  static async fetchTenantAuditLogs(id: string): Promise<TenantAuditLog[]> {
    await delay(250);
    return [
      {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        action: "Module Feature Update",
        performedBy: "SuperAdmin Console",
        ipAddress: "102.164.12.8",
        category: "CONFIG",
        details: `Telemedicine & ABDM M3 feature status updated for tenant ${id}`,
      },
      {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        action: "Subscription Tier Verified",
        performedBy: "admin@hospital.com",
        ipAddress: "49.37.102.19",
        category: "LICENSE",
        details: "Annual renewal invoice processed and verified ok",
      },
      {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        action: "Compliance Re-certification",
        performedBy: "Governance Sentinel",
        ipAddress: "127.0.0.1",
        category: "SECURITY",
        details: "NABH & HFR Registry certificates verified valid",
      },
    ];
  }

  static exportTenants(ids: string[] = []): string {
    const recordsToExport = ids.length > 0
      ? this.tenants.filter((t) => ids.includes(t.id))
      : this.tenants;

    const headers = [
      "Tenant ID",
      "Hospital Name",
      "Hospital Type",
      "City",
      "State",
      "Plan",
      "Status",
      "Active Users",
      "Max Users",
      "Bed Count",
      "Storage (GB)",
      "Expiry Date",
      "Health Status",
      "MRR (INR)",
    ];

    const rows = recordsToExport.map((t) => [
      t.id,
      `"${t.hospitalName}"`,
      `"${t.hospitalType}"`,
      `"${t.city}"`,
      `"${t.state}"`,
      t.subscriptionPlan,
      t.status,
      t.activeUsers,
      t.maxUsers,
      t.bedCount,
      t.storageUsedGB,
      t.expiryDate,
      t.healthStatus,
      t.mrr,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
}

export function getTenantById(tenantId: string): Tenant | undefined {
  return TenantApiService["tenants"].find((t: Tenant) => t.id === tenantId);
}

