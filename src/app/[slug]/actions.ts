"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { startOfMonth, endOfMonth, format } from "date-fns";

// Check booking limit and reset monthly count if needed
export async function checkBookingLimit(companyId: string): Promise<{
  allowed: boolean;
  plan: string;
  currentCount: number;
  limit: number | null;
}> {
  const supabase = await createClient();
  
  const { data: company } = await supabase
    .from("companies")
    .select("id, plan")
    .eq("id", companyId)
    .single();

  const plan = company?.plan || 'free';

  const now = new Date();
  const startStr = format(startOfMonth(now), "yyyy-MM-dd");
  const endStr = format(endOfMonth(now), "yyyy-MM-dd");

  const { count: realCount } = await supabase
    .from("appointments")
    .select("*", { count: 'exact', head: true })
    .eq("company_id", companyId)
    .gte("appointment_date", startStr)
    .lte("appointment_date", endStr);

  const currentCount = realCount || 0;

  // Determine limit based on plan
  const limits: Record<string, number | null> = {
    free: 30,
    pro: 200,
    premium: null, // unlimited
  };

  const limit = limits[plan] ?? 30;

  return {
    allowed: limit === null || currentCount < limit,
    plan,
    currentCount,
    limit,
  };
}

// O contador agora é real-time, apenas revalidamos o cache
export async function incrementBookingCount(companyId: string) {
  // Revalidate the dashboard layout to show updated plan usage
  revalidatePath('/app', 'layout');
}

export async function sendBookingNotification(data: any) {
  try {
    // Flattening data for n8n
    const n8nData = {
      customer_name: data.customer.name,
      customer_phone: data.customer.phone,
      service: data.service.name,
      appointment_date: data.appointment.date,
      start_time: data.appointment.time,
      company_id: data.company_id,
      company_name: data.company
    };

    const response = await fetch('https://webhook.omniiabr.com/webhook/af-confirmar-agendamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nData),
    });
    
    return { success: response.ok };
  } catch (error) {
    console.error("Erro ao enviar notificação n8n:", error);
    return { success: false, error: String(error) };
  }
}
