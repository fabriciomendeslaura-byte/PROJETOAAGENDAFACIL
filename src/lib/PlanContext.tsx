"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PlanType, PLANS, canUseFeature, isAtLimit, getMonthlyLimit, Feature } from "./plans";

interface PlanContextType {
  plan: PlanType;
  monthlyCount: number;
  monthlyLimit: number | null;
  canUse: (feature: Feature) => boolean;
  atLimit: boolean;
  usagePercent: number;
  showUpgradeModal: boolean;
  upgradeFeature: string | null;
  openUpgradeModal: (featureName?: string) => void;
  closeUpgradeModal: () => void;
  setMonthlyCount: (count: number) => void;
}

const PlanContext = createContext<PlanContextType | null>(null);

export function PlanProvider({
  children,
  plan = 'free',
  monthlyCount = 0,
}: {
  children: ReactNode;
  plan?: PlanType;
  monthlyCount?: number;
}) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);
  const [liveMonthlyCount, setLiveMonthlyCount] = useState(monthlyCount);

  // Sync state if props change (e.g., from server)
  useEffect(() => {
    setLiveMonthlyCount(monthlyCount);
  }, [monthlyCount]);

  const limit = getMonthlyLimit(plan);
  const atLimit = isAtLimit(plan, liveMonthlyCount);
  const usagePercent = limit ? Math.min((liveMonthlyCount / limit) * 100, 100) : 0;

  const openUpgradeModal = (featureName?: string) => {
    setUpgradeFeature(featureName || null);
    setShowUpgradeModal(true);
  };

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
    setUpgradeFeature(null);
  };

  return (
    <PlanContext.Provider
      value={{
        plan,
        monthlyCount,
        monthlyLimit: limit,
        canUse: (feature: Feature) => canUseFeature(plan, feature),
        atLimit,
        usagePercent,
        showUpgradeModal,
        upgradeFeature,
        openUpgradeModal,
        closeUpgradeModal,
        setMonthlyCount: setLiveMonthlyCount,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    // Return safe defaults if used outside provider
    return {
      plan: 'free' as PlanType,
      monthlyCount: 0,
      monthlyLimit: 30,
      canUse: () => false,
      atLimit: false,
      usagePercent: 0,
      showUpgradeModal: false,
      upgradeFeature: null,
      openUpgradeModal: () => {},
      closeUpgradeModal: () => {},
      setMonthlyCount: () => {},
    };
  }
  return ctx;
}
