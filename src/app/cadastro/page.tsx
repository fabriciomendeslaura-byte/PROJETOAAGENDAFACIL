"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [businessType, setBusinessType] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const businessTypes = [
    { id: "barbearia", name: "Barbearia", icon: "💈" },
    { id: "salao", name: "Salão de Beleza", icon: "💇‍♀️" },
    { id: "estetica", name: "Clínica de Estética", icon: "✨" },
    { id: "manicure", name: "Manicure & Pedicure", icon: "💅" },
    { id: "petshop", name: "Pet Shop/Banho e Tosa", icon: "🐶" },
    { id: "outros", name: "Outros Negócios", icon: "🏢" },
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const generatedSlug = slugify(company);
    const businessTypeLabel = businessTypes.find((t: any) => t.id === businessType)?.name || businessType;

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          full_name: name,
          fullName: name,
          company: company,
          company_name: company,
          companyName: company,
          slug: generatedSlug,
          company_slug: generatedSlug,
          companySlug: generatedSlug,
          business_type: businessTypeLabel,
          businessType: businessTypeLabel,
          plan: 'free'
        }
      }
    });

    if (error) {
      console.error("Erro no signup:", error);
      const authError = error as any;
      setError(`${error.message}${authError.hint ? ' - ' + authError.hint : ''}${authError.details ? ' - ' + authError.details : ''}`);
      setLoading(false);
    } else {
      // Due to RLS triggers creating the company and user, we just redirect or show success
      setSuccessMsg("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push("/app/dashboard");
        router.refresh();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 bg-slate-50">
      <div className="w-full sm:max-w-md px-6 py-8 bg-white shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-[#0284c7]" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">AgendaFácil</span>
          </Link>
          <h1 className="text-xl font-semibold text-slate-800">Crie sua conta grátis</h1>
          <p className="text-sm text-slate-500 mt-1">Comece a receber agendamentos hoje mesmo.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm text-center">
            {successMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSignUp}>
          <div className="space-y-1.5">
            <Label htmlFor="name">Seu Nome completo</Label>
            <Input 
              id="name" 
              type="text" 
              placeholder="João da Silva" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

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
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Crie uma senha forte" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <Label htmlFor="company">Nome da Empresa</Label>
            <Input 
              id="company" 
              type="text" 
              placeholder="Barbearia do João" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessType">Tipo de Negócio</Label>
            <select 
              id="businessType"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7] focus-visible:border-transparent transition-colors"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
            >
              <option value="" disabled>Selecione uma opção</option>
              <option value="barbearia">Barbearia</option>
              <option value="salao">Salão de Beleza</option>
              <option value="estetica">Clínica de Estética</option>
              <option value="dentista">Dentista / Odontologia</option>
              <option value="medicina">Consultório Médico</option>
              <option value="psicologia">Psicologia</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <Button type="submit" className="w-full text-base h-11 mt-6" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-[#0284c7] hover:underline hover:text-[#0369a1] transition-colors">
            Fazer login
          </Link>
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-gradient-to-t from-green-50 to-transparent blur-3xl opacity-60 rounded-full translate-x-1/3 -translate-y-1/3" />
      </div>
    </div>
  );
}
