import { Calendar, MessageCircle, Clock, CheckCircle2, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Calendar className="h-8 w-8 text-[#0284c7]" />
          <span className="text-xl font-bold tracking-tight text-slate-900">AgendaFácil</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="#beneficios" className="text-sm font-medium text-slate-600 hover:text-slate-900">Benefícios</Link>
          <Link href="#como-funciona" className="text-sm font-medium text-slate-600 hover:text-slate-900">Como funciona</Link>
          <Link href="#depoimentos" className="text-sm font-medium text-slate-600 hover:text-slate-900">Depoimentos</Link>
        </nav>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">Entrar</Link>
          <Link href="/cadastro">
            <Button>Criar conta grátis</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-40">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl animate-fade-in">
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl mb-6 leading-tight">
                Receba agendamentos automaticamente pelo <span className="text-green-600">WhatsApp</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
                O sistema moderno, simples e extremamente intuitivo que agenda seus clientes 24h por dia e envia lembretes automáticos para você reduzir faltas e focar no que importa.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/cadastro">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
                    Criar conta grátis
                  </Button>
                </Link>
                <Link href="#como-funciona" className="text-sm font-semibold leading-6 text-slate-900 flex items-center group">
                  Saiba mais <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
          {/* Decorative background blurs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 blur-3xl opacity-20 pointer-events-none">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-blue-400 to-green-300 rounded-full" />
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Tudo que você precisa para crescer</h2>
              <p className="mt-4 text-lg text-slate-600">
                Chega de perder tempo respondendo mensagens repetitivas ou lidando com clientes que não aparecem.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="rounded-lg bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-[#0284c7]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">Agenda online 24h</h3>
                  <p className="text-slate-600 text-sm">Seus clientes podem agendar a qualquer momento, mesmo quando você estiver dormindo.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="rounded-lg bg-green-100 w-12 h-12 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">Confirmação automática</h3>
                  <p className="text-slate-600 text-sm">Confirme horários instantaneamente sem precisar tocar no celular.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="rounded-lg bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">Lembretes por WhatsApp</h3>
                  <p className="text-slate-600 text-sm">Notificações enviadas diretamente no WhatsApp do cliente para relembrar o horário.</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="rounded-lg bg-orange-100 w-12 h-12 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">Redução de faltas</h3>
                  <p className="text-slate-600 text-sm">Com lembretes precisos, zere os cancelamentos de última hora e aumente seu faturamento.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="como-funciona" className="py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Como funciona?</h2>
              <p className="mt-4 text-lg text-slate-600">
                Apenas 3 passos separam você de uma rotina muito mais organizada e produtiva.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative cursor-default">
              {/* Line connector for desktop */}
              <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-0.5 bg-slate-200 -z-10" />
              
              <div className="relative text-center">
                <div className="w-24 h-24 mx-auto bg-white border-4 border-[#0284c7] rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <span className="text-3xl font-bold text-[#0284c7]">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Crie sua conta</h3>
                <p className="text-slate-600">Cadastre seus serviços, horários disponíveis e preços em menos de 5 minutos.</p>
              </div>

              <div className="relative text-center">
                <div className="w-24 h-24 mx-auto bg-white border-4 border-[#0284c7] rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <span className="text-3xl font-bold text-[#0284c7]">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Compartilhe seu link</h3>
                <p className="text-slate-600">Coloque seu link exclusivo do AgendaFácil no Instagram e passe pro seus clientes pelo WhatsApp.</p>
              </div>

              <div className="relative text-center">
                <div className="w-24 h-24 mx-auto bg-white border-4 border-[#0284c7] rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <span className="text-3xl font-bold text-[#0284c7]">3</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Receba agendamentos</h3>
                <p className="text-slate-600">Os clientes escolhem o horário sozinhos, o sistema avisa você e lembra eles na hora certa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="depoimentos" className="py-24 bg-[#0284c7] text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-16">O que estão dizendo</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { name: "Mariana Souza", role: "Esteticista", text: "O AgendaFácil mudou minha vida. Antes eu passava o final de semana inteiro respondendo clientes, agora a agenda lota sozinha!" },
                { name: "Carlos Oliveira", role: "Barbeiro", text: "Meus clientes amaram a facilidade de agendar pela internet, e as faltas reduziram em 90% com os lembretes no WhatsApp." },
                { name: "Dr. Rafael", role: "Dentista", text: "Um sistema premium, super fácil de configurar. Não preciso mais de uma secretária focada apenas em marcar consultas." }
              ].map((testimonial, i) => (
                <Card key={i} className="bg-white/10 border-none text-white backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 text-yellow-400 mb-4">
                      {[...Array(5)].map((_, j) => <Star key={j} className="fill-current w-5 h-5" />)}
                    </div>
                    <p className="text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-blue-200 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500 blur-3xl opacity-30"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Pronto para organizar sua agenda?</h2>
                <p className="text-xl mb-10 text-slate-300 max-w-2xl mx-auto">Junte-se a milhares de profissionais que pararam de perder tempo e aumentaram seu faturamento.</p>
                <Link href="/cadastro">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                    Criar conta grátis agora
                  </Button>
                </Link>
                <p className="mt-4 text-sm text-slate-400">Não precisa de cartão de crédito. Leve 2 minutos.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#0284c7]" />
            <span className="text-lg font-bold text-slate-900">AgendaFácil</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} AgendaFácil. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
