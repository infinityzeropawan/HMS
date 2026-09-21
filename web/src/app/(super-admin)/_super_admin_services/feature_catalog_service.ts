import {
  FeatureDefinition,
  FeatureTemplate,
  FeatureDependencyViolation,
  LicenseState,
  RouteItem,
} from "../_super_admin_types/feature_management";

export const FEATURE_CATALOG: FeatureDefinition[] = [
  // --- CLINICAL ---
  {
    id: "FEAT-CLIN-01",
    name: "OPD Consultation & Token System",
    description: "Outpatient registration, doctor queue, tokens, e-prescriptions & clinical notes",
    category: "Clinical",
    status: "Active",
    dependencies: [],
    isPremium: false,
    routeMeta: {
      allowedRoutes: [
        { path: "/dashboard", label: "General Dashboard" },
        { path: "/profile", label: "Doctor Profile" },
      ],
      hiddenRoutes: [
        { path: "/opd/widgets", label: "OPD Quick Widgets" },
      ],
      blockedRoutes: [
        { path: "/opd", label: "OPD Dashboard" },
        { path: "/doctor/queue", label: "OPD Queue Management" },
        { path: "/opd/prescriptions", label: "Prescription Management" },
        { path: "/opd/encounters", label: "Encounter Workspace" },
      ],
    },
  },
  {
    id: "FEAT-CLIN-02",
    name: "IPD Admissions & Bed Allocation",
    description: "Inpatient admission desk, ward matrix, daily rounds logs, and discharge billing",
    category: "Clinical",
    status: "Active",
    dependencies: [],
    isPremium: false,
    routeMeta: {
      allowedRoutes: [
        { path: "/dashboard", label: "General Dashboard" },
      ],
      hiddenRoutes: [
        { path: "/ipd/transfers", label: "Bed Transfer Widget" },
      ],
      blockedRoutes: [
        { path: "/ipd", label: "IPD Admissions Console" },
        { path: "/ipd/wards", label: "Ward Matrix & Bed Roster" },
        { path: "/ipd/rounds", label: "Doctor Daily Clinical Rounds" },
        { path: "/ipd/discharges", label: "Discharge Summary Manager" },
      ],
    },
  },
  {
    id: "FEAT-CLIN-03",
    name: "Operation Theatre (OT) Scheduling",
    description: "Surgical roster, PAC clearance, intra-op nurse logs, surgical billing",
    category: "Clinical",
    status: "Active",
    dependencies: ["FEAT-CLIN-02"], // Requires IPD
    isPremium: false,
    routeMeta: {
      allowedRoutes: [
        { path: "/ipd", label: "IPD Admissions Console" },
      ],
      hiddenRoutes: [
        { path: "/ot/logs", label: "Intra-Op Nurse Logs" },
      ],
      blockedRoutes: [
        { path: "/ot", label: "Operation Theatre Roster" },
        { path: "/ot/schedule", label: "Surgical Booking Console" },
        { path: "/ot/pac", label: "Pre-Anesthesia Clearance (PAC)" },
      ],
    },
  },
  {
    id: "FEAT-CLIN-04",
    name: "ICU & Critical Care Telemetry",
    description: "Intensive Care Unit monitoring, ventilator bed tracking & critical alarms",
    category: "Clinical",
    status: "Active",
    dependencies: ["FEAT-CLIN-02"], // Requires IPD
    isPremium: true,
    routeMeta: {
      allowedRoutes: [
        { path: "/ipd/wards", label: "Ward Matrix" },
      ],
      hiddenRoutes: [
        { path: "/icu/vitals", label: "ICU Telemetry Widget" },
      ],
      blockedRoutes: [
        { path: "/icu", label: "ICU Critical Care Console" },
        { path: "/icu/monitors", label: "Ventilator & Telemetry Monitor" },
        { path: "/icu/alarms", label: "Critical Alarm Central Desk" },
      ],
    },
  },
  {
    id: "FEAT-CLIN-05",
    name: "Pathology & Clinical Lab Engine",
    description: "Sample barcode collection, analyzer auto-comm & verified diagnostic reports",
    category: "Clinical",
    status: "Active",
    dependencies: [],
    isPremium: false,
    routeMeta: {
      allowedRoutes: [
        { path: "/dashboard", label: "General Dashboard" },
      ],
      hiddenRoutes: [
        { path: "/lab/analyzer", label: "Analyzer Auto-Comm Status" },
      ],
      blockedRoutes: [
        { path: "/lab", label: "Pathology Worklist" },
        { path: "/lab/samples", label: "Sample Barcode Counter" },
        { path: "/lab/reports", label: "Lab Verification & Release" },
      ],
    },
  },
  {
    id: "FEAT-CLIN-06",
    name: "Radiology & DICOM PACS Imaging",
    description: "X-Ray, CT, MRI bookings, web DICOM PACS viewer & radiologist reporting",
    category: "Clinical",
    status: "Active",
    dependencies: ["FEAT-CLIN-05"], // Requires Lab base
    isPremium: false,
    routeMeta: {
      allowedRoutes: [
        { path: "/lab", label: "Pathology Worklist" },
      ],
      hiddenRoutes: [
        { path: "/radiology/dicom-widget", label: "PACS Preview Thumbnail" },
      ],
      blockedRoutes: [
        { path: "/radiology", label: "Radiology Worklist" },
        { path: "/radiology/pacs", label: "DICOM PACS Web Viewer" },
        { path: "/radiology/reports", label: "Radiologist Diagnostic Desk" },
      ],
    },
  },
  {
    id: "FEAT-CLIN-07",
    name: "Telemedicine & Remote Care",
    description: "HD video appointments, remote vitals monitoring, e-prescriptions",
    category: "Clinical",
    status: "Active",
    dependencies: ["FEAT-CLIN-01"], // Requires OPD
    isPremium: true,
    routeMeta: {
      allowedRoutes: [
        { path: "/opd", label: "OPD Dashboard" },
      ],
      hiddenRoutes: [
        { path: "/telehealth/video-widget", label: "Video Preview Widget" },
      ],
      blockedRoutes: [
        { path: "/telehealth", label: "Telemedicine Appointments Desk" },
        { path: "/telehealth/consults", label: "HD Video Consultation Suite" },
        { path: "/telehealth/vitals-stream", label: "Remote Patient Vitals Stream" },
      ],
    },
  },
  {
    id: "FEAT-CLIN-08",
    name: "Self-Service Patient Portal App",
    description: "Patient appointment booking, lab report downloads & online payments",
    category: "Clinical",
    status: "Active",
    dependencies: ["FEAT-CLIN-01"], // Requires OPD
    isPremium: true,
    routeMeta: {
      allowedRoutes: [
        { path: "/opd/prescriptions", label: "Prescription View" },
      ],
      hiddenRoutes: [
        { path: "/patient-portal/banner", label: "Portal Download Banner" },
      ],
      blockedRoutes: [
        { path: "/patient-portal", label: "Patient Web Workspace" },
        { path: "/patient-portal/appointments", label: "Self Booking Portal" },
        { path: "/patient-portal/lab-reports", label: "Patient Report Downloads" },
      ],
    },
  },

  // --- BUSINESS ---
  {
    id: "FEAT-BIZ-01",
    name: "IPD & OPD Billing Engine",
    description: "Cash counter billing, discharge invoices, GST tax rules & payment gateways",
    category: "Business",
    status: "Active",
    dependencies: [],
    isPremium: false,
    routeMeta: {
      allowedRoutes: [
        { path: "/dashboard", label: "General Dashboard" },
      ],
      hiddenRoutes: [
        { path: "/billing/quick-tax", label: "Tax Rules Quick View" },
      ],
      blockedRoutes: [
        { path: "/billing", label: "Central Billing Console" },
        { path: "/billing/invoices", label: "Invoice Management" },
        { path: "/billing/cashier", label: "Cash Counter Counter" },
      ],
    },
  },
  {
    id: "FEAT-BIZ-02",
    name: "Insurance & TPA Cashless Desk",
    description: "Pre-authorization request, cashless claim tracking & TPA settlement",
    category: "Business",
    status: "Active",
    dependencies: ["FEAT-BIZ-01"], // Requires Billing Engine
    isPremium: false,
    routeMeta: {
      allowedRoutes: [
        { path: "/billing/invoices", label: "Invoice Management" },
      ],
      hiddenRoutes: [
        { path: "/tpa/widget", label: "Pre-Auth Quick Badge" },
      ],
      blockedRoutes: [
        { path: "/tpa", label: "TPA Cashless Desk" },
        { path: "/tpa/claims", label: "Claims Settlement Tracker" },
        { path: "/tpa/pre-auth", label: "Pre-Authorization Workspace" },
      ],
    },
  },
  {
    id: "FEAT-BIZ-03",
    name: "Pharmacy Dispensing & Batch Inventory",
    description: "Medication dispensing, stock inventory, expiry tracking & batch management",
    category: "Business",
    status: "Active",
    dependencies: ["FEAT-BIZ-01"], // Requires Billing Engine
    isPremium: false,
    routeMeta: {
      allowedRoutes: [
        { path: "/billing", label: "Central Billing Console" },
      ],
      hiddenRoutes: [
        { path: "/pharmacy/barcode", label: "Barcode Scanner Widget" },
      ],
      blockedRoutes: [
        { path: "/pharmacy", label: "Pharmacy Dispensing Counter" },
        { path: "/pharmacy/stock", label: "Batch Inventory & Expiry Monitor" },
        { path: "/pharmacy/purchase-order", label: "Medicine Purchase Orders" },
      ],
    },
  },
  {
    id: "FEAT-BIZ-04",
    name: "Staff Duty Roster & HR Console",
    description: "Doctor shift scheduling, nurse roster, attendance biometric sync & payroll",
    category: "Business",
    status: "Active",
    dependencies: [],
    isPremium: false,
    routeMeta: {
      allowedRoutes: [
        { path: "/dashboard", label: "General Dashboard" },
      ],
      hiddenRoutes: [
        { path: "/hr/biometric-widget", label: "Biometric Live Status" },
      ],
      blockedRoutes: [
        { path: "/hr", label: "HR & Roster Management" },
        { path: "/hr/roster", label: "Duty Shift Roster Console" },
        { path: "/hr/payroll", label: "Staff Payroll & Attendance Logs" },
      ],
    },
  },

  // --- INTEGRATIONS ---
  {
    id: "FEAT-INT-01",
    name: "ABDM Ayushman Bharat Gateway (M1/M2/M3)",
    description: "ABHA ID registration, Health Information Exchange, FHIR records link & gateway",
    category: "Integrations",
    status: "Active",
    dependencies: ["FEAT-CLIN-01"], // Requires OPD
    isPremium: false,
    routeMeta: {
      allowedRoutes: [
        { path: "/opd", label: "OPD Dashboard" },
      ],
      hiddenRoutes: [
        { path: "/abdm/widget", label: "ABHA Number Verification Badge" },
      ],
      blockedRoutes: [
        { path: "/abdm", label: "ABDM Integration Console" },
        { path: "/abdm/gateway", label: "M1/M2/M3 Gateway Node" },
        { path: "/abdm/abha", label: "ABHA Creation Workspace" },
      ],
    },
  },
  {
    id: "FEAT-INT-02",
    name: "Self-Service Check-in Patient Kiosks",
    description: "Queue token printing, self check-in kiosk terminals & UPI payment QR",
    category: "Integrations",
    status: "Active",
    dependencies: ["FEAT-CLIN-01"], // Requires OPD
    isPremium: true,
    routeMeta: {
      allowedRoutes: [
        { path: "/opd/tokens", label: "Token Queue" },
      ],
      hiddenRoutes: [
        { path: "/kiosks/printer", label: "Terminal Thermal Printer Status" },
      ],
      blockedRoutes: [
        { path: "/kiosks", label: "Kiosk Management Console" },
        { path: "/kiosks/terminals", label: "Self Check-in Terminals" },
      ],
    },
  },

  // --- PREMIUM ---
  {
    id: "FEAT-PREM-01",
    name: "AI Clinical Decision Support (CDSS)",
    description: "Real-time drug interaction alerts, diagnostic warnings & AI doctor assistant",
    category: "Premium",
    status: "Active",
    dependencies: ["FEAT-CLIN-01"], // Requires OPD EMR
    isPremium: true,
    routeMeta: {
      allowedRoutes: [
        { path: "/opd/prescriptions", label: "Prescription Workspace" },
      ],
      hiddenRoutes: [
        { path: "/ai-cdss/sidebar", label: "AI Clinical Sidebar" },
      ],
      blockedRoutes: [
        { path: "/ai-cdss", label: "AI Decision Support Central Engine" },
        { path: "/ai-cdss/alerts", label: "Drug Interaction Warning Matrix" },
      ],
    },
  },
  {
    id: "FEAT-PREM-02",
    name: "Blood Bank & Transfusion Management",
    description: "Donor registration, cross-matching, blood component stock & release desk",
    category: "Premium",
    status: "Active",
    dependencies: ["FEAT-CLIN-05"], // Requires Lab
    isPremium: true,
    routeMeta: {
      allowedRoutes: [
        { path: "/lab", label: "Pathology Worklist" },
      ],
      hiddenRoutes: [
        { path: "/blood-bank/stock-widget", label: "Blood Unit Quick Monitor" },
      ],
      blockedRoutes: [
        { path: "/blood-bank", label: "Blood Bank Central Console" },
        { path: "/blood-bank/donors", label: "Donor Registry Workspace" },
        { path: "/blood-bank/stock", label: "Cross-Match & Transfusion Unit" },
      ],
    },
  },
];

