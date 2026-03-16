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
        <button type="button" className="relative text-slate-400 hover:text-slate-500 transition-colors focus:outline-none">
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            3
          </span>
          <Bell className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}
