export interface EmailBrandingConfig {
  logoUrl: string;
  headerBannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  supportEmail: string;
  supportPhone: string;
  senderName: string;
}

export interface PdfBrandingConfig {
  headerLogoUrl: string;
  prescriptionHeader: string;
  invoiceFooterText: string;
  watermarkText: string;
  showQrCode: boolean;
  accentColor: string;
  showDigitalSignature: boolean;
  hospitalAddressFooter: string;
}

export interface WhiteLabelConfig {
  productName: string;
  subdomain: string;
  customDomain: string;
  faviconUrl: string;
  supportEmail: string;
  supportPhone: string;
  hideVendorPoweredBy: boolean;
  cnameVerified: boolean;
  sslActive: boolean;
}

export interface ExtendedTenantBrandingConfig {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  prescriptionHeader: string;
  patientPortalTitle: string;
  watermarkText: string;
  
  // Extended configuration modules
  emailBranding: EmailBrandingConfig;
  pdfBranding: PdfBrandingConfig;
  whiteLabel: WhiteLabelConfig;
}

export type LivePreviewMode = "login" | "dashboard" | "sidebar" | "header";
export type PdfDocumentType = "invoice" | "prescription" | "lab_report" | "discharge_summary";
