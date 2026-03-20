"use client"

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const menuItems = [
  { name: "Dashboard", href: "/app/dashboard" },
  { name: "Agenda", href: "/app/agenda" },
  { name: "Serviços", href: "/app/servicos" },
  { name: "Clientes", href: "/app/clientes" },
  { name: "Configurações", href: "/app/configuracoes" },
];

export function Topbar({ 
  companySlug,
  companyId,
  onMenuClick
}: { 
  companySlug?: string | null;
  companyId?: string | null;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentPage = menuItems.find(item => item.href === pathname)?.name || "Página";

  // Buscar notificações iniciais e configurar Realtime
  useEffect(() => {
    if (!companyId) return;

    const supabase = createClient();

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          start_time,
          created_at,
          customers (name),
          services (name)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setNotifications(data);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Listener Realtime para novos agendamentos
    const channel = supabase
      .channel(`new-appointments-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `company_id=eq.${companyId}`
        },
        async (payload) => {
          // Buscar os detalhes (join) do novo agendamento
          const { data, error } = await supabase
            .from("appointments")
            .select(`
              id,
              appointment_date,
              start_time,
              created_at,
              customers (name),
              services (name)
            `)
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            setNotifications(prev => [data, ...prev.slice(0, 4)]);
            setHasUnread(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <button 
          type="button" 
          onClick={onMenuClick}
          className="md:hidden text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-none">{currentPage}</h1>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {companySlug && (
          <Link href={`/${companySlug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-9 rounded-full px-3 sm:px-4 text-slate-600">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Página</span>
            </Button>
          </Link>
        )}
        {companySlug ? (
          <Link href={`/${companySlug}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="flex items-center gap-1.5 h-9 rounded-full px-3 sm:px-4 shadow-sm bg-[#0284c7] hover:bg-[#0369a1]">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Agendamento</span>
            </Button>
          </Link>
        ) : (
          <Button size="sm" className="flex items-center gap-1.5 h-9 rounded-full px-3 sm:px-4 shadow-sm bg-[#0284c7] hover:bg-[#0369a1] opacity-50 cursor-not-allowed">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Agendamento</span>
          </Button>
        )}
        
        <div className="relative" ref={notificationRef}>
          <button 
            type="button" 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setHasUnread(false);
            }}
            className={cn(
              "relative text-slate-400 hover:text-slate-500 transition-colors focus:outline-none p-2 rounded-full hover:bg-slate-100",
              showNotifications && "bg-slate-100 text-slate-900"
            )}
          >
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white">
              </span>
            )}
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5 z-50"
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Notificações</h3>
                  <span className="text-[10px] text-[#0284c7] font-bold uppercase tracking-wider">Novo</span>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {loading ? (
                    <div className="py-4 text-center text-xs text-slate-400">Carregando...</div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className="flex gap-3 p-2 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Plus className="h-4 w-4 text-[#0284c7]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Novo Agendamento!</p>
                          <p className="text-[11px] text-slate-500">
                            {notif.customers?.name || "Cliente"} agendou um {notif.services?.name || "serviço"} para dia {new Date(notif.appointment_date).toLocaleDateString('pt-BR')} às {notif.start_time.slice(0, 5)}.
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(notif.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-xs text-slate-400">Nenhuma notificação por enquanto.</p>
                    </div>
                  )}
                </div>
                <Button variant="ghost" className="w-full mt-4 h-8 text-xs text-slate-500 hover:text-slate-900">
                  Ver todas as notificações
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
