"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/ImageUpload";

const DAYS_OF_WEEK = [
  { id: 1, name: "Segunda-feira" },
  { id: 2, name: "Terça-feira" },
  { id: 3, name: "Quarta-feira" },
  { id: 4, name: "Quinta-feira" },
  { id: 5, name: "Sexta-feira" },
  { id: 6, name: "Sábado" },
  { id: 0, name: "Domingo" },
];

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [origin, setOrigin] = useState("");
  
  const [hours, setHours] = useState<Record<number, { active: boolean; open: string; close: string }>>({});

  useEffect(() => {
    async function fetchData() {
      setOrigin(typeof window !== 'undefined' ? window.location.origin : '');
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
          
          const { data: companyData } = await supabase
            .from("companies")
            .select("name, slug, logo_url")
            .eq("id", userData.company_id)
            .single();
            
          if (companyData) {
            setCompanyName(companyData.name);
            setSlug(companyData.slug || "");
            setLogoUrl(companyData.logo_url || "");
          }

          const { data: hoursData } = await supabase
            .from("business_hours")
            .select("*")
            .eq("company_id", userData.company_id);
            
          const hoursMap: Record<number, any> = {};
          
          DAYS_OF_WEEK.forEach(day => {
            const existing = hoursData?.find(h => h.weekday === day.id);
            if (existing) {
              hoursMap[day.id] = { active: true, open: existing.open_time.substring(0, 5), close: existing.close_time.substring(0, 5) };
            } else {
              hoursMap[day.id] = { active: false, open: "08:00", close: "18:00" };
            }
          });
          
          setHours(hoursMap);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    const supabase = createClient();

    // Update company
    await supabase.from("companies").update({ 
      name: companyName,
      logo_url: logoUrl 
    }).eq("id", companyId);

    // Update business hours (delete all current and insert active ones)
    await supabase.from("business_hours").delete().eq("company_id", companyId);
    
    const hoursToInsert = Object.entries(hours)
      .filter(([_, value]) => value.active)
      .map(([day, value]) => ({
        company_id: companyId,
        weekday: parseInt(day),
        open_time: value.open + ":00",
        close_time: value.close + ":00"
      }));

    if (hoursToInsert.length > 0) {
      await supabase.from("business_hours").insert(hoursToInsert);
    }

    setSaving(false);
    alert("Configurações salvas com sucesso!");
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando configurações...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h2>
          <p className="text-slate-500">Gerencie as informações do seu negócio e link de agendamento.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1]">
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      {slug && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-900">Seu Link de Agendamento</CardTitle>
            <CardDescription className="text-blue-700">Compartilhe este link no seu Instagram e WhatsApp para seus clientes agendarem sozinhos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-md bg-white border border-blue-200 rounded-md p-3 text-sm font-medium text-slate-700 flex items-center shadow-sm truncate">
                <span className="text-slate-400 mr-1">{origin ? `${origin}/` : 'carregando.../'}</span>{slug}
              </div>
              <Button variant="outline" className="bg-white hover:bg-slate-50 border-blue-200 text-blue-700" onClick={() => navigator.clipboard.writeText(`${origin}/${slug}`)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Link href={`/${slug}`} target="_blank">
                <Button variant="ghost" className="text-blue-700 hover:text-blue-800 hover:bg-blue-100">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Negócio</CardTitle>
            <CardDescription>Dados básicos que aparecem para seus clientes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 border-b border-slate-100 pb-6">
              <ImageUpload value={logoUrl} onChange={setLogoUrl} disabled={saving} />
              <div className="flex-1 space-y-1 text-center sm:text-left pt-2">
                <h4 className="font-semibold text-slate-900">Logo da Empresa</h4>
                <p className="text-sm text-slate-500">Este logo será exibido na sua página pública de agendamento.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            {/* Outros campos simulados */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horário de Funcionamento</CardTitle>
            <CardDescription>Defina quando os clientes podem agendar com você.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => {
                const schedule = hours[day.id] || { active: false, open: "08:00", close: "18:00" };
                return (
                  <div key={day.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-40">
                      <input 
                        type="checkbox" 
                        checked={schedule.active} 
                        onChange={(e) => setHours({ ...hours, [day.id]: { ...schedule, active: e.target.checked } })}
                        className="w-4 h-4 rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7]" 
                      />
                      <span className={`text-sm ${schedule.active ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                        {day.name}
                      </span>
                    </div>
                    {schedule.active ? (
                      <div className="flex items-center gap-2">
                        <Input type="time" value={schedule.open} onChange={(e) => setHours({ ...hours, [day.id]: { ...schedule, open: e.target.value } })} className="w-24 h-8 text-xs text-center" />
                        <span className="text-slate-400 text-sm">até</span>
                        <Input type="time" value={schedule.close} onChange={(e) => setHours({ ...hours, [day.id]: { ...schedule, close: e.target.value } })} className="w-24 h-8 text-xs text-center" />
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 italic">Fechado</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
