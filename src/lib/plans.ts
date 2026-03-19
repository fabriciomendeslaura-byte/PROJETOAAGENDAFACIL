export type PlanType = 'free' | 'pro' | 'premium';

export type Feature = 
  | 'booking_link'
  | 'whatsapp_confirmation'
  | 'whatsapp_connection'
  | 'auto_reminder'
  | 'auto_reconfirmation'
  | 'cancellation_link'
  | 'basic_customization'
  | 'auto_followup'
  | 'auto_reschedule'
  | 'reports'
  | 'full_automations';

export interface PlanDefinition {
  id: PlanType;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  monthlyLimit: number | null; // null = unlimited
  features: Feature[];
  featureLabels: string[];
  highlight: boolean;
  badge?: string;
}

export const PLANS: Record<PlanType, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Grátis',
    price: 0,
    priceLabel: 'R$0',
    description: 'Ideal para quem está começando',
    monthlyLimit: 30,
    features: ['booking_link', 'whatsapp_confirmation', 'whatsapp_connection'],
    featureLabels: [
      'Até 30 agendamentos por mês',
      'Link de agendamento exclusivo',
      'Confirmação automática via WhatsApp',
      'Conexão com 1 WhatsApp',
    ],
    highlight: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceLabel: 'R$29',
    description: 'Para profissionais em crescimento',
    monthlyLimit: 200,
    features: [
      'booking_link', 'whatsapp_confirmation', 'whatsapp_connection',
      'auto_reminder', 'auto_reconfirmation', 'cancellation_link', 'basic_customization',
    ],
    featureLabels: [
      'Até 200 agendamentos por mês',
      'Tudo do plano Grátis',
      'Lembrete automático 24h antes',
      'Reconfirmação automática',
      'Cancelamento via link',
      'Personalização básica',
    ],
    highlight: true,
    badge: 'Mais escolhido',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 59,
    priceLabel: 'R$59',
    description: 'Escalabilidade e automação total',
    monthlyLimit: null,
    features: [
      'booking_link', 'whatsapp_confirmation', 'whatsapp_connection',
      'auto_reminder', 'auto_reconfirmation', 'cancellation_link', 'basic_customization',
      'auto_followup', 'auto_reschedule', 'reports', 'full_automations',
    ],
    featureLabels: [
      'Agendamentos ilimitados',
      'Tudo do plano Pro',
      'Follow-up automático pós-atendimento',
      'Reagendamento automático',
      'Relatórios detalhados',
      'Automações completas',
    ],
    highlight: false,
  },
};

export function canUseFeature(plan: PlanType, feature: Feature): boolean {
  return PLANS[plan]?.features.includes(feature) ?? false;
}

export function getMonthlyLimit(plan: PlanType): number | null {
  return PLANS[plan]?.monthlyLimit ?? 30;
}

export function isAtLimit(plan: PlanType, currentCount: number): boolean {
  const limit = getMonthlyLimit(plan);
  if (limit === null) return false; // unlimited
  return currentCount >= limit;
}

export function getUpgradePlan(currentPlan: PlanType): PlanType | null {
  if (currentPlan === 'free') return 'pro';
  if (currentPlan === 'pro') return 'premium';
  return null;
}

export function getPlanColor(plan: PlanType): { bg: string; text: string; border: string; badge: string } {
  switch (plan) {
    case 'premium':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' };
    case 'pro':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', badge: 'bg-slate-200 text-slate-700' };
  }
}
