"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/app/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-slate-50">
      <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-[#0284c7]" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">AgendaFácil</span>
          </Link>
          <h1 className="text-xl font-semibold text-slate-800">Acesse sua conta</h1>
          <p className="text-sm text-slate-500 mt-1">Bem-vindo de volta! Por favor, insira seus dados.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Senha</Label>
              <Link href="#" className="text-sm font-medium text-[#0284c7] hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <Button type="submit" className="w-full text-base h-11 mt-2" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="font-medium text-[#0284c7] hover:underline hover:text-[#0369a1] transition-colors">
            Criar conta grátis
          </Link>
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-b from-blue-50 to-transparent blur-3xl opacity-50 rounded-full" />
      </div>
    </div>
  );
}
