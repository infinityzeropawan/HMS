"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ExtendedTenantBrandingConfig } from "../_super_admin_types/branding_types";
import { WhiteLabelService } from "../_super_admin_services/white_label_service";
import { GovernanceEventBus } from "../_super_admin_services/governance_event_bus";

interface BrandingStoreState {
  brandingByTenant: Record<string, ExtendedTenantBrandingConfig>;

  // Actions
  getBranding: (tenantId: string) => ExtendedTenantBrandingConfig;
  updateBranding: (tenantId: string, partial: Partial<ExtendedTenantBrandingConfig>) => void;
  updateLogo: (tenantId: string, logoUrl: string) => void;
  updateColors: (tenantId: string, primaryColor: string, secondaryColor: string) => void;
  updateProductName: (tenantId: string, productName: string) => void;
  updateSupportContact: (tenantId: string, email: string, phone: string) => void;
  updateWhiteLabel: (tenantId: string, partialWL: Partial<ExtendedTenantBrandingConfig["whiteLabel"]>) => void;
  updateEmailBranding: (tenantId: string, partialEB: Partial<ExtendedTenantBrandingConfig["emailBranding"]>) => void;
  updatePdfBranding: (tenantId: string, partialPB: Partial<ExtendedTenantBrandingConfig["pdfBranding"]>) => void;
}

export const useBrandingStore = create<BrandingStoreState>()(
  persist(
    (set, get) => ({
      brandingByTenant: {},

      getBranding: (tenantId: string) => {
        const existing = get().brandingByTenant[tenantId];
        if (existing) return existing;
        return WhiteLabelService.ensureCompleteBranding(tenantId);
      },

      updateBranding: (tenantId: string, partial: Partial<ExtendedTenantBrandingConfig>) => {
        set((state) => {
          const current = state.brandingByTenant[tenantId] || WhiteLabelService.ensureCompleteBranding(tenantId);
          const updated: ExtendedTenantBrandingConfig = {
            ...current,
            ...partial,
            // Sync cross-module common fields if top-level fields changed
            logoUrl: partial.logoUrl ?? current.logoUrl,
            primaryColor: partial.primaryColor ?? current.primaryColor,
            secondaryColor: partial.secondaryColor ?? current.secondaryColor,
            patientPortalTitle: partial.patientPortalTitle ?? current.patientPortalTitle,
            emailBranding: {
              ...current.emailBranding,
              ...(partial.emailBranding || {}),
              logoUrl: partial.logoUrl ?? partial.emailBranding?.logoUrl ?? current.emailBranding.logoUrl,
              primaryColor: partial.primaryColor ?? partial.emailBranding?.primaryColor ?? current.emailBranding.primaryColor,
              secondaryColor: partial.secondaryColor ?? partial.emailBranding?.secondaryColor ?? current.emailBranding.secondaryColor,
            },
            pdfBranding: {
              ...current.pdfBranding,
              ...(partial.pdfBranding || {}),
              headerLogoUrl: partial.logoUrl ?? partial.pdfBranding?.headerLogoUrl ?? current.pdfBranding.headerLogoUrl,
              accentColor: partial.primaryColor ?? partial.pdfBranding?.accentColor ?? current.pdfBranding.accentColor,
            },
            whiteLabel: {
              ...current.whiteLabel,
              ...(partial.whiteLabel || {}),
              productName: partial.patientPortalTitle ?? partial.whiteLabel?.productName ?? current.whiteLabel.productName,
            },
          };

          GovernanceEventBus.emit({
            eventType: "BRANDING_CHANGE",
            tenantId,
            tenantName: tenantId,
            actor: "SuperAdmin Pawan",
            actorRole: "SUPER_ADMIN",
            action: `Updated Unified Branding Configuration for ${tenantId}`,
            details: { primaryColor: updated.primaryColor, productName: updated.patientPortalTitle },
            riskLevel: "INFO",
          });

          return {
            brandingByTenant: {
              ...state.brandingByTenant,
              [tenantId]: updated,
            },
          };
        });
      },

      updateLogo: (tenantId: string, logoUrl: string) => {
        get().updateBranding(tenantId, { logoUrl });
      },

      updateColors: (tenantId: string, primaryColor: string, secondaryColor: string) => {
        get().updateBranding(tenantId, { primaryColor, secondaryColor });
      },

      updateProductName: (tenantId: string, productName: string) => {
        const current = get().getBranding(tenantId);
        get().updateBranding(tenantId, {
          patientPortalTitle: productName,
          whiteLabel: { ...current.whiteLabel, productName },
        });
      },

      updateSupportContact: (tenantId: string, email: string, phone: string) => {
        const current = get().getBranding(tenantId);
        get().updateBranding(tenantId, {
          emailBranding: { ...current.emailBranding, supportEmail: email, supportPhone: phone },
          whiteLabel: { ...current.whiteLabel, supportEmail: email, supportPhone: phone },
        });
      },

      updateWhiteLabel: (tenantId: string, partialWL: Partial<ExtendedTenantBrandingConfig["whiteLabel"]>) => {
        const current = get().getBranding(tenantId);
        get().updateBranding(tenantId, {
          patientPortalTitle: partialWL.productName || current.patientPortalTitle,
          whiteLabel: { ...current.whiteLabel, ...partialWL },
        });
      },

      updateEmailBranding: (tenantId: string, partialEB: Partial<ExtendedTenantBrandingConfig["emailBranding"]>) => {
        const current = get().getBranding(tenantId);
        get().updateBranding(tenantId, {
          emailBranding: { ...current.emailBranding, ...partialEB },
        });
      },

      updatePdfBranding: (tenantId: string, partialPB: Partial<ExtendedTenantBrandingConfig["pdfBranding"]>) => {
        const current = get().getBranding(tenantId);
        get().updateBranding(tenantId, {
          pdfBranding: { ...current.pdfBranding, ...partialPB },
        });
      },
    }),
    {
      name: "super_admin_unified_branding_store_v1",
    }
  )
);
