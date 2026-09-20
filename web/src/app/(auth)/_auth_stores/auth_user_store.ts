"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole =
  | "RECEPTIONIST"
  | "RECEPTION"
  | "DOCTOR"
  | "PHARMACIST"
  | "PHARMACY"
  | "LAB_TECH"
  | "LAB"
  | "BILLER"
  | "BILLING"
  | "NURSE"
  | "ADMIN"
  | "HOSPITAL_ADMIN"
  | "SUPER_ADMIN";

export interface UserSession {
  userId: string;
  username: string;
  role: UserRole;
  tenantId: string;
  hospitalName: string;
  token: string;
}

interface AuthState {
  user: UserSession | null;
  mfaRequired: boolean;
  mfaSessionToken: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setUserSession: (session: UserSession) => void;
  setMfaChallenge: (sessionToken: string) => void;
  logout: () => void;
}

export const useAuthUserStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      mfaRequired: false,
      mfaSessionToken: null,
      _hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      setUserSession: (session) =>
        set({
          user: session,
          mfaRequired: false,
          mfaSessionToken: null,
        }),
      setMfaChallenge: (sessionToken) =>
        set({
          mfaRequired: true,
          mfaSessionToken: sessionToken,
        }),
      logout: () => {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("hms_user_auth_session");
            sessionStorage.clear();
          } catch {
            /* ignore storage errors */
          }
        }
        set({
          user: null,
          mfaRequired: false,
          mfaSessionToken: null,
        });
      },
    }),
    {
      name: "hms_user_auth_session",
      partialize: (state) => ({
        user: state.user,
        mfaRequired: state.mfaRequired,
        mfaSessionToken: state.mfaSessionToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

