"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format, addDays, subDays, parseISO, addMinutes } from "date-fns";
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

  const HOUR_HEIGHT = 64;
  const TOP_OFFSET = 32;

  // Helper to calculate top and height percentage for absolute positioning
  // Based on 8:00 to 20:00 (12 hours) -> each hour is HOUR_HEIGHT px
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
    
    const durationMins = Math.max(endMinutesFrom8 - startMinutesFrom8, 20); // Min duration for visual

    return {
      top: `${(startMinutesFrom8 / 60) * HOUR_HEIGHT + TOP_OFFSET}px`,
      height: `${(durationMins / 60) * HOUR_HEIGHT}px`
    };
  };

  // Process appointments into clusters of overlapping events
  const clusters: Appointment[][] = [];
  appointments.forEach(app => {
    let cluster = clusters.find(c => 
      c.some(other => {
        const start = app.start_time;
        const end = app.end_time || app.start_time;
        const oStart = other.start_time;
        const oEnd = other.end_time || other.start_time;
        return (oStart < end && oEnd > start);
      })
    );
    
    if (cluster) {
      cluster.push(app);
    } else {
      clusters.push([app]);
    }
  });

  const processedAppointments = appointments.map((app) => {
    // Find the cluster this app belongs to
    const cluster = clusters.find(c => c.includes(app)) || [app];
    
    // Determine column index within cluster
    // Sort cluster by start time first for deterministic columns
    const sortedCluster = [...cluster].sort((a, b) => a.start_time.localeCompare(b.start_time));
    
    // Assign columns
    const columns: string[][] = [];
    sortedCluster.forEach(item => {
      let colIndex = columns.findIndex(col => {
        // Check if 'item' overlaps with any appointment already placed in this column
        return !col.some(cItem => {
          const cApp = appointments.find(a => a.id === cItem)!; // Find the full appointment object
          const start = item.start_time;
          const end = item.end_time || item.start_time;
          const cStart = cApp.start_time;
          const cEnd = cApp.end_time || cApp.start_time;
          return (cStart < end && cEnd > start);
        });
      });
      
      if (colIndex === -1) {
        // No suitable column found, create a new one
        columns.push([item.id]);
        colIndex = columns.length - 1;
      } else {
        // Add to existing column
        columns[colIndex].push(item.id);
      }
    });

    const columnIndex = columns.findIndex(col => col.includes(app.id));
    const totalInGroup = columns.length;

    return {
      ...app,
      columnIndex,
      groupSize: totalInGroup
    };
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agenda</h2>
          <p className="text-slate-500">Visualize e organize todos os seus horários.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleToday} className="h-10 text-slate-600 bg-white shadow-sm hover:bg-slate-50 transition-colors">
            Hoje
          </Button>
          <div className="flex items-center bg-white rounded-md border border-slate-200 shadow-sm p-1">
            <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-8 w-8 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold px-4 text-sm text-slate-700 capitalize w-48 text-center">
              {format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-8 w-8 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" className="h-10 border-slate-200 bg-white hidden sm:flex shadow-sm hover:bg-slate-50 transition-colors">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Selecionar Data
          </Button>
        </div>
      </div>

      <Card className="flex-1 min-h-[600px] overflow-hidden flex flex-col border-slate-200 shadow-lg">
        {/* Calendar Body (Daily View) */}
        <CardContent className="flex-1 p-0 overflow-y-auto relative bg-white">
          <div className="flex relative min-h-[500px]">
            {/* Times col */}
            <div className="w-20 sm:w-24 border-r border-slate-100 bg-slate-50/50 z-30 sticky left-0 text-center flex-shrink-0 pt-[32px]">
              {MOCK_HOURS.map((hour) => (
                <div key={hour} className="h-16 relative">
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-semibold text-slate-400 bg-white sm:bg-transparent px-1 sm:px-2 z-40">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Area */}
            <div className="flex-1 relative w-full pt-[32px]">
              {/* Horizontal Lines - Exactly at the top of each hour block */}
              {MOCK_HOURS.map((hour) => (
                <div 
                  key={hour} 
                  className="absolute left-0 right-0 border-t border-slate-100 w-full pointer-events-none z-10" 
                  style={{ top: `${(hour - 8) * HOUR_HEIGHT + TOP_OFFSET}px` }} 
                />
              ))}
              {/* Bottom border for the last slot */}
              <div 
                className="absolute left-0 right-0 border-t border-slate-100 w-full pointer-events-none z-10" 
                style={{ top: `${(MOCK_HOURS.length) * HOUR_HEIGHT + TOP_OFFSET}px` }} 
              />
              
              {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-slate-200">
                    <div className="w-2 h-2 bg-[#0284c7] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#0284c7] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-[#0284c7] rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-sm font-medium text-slate-600 ml-1">Atualizando...</span>
                  </div>
                </div>
              )}

              {/* Events */}
              {!loading && processedAppointments.map(app => {
                const pos = calculatePosition(app.start_time, app.end_time);
                
                let bgColors = "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100";
                let stripeColor = "bg-blue-500";
                
                if (app.status === 'completed') {
                  bgColors = "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100";
                  stripeColor = "bg-emerald-500";
                }
                if (app.status === 'cancelled') {
                  bgColors = "bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100 opacity-60";
                  stripeColor = "bg-rose-500";
                }

                // Calculate width and left based on columns
                const width = `${100 / app.groupSize}%`;
                const left = `${(app.columnIndex / app.groupSize) * 100}%`;
                
                const isShort = parseInt(pos.height) <= 32;
                const isVeryShort = parseInt(pos.height) < 48;

                return (
                  <div 
                    key={app.id} 
                    className={`absolute border rounded-lg shadow-sm px-2 py-1 transition-all duration-200 cursor-pointer hover:shadow-md z-20 group flex flex-col pt-1 overflow-hidden ${bgColors}`}
                    style={{ 
                      top: pos.top, 
                      height: pos.height,
                      left: `calc(${left} + 4px)`,
                      width: `calc(${width} - 8px)`,
                      minHeight: '32px' // Increased minHeight slightly
                    }}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripeColor} rounded-l-lg`} />
                    <div className="flex flex-col h-full justify-center">
                      <div className="font-bold truncate text-[10px] leading-tight flex items-center gap-1">
                        <span className="truncate">{app.services?.name}</span>
                        {isVeryShort && (
                          <span className="text-[9px] opacity-70 whitespace-nowrap font-normal">
                            - {app.customers?.name}
                          </span>
                        )}
                      </div>
                      
                      {!isVeryShort && (
                        <div className="font-medium truncate text-[10px] sm:text-[11px] text-slate-600">
                          {app.customers?.name}
                        </div>
                      )}
                      
                      {!isShort && (
                        <div className="opacity-70 flex items-center gap-1 mt-0.5 text-[9px] sm:text-[10px] font-semibold">
                          <Clock className="w-2.5 h-2.5" />
                          {app.start_time.substring(0, 5)} {app.end_time ? `- ${app.end_time.substring(0, 5)}` : ''}
                        </div>
                      )}
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
