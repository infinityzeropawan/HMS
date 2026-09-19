import { TenantBrandingConfig } from "../_super_admin_types/tenant_management";
import { EmailBrandingConfig, PdfBrandingConfig, WhiteLabelConfig, ExtendedTenantBrandingConfig } from "../_super_admin_types/branding_types";

export class WhiteLabelService {
  /**
   * Generates complete default Email Branding configuration for a tenant
   */
  public static getDefaultEmailBranding(tenantName: string, primaryColor: string = "#0d9488", logoUrl?: string): EmailBrandingConfig {
    return {
      logoUrl: logoUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80",
      headerBannerUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
      primaryColor: primaryColor || "#0d9488",
      secondaryColor: "#0f766e",
      footerText: `© ${new Date().getFullYear()} ${tenantName}. All rights reserved. Confidential Healthcare Communication.`,
      supportEmail: `support@${tenantName.toLowerCase().replace(/[^a-z0-9]/g, "")}.org`,
      supportPhone: "+91 1800-425-9999",
      senderName: `${tenantName} Desk`,
    };
  }

  /**
   * Generates default PDF Document Branding configuration for a tenant
   */
  public static getDefaultPdfBranding(tenantName: string, primaryColor: string = "#0d9488", logoUrl?: string): PdfBrandingConfig {
    return {
      headerLogoUrl: logoUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80",
      prescriptionHeader: `${tenantName.toUpperCase()} MULTI-SPECIALTY HOSPITAL & RESEARCH CENTER`,
      invoiceFooterText: "Thank you for choosing our healthcare services. For billing queries, contact accounts desk.",
      watermarkText: "OFFICIAL MEDICAL RECORD",
      showQrCode: true,
      accentColor: primaryColor || "#0d9488",
      showDigitalSignature: true,
      hospitalAddressFooter: `NABH Accredited Hospital Facility | ABDM Gateway Node | GSTIN: 27AAAAA0000A1Z5`,
    };
  }

  /**
   * Generates default White Label controls for a tenant
   */
  public static getDefaultWhiteLabelConfig(tenantName: string, subdomain: string): WhiteLabelConfig {
    const cleanSub = subdomain || tenantName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return {
      productName: `${tenantName} Health Cloud`,
      subdomain: cleanSub,
      customDomain: `portal.${cleanSub}.org`,
      faviconUrl: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
      supportEmail: `care@${cleanSub}.org`,
      supportPhone: "+91 1800-111-2222",
      hideVendorPoweredBy: false,
      cnameVerified: true,
      sslActive: true,
    };
  }

  /**
   * Ensures a tenant's branding config contains all sub-structures
   */
  public static ensureCompleteBranding(tenantNameOrId: string, subdomain?: string, branding?: Partial<TenantBrandingConfig>): ExtendedTenantBrandingConfig {
    const tenantName = tenantNameOrId.startsWith("TNT") || tenantNameOrId.startsWith("TENANT") ? "Apollo Super Speciality Hospital" : tenantNameOrId;
    const sub = subdomain || "apollo";
    const primary = branding?.primaryColor || "#0d9488";
    const secondary = branding?.secondaryColor || "#0f766e";
    const logo = branding?.logoUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80";

    return {
      primaryColor: primary,
      secondaryColor: secondary,
      logoUrl: logo,
      customDomain: branding?.customDomain || `portal.${sub}.org`,
      prescriptionHeader: branding?.prescriptionHeader || `${tenantName.toUpperCase()} MEDICAL CENTER`,
      patientPortalTitle: branding?.patientPortalTitle || `${tenantName} Patient Portal`,
      watermarkText: branding?.watermarkText || "OFFICIAL MEDICAL RECORD",
      emailBranding: branding?.emailBranding || this.getDefaultEmailBranding(tenantName, primary, logo),
      pdfBranding: branding?.pdfBranding || this.getDefaultPdfBranding(tenantName, primary, logo),
      whiteLabel: branding?.whiteLabel || this.getDefaultWhiteLabelConfig(tenantName, sub),
    };
  }

  /**
   * Validates pre-save domain and SSL configuration
   */
  public static validateCustomDomain(domain: string): { valid: boolean; cnameTarget: string; message: string } {
    if (!domain || domain.trim().length === 0) {
      return { valid: false, cnameTarget: "", message: "Domain name cannot be empty." };
    }
    const cleanDomain = domain.toLowerCase().trim();
    if (cleanDomain.includes(" ") || !cleanDomain.includes(".")) {
      return { valid: false, cnameTarget: "", message: "Invalid FQDN format. Example: portal.apollo.org" };
    }
    return {
      valid: true,
      cnameTarget: "cname.hms-saas.cloud",
      message: "Domain syntax valid. Point CNAME record to cname.hms-saas.cloud to activate SSL.",
    };
  }
}
