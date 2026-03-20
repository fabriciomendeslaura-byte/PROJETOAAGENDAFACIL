"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Customer {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  appointments: { appointment_date: string }[];
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
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
        const { data } = await supabase
          .from("customers")
          .select("*, appointments(appointment_date)")
          .eq("company_id", userData.company_id)
          .order("created_at", { ascending: false });
        
        if (data) setClients(data);
      }
    }
    setLoading(false);
  }

  const getVisitStats = (appointments: { appointment_date: string }[]) => {
    if (!appointments || appointments.length === 0) {
      return { total: 0, last: "Nunca" };
    }
    const dates = appointments.map(a => new Date(a.appointment_date).getTime());
    const lastDate = new Date(Math.max(...dates));
    
    return {
      total: appointments.length,
      last: lastDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric'})
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Clientes</h2>
          <p className="text-slate-500">Acompanhe o histórico de quem visita seu negócio.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center bg-white rounded-t-xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar cliente por nome ou celular..." 
              className="pl-9 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:border-slate-300 md:text-sm text-base h-11 md:h-10" 
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto ml-auto bg-white border-slate-200 h-11 md:h-10">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
        
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nome</th>
                  <th className="px-6 py-4 font-semibold">Telefone</th>
                  <th className="px-6 py-4 font-semibold text-center">Última Visita</th>
                  <th className="px-6 py-4 font-semibold text-center">Visitas</th>
                  <th className="px-6 py-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">Carregando clientes...</td>
                  </tr>
                )}
                {!loading && clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">Nenhum cliente registrado ainda.</td>
                  </tr>
                )}
                {clients.map((client) => {
                  const stats = getVisitStats(client.appointments);
                  return (
                    <tr key={client.id} className="bg-white hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-[#0284c7] flex items-center justify-center font-bold">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          {client.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{client.phone || "-"}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{stats.last}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-slate-700 bg-slate-100 rounded-full">
                          {stats.total}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <History className="mr-2 h-4 w-4" />
                          Histórico
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {loading && <div className="p-8 text-center text-slate-500 text-sm">Carregando clientes...</div>}
            {!loading && clients.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">Nenhum cliente registrado ainda.</div>}
            {clients.map(client => {
               const stats = getVisitStats(client.appointments);
               return (
                 <div key={client.id} className="p-4 bg-white hover:bg-slate-50 transition-colors flex flex-col gap-3">
                   <div className="flex items-center gap-3">
                     <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 text-[#0284c7] flex items-center justify-center font-bold text-lg">
                       {client.name.charAt(0).toUpperCase()}
                     </div>
                     <div className="flex flex-col min-w-0 flex-1">
                       <span className="font-semibold text-slate-900 truncate text-base">{client.name}</span>
                       <span className="text-sm text-slate-500 truncate">{client.phone || "Sem telefone"}</span>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg mt-1 border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Última Visita</span>
                        <span className="text-sm font-semibold text-slate-700">{stats.last}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Total Visitas</span>
                        <span className="text-sm font-black text-[#0284c7]">{stats.total}</span>
                      </div>
                   </div>
                   <Button variant="outline" className="w-full mt-1 h-11 border-slate-200 text-blue-600 font-semibold bg-white hover:bg-blue-50">
                     <History className="mr-2 h-4 w-4" />
                     Ver Histórico
                   </Button>
                 </div>
               )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
