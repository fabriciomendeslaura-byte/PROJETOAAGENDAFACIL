"use client";

import { Check, Lock, Zap, Crown, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { usePlan } from "@/lib/PlanContext";
import { PLANS, PlanType, getPlanColor } from "@/lib/plans";

const ALL_FEATURES = [
  { key: 'booking_link', label: 'Link de agendamento exclusivo', plans: ['free', 'pro', 'premium'] },
  { key: 'whatsapp_confirmation', label: 'Confirmação automática via WhatsApp', plans: ['free', 'pro', 'premium'] },
  { key: 'whatsapp_connection', label: 'Conexão com 1 WhatsApp', plans: ['free', 'pro', 'premium'] },
  { key: 'auto_reminder', label: 'Lembrete automático 24h antes', plans: ['pro', 'premium'] },
  { key: 'auto_reconfirmation', label: 'Reconfirmação automática', plans: ['pro', 'premium'] },
  { key: 'cancellation_link', label: 'Cancelamento via link', plans: ['pro', 'premium'] },
  { key: 'basic_customization', label: 'Personalização básica', plans: ['pro', 'premium'] },
  { key: 'auto_followup', label: 'Follow-up automático pós-atendimento', plans: ['premium'] },
  { key: 'auto_reschedule', label: 'Reagendamento automático', plans: ['premium'] },
  { key: 'reports', label: 'Relatórios detalhados', plans: ['premium'] },
  { key: 'full_automations', label: 'Automações completas', plans: ['premium'] },
];

const planOrder: PlanType[] = ['free', 'pro', 'premium'];
const planIcons = { free: Star, pro: Zap, premium: Crown };

export default function PlanosPage() {
  const { plan: currentPlan, monthlyCount, monthlyLimit, usagePercent, openUpgradeModal } = usePlan();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Planos</h2>
        <p className="text-slate-500">Escolha o plano ideal para o seu negócio crescer.</p>
      </div>

      {/* Current Plan Summary */}
      <Card className="border-[#0284c7]/20 bg-gradient-to-r from-blue-50/50 to-cyan-50/50">
        <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${getPlanColor(currentPlan).badge} flex items-center justify-center`}>
              {(() => { const Icon = planIcons[currentPlan]; return <Icon className="w-5 h-5" />; })()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Plano {PLANS[currentPlan].name}</p>
              {monthlyLimit ? (
                <p className="text-xs text-slate-500">{monthlyCount}/{monthlyLimit} agendamentos usados este mês</p>
              ) : (
                <p className="text-xs text-slate-500">{monthlyCount} agendamentos este mês — Ilimitado</p>
              )}
            </div>
          </div>
          {monthlyLimit && (
            <div className="w-full sm:w-48">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercent}%` }}
                  className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                />
              </div>
              <p className="text-[10px] text-right mt-1 font-bold text-slate-400">{Math.round(usagePercent)}% usado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {planOrder.map((planId, index) => {
          const p = PLANS[planId];
          const isCurrentPlan = currentPlan === planId;
          const colors = getPlanColor(planId);
          const Icon = planIcons[planId];

          return (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex"
            >
              <Card className={`flex flex-col w-full relative transition-all duration-300 hover:shadow-2xl border-2 ${
                isCurrentPlan
                  ? "border-[#0284c7] shadow-xl ring-2 ring-[#0284c7]/20"
                  : p.highlight
                  ? "border-[#0284c7]/50 shadow-lg"
                  : "border-slate-100 shadow-lg"
              }`}>
                {isCurrentPlan && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0284c7] text-white px-4 py-1 rounded-full text-xs font-bold">
                    Seu plano atual
                  </div>
                )}
                {!isCurrentPlan && p.badge && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                    {p.badge}
                  </div>
                )}

                <CardHeader className="pt-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${colors.badge} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{p.name}</CardTitle>
                  </div>
                  <p className="text-sm text-slate-500">{p.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">{p.priceLabel}</span>
                    <span className="text-slate-500 font-medium">/mês</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-6">
                  <ul className="space-y-3">
                    {p.featureLabels.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="bg-green-100 rounded-full p-0.5 mt-0.5 flex-shrink-0">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span className="text-sm text-slate-700 font-medium leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pb-8 pt-0">
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full py-5 text-base font-semibold rounded-xl border-slate-200" disabled>
                      Plano atual
                    </Button>
                  ) : (
                    <Button
                      variant={p.highlight || planOrder.indexOf(planId) > planOrder.indexOf(currentPlan) ? "default" : "outline"}
                      className={`w-full py-5 text-base font-semibold rounded-xl transition-all duration-300 ${
                        planOrder.indexOf(planId) > planOrder.indexOf(currentPlan)
                          ? "bg-[#0284c7] hover:bg-[#0369a1] text-white"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                      onClick={() => openUpgradeModal()}
                    >
                      {planOrder.indexOf(planId) > planOrder.indexOf(currentPlan) ? (
                        <><Zap className="w-4 h-4 mr-2" /> Fazer upgrade</>
                      ) : (
                        "Mudar plano"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 w-1/2">Funcionalidade</th>
                  {planOrder.map(pId => (
                    <th key={pId} className={`text-center py-3 px-4 font-bold ${currentPlan === pId ? 'text-[#0284c7]' : 'text-slate-700'}`}>
                      {PLANS[pId].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((feat, i) => (
                  <tr key={feat.key} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                    <td className="py-3 px-4 text-slate-700 font-medium">{feat.label}</td>
                    {planOrder.map(pId => (
                      <td key={pId} className="text-center py-3 px-4">
                        {feat.plans.includes(pId) ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 rounded-full">
                            <Lock className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
