"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Clock, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState("30");
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    const supabase = createClient();
    
    // Get current user's company_id
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();
        
      if (userData?.company_id) {
        setCompanyId(userData.company_id);
        const { data } = await supabase
          .from("services")
          .select("*")
          .eq("company_id", userData.company_id)
          .order("created_at", { ascending: false });
        
        if (data) setServices(data);
      }
    }
    setLoading(false);
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .insert([
        { 
          company_id: companyId, 
          name: newName, 
          duration_minutes: parseInt(newDuration), 
          price: parseFloat(newPrice.replace(',','.')) 
        }
      ])
      .select();

    if (!error && data) {
      setServices([data[0], ...services]);
      setNewName("");
      setNewDuration("30");
      setNewPrice("");
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    
    const supabase = createClient();
    const { error } = await supabase.from("services").delete().eq("id", id);
    
    if (!error) {
      setServices(services.filter(s => s.id !== id));
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando serviços...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Serviços</h2>
          <p className="text-slate-500">Gerencie os serviços oferecidos e seus valores.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1]">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-blue-200 bg-blue-50/50 mb-6">
          <CardHeader>
            <CardTitle className="text-blue-900 text-lg">Adicionar Novo Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddService} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label htmlFor="name">Nome do Serviço</Label>
                <Input id="name" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Corte de Cabelo" />
              </div>
              <div className="space-y-2 w-full sm:w-32">
                <Label htmlFor="duration">Duração (min)</Label>
                <select 
                  id="duration"
                  value={newDuration}
                  onChange={e => setNewDuration(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7]"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hora</option>
                  <option value="90">1h 30m</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
              <div className="space-y-2 w-full sm:w-32">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input id="price" required value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="0,00" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#0284c7] hover:bg-[#0369a1]">Salvar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            Nenhum serviço cadastrado ainda.
          </div>
        )}
        
        {services.map((service) => (
          <Card key={service.id} className="relative group overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg text-slate-900">{service.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {service.duration_minutes} minutos
                </div>
                <div className="flex items-center text-sm font-semibold text-slate-900">
                  <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                  R$ {Number(service.price).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isAdding && (
          <Card onClick={() => setIsAdding(true)} className="border-dashed border-2 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[160px]">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-2">
              <Plus className="h-6 w-6 text-slate-600" />
            </div>
            <span className="font-medium text-slate-700">Adicionar Serviço</span>
          </Card>
        )}
      </div>
    </div>
  );
}
