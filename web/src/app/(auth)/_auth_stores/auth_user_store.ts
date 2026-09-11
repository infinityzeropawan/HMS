"use client";

import { create } from "zustand";

export interface UserSession {
  userId: string;
  username: string;
  role: "RECEPTIONIST" | "DOCTOR" | "PHARMACIST" | "LAB_TECH" | "BILLER" | "ADMIN";
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

export const useAuthUserStore = create<AuthState>((set) => ({
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
}));
