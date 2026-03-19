"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
    .select("plan, monthly_appointments_count, last_reset_date")
    .eq("id", companyId)
    .single();

  const plan = company?.plan || 'free';
  let currentCount = company?.monthly_appointments_count || 0;
  const lastReset = company?.last_reset_date;

  // Check if we need to reset the monthly counter
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  if (lastReset) {
    const resetMonth = lastReset.substring(0, 7); // "YYYY-MM"
    if (resetMonth !== currentMonth) {
      // Reset counter for new month
      await supabase
        .from("companies")
        .update({
          monthly_appointments_count: 0,
          last_reset_date: now.toISOString().split('T')[0],
        })
        .eq("id", companyId);
      currentCount = 0;
    }
  } else {
    // First time - set the reset date
    await supabase
      .from("companies")
      .update({
        last_reset_date: now.toISOString().split('T')[0],
      })
      .eq("id", companyId);
  }

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

// Increment the monthly appointment counter
export async function incrementBookingCount(companyId: string) {
  const supabase = await createClient();
  
  // Use RPC or just increment manually
  const { data: company } = await supabase
    .from("companies")
    .select("monthly_appointments_count")
    .eq("id", companyId)
    .single();

  const newCount = (company?.monthly_appointments_count || 0) + 1;

  await supabase
    .from("companies")
    .update({ monthly_appointments_count: newCount })
    .eq("id", companyId);

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