export const FEATURE_TEMPLATES: FeatureTemplate[] = [
  {
    id: "TMPL-CLINIC",
    name: "Small Clinic & OPD OPD Preset",
    description: "Essential modules for single doctor clinics & outpatient centers",
    targetHospitalType: "Clinic Chain",
    featureIds: ["FEAT-CLIN-01", "FEAT-BIZ-01", "FEAT-BIZ-03"],
  },
  {
    id: "TMPL-DIAGNOSTIC",
    name: "Diagnostic Center Preset",
    description: "Pathology lab, DICOM PACS radiology imaging, and pharmacy billing",
    targetHospitalType: "Single-Specialty",
    featureIds: ["FEAT-CLIN-05", "FEAT-CLIN-06", "FEAT-BIZ-01", "FEAT-BIZ-03"],
  },
  {
    id: "TMPL-MULTISPECIALTY",
    name: "Multi-Specialty Hospital Preset",
    description: "Comprehensive suite including OPD, IPD, OT, Lab, Pharmacy, Radiology & ABDM",
    targetHospitalType: "Multi-Specialty",
    featureIds: [
      "FEAT-CLIN-01",
      "FEAT-CLIN-02",
      "FEAT-CLIN-03",
      "FEAT-CLIN-05",
      "FEAT-CLIN-06",
      "FEAT-BIZ-01",
      "FEAT-BIZ-02",
      "FEAT-BIZ-03",
      "FEAT-INT-01",
    ],
  },
  {
    id: "TMPL-ENTERPRISE",
    name: "Enterprise Super-Specialty Suite",
    description: "Full suite including AI CDSS, Telemedicine, ICU Telemetry, Blood Bank & Kiosks",
    targetHospitalType: "Super-Specialty",
    featureIds: FEATURE_CATALOG.map((f) => f.id),
  },
];

