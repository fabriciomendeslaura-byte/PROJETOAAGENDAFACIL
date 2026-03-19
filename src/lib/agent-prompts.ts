export type AgentType = 'sdr' | 'agendamento' | 'suporte';
export type ToneType = 'formal' | 'amigavel' | 'descontraido';

export interface AgentTypeOption {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const AGENT_TYPES: AgentTypeOption[] = [
  {
    id: 'sdr',
    name: 'SDR',
    description: 'Qualifica leads e direciona para atendimento ou agendamento',
    icon: '🎯',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'agendamento',
    name: 'Agendamento',
    description: 'Focado em marcar horários e enviar link de agendamento',
    icon: '📅',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'suporte',
    name: 'Suporte',
    description: 'Responde dúvidas e ajuda clientes',
    icon: '💬',
    color: 'from-purple-500 to-violet-600',
  },
];

export const TONE_OPTIONS: { id: ToneType; label: string; emoji: string }[] = [
  { id: 'formal', label: 'Formal', emoji: '👔' },
  { id: 'amigavel', label: 'Amigável', emoji: '😊' },
  { id: 'descontraido', label: 'Descontraído', emoji: '😎' },
];

function getToneDescription(tone: ToneType): string {
  switch (tone) {
    case 'formal': return 'Use linguagem profissional, clara e objetiva. Trate por "senhor(a)" e evite gírias.';
    case 'amigavel': return 'Use linguagem amigável e acolhedora. Trate pelo nome e seja simpático, mas profissional.';
    case 'descontraido': return 'Use linguagem descontraída e natural. Use emojis e expressões informais. Seja divertido.';
  }
}

export function generatePrompt(params: {
  type: AgentType;
  tone: ToneType;
  agentName: string;
  businessName: string;
  businessDescription: string;
  services: string;
  prices: string;
  workingHours: string;
  role: string;
  bookingLink: string;
}): string {
  const { type, tone, agentName, businessName, businessDescription, services, prices, workingHours, role, bookingLink } = params;
  
  const toneDesc = getToneDescription(tone);

  // Type-specific sections
  let objective = '';
  let flow = '';
  let qualificationCriteria = '';
  let disqualificationCriteria = '';

  switch (type) {
    case 'sdr':
      objective = `Você é ${agentName}, um SDR virtual de ${businessName}. Seu papel é qualificar leads que entram em contato pelo WhatsApp, entender suas necessidades, apresentar os serviços e direcionar para agendamento quando qualificados.`;
      flow = `1. Cumprimente o lead e pergunte como pode ajudar
2. Identifique o que o lead procura
3. Apresente os serviços relevantes de ${businessName}
4. Verifique os critérios de qualificação
5. Se qualificado: envie o link de agendamento
6. Se não qualificado: agradeça e ofereça alternativas
7. Finalize com uma mensagem positiva`;
      qualificationCriteria = `- Demonstra interesse real em um dos serviços
- Está na região de atendimento
- Tem disponibilidade para agendar`;
      disqualificationCriteria = `- Não tem interesse nos serviços oferecidos
- Está apenas pesquisando preços sem intenção real
- Não está na região de atendimento`;
      break;

    case 'agendamento':
      objective = `Você é ${agentName}, assistente de agendamento de ${businessName}. Seu único foco é ajudar clientes a marcar, remarcar ou cancelar horários de forma rápida e eficiente.`;
      flow = `1. Cumprimente e pergunte qual serviço deseja agendar
2. Informe os horários disponíveis
3. Confirme os dados (nome, telefone, serviço, data e hora)
4. Envie o link de agendamento: ${bookingLink || '[link]'}
5. Confirme o agendamento e envie um resumo
6. Pergunte se precisa de algo mais`;
      qualificationCriteria = `- Deseja agendar um serviço
- Tem disponibilidade nos horários oferecidos`;
      disqualificationCriteria = `- Não deseja agendar nenhum serviço
- Nenhum horário é conveniente`;
      break;

    case 'suporte':
      objective = `Você é ${agentName}, assistente de suporte de ${businessName}. Sua missão é responder dúvidas dos clientes sobre serviços, preços, horários e procedimentos de forma clara e prestativa.`;
      flow = `1. Cumprimente e pergunte como pode ajudar
2. Identifique a dúvida do cliente
3. Forneça a resposta de forma clara e objetiva
4. Se necessário, direcione para agendamento
5. Pergunte se ficou alguma dúvida
6. Finalize com uma mensagem positiva`;
      qualificationCriteria = `- Tem uma dúvida legítima sobre os serviços
- Demonstra interesse em utilizar os serviços`;
      disqualificationCriteria = `- Mensagens de spam ou fora de contexto
- Assuntos não relacionados ao negócio`;
      break;
  }

  return `## SEU OBJETIVO
${objective}

## TOM DE VOZ
${toneDesc}

## FLUXO DE CONVERSA
${flow}

## CRITÉRIOS DE QUALIFICAÇÃO
${qualificationCriteria}

## CRITÉRIOS DE DESQUALIFICAÇÃO
${disqualificationCriteria}

## INFORMAÇÕES DO NEGÓCIO
- **Empresa:** ${businessName}
- **Descrição:** ${businessDescription}
- **Serviços:** ${services}
- **Preços:** ${prices || 'Consultar na hora do agendamento'}
- **Horário:** ${workingHours}
- **Link de agendamento:** ${bookingLink || '[informar link]'}

## REGRAS IMPORTANTES
1. NUNCA invente informações. Se não souber, diga que vai verificar.
2. NUNCA compartilhe dados pessoais de outros clientes.
3. Seja breve e direto nas respostas.
4. Se o cliente pedir algo fora do escopo, redirecione educadamente.
5. Sempre ofereça o link de agendamento quando apropriado.
6. Responda SEMPRE no idioma do cliente (português).
7. ${role ? `Seu papel específico: ${role}` : 'Atue como um assistente virtual profissional.'}`;
}

export function generateWelcomeMessage(agentName: string, businessName: string, type: AgentType): string {
  switch (type) {
    case 'sdr':
      return `Olá! 👋 Sou ${agentName}, assistente virtual de ${businessName}. Posso te ajudar a conhecer nossos serviços e encontrar o melhor para você. Como posso te ajudar?`;
    case 'agendamento':
      return `Olá! 👋 Sou ${agentName}, assistente de agendamento de ${businessName}. Posso te ajudar a marcar seu horário agora mesmo! Qual serviço você gostaria de agendar?`;
    case 'suporte':
      return `Olá! 👋 Sou ${agentName}, assistente de ${businessName}. Estou aqui para responder suas dúvidas. Como posso te ajudar?`;
  }
}

export function getSimulatedConversation(type: AgentType, businessName: string, services: string): { role: 'client' | 'agent'; message: string }[] {
  const serviceName = services?.split(',')[0]?.trim() || 'serviço';

  switch (type) {
    case 'sdr':
      return [
        { role: 'client', message: 'Oi, quero saber mais sobre os serviços de vocês' },
        { role: 'agent', message: `Olá! 😊 Que bom que entrou em contato com ${businessName}! Oferecemos ${services || 'diversos serviços'}. Qual deles te interessa mais?` },
        { role: 'client', message: `Quanto custa ${serviceName}?` },
        { role: 'agent', message: `Ótima escolha! O ${serviceName} é um dos nossos mais procurados. Posso te enviar o link para você agendar e ver os detalhes completos. Quer fazer isso agora?` },
      ];
    case 'agendamento':
      return [
        { role: 'client', message: 'Quero agendar um horário' },
        { role: 'agent', message: `Claro! 📅 Em ${businessName} temos ${services || 'diversos serviços'}. Qual serviço você gostaria de agendar?` },
        { role: 'client', message: serviceName },
        { role: 'agent', message: `Perfeito! Vou te enviar o link para agendar seu ${serviceName}. Lá você pode escolher o melhor dia e horário. 😉` },
      ];
    case 'suporte':
      return [
        { role: 'client', message: `Quanto custa ${serviceName}?` },
        { role: 'agent', message: `Olá! Obrigado pelo interesse no ${serviceName}! Os valores podem variar de acordo com suas necessidades. Posso te enviar nosso link de agendamento para você conferir todas as opções?` },
        { role: 'client', message: 'Vocês funcionam no sábado?' },
        { role: 'agent', message: `Ótima pergunta! Nosso horário de funcionamento completo está disponível na nossa página de agendamento. Posso te enviar o link agora? 😊` },
      ];
  }
}
