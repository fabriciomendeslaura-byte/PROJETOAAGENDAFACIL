"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  Home, 
  Scissors, 
  Users, 
  Settings,
  LogOut,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { usePlan } from "@/lib/PlanContext";
import { PLANS, getPlanColor } from "@/lib/plans";

const menuItems = [
  { name: "Dashboard", href: "/app/dashboard", icon: Home },
  { name: "Agenda", href: "/app/agenda", icon: Calendar },
  { name: "Serviços", href: "/app/servicos", icon: Scissors },
  { name: "Clientes", href: "/app/clientes", icon: Users },
  { name: "Planos", href: "/app/planos", icon: Crown },
  { name: "Configurações", href: "/app/configuracoes", icon: Settings },
];

export function Sidebar({ user, isMobile }: { user: any, isMobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { plan } = usePlan();
  const colors = getPlanColor(plan);
  const planDef = PLANS[plan];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "US";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className={cn(
      "flex w-64 flex-col bg-slate-900 text-slate-300 transition-all border-r border-slate-800",
      isMobile ? "h-full" : "h-screen"
    )}>
      <div className="flex h-16 items-center flex-shrink-0 px-6 bg-slate-950">
        <Link href="/app/dashboard" className="flex items-center gap-2 text-white">
          <Calendar className="h-6 w-6 text-[#38bdf8]" />
          <span className="text-lg font-bold tracking-tight">AgendaFácil</span>
        </Link>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto py-6">
        <nav className="flex-1 space-y-1.5 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-[#0284c7] text-white shadow-sm" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon 
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors", 
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  )} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-slate-800">
        <div className="flex items-center w-full">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white overflow-hidden">
              {user?.companies?.logo_url ? (
                <img src={user.companies.logo_url} alt={user.companies.name} className="h-full w-full object-cover" />
              ) : (
                getInitials(user?.name || "")
              )}
            </div>
          </div>
          <div className="ml-3 truncate">
            <p className="text-sm font-medium text-white">{user?.name || "Usuário"}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-slate-400 truncate max-w-[100px]">{user?.companies?.name || "Empresa"}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${colors.badge}`}>
                {planDef.name.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="mt-4 w-full group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-400 transition-colors" />
          <span className="group-hover:text-red-400 transition-colors">Sair</span>
        </button>
      </div>
    </div>
  );
}

