"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NetworkBranch {
  id: string;
  branchCode: string;
  branchName: string;
  locationCity: string;
  totalBeds: number;
  occupiedBeds: number;
  icuBedsAvailable: number;
  activeDoctors: number;
  ambulancesActive: number;
  dailyRevenue: number;
  operationalStatus: "ONLINE" | "PARTIAL_CLOSED" | "SUSPENDED";
}

interface NetworkStoreState {
  branches: NetworkBranch[];
  resetToDefaults: () => void;
}

const DEFAULT_BRANCHES: NetworkBranch[] = [
  {
    id: "br-1",
    branchCode: "APOLLO-MAIN",
    branchName: "Apollo Super Speciality Hospital (Main Campus)",
    locationCity: "Bandra East, Mumbai",
    totalBeds: 250,
    occupiedBeds: 198,
    icuBedsAvailable: 6,
    activeDoctors: 42,
    ambulancesActive: 4,
    dailyRevenue: 1250000,
    operationalStatus: "ONLINE",
  },
  {
    id: "br-2",
    branchCode: "FORTIS-HEART",
    branchName: "Fortis Heart & Vascular Institute",
    locationCity: "Mulund West, Mumbai",
    totalBeds: 180,
    occupiedBeds: 142,
    icuBedsAvailable: 4,
    activeDoctors: 30,
    ambulancesActive: 3,
    dailyRevenue: 980000,
    operationalStatus: "ONLINE",
  },
  {
    id: "br-3",
    branchCode: "CITY-DIAG",
    branchName: "City OPD & Diagnostic Center",
    locationCity: "Thane West, Thane",
    totalBeds: 35,
    occupiedBeds: 18,
    icuBedsAvailable: 2,
    activeDoctors: 12,
    ambulancesActive: 1,
    dailyRevenue: 240000,
    operationalStatus: "ONLINE",
  },
];

export const useNetworkStore = create<NetworkStoreState>()(
  persist(
    (set) => ({
      branches: DEFAULT_BRANCHES,
      resetToDefaults: () => set({ branches: DEFAULT_BRANCHES }),
    }),
    {
      name: "hms_network_branches_store",
    }
  )
);
