"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Filter, Plus, MoreVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format, addDays, subDays, isSameDay, startOfHour, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  customer_name?: string;
  customer_phone?: string;
  customers: { name: string };
  services: { name: string };
  serviço?: string;
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [nowPos, setNowPos] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const HOUR_HEIGHT = 56; // Um pouco mais de espaço para elegância
  const TOP_OFFSET = 32;

  useEffect(() => {
    fetchAppointments(currentDate);
    
    // Timer for "Now" line
    const timer = setInterval(updateNowPosition, 60000);
    updateNowPosition();
    return () => clearInterval(timer);
  }, [currentDate]);

  function updateNowPosition() {
    const now = new Date();
    if (!isSameDay(now, currentDate)) {
      setNowPos(null);
      return;
    }
    const h = now.getHours();
    const m = now.getMinutes();
    if (h >= 8 && h < 21) {
      const minsFrom8 = (h - 8) * 60 + m;
      setNowPos((minsFrom8 / 60) * HOUR_HEIGHT + TOP_OFFSET);
    } else {
      setNowPos(null);
    }
  }

  async function fetchAppointments(date: Date) {
    setLoading(true);
    const supabase = createClient();
    const dateStr = format(date, "yyyy-MM-dd");

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();
        
      if (userData?.company_id) {
        const { data } = await supabase
          .from("appointments")
          .select("id, start_time, end_time, status, customer_name, customer_phone, serviço, customers(name), services(name)")
          .eq("company_id", userData.company_id)
          .eq("appointment_date", dateStr)
          .order("start_time", { ascending: true });
        
        if (data) setAppointments(data as any);
      }
    }
    setLoading(false);
  }

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Helper to calculate top and height percentage for absolute positioning
  const calculatePosition = (start: string) => {
    const startH = parseInt(start.substring(0, 2));
    const startM = parseInt(start.substring(3, 5));
    const startMinutesFrom8 = (startH - 8) * 60 + startM;

    return {
      top: `${(startMinutesFrom8 / 60) * HOUR_HEIGHT + 12}px`, // +12px de folga
      height: `28px` 
    };
  };

  // Process appointments into columns for overlapping events
  const processedAppointments = appointments.map((app, index) => {
    // Simple overlapping logic for UI
    const overlaps = appointments.filter((other, idx) => 
      idx !== index && (
        (other.start_time >= app.start_time && other.start_time < (app.end_time || app.start_time)) ||
        (app.start_time >= other.start_time && app.start_time < (other.end_time || other.start_time))
      )
    );

    return {
      ...app,
      columnIndex: overlaps.length > 0 && overlaps[0].start_time === app.start_time && index > appointments.indexOf(overlaps[0]) ? 1 : 0,
      groupSize: overlaps.length > 0 ? 2 : 1
    };
  });

  return (
    <div className="space-y-6 h-full flex flex-col bg-slate-50/30 p-2 sm:p-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Agenda</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Ao Vivo</span>
            </div>
            <p className="text-slate-500 text-sm">Gerencie seu tempo com precisão.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 flex-1 lg:flex-initial">
             <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-11 w-11 md:h-9 md:w-9 hover:bg-slate-50 rounded-lg">
              <ChevronLeft className="h-5 w-5 md:h-4 md:w-4 text-slate-600" />
            </Button>
            <div className="px-2 md:px-4 flex flex-col items-center flex-1 min-w-0">
              <span className="font-bold text-xs md:text-sm text-slate-800 capitalize truncate w-full text-center">
                {format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
              {isSameDay(currentDate, new Date()) && (
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Hoje</span>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-11 w-11 md:h-9 md:w-9 hover:bg-slate-50 rounded-lg">
              <ChevronRight className="h-5 w-5 md:h-4 md:w-4 text-slate-600" />
            </Button>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" onClick={handleToday} className="h-11 px-4 border-slate-200 bg-white hover:bg-slate-50 rounded-xl shadow-sm font-semibold transition-all active:scale-95">
               Ir para Hoje
            </Button>
            <Button className="h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo
            </Button>
          </div>
        </div>
      </div>

      <Card className="flex-1 min-h-[600px] overflow-hidden flex flex-col border-none shadow-2xl shadow-slate-200/50 rounded-3xl bg-white/80 backdrop-blur-xl">
        <CardContent className="flex-1 p-0 overflow-y-auto relative no-scrollbar" ref={scrollRef}>
          <div className="flex relative min-h-[600px]">
            {/* Times col */}
            <div className="w-20 sm:w-24 border-r border-slate-100/50 bg-slate-50/30 z-30 sticky left-0 text-center flex-shrink-0 pt-[32px]">
              {MOCK_HOURS.map((hour) => (
                <div key={hour} style={{ height: `${HOUR_HEIGHT}px` }} className="relative">
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Area */}
            <div className="flex-1 relative w-full mt-[20px] overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
              
              {/* Horizontal Lines */}
              {MOCK_HOURS.map((hour) => (
                <div 
                  key={hour} 
                  className="absolute left-0 right-0 border-t border-slate-100/60 w-full pointer-events-none z-10" 
                  style={{ top: `${(hour - 8) * HOUR_HEIGHT + 12}px` }} 
                />
              ))}

              {/* "Now" Indicator Line */}
              {nowPos !== null && (
                <div 
                  className="absolute left-0 right-0 z-40 pointer-events-none flex items-center"
                  style={{ top: `${(nowPos - TOP_OFFSET) + 12}px` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] -ml-1.25" />
                  <div className="h-[1.5px] bg-red-500 flex-1 shadow-[0_0_4px_rgba(239,68,68,0.3)]" />
                </div>
              )}
              
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[2px]"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-full"
                  >
                    {processedAppointments.map(app => {
                      const pos = calculatePosition(app.start_time);
                      
                      let accentColor = "bg-blue-500";
                      let bgTheme = "bg-white border-slate-200/60 hover:border-blue-400 hover:shadow-blue-100";
                      let textColor = "text-slate-900";
                      
                      if (app.status === 'completed') {
                        accentColor = "bg-emerald-500";
                        bgTheme = "bg-emerald-50/30 border-emerald-100/80 hover:border-emerald-400 hover:shadow-emerald-100";
                        textColor = "text-emerald-900";
                      }
                      if (app.status === 'cancelled') {
                        accentColor = "bg-rose-500";
                        bgTheme = "bg-rose-50/20 border-rose-100/60 opacity-60 hover:opacity-100";
                        textColor = "text-rose-900";
                      }

                      const width = `${100 / app.groupSize}%`;
                      const left = `${(app.columnIndex / app.groupSize) * 100}%`;

                      return (
                        <motion.div 
                          key={app.id} 
                          layoutId={app.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`absolute border rounded-2xl shadow-sm px-3 transition-all duration-300 cursor-pointer hover:shadow-xl z-20 group flex items-center overflow-hidden ${bgTheme}`}
                          style={{ 
                            top: `calc(${pos.top} - 10px)`, // Sobe mais um pouco conforme pedido
                            height: `28px`, // Mais fino para parecer uma linha precisa
                            left: `calc(${left} + 6px)`,
                            width: `calc(${width} - 12px)`,
                          }}
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor} rounded-l-2xl`} />
                          
                          <div className="flex items-center gap-3 w-full overflow-hidden">
                            <div className={`text-[11px] font-black ${textColor} opacity-80 shrink-0 font-mono italic`}>
                              {app.start_time.substring(0, 5)}
                            </div>
                            
                            <div className="h-6 w-px bg-slate-200 shrink-0" />
                            
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className={`font-extrabold truncate text-[11px] ${textColor} tracking-tight uppercase`}>
                                {app.serviço || app.services?.name}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate font-semibold">
                                {app.customer_name || app.customers?.name}
                              </span>
                            </div>

                            <MoreVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
