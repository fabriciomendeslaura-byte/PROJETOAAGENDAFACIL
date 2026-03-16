"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar as CalendarIcon, Clock, DollarSign, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  customers: { name: string };
  services: { name: string; price: number; duration_minutes: number };
}

export default function DashboardOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [metrics, setMetrics] = useState({ todayCount: 0, revenue: 0, newClients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    const supabase = createClient();
    const dateStr = format(new Date(), "yyyy-MM-dd");

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();
        
      if (userData?.company_id) {
        // Fetch today's appointments
        const { data: appts } = await supabase
          .from("appointments")
          .select("id, start_time, end_time, status, customers(name), services(name, price, duration_minutes)")
          .eq("company_id", userData.company_id)
          .eq("appointment_date", dateStr)
          .order("start_time", { ascending: true });
          
        if (appts) {
          setAppointments(appts as any);
          const revenue = appts.reduce((sum, app: any) => sum + (app.services?.price || 0), 0);
          setMetrics(prev => ({ ...prev, todayCount: appts.length, revenue }));
        }

        // Fetch total clients
        const { count } = await supabase
          .from("customers")
          .select("*", { count: 'exact', head: true })
          .eq("company_id", userData.company_id);
          
        if (count !== null) {
          setMetrics(prev => ({ ...prev, newClients: count }));
        }
      }
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Visão Geral</h2>
          <p className="text-slate-500">Aqui está o resumo do seu dia hoje, {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Carregando dados do painel...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Agendamentos Hoje</CardTitle>
                <CalendarIcon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{metrics.todayCount}</div>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  Agendamentos para o dia de hoje
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Clientes</CardTitle>
                <Users className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{metrics.newClients}</div>
                <p className="text-xs text-slate-500 mt-1">Registrados na plataforma</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Faturamento Previsto Hoje</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">R$ {metrics.revenue.toFixed(2).replace('.', ',')}</div>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  Baseado nos {metrics.todayCount} agendamentos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Status</CardTitle>
                <Clock className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">Ativo</div>
                <p className="text-xs text-slate-500 mt-1">Sistema operando normalmente</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Próximos Clientes Hoje</CardTitle>
                <CardDescription>
                  Você tem {appointments.length} agendamentos para hoje.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {appointments.length === 0 && (
                    <div className="text-center py-6 text-slate-500 border border-dashed rounded-md">
                      Nenhum agendamento para hoje ainda.
                    </div>
                  )}
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4 hidden sm:flex">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {apt.customers?.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none text-slate-900">{apt.customers?.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{apt.services?.name}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{apt.start_time.substring(0, 5)}</p>
                          <p className="text-xs text-slate-500">{apt.services?.duration_minutes} min</p>
                        </div>
                        <Badge variant={apt.status === "confirmed" ? "success" : "warning"} className="hidden sm:inline-flex">
                          {apt.status === "confirmed" ? "Confirmado" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Desempenho Semanal</CardTitle>
                <CardDescription>Resumo de agendamentos diários</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                {/* Simple mock chart visualization using CSS */}
                <div className="flex items-end justify-between w-full h-48 gap-2">
                  {[40, 65, 45, 80, 55, 90, 30].map((height, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="w-full relative rounded-t-sm" style={{ height: '100%' }}>
                        <div 
                          className="absolute bottom-0 w-full bg-[#0284c7] rounded-t-sm transition-all duration-500 group-hover:bg-[#0369a1]" 
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">
                        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
