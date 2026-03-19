"use client";

import { createContext, useContext, useState, ReactNode } from "react";
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

  const limit = getMonthlyLimit(plan);
  const atLimit = isAtLimit(plan, monthlyCount);
  const usagePercent = limit ? Math.min((monthlyCount / limit) * 100, 100) : 0;

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
    };
  }
  return ctx;
}
