"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Calendar, Clock, CheckCircle2, User, Phone, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { format, addDays, getDay, isAfter, setHours, setMinutes, startOfDay, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sendBookingNotification, checkBookingLimit, incrementBookingCount } from "./actions";

interface Company {
  id: string;
  name: string;
  business_type: string;
  logo_url?: string;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface BusinessHour {
  weekday: number;
  open_time: string;
  close_time: string;
}

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedAppointments, setBookedAppointments] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  
  const [nextDates, setNextDates] = useState<Date[]>([]);
  const [limitReached, setLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ plan: string; currentCount: number; limit: number | null } | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      
      const supabase = createClient();
      
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (companyData) {
        setCompany(companyData);

        // Check booking limit
        const limitResult = await checkBookingLimit(companyData.id);
        setLimitInfo({ plan: limitResult.plan, currentCount: limitResult.currentCount, limit: limitResult.limit });
        if (!limitResult.allowed) {
          setLimitReached(true);
        }
        
        const [servicesRes, hoursRes] = await Promise.all([
          supabase.from('services').select('*').eq('company_id', companyData.id),
          supabase.from('business_hours').select('*').eq('company_id', companyData.id)
        ]);
        
        constFetchedServices = servicesRes.data || [];
        constFetchedHours = hoursRes.data || [];
        
        if (servicesRes.data) setServices(servicesRes.data);
        if (hoursRes.data) setBusinessHours(hoursRes.data);

        // Calculate valid next dates
        const potentialDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
        const validDates: Date[] = [];
        
        for (const date of potentialDates) {
          const dayOfWeek = getDay(date);
          const dayHours = constFetchedHours.find(h => h.weekday === dayOfWeek);
          
          if (dayHours) {
            // Check if day is today and still has time slots
            if (isEqual(startOfDay(date), startOfDay(new Date()))) {
              const closeH = parseInt(dayHours.close_time.substring(0, 2));
              const closeM = parseInt(dayHours.close_time.substring(3, 5));
              const now = new Date();
              const closeTime = setMinutes(setHours(startOfDay(now), closeH), closeM);
              
              // If it's already past closing time or very close to it, skip today
              if (isAfter(now, closeTime)) continue;
            }
            validDates.push(date);
          }
          if (validDates.length >= 7) break;
        }
        
        setNextDates(validDates);
        if (validDates.length > 0) {
          setSelectedDate(validDates[0]);
        }
      }
      
      setLoading(false);
    }
    let constFetchedServices: Service[] = [];
    let constFetchedHours: BusinessHour[] = [];
    loadData();
  }, [slug]);

  // Update available times and fetch booked appointments when date or service changes
  useEffect(() => {
    async function updateAvailability() {
      if (!company || !selectedService) return;
      
      const supabase = createClient();
      
      // Fetch existing appointments for the selected date
      const { data: existingBookings } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('company_id', company.id)
        .eq('appointment_date', format(selectedDate, "yyyy-MM-dd"))
        .neq('status', 'cancelled');
        
      if (existingBookings) {
        setBookedAppointments(existingBookings);
      }

      const dayOfWeek = getDay(selectedDate);
      const hours = businessHours.find(h => h.weekday === dayOfWeek);
      
      if (!hours) {
        setAvailableTimes([]);
        setSelectedTime(null);
        return;
      }
      
      const openHour = parseInt(hours.open_time.substring(0, 2));
      const openMin = parseInt(hours.open_time.substring(3, 5));
      const closeHour = parseInt(hours.close_time.substring(0, 2));
      const closeMin = parseInt(hours.close_time.substring(3, 5));
      
      let currentMins = openHour * 60 + openMin;
      const endMins = closeHour * 60 + closeMin;
      
      const slots = [];
      const now = new Date();
      const isToday = isEqual(startOfDay(selectedDate), startOfDay(now));

      while (currentMins + 60 <= endMins) {
        const h = Math.floor(currentMins / 60);
        const m = currentMins % 60;
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        
        // Filter past times if today
        if (isToday) {
          const slotTime = setMinutes(setHours(startOfDay(now), h), m);
          if (isAfter(slotTime, now)) {
            slots.push(timeStr);
          }
        } else {
          slots.push(timeStr);
        }
        
        currentMins += 60;
      }
      
      setAvailableTimes(slots);
      setSelectedTime(null);
    }
    
    updateAvailability();
  }, [selectedDate, selectedService, businessHours, company]);

  const isSlotOccupied = (time: string) => {
    const service = services.find(s => s.id === selectedService);
    const duration = service?.duration_minutes || 30;
    
    const [h, m] = time.split(':').map(Number);
    const startMins = h * 60 + m;
    const endMins = startMins + duration;
    
    return bookedAppointments.some(booking => {
      const [bh, bm] = booking.start_time.split(':').map(Number);
      const [beh, bem] = booking.end_time.split(':').map(Number);
      
      const bStartMins = bh * 60 + bm;
      const bEndMins = beh * 60 + bem;
      
      // Check for overlap: (StartA < EndB) and (EndA > StartB)
      return (startMins < bEndMins && endMins > bStartMins);
    });
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !selectedService || !selectedTime) return;

    // Check limit one more time before submission
    if (limitReached) {
      alert('Este profissional atingiu o limite de agendamentos do mês. Tente novamente no próximo mês.');
      return;
    }
    
    setSubmitting(true);
    const supabase = createClient();
    
    try {
      // 1. Find or create customer
      // Simplification: We just insert a new one or find existing by phone
      let customerId = null;
      
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('id')
        .eq('company_id', company.id)
        .eq('phone', clientPhone)
        .limit(1);
        
      if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
      } else {
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert([{ company_id: company.id, name: clientName, phone: clientPhone }])
          .select()
          .single();
          
        if (newCustomer) customerId = newCustomer.id;
      }
      
      // 2. Create appointment
      if (customerId) {
        const service = services.find(s => s.id === selectedService);
        const duration = service?.duration_minutes || 30;
        
        // calculate end time
        const [h, m] = selectedTime.split(':').map(Number);
        const totalStartMins = h * 60 + m;
        const endTotalMins = totalStartMins + duration;
        const endH = Math.floor(endTotalMins / 60);
        const endM = endTotalMins % 60;
        const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}:00`;
        const startTimeStr = `${selectedTime}:00`;
        
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        
        await supabase.from('appointments').insert([{
          company_id: company.id,
          customer_id: customerId,
          service_id: selectedService,
          appointment_date: dateStr,
          start_time: startTimeStr,
          end_time: endTimeStr,
          status: 'confirmed',
          customer_name: clientName,
          customer_phone: clientPhone,
          serviço: service?.name // Salva o nome do serviço no momento do agendamento
        }]);

        // Increment booking counter
        await incrementBookingCount(company.id);
        
        // Trigger notification via Server Action (avoids CORS)
        try {
          await sendBookingNotification({
            company_id: company.id,
            company: company.name,
            customer: {
              name: clientName,
              phone: clientPhone
            },
            service: {
              name: service?.name,
              price: service?.price,
              duration: service?.duration_minutes
            },
            appointment: {
              date: dateStr,
              time: startTimeStr,
              endTime: endTimeStr
            }
          });
        } catch (webhookError) {
          console.error("Erro ao enviar notificação:", webhookError);
        }
        
        setStep(4);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao realizar agendamento.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Página não encontrada</h1>
        <p className="text-slate-500 mt-2">O link de agendamento que você acessou é inválido.</p>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <Card className="max-w-md w-full py-12 px-6 border-slate-200">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Agenda indisponível</h2>
          <p className="text-slate-500 text-sm mb-4">
            Este profissional atingiu o limite de agendamentos do mês.
            Tente novamente no próximo mês ou entre em contato diretamente.
          </p>
          {limitInfo && limitInfo.limit && (
            <div className="bg-slate-50 rounded-lg p-4 mt-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Agendamentos usados</span>
                <span className="font-bold">{limitInfo.currentCount}/{limitInfo.limit}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
        <Card className="max-w-md w-full text-center py-12 px-6 border-slate-200">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl mb-2 text-slate-900">Agendamento Confirmado!</CardTitle>
          <CardDescription className="text-base mb-8 text-slate-500">
            Daremos andamento ao seu agendamento. Te esperamos no horário marcado!
          </CardDescription>
          <Button onClick={() => { setStep(1); setSelectedService(null); setSelectedTime(null); setClientName(""); }} variant="outline" className="w-full">
            Fazer novo agendamento
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-xl w-full">
        {/* Header Profile */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-blue-100 text-[#0284c7] font-bold text-4xl rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md overflow-hidden bg-white">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              company.name.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{company.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-slate-500 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{company.business_type || "Negócio Local"}</span>
          </div>
        </div>

        {/* Booking Card */}
        <Card className="shadow-lg border-slate-200/60 overflow-hidden">
          {/* Progress Bar */}
          <div className="flex">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 flex-1 ${step >= i ? "bg-[#0284c7]" : "bg-slate-100"}`} />
            ))}
          </div>

          <CardHeader className="bg-white border-b border-slate-100 pb-4">
            <CardTitle className="text-xl text-center text-slate-800">
              {step === 1 && "Escolha o Serviço"}
              {step === 2 && "Escolha Data e Horário"}
              {step === 3 && "Seus Dados"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 bg-white">
            {/* Step 1: Services */}
            {step === 1 && (
              <div className="space-y-3">
                {services.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">Nenhum serviço disponível no momento.</p>
                ) : (
                  services.map((service) => (
                    <label 
                      key={service.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedService === service.id 
                          ? "border-[#0284c7] bg-blue-50/50" 
                          : "border-slate-100 hover:border-blue-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input 
                          type="radio" 
                          name="service"
                          checked={selectedService === service.id}
                          onChange={() => setSelectedService(service.id)}
                          className="w-5 h-5 text-[#0284c7] focus:ring-[#0284c7]"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{service.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {service.duration_minutes} min</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#0284c7]">R$ {Number(service.price).toFixed(2).replace('.', ',')}</p>
                      </div>
                    </label>
                  ))
                )}
                {services.length > 0 && (
                  <Button 
                    className="w-full h-12 text-lg mt-6 bg-[#0284c7] hover:bg-[#0369a1]" 
                    disabled={!selectedService}
                    onClick={handleNext}
                  >
                    Continuar
                  </Button>
                )}
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" /> 
                    Datas Próximas
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
                    {nextDates.map((date, idx) => {
                      const dateStr = format(date, "EEE, dd MMM", { locale: ptBR });
                      const isToday = idx === 0;
                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => setSelectedDate(date)}
                          className={`flex-shrink-0 snap-start py-3 px-5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:ring-offset-1 font-medium capitalize ${
                            selectedDate.getDate() === date.getDate() 
                              ? "bg-[#0284c7] text-white border-[#0284c7] shadow-md shadow-blue-500/20" 
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          {isToday ? `Hoje, ${format(date, "dd MMM", { locale: ptBR })}` : dateStr}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Horários Disponíveis
                  </h3>
                  {availableTimes.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-md border border-slate-100">
                      Fechado ou sem horários neste dia.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      {availableTimes.map((time) => {
                        const occupied = isSlotOccupied(time);
                        return (
                          <button
                            key={time}
                            disabled={occupied}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 rounded border text-sm transition-all font-medium ${
                              occupied 
                                ? "bg-red-50 text-red-400 border-red-100 cursor-not-allowed" 
                                : selectedTime === time
                                ? "bg-[#0284c7] text-white border-[#0284c7]"
                                : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button variant="outline" className="flex-1" onClick={handleBack}>Voltar</Button>
                  <Button className="flex-1 bg-[#0284c7] hover:bg-[#0369a1]" disabled={!selectedTime} onClick={handleNext}>Continuar</Button>
                </div>
              </div>
            )}

            {/* Step 3: User Details */}
            {step === 3 && (
              <form 
                className="space-y-4"
                onSubmit={handleSubmit}
              >
                <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between border border-slate-100 mb-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{services.find(s => s.id === selectedService)?.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{format(selectedDate, "dd MMM", { locale: ptBR })} às {selectedTime}</p>
                  </div>
                  <Button type="button" variant="link" size="sm" onClick={() => setStep(1)} className="text-[#0284c7]">Editar</Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="clientName" className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />
                    Seu Nome Completo
                  </Label>
                  <Input id="clientName" value={clientName} onChange={e => setClientName(e.target.value)} required placeholder="Ex: João da Silva" className="h-11" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="clientPhone" className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    WhatsApp
                  </Label>
                  <Input id="clientPhone" value={clientPhone} onChange={e => setClientPhone(e.target.value)} required placeholder="(00) 00000-0000" className="h-11" type="tel" />
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-100">
                  <Button type="button" variant="outline" className="flex-1 h-12" onClick={handleBack} disabled={submitting}>Voltar</Button>
                  <Button type="submit" className="flex-[2] h-12 text-lg bg-[#0284c7] hover:bg-[#0369a1]" disabled={submitting || !clientName || !clientPhone}>
                    {submitting ? "Confirmando..." : "Confirmar Agendamento"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
