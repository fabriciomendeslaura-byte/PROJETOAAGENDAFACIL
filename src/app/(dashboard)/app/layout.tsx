import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { redirect } from "next/navigation";
import { PlanType } from "@/lib/plans";
import { PlanProvider } from "@/lib/PlanContext";
import { UpgradeModal } from "@/components/ui/UpgradeModal";

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
    .select("*, companies(name, slug, logo_url, plan, monthly_appointments_count, last_reset_date)")
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
  const monthlyCount = company?.monthly_appointments_count || 0;

  return (
    <PlanProvider plan={plan} monthlyCount={monthlyCount}>
      <DashboardShell userProfile={userProfile}>
        {children}
      </DashboardShell>
      <UpgradeModal />
    </PlanProvider>
  );
}

