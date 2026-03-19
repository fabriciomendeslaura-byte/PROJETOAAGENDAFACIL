"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PLANS, PlanType } from "@/lib/plans";
import Link from "next/link";

const planOrder: PlanType[] = ['free', 'pro', 'premium'];

export function PricingSection() {
  return (
    <section id="planos" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4"
          >
            Escolha o plano ideal para automatizar sua agenda
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            Agendamentos automáticos, lembretes e confirmações para você não perder clientes.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {planOrder.map((planId, index) => {
            const plan = PLANS[planId];
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex"
              >
                <Card 
                  className={`flex flex-col w-full relative transition-all duration-300 hover:shadow-2xl border-2 ${
                    plan.highlight 
                      ? "border-[#0284c7] shadow-xl scale-105 z-10" 
                      : "border-slate-100 shadow-lg"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0284c7] text-white px-4 py-1 rounded-full text-sm font-bold">
                      {plan.badge}
                    </div>
                  )}
                  
                  <CardHeader className="pt-8">
                    <CardTitle className="text-xl font-bold text-slate-900">{plan.name}</CardTitle>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900">{plan.priceLabel}</span>
                      <span className="text-slate-500 font-medium">/mês</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pb-8">
                    <ul className="space-y-4">
                      {plan.featureLabels.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="bg-green-100 rounded-full p-0.5 mt-1 flex-shrink-0">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <span className={`${feature.includes('🤖') ? 'text-[#0284c7] font-bold' : 'text-slate-700 font-medium'} text-sm leading-tight`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pb-8 pt-0 mt-auto">
                    <Link href="/cadastro" className="w-full">
                      <Button 
                        variant={plan.highlight ? "default" : "outline"} 
                        className={`w-full py-6 text-base font-semibold transition-all duration-300 ${
                          plan.highlight 
                            ? "bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl" 
                            : "hover:bg-slate-50 border-slate-200 rounded-xl"
                        }`}
                      >
                        {planId === 'free' ? 'Começar grátis' : 'Assinar plano'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
