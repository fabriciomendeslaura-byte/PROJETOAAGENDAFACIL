"use client";

import { X, Zap, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/lib/PlanContext";
import { PLANS, getUpgradePlan, getPlanColor } from "@/lib/plans";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function UpgradeModal() {
  const { showUpgradeModal, closeUpgradeModal, upgradeFeature, plan } = usePlan();
  const upgradeTo = getUpgradePlan(plan);

  if (!upgradeTo) return null;

  const upgradePlan = PLANS[upgradeTo];
  const currentPlan = PLANS[plan];
  const colors = getPlanColor(upgradeTo);

  return (
    <AnimatePresence>
      {showUpgradeModal && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUpgradeModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className={`${colors.bg} p-6 relative`}>
                <button 
                  onClick={closeUpgradeModal}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${colors.badge} flex items-center justify-center`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Faça upgrade para o {upgradePlan.name}</h3>
                    <p className="text-sm text-slate-500">{upgradePlan.description}</p>
                  </div>
                </div>

                {upgradeFeature && (
                  <div className="mt-3 flex items-center gap-2 bg-white/80 rounded-lg p-3 border border-slate-200/50">
                    <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{upgradeFeature}</span> está disponível apenas no plano <span className="font-bold">{upgradePlan.name}</span>.
                    </p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-slate-900">{upgradePlan.priceLabel}</span>
                  <span className="text-slate-500">/mês</span>
                </div>

                <ul className="space-y-3">
                  {upgradePlan.featureLabels.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-0.5 mt-0.5 flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 flex flex-col gap-2">
                <Link href="/app/planos">
                  <Button 
                    onClick={closeUpgradeModal}
                    className="w-full h-12 text-base font-semibold bg-[#0284c7] hover:bg-[#0369a1] rounded-xl"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Fazer upgrade agora
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={closeUpgradeModal}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Agora não
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
