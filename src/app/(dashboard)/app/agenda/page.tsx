"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format, addDays, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const MOCK_HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  customers: { name: string };
  services: { name: string };
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments(currentDate);
  }, [currentDate]);

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
          .select("id, start_time, end_time, status, customers(name), services(name)")
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
  // Based on 8:00 to 20:00 (12 hours) -> each hour is 64px
  const calculatePosition = (start: string, end: string | null) => {
    const startH = parseInt(start.substring(0, 2));
    const startM = parseInt(start.substring(3, 5));
    
    let endH = startH;
    let endM = startM + 30; // Default 30 min duration if missing end_time
    if (end) {
      endH = parseInt(end.substring(0, 2));
      endM = parseInt(end.substring(3, 5));
    }

    const startMinutesFrom8 = (startH - 8) * 60 + startM;
    const endMinutesFrom8 = (endH - 8) * 60 + endM;
    
    const durationMins = endMinutesFrom8 - startMinutesFrom8;

    return {
      top: `${(startMinutesFrom8 / 60) * 64}px`,
      height: `${(durationMins / 60) * 64}px`
    };
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agenda</h2>
          <p className="text-slate-500">Visualize e organize todos os seus horários.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleToday} className="h-10 text-slate-600 bg-white">
            Hoje
          </Button>
          <div className="flex items-center bg-white rounded-md border border-slate-200 shadow-sm p-1">
            <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold px-4 text-sm text-slate-700 capitalize w-48 text-center">
              {format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" className="h-10 border-slate-200 bg-white hidden sm:flex">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Selecionar Data
          </Button>
        </div>
      </div>

      <Card className="flex-1 min-h-[600px] overflow-hidden flex flex-col">
        {/* Calendar Body (Daily View) */}
        <CardContent className="flex-1 p-0 overflow-y-auto relative bg-white">
          <div className="flex relative min-h-[500px]">
            {/* Times col */}
            <div className="w-20 sm:w-24 border-r border-slate-100 bg-white z-10 sticky left-0 text-center flex-shrink-0">
              {MOCK_HOURS.map((hour) => (
                <div key={hour} className="h-16 border-b border-slate-100 relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-500 bg-white px-2">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Area */}
            <div className="flex-1 relative w-full border-l border-slate-100">
              {/* Horizontal Lines */}
              {MOCK_HOURS.map((hour) => (
                <div key={hour} className="h-16 border-b border-slate-50 w-full absolute pointer-events-none" style={{ top: `${(hour - 8) * 64}px` }} />
              ))}
              
              {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                  <span className="text-slate-500 bg-white px-4 py-2 rounded-md shadow-sm border border-slate-200">Carregando horários...</span>
                </div>
              )}

              {/* Events */}
              {!loading && appointments.map(app => {
                const pos = calculatePosition(app.start_time, app.end_time);
                
                let bgColors = "bg-blue-100 border-blue-300 text-blue-900";
                if (app.status === 'completed') bgColors = "bg-green-100 border-green-300 text-green-900";
                if (app.status === 'cancelled') bgColors = "bg-red-100 border-red-300 text-red-900 opacity-60";

                return (
                  <div 
                    key={app.id} 
                    className={`absolute left-2 right-4 sm:right-8 border-l-4 rounded-md shadow-sm p-2 text-xs sm:text-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${bgColors} z-20`}
                    style={{ top: pos.top, height: pos.height }}
                  >
                    <div className="font-semibold truncate">{app.services?.name} - {app.customers?.name}</div>
                    <div className="opacity-80 flex items-center gap-1 mt-1 truncate">
                      <Clock className="w-3 h-3" />
                      {app.start_time.substring(0, 5)} {app.end_time ? `- ${app.end_time.substring(0, 5)}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
