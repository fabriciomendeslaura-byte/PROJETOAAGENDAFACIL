"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Grátis",
    price: "R$0",
    description: "Ideal para quem está começando",
    features: [
      "Até 30 agendamentos por mês",
      "Link de agendamento exclusivo",
      "Confirmação automática",
      "Integração com WhatsApp",
    ],
    buttonText: "Começar grátis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$29",
    description: "Para profissionais em crescimento",
    features: [
      "Até 200 agendamentos por mês",
      "Lembrete automático para clientes",
      "Mensagem de reconfirmação",
      "Personalização da agenda",
      "Suporte prioritário",
    ],
    buttonText: "Assinar plano",
    highlight: true,
    badge: "Mais escolhido",
  },
  {
    name: "Premium",
    price: "R$59",
    description: "Escalabilidade e automação total",
    features: [
      "Agendamentos ilimitados",
      "Follow-up após atendimento",
      "Relatórios detalhados",
      "Prioridade máxima no suporte",
      "Novas automações exclusivas",
    ],
    buttonText: "Assinar plano",
    highlight: false,
  },
];

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
          {plans.map((plan, index) => (
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
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 font-medium">/mês</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="bg-green-100 rounded-full p-0.5 mt-1">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-slate-700 text-sm leading-tight font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pb-8 pt-0">
                  <Button 
                    variant={plan.highlight ? "default" : "outline"} 
                    className={`w-full py-6 text-base font-semibold transition-all duration-300 ${
                      plan.highlight 
                        ? "bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl" 
                        : "hover:bg-slate-50 border-slate-200 rounded-xl"
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
