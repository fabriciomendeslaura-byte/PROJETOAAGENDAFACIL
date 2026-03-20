import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { redirect } from "next/navigation";
import { PlanType } from "@/lib/plans";
import { PlanProvider } from "@/lib/PlanContext";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch company and user details including plan info
  const { data: userProfile, error } = await supabase
    .from("users")
    .select("*, companies(id, name, slug, logo_url, plan, monthly_appointments_count, last_reset_date)")
    .eq("id", user.id)
    .single();

  const company = userProfile?.companies;

  // Strict check: if the user doesn't have a profile or company (e.g. from an old test account before triggers)
  // we must block access because the app requires a company to function.
  if (!userProfile || !company || error) {
    // Log them out and redirect
    await supabase.auth.signOut();
    redirect("/cadastro?error=incomplete_account_please_register_again");
  }

  const dbPlan = (company?.plan || 'free').toLowerCase();
  const plan = (dbPlan === 'free' || dbPlan === 'pro' || dbPlan === 'premium') 
    ? dbPlan as PlanType 
    : 'free';

  // Real-time count of appointments for the current month
  const now = new Date();
  const startStr = format(startOfMonth(now), "yyyy-MM-dd");
  const endStr = format(endOfMonth(now), "yyyy-MM-dd");

  const { count: realCount } = await supabase
    .from("appointments")
    .select("*", { count: 'exact', head: true })
    .eq("company_id", company?.id)
    .gte("appointment_date", startStr)
    .lte("appointment_date", endStr);

  const monthlyCount = realCount || 0;

  return (
    <PlanProvider plan={plan} monthlyCount={monthlyCount}>
      <DashboardShell userProfile={userProfile}>
        {children}
      </DashboardShell>
      <UpgradeModal />
    </PlanProvider>
  );
}