export class FeatureCatalogService {
  static getCatalog(): FeatureDefinition[] {
    return [...FEATURE_CATALOG];
  }

  static getFeatureById(id: string): FeatureDefinition | undefined {
    return FEATURE_CATALOG.find((f) => f.id === id);
  }

  static getTemplates(): FeatureTemplate[] {
    return [...FEATURE_TEMPLATES];
  }

  // --- Dependency Validation Engine ---
  static validateDependencyChange(
    targetFeatureId: string,
    targetState: LicenseState,
    currentTenantAssignments: Record<string, LicenseState>
  ): FeatureDependencyViolation | null {
    const targetFeature = this.getFeatureById(targetFeatureId);
    if (!targetFeature) return null;

    // Case 1: Enabling a feature -> Check if all prerequisites are enabled
    if (targetState === "Enabled" || targetState === "Trial") {
      const missingPrerequisites: { id: string; name: string }[] = [];

      for (const depId of targetFeature.dependencies) {
        const parentState = currentTenantAssignments[depId];
        if (!parentState || parentState === "Disabled") {
          const parentFeat = this.getFeatureById(depId);
          if (parentFeat) {
            missingPrerequisites.push({ id: parentFeat.id, name: parentFeat.name });
          }
        }
      }

      if (missingPrerequisites.length > 0) {
        return {
          featureId: targetFeature.id,
          featureName: targetFeature.name,
          missingPrerequisites,
          affectedDownstream: [],
        };
      }
    }

    // Case 2: Disabling a feature -> Check if downstream features depend on this feature
    if (targetState === "Disabled") {
      const affectedDownstream: { id: string; name: string }[] = [];

      for (const feat of FEATURE_CATALOG) {
        if (feat.dependencies.includes(targetFeatureId)) {
          const childState = currentTenantAssignments[feat.id];
          if (childState === "Enabled" || childState === "Trial") {
            affectedDownstream.push({ id: feat.id, name: feat.name });
          }
        }
      }

      if (affectedDownstream.length > 0) {
        return {
          featureId: targetFeature.id,
          featureName: targetFeature.name,
          missingPrerequisites: [],
          affectedDownstream,
        };
      }
    }

    return null;
  }

