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
      logout: () =>
        set({
          user: null,
          mfaRequired: false,
          mfaSessionToken: null,
        }),
    }),
    {
      name: "hms_user_auth_session",
    }
  )
);
