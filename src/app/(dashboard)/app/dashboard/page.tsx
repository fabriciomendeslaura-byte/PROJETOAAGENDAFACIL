"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar as CalendarIcon, Clock, DollarSign, ArrowUpRight, Zap, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format, subDays, startOfDay, endOfDay, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { usePlan } from "@/lib/PlanContext";
import { PLANS, getPlanColor } from "@/lib/plans";
import Link from "next/link";

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  customers: { name: string };
  services: { name: string; price: number; duration_minutes: number };
  serviço?: string;
}

export default function DashboardOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('today');
  const [weeklyData, setWeeklyData] = useState<{ day: string, count: number, date: Date }[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [metrics, setMetrics] = useState({ todayCount: 0, revenue: 0, newClients: 0, periodRevenue: 0, periodCount: 0 });
  const [loading, setLoading] = useState(true);
  const { plan, monthlyCount, monthlyLimit, usagePercent, openUpgradeModal } = usePlan();
  const planDef = PLANS[plan];
  const colors = getPlanColor(plan);
  
  // Group appointments by date for week/month view
  const groupedAppointments = appointments.reduce((groups: Record<string, Appointment[]>, appointment) => {
    // Assuming appointment has a date field or we use today's date if not present
    // Let's modify the fetch to include appointment_date
    return groups;
  }, {});

  useEffect(() => {
    fetchDashboardData();
  }, [viewMode]);

  async function fetchDashboardData() {
    setLoading(true);
    const supabase = createClient();
    const now = new Date();
    
    let startDate: Date;
    let endDate: Date;

    if (viewMode === 'today') {
      startDate = startOfDay(now);
      endDate = endOfDay(now);
    } else if (viewMode === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }

    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();
        
      if (userData?.company_id) {
        // Fetch appointments for the selected period
        const { data: appts } = await supabase
          .from("appointments")
          .select("id, appointment_date, start_time, end_time, status, serviço, customers(name), services(name, price, duration_minutes)")
          .eq("company_id", userData.company_id)
          .gte("appointment_date", startStr)
          .lte("appointment_date", endStr)
          .neq("status", "cancelled")
          .order("appointment_date", { ascending: true })
          .order("start_time", { ascending: true });
          
        if (appts) {
          setAppointments(appts as any);
          const revenue = appts.reduce((sum, app: any) => sum + (app.services?.price || 0), 0);
          
          if (viewMode === 'today') {
            setMetrics(prev => ({ ...prev, todayCount: appts.length, revenue, periodRevenue: revenue, periodCount: appts.length }));
          } else {
            setMetrics(prev => ({ ...prev, periodRevenue: revenue, periodCount: appts.length }));
            
            // Still need today's stats for the cards if not in today view? 
            // Let's fetch today's separately or filter if today is in range
            const todayStr = format(now, "yyyy-MM-dd");
            const todayAppts = appts.filter((a: any) => a.appointment_date === todayStr);
            const todayRevenue = todayAppts.reduce((sum, app: any) => sum + (app.services?.price || 0), 0);
            setMetrics(prev => ({ ...prev, todayCount: todayAppts.length, revenue: todayRevenue }));
          }
        }

        // Fetch weekly appointments for chart - Always weekly
        const startOfMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfMonday, i));
        
        const { data: weeklyAppts } = await supabase
          .from("appointments")
          .select("appointment_date")
          .eq("company_id", userData.company_id)
          .gte("appointment_date", format(weekDays[0], "yyyy-MM-dd"))
          .lte("appointment_date", format(weekDays[6], "yyyy-MM-dd"))
          .neq("status", "cancelled");

        const chartData = weekDays.map(date => {
          const count = weeklyAppts?.filter(a => isSameDay(new Date(a.appointment_date + 'T12:00:00'), date)).length || 0;
          return {
            day: format(date, "EEE", { locale: ptBR }).replace('.', ''),
            count,
            date
          };
        });
        setWeeklyData(chartData);

        // Fetch total clients
        const { count } = await supabase
          .from("customers")
          .select("*", { count: 'exact', head: true })
          .eq("company_id", userData.company_id);
          
        if (count !== null) {
          setMetrics(prev => ({ ...prev, newClients: count }));
        }

        // Fetch upcoming appointments (next 5)
        const { data: upcoming } = await supabase
          .from("appointments")
          .select("id, appointment_date, start_time, end_time, status, serviço, customers(name), services(name, price, duration_minutes)")
          .eq("company_id", userData.company_id)
          .gte("appointment_date", format(now, "yyyy-MM-dd"))
          .neq("status", "cancelled")
          .order("appointment_date", { ascending: true })
          .order("start_time", { ascending: true })
          .limit(5);

        if (upcoming) {
          setUpcomingAppointments(upcoming as any);
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative overflow-hidden group border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CalendarIcon className="h-12 w-12 text-blue-600" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {viewMode === 'today' ? 'Agendamentos Hoje' : `Agendamentos ${viewMode === 'week' ? 'da Semana' : 'do Mês'}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{metrics.periodCount}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((metrics.periodCount / (viewMode === 'today' ? 10 : viewMode === 'week' ? 50 : 200)) * 100, 100)}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-blue-600">{Math.round((metrics.periodCount / (viewMode === 'today' ? 10 : viewMode === 'week' ? 50 : 200)) * 100)}% da meta</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Card className="border-slate-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Clientes</CardTitle>
                <Users className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{metrics.newClients}</div>
                <p className="text-xs text-slate-500 mt-1">Base de clientes ativa</p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {viewMode === 'today' ? 'Faturamento Hoje' : `Faturamento ${viewMode === 'week' ? 'da Semana' : 'do Mês'}`}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">R$ {metrics.periodRevenue.toFixed(2).replace('.', ',')}</div>
                <div className="flex items-center gap-1 mt-1 text-green-600 font-bold text-[10px]">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{viewMode === 'today' ? 'Em tempo real' : 'Total no período'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Plan Usage Card */}
            <Card className={`relative overflow-hidden group ${colors.border} ${colors.bg}`}>
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown className="h-12 w-12" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Seu Plano</CardTitle>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                  {planDef.name.toUpperCase()}
                </span>
              </CardHeader>
              <CardContent>
                {monthlyLimit ? (
                  <>
                    <div className="text-2xl font-bold text-slate-900">
                      {monthlyCount}<span className="text-base font-medium text-slate-400">/{monthlyLimit}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${usagePercent}%` }}
                          className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${usagePercent >= 90 ? 'text-red-600' : 'text-slate-500'}`}>
                        {Math.round(usagePercent)}%
                      </span>
                    </div>
                    {plan !== 'premium' && (
                      <button
                        onClick={() => openUpgradeModal()}
                        className="mt-2 text-[10px] font-bold text-[#0284c7] hover:text-[#0369a1] flex items-center gap-1 transition-colors"
                      >
                        <Zap className="w-3 h-3" /> Fazer upgrade
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-900">Ilimitado</div>
                    <p className="text-xs text-slate-500 mt-1">{monthlyCount} agendamentos este mês</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex bg-slate-100/50 p-1 rounded-xl w-fit mb-6">
            {(['today', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === mode 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {mode === 'today' ? 'Hoje' : mode === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>
                  {viewMode === 'today' 
                    ? (appointments.length > 0 ? 'Agendamentos de Hoje' : 'Próximos Agendamentos') 
                    : viewMode === 'week' 
                      ? 'Agendamentos da Semana' 
                      : 'Agendamentos do Mês'}
                </CardTitle>
                <CardDescription>
                  Você tem {metrics.periodCount} agendamentos {viewMode === 'today' ? 'para hoje' : viewMode === 'week' ? 'nesta semana' : 'neste mês'}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {appointments.length === 0 && upcomingAppointments.length === 0 && (
                    <div className="text-center py-12 text-slate-500 border border-dashed rounded-xl bg-slate-50/50">
                      <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="font-medium">Nenhum agendamento encontrado.</p>
                      <p className="text-xs text-slate-400 mt-1">Sua agenda está livre para novos clientes.</p>
                    </div>
                  )}

                  {(viewMode === 'today' && appointments.length === 0 ? upcomingAppointments : appointments).map((apt, index) => {
                    const currentList = viewMode === 'today' && appointments.length === 0 ? upcomingAppointments : appointments;
                    const prevApt = currentList[index - 1];
                    const showDateHeader = (viewMode !== 'today' || appointments.length === 0) && (!prevApt || (apt as any).appointment_date !== (prevApt as any).appointment_date);
                    
                    return (
                      <div key={apt.id}>
                        {showDateHeader && (
                          <div className="flex items-center gap-2 mb-4 mt-2">
                            <div className="h-px bg-slate-100 flex-1"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                              {format(new Date((apt as any).appointment_date + 'T12:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            </span>
                            <div className="h-px bg-slate-100 flex-1"></div>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0 gap-3 group hover:bg-slate-50/50 -mx-2 px-2 transition-colors rounded-lg">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                            {apt.customers?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-slate-900">{apt.customers?.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-slate-500 truncate">{apt.serviço || apt.services?.name}</p>
                              {viewMode === 'today' && <span className="text-[10px] text-slate-300">•</span>}
                              {viewMode === 'today' && <p className="text-[10px] text-slate-400">{apt.start_time.substring(0, 5)}</p>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {viewMode !== 'today' ? (
                               <p className="text-sm font-bold text-slate-900">{apt.start_time.substring(0, 5)}</p>
                            ) : (
                               <Badge variant={apt.status === "confirmed" ? "success" : "warning"} className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-tighter">
                                {apt.status === "confirmed" ? "Confirmado" : "Pendente"}
                               </Badge>
                            )}
                            {viewMode !== 'today' && (
                               <Badge variant={apt.status === "confirmed" ? "success" : "warning"} className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-tighter">
                                {apt.status === "confirmed" ? "Sim" : "Pnd"}
                               </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3 overflow-hidden">
              <CardHeader>
                <CardTitle>Desempenho Semanal</CardTitle>
                <CardDescription>Resumo de agendamentos diários</CardDescription>
              </CardHeader>
              <CardContent className="h-64 pt-4">
                <div className="flex items-end justify-between w-full h-full gap-2 sm:gap-4 px-2">
                  {weeklyData.map((data, i) => {
                    const maxCount = Math.max(...weeklyData.map(d => d.count), 5);
                    const heightPercent = (data.count / maxCount) * 100;
                    const isToday = isSameDay(data.date, new Date());
                    
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1 relative group h-full justify-end">
                        {/* Tooltip on hover */}
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none z-50 whitespace-nowrap shadow-xl"
                        >
                          {data.count} agendamentos
                        </motion.div>

                        {/* Animated Bar */}
                        <div className="w-full relative h-[80%] flex items-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                            className={`w-full rounded-t-md relative overflow-hidden bg-gradient-to-t selection:bg-none ${
                              isToday 
                              ? "from-blue-600 to-blue-400" 
                              : "from-slate-200 to-slate-100 group-hover:from-blue-200 group-hover:to-blue-100"
                            } transition-colors duration-300`}
                          >
                            {isToday && (
                              <motion.div 
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-white/20"
                              />
                            )}
                          </motion.div>
                        </div>
                        
                        <span className={`text-[10px] sm:text-xs font-medium ${isToday ? "text-blue-600 font-bold" : "text-slate-500"}`}>
                          {data.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
