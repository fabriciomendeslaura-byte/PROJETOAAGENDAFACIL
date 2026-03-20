"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardShellProps {
  children: React.ReactNode;
  userProfile: any;
}

export function DashboardShell({ children, userProfile }: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Fechar o menu ao mudar de página no mobile
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:flex-shrink-0 border-r border-slate-200">
        <Sidebar user={userProfile} />
      </div>

      {/* Sidebar Mobile com Animação */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
            />
            
            {/* Menu Lateral Mobile */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden shadow-2xl"
            >
              <Sidebar user={userProfile} isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar 
          companySlug={userProfile?.companies?.slug || null} 
          companyId={userProfile?.company_id || null}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="relative flex-1 overflow-x-hidden overflow-y-auto focus:outline-none md:pb-0 pb-[80px]">
          <div className="py-4 px-4 sm:p-6 md:p-8 w-full max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav Mobile */}
      <BottomNav companySlug={userProfile?.companies?.slug || null} />
    </div>
  );
}
