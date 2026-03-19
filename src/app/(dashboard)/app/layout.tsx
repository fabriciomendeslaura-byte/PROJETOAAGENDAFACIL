import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { redirect } from "next/navigation";
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
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, companies(name, slug, logo_url, plan, monthly_appointments_count, last_reset_date)")
    .eq("id", user.id)
    .single();

  const company = userProfile?.companies;
  const plan = company?.plan || 'free';
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

