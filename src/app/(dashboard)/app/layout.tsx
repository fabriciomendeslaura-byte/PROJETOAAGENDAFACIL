import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { redirect } from "next/navigation";

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

  // Fetch company and user details
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, companies(name, slug, logo_url)")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell userProfile={userProfile}>
      {children}
    </DashboardShell>
  );
}
