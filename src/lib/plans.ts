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
  | 'full_automations'
  | 'ai_agent'
  | 'multiple_agents'
  | 'advanced_automations'
  | 'advanced_reports'
  | 'priority_support';

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
    description: 'Para quem está começando',
    monthlyLimit: 30,
    features: ['booking_link', 'whatsapp_confirmation', 'auto_reminder', 'whatsapp_connection'],
    featureLabels: [
      'Até 30 agendamentos por mês',
      'Link de agendamento',
      'Confirmação automática via WhatsApp',
      'Lembrete automático para clientes',
      'Conexão com 1 WhatsApp',
    ],
    highlight: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 57,
    priceLabel: 'R$57',
    description: 'Para profissionais em crescimento',
    monthlyLimit: 200,
    features: [
      'booking_link', 'whatsapp_confirmation', 'auto_reminder', 'whatsapp_connection',
      'auto_reconfirmation', 'cancellation_link', 'auto_followup', 'reports', 'basic_customization',
    ],
    featureLabels: [
      'Até 200 agendamentos por mês',
      'Tudo do plano Grátis',
      'Lembrete automático',
      'Reconfirmação automática',
      'Cancelamento via link',
      'Follow-up automático após atendimento',
      'Relatórios básicos',
      'Personalização básica',
    ],
    highlight: false,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 137,
    priceLabel: 'R$137',
    description: 'Escalabilidade e atendimento automático',
    monthlyLimit: null,
    features: [
      'booking_link', 'whatsapp_confirmation', 'auto_reminder', 'whatsapp_connection',
      'auto_reconfirmation', 'cancellation_link', 'auto_followup', 'reports', 'basic_customization',
      'ai_agent', 'multiple_agents', 'advanced_automations', 'advanced_reports', 'priority_support',
      'auto_reschedule', 'full_automations'
    ],
    featureLabels: [
      'Agendamentos ilimitados',
      'Tudo do plano Pro',
      '🤖 Agente de IA que atende seus clientes automaticamente no WhatsApp',
      'Atendimento automático com IA (preparado para integração)',
      'Múltiplos agentes (opcional futuro)',
      'Automações avançadas',
      'Relatórios avançados',
      'Prioridade de suporte',
    ],
    highlight: true,
    badge: 'Mais completo',
  },
};

export function canUseFeature(plan: PlanType, feature: Feature): boolean {
  return PLANS[plan]?.features.includes(feature) ?? false;
}

export function getMonthlyLimit(plan: PlanType): number | null {
  const planDef = PLANS[plan];
  if (!planDef) return 30;
  return planDef.monthlyLimit;
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
