"use client";

import { useEffect, useState, useCallback } from "react";
import { Bot, Lock, Zap, Copy, Check, Smartphone, Wifi, WifiOff, Loader2, Save, Sparkles, MessageSquare, Settings2, User2, Link2, Image as ImageIcon, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlan } from "@/lib/PlanContext";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  AgentType, ToneType, AGENT_TYPES, TONE_OPTIONS,
  generatePrompt, generateWelcomeMessage, getSimulatedConversation,
} from "@/lib/agent-prompts";

interface AgentData {
  id?: string;
  agent_name: string;
  agent_type: AgentType;
  business_name: string;
  business_description: string;
  services: string;
  prices: string;
  working_hours: string;
  tone: ToneType;
  role: string;
  custom_prompt: string;
  welcome_message: string;
  booking_link: string;
  image_url: string;
  whatsapp_status: string;
}

const DEFAULT_AGENT: AgentData = {
  agent_name: '',
  agent_type: 'agendamento',
  business_name: '',
  business_description: '',
  services: '',
  prices: '',
  working_hours: '',
  tone: 'amigavel',
  role: '',
  custom_prompt: '',
  welcome_message: '',
  booking_link: '',
  image_url: '',
  whatsapp_status: 'disconnected',
};

export default function AgenteIAPage() {
  const { plan, canUse, openUpgradeModal } = usePlan();
  const hasPremium = canUse('ai_agent');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentData>(DEFAULT_AGENT);
  const [hasExistingAgent, setHasExistingAgent] = useState(false);
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [promptCopied, setPromptCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    loadAgent();
  }, []);

  async function loadAgent() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (userData?.company_id) {
        setCompanyId(userData.company_id);

        // Get company slug for booking link
        const { data: companyData } = await supabase
          .from("companies")
          .select("slug, name")
          .eq("id", userData.company_id)
          .single();

        if (companyData) {
          setSlug(companyData.slug || '');
          setAgent(prev => ({ ...prev, business_name: prev.business_name || companyData.name || '' }));
        }

        // Check for existing agent
        const { data: agentData } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("company_id", userData.company_id)
          .limit(1)
          .single();

        if (agentData) {
          setAgent(agentData as AgentData);
          setHasExistingAgent(true);
          setStep('configure');
        }
      }
    }
    setLoading(false);
  }

  const handleSelectType = (type: AgentType) => {
    const bookingLink = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}` : '';
    const welcomeMsg = generateWelcomeMessage(agent.agent_name || 'Assistente', agent.business_name || 'Empresa', type);
    const prompt = generatePrompt({
      type,
      tone: agent.tone,
      agentName: agent.agent_name || 'Assistente',
      businessName: agent.business_name || 'Empresa',
      businessDescription: agent.business_description || '',
      services: agent.services || '',
      prices: agent.prices || '',
      workingHours: agent.working_hours || '',
      role: agent.role || '',
      bookingLink,
    });

    setAgent(prev => ({
      ...prev,
      agent_type: type,
      custom_prompt: prompt,
      welcome_message: welcomeMsg,
      booking_link: bookingLink,
    }));
    setStep('configure');
  };

  const regeneratePrompt = useCallback(() => {
    const bookingLink = agent.booking_link || (slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}` : '');
    const prompt = generatePrompt({
      type: agent.agent_type,
      tone: agent.tone,
      agentName: agent.agent_name || 'Assistente',
      businessName: agent.business_name || 'Empresa',
      businessDescription: agent.business_description || '',
      services: agent.services || '',
      prices: agent.prices || '',
      workingHours: agent.working_hours || '',
      role: agent.role || '',
      bookingLink,
    });
    setAgent(prev => ({ ...prev, custom_prompt: prompt }));
  }, [agent.agent_type, agent.tone, agent.agent_name, agent.business_name, agent.business_description, agent.services, agent.prices, agent.working_hours, agent.role, agent.booking_link, slug]);

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    const supabase = createClient();

    const agentPayload = {
      company_id: companyId,
      agent_name: agent.agent_name,
      agent_type: agent.agent_type,
      business_name: agent.business_name,
      business_description: agent.business_description,
      services: agent.services,
      prices: agent.prices,
      working_hours: agent.working_hours,
      tone: agent.tone,
      role: agent.role,
      custom_prompt: agent.custom_prompt,
      welcome_message: agent.welcome_message,
      booking_link: agent.booking_link,
      image_url: agent.image_url,
      whatsapp_status: agent.whatsapp_status,
    };

    if (agent.id) {
      await supabase.from("ai_agents").update(agentPayload).eq("id", agent.id);
    } else {
      const { data } = await supabase.from("ai_agents").insert([agentPayload]).select().single();
      if (data) setAgent(prev => ({ ...prev, id: data.id }));
    }

    setHasExistingAgent(true);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(agent.custom_prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const updateField = (field: keyof AgentData, value: string) => {
    setAgent(prev => ({ ...prev, [field]: value }));
  };

  // PREMIUM GATE
  if (!hasPremium && !loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agente de IA</h2>
        <Card className="max-w-lg mx-auto text-center py-16 border-slate-200">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Disponível apenas no plano Premium</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Crie seu agente de IA personalizado para atendimento automático no WhatsApp com o plano Premium.
              </p>
            </div>
            <Button
              onClick={() => openUpgradeModal('Agente de IA')}
              className="bg-[#0284c7] hover:bg-[#0369a1] h-12 px-8 text-base font-semibold rounded-xl"
            >
              <Zap className="w-4 h-4 mr-2" /> Fazer upgrade
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // STEP 1: SELECT AGENT TYPE
  if (step === 'select' && !hasExistingAgent) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Escolha um tipo de agente para começar</h2>
          <p className="text-slate-500 mt-2">Você pode personalizar tudo depois</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {AGENT_TYPES.map((type, i) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#0284c7] group"
                onClick={() => handleSelectType(type.id)}
              >
                <CardContent className="pt-8 pb-8 text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{type.name}</h3>
                    <p className="text-sm text-slate-500 mt-2">{type.description}</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl border-slate-200 group-hover:bg-[#0284c7] group-hover:text-white group-hover:border-[#0284c7] transition-all">
                    Selecionar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // STEP 2: CONFIGURE AGENT
  const conversation = getSimulatedConversation(agent.agent_type, agent.business_name, agent.services);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Configure seu Agente de IA 🤖</h2>
          <p className="text-slate-500">Tipo: <span className="font-semibold text-slate-700">{AGENT_TYPES.find(t => t.id === agent.agent_type)?.name}</span></p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {!hasExistingAgent && (
            <Button variant="outline" onClick={() => setStep('select')} className="flex-1 sm:flex-initial">
              ← Voltar
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-initial bg-[#0284c7] hover:bg-[#0369a1] h-11"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Agente'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* SECTION 1: Basic Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-[#0284c7]" />
              <CardTitle>Informações Básicas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome do Agente</Label>
              <Input placeholder="Ex: Luna, Max, Bia..." value={agent.agent_name} onChange={e => updateField('agent_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input value={agent.business_name} onChange={e => updateField('business_name', e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Descrição do Negócio</Label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-y"
                placeholder="Descreva brevemente o que sua empresa faz..."
                value={agent.business_description}
                onChange={e => updateField('business_description', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Service Config */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-green-600" />
              <CardTitle>Configuração do Atendimento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Serviços Oferecidos</Label>
              <Input placeholder="Ex: Corte, Barba, Hidratação..." value={agent.services} onChange={e => updateField('services', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Preços (opcional)</Label>
              <Input placeholder="Ex: Corte R$45, Barba R$30..." value={agent.prices} onChange={e => updateField('prices', e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Horário de Funcionamento</Label>
              <Input placeholder="Ex: Segunda a sexta, 9h às 18h" value={agent.working_hours} onChange={e => updateField('working_hours', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: Personality */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <CardTitle>Personalidade</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Papel do Agente (Role)</Label>
              <Input placeholder="Ex: Atendente virtual, Recepcionista digital..." value={agent.role} onChange={e => updateField('role', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tom de Voz</Label>
              <div className="grid grid-cols-3 gap-3">
                {TONE_OPTIONS.map(tone => (
                  <button
                    key={tone.id}
                    onClick={() => updateField('tone', tone.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      agent.tone === tone.id
                        ? 'border-[#0284c7] bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{tone.emoji}</span>
                    <p className={`text-sm font-semibold mt-1 ${agent.tone === tone.id ? 'text-[#0284c7]' : 'text-slate-700'}`}>{tone.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: AI Prompt */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-600" />
                <CardTitle>Prompt Inteligente</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={regeneratePrompt} className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" /> Regenerar
                </Button>
                <Button variant="outline" size="sm" onClick={copyPrompt} className="text-xs">
                  {promptCopied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {promptCopied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>
            <CardDescription>O prompt é gerado automaticamente. Edite livremente para personalizar.</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[300px] resize-y font-mono text-xs leading-relaxed"
              value={agent.custom_prompt}
              onChange={e => updateField('custom_prompt', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* SECTION 5: Welcome Message */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <CardTitle>Mensagem Inicial</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-y"
              placeholder="Mensagem de boas-vindas que o agente enviará..."
              value={agent.welcome_message}
              onChange={e => updateField('welcome_message', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* SECTION 6: Booking Link */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              <CardTitle>Link de Agendamento</CardTitle>
            </div>
            <CardDescription>Puxado automaticamente do seu sistema. Edite se necessário.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input value={agent.booking_link} onChange={e => updateField('booking_link', e.target.value)} placeholder="https://..." />
          </CardContent>
        </Card>

        {/* SECTION 7: Agent Image */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-pink-600" />
              <CardTitle>Imagem do Agente</CardTitle>
            </div>
            <CardDescription>Opcional — será usado como avatar do agente.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload value={agent.image_url} onChange={(url) => updateField('image_url', url)} />
          </CardContent>
        </Card>

        {/* SECTION 8: Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                <CardTitle>Preview do Agente</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? 'Ocultar' : 'Mostrar'} preview
              </Button>
            </div>
          </CardHeader>
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <CardContent>
                  <div className="bg-slate-50 rounded-2xl p-4 max-w-sm mx-auto border border-slate-200">
                    {/* WhatsApp-style header */}
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white overflow-hidden">
                        {agent.image_url ? (
                          <img src={agent.image_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Bot className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{agent.agent_name || 'Agente IA'}</p>
                        <p className="text-[10px] text-green-600 font-medium">Online</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3">
                      {/* Welcome message */}
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm border border-slate-100">
                          <p className="text-xs text-slate-700">{agent.welcome_message || 'Olá! 👋 Como posso te ajudar?'}</p>
                          <p className="text-[9px] text-slate-400 text-right mt-1">14:30</p>
                        </div>
                      </div>

                      {conversation.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className={`flex ${msg.role === 'client' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`rounded-2xl px-3 py-2 max-w-[85%] shadow-sm ${
                            msg.role === 'client'
                              ? 'bg-[#dcf8c6] rounded-tr-sm'
                              : 'bg-white rounded-tl-sm border border-slate-100'
                          }`}>
                            <p className="text-xs text-slate-700">{msg.message}</p>
                            <p className="text-[9px] text-slate-400 text-right mt-1">14:3{i + 1}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* SECTION 9: WhatsApp Connection */}
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <CardTitle>Conectar WhatsApp</CardTitle>
            </div>
            <CardDescription>Conecte seu WhatsApp para o agente atender seus clientes automaticamente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                agent.whatsapp_status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-400'
              }`} />
              <span className={`text-sm font-semibold ${
                agent.whatsapp_status === 'connected' ? 'text-green-700' : 'text-slate-600'
              }`}>
                {agent.whatsapp_status === 'connected' ? 'Conectado' : agent.whatsapp_status === 'waiting' ? 'Aguardando conexão...' : 'Desconectado'}
              </span>
            </div>

            {agent.whatsapp_status !== 'connected' && (
              <div className="bg-white rounded-2xl p-8 border border-green-200 text-center space-y-4">
                {/* Mock QR Code */}
                <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                  <div className="text-center">
                    <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">QR Code aparecerá aqui</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">Escaneie o QR Code com seu WhatsApp para conectar</p>
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => updateField('whatsapp_status', 'waiting')}
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  Gerar QR Code
                </Button>
                <p className="text-[10px] text-slate-400">🔮 Integração com API de WhatsApp em breve</p>
              </div>
            )}

            {agent.whatsapp_status === 'connected' && (
              <div className="bg-white rounded-2xl p-6 border border-green-200 text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Wifi className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-semibold text-green-700">WhatsApp conectado com sucesso!</p>
                <p className="text-sm text-slate-500">Seu agente está pronto para atender.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => updateField('whatsapp_status', 'disconnected')}
                >
                  <WifiOff className="w-3 h-3 mr-1" /> Desconectar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom save button */}
      <div className="sticky bottom-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0284c7] hover:bg-[#0369a1] h-12 px-8 text-base font-semibold rounded-xl shadow-xl"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Salvando...' : saved ? 'Salvo com sucesso!' : 'Salvar Agente'}
        </Button>
      </div>
    </div>
  );
}
