import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
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
    .select("*, companies(name, slug)")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar user={userProfile || null} />
      </div>
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <Topbar companySlug={userProfile?.companies?.slug || null} />
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
