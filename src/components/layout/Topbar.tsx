"use client"

import { usePathname } from "next/navigation";
import { Bell, Menu, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const menuItems = [
  { name: "Dashboard", href: "/app/dashboard" },
  { name: "Agenda", href: "/app/agenda" },
  { name: "Serviços", href: "/app/servicos" },
  { name: "Clientes", href: "/app/clientes" },
  { name: "Configurações", href: "/app/configuracoes" },
];

export function Topbar({ companySlug }: { companySlug?: string | null }) {
  const pathname = usePathname();
  const currentPage = menuItems.find(item => item.href === pathname)?.name || "Página";

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <button type="button" className="md:hidden text-slate-500 hover:text-slate-900">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-slate-900">{currentPage}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {companySlug && (
          <Link href={`/${companySlug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5 h-9 rounded-full px-4 text-slate-600">
              <ExternalLink className="w-4 h-4" />
              <span>Ver Página Pública</span>
            </Button>
          </Link>
        )}
        {companySlug ? (
          <Link href={`/${companySlug}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="hidden sm:flex items-center gap-1.5 h-9 rounded-full px-4 shadow-sm bg-[#0284c7] hover:bg-[#0369a1]">
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </Button>
          </Link>
        ) : (
          <Button size="sm" className="hidden sm:flex items-center gap-1.5 h-9 rounded-full px-4 shadow-sm bg-[#0284c7] hover:bg-[#0369a1] opacity-50 cursor-not-allowed">
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </Button>
        )}
        
        <div className="relative group">
          <button type="button" className="relative text-slate-400 hover:text-slate-500 transition-colors focus:outline-none p-1 rounded-full hover:bg-slate-100">
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white">
              1
            </span>
            <Bell className="h-6 w-6" />
          </button>
          
          <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5 transition-all opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Notificações</h3>
              <span className="text-[10px] text-[#0284c7] font-bold uppercase tracking-wider">Novo</span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 p-2 rounded-lg bg-blue-50/50">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-4 w-4 text-[#0284c7]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Novo Agendamento!</p>
                  <p className="text-[11px] text-slate-500">João da Silva agendou um Corte de Cabelo para hoje às 14:00.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Agora mesmo</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-4 h-8 text-xs text-slate-500 hover:text-slate-900">
              Ver todas as notificações
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