  static normalizeFeatureId(featureId: string): string {
    return normalizeToCanonicalFeatureId(featureId);
  }
}

// Map short feature IDs and legacy string keys to canonical catalog IDs
export const FEATURE_ID_ALIAS_MAP: Record<string, string> = {
  // Legacy / Short Claim Feature Aliases
  "FEAT-CLIN-OPD": "FEAT-CLIN-01",
  "FEAT-CLIN-IPD": "FEAT-CLIN-02",
  "FEAT-CLIN-OT": "FEAT-CLIN-03",
  "FEAT-CLIN-ICU": "FEAT-CLIN-04",
  "FEAT-CLIN-LAB": "FEAT-CLIN-05",
  "FEAT-CLIN-PACS": "FEAT-CLIN-06",
  "FEAT-CLIN-PHARM": "FEAT-BIZ-03",
  "FEAT-CLIN-TELEMEDICINE": "FEAT-CLIN-07",
  "FEAT-CLIN-PORTAL": "FEAT-CLIN-08",
  "FEAT-BUS-BILLING": "FEAT-BIZ-01",
  "FEAT-BUS-TPA": "FEAT-BIZ-02",
  "FEAT-BUS-ROSTER": "FEAT-BIZ-04",
  "FEAT-INT-ABDM": "FEAT-INT-01",
  "FEAT-INT-KIOSK": "FEAT-INT-02",
  "FEAT-PREM-AI": "FEAT-PREM-01",
  "FEAT-PREM-BLOOD": "FEAT-PREM-02",
  "FEAT-BUS-ANALYTICS": "FEAT-BIZ-01", // Represented under Core Business / System Audit Operations (FEAT-BIZ-01)

  // Legacy String Keys Compatibility Aliases
  "opd_queue": "FEAT-CLIN-01",
  "patient_registration": "FEAT-CLIN-01",
  "eprescriptions": "FEAT-CLIN-01",
  "ipd_ward_matrix": "FEAT-CLIN-02",
  "ot_scheduler": "FEAT-CLIN-03",
  "icu_telemetry": "FEAT-CLIN-04",
  "lab_pathology": "FEAT-CLIN-05",
  "pacs_viewer": "FEAT-CLIN-06",
  "telemedicine": "FEAT-CLIN-07",
  "patient_portal": "FEAT-CLIN-08",
  "basic_billing": "FEAT-BIZ-01",
  "tpa_claims": "FEAT-BIZ-02",
  "pharmacy_fefo": "FEAT-BIZ-03",
  "staff_roster": "FEAT-BIZ-04",
  "hr_console": "FEAT-BIZ-04",
  "abdm_gateway": "FEAT-INT-01",
  "kiosk_checkin": "FEAT-INT-02",
  "cdss_ai": "FEAT-PREM-01",
  "blood_bank": "FEAT-PREM-02",

  // Identity Mappings for Canonical Catalog IDs
  "FEAT-CLIN-01": "FEAT-CLIN-01",
  "FEAT-CLIN-02": "FEAT-CLIN-02",
  "FEAT-CLIN-03": "FEAT-CLIN-03",
  "FEAT-CLIN-04": "FEAT-CLIN-04",
  "FEAT-CLIN-05": "FEAT-CLIN-05",
  "FEAT-CLIN-06": "FEAT-CLIN-06",
  "FEAT-CLIN-07": "FEAT-CLIN-07",
  "FEAT-CLIN-08": "FEAT-CLIN-08",
  "FEAT-BIZ-01": "FEAT-BIZ-01",
  "FEAT-BIZ-02": "FEAT-BIZ-02",
  "FEAT-BIZ-03": "FEAT-BIZ-03",
  "FEAT-BIZ-04": "FEAT-BIZ-04",
  "FEAT-INT-01": "FEAT-INT-01",
  "FEAT-INT-02": "FEAT-INT-02",
  "FEAT-PREM-01": "FEAT-PREM-01",
  "FEAT-PREM-02": "FEAT-PREM-02",
};

export function normalizeToCanonicalFeatureId(featureId: string): string {
  if (!featureId) return "";
  return FEATURE_ID_ALIAS_MAP[featureId] || featureId;
}

