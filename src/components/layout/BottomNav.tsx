"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav({ companySlug }: { companySlug?: string | null }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Início", href: "/app/dashboard", icon: Home },
    { name: "Agenda", href: "/app/agenda", icon: Calendar },
    { 
      name: "Novo", 
      href: companySlug ? `/${companySlug}` : "#", 
      icon: Plus,
      isAction: true
    },
    { name: "Clientes", href: "/app/clientes", icon: Users },
    { name: "Ajustes", href: "/app/configuracoes", icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link 
                key={idx} 
                href={item.href}
                target={companySlug ? "_blank" : "_self"}
                rel={companySlug ? "noopener noreferrer" : ""}
                className="flex flex-col items-center justify-center w-14 -mt-6 group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-[#0284c7] rounded-full shadow-lg shadow-blue-500/30 text-white group-active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium text-slate-500 mt-1">
                  Novo
                </span>
              </Link>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-full space-y-1 active:scale-95 transition-transform",
                isActive ? "text-[#0284c7]" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-blue-50/50")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
