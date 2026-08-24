import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // O middleware ja protege estas rotas; esta checagem e a segunda barreira,
  // e garante que `user` existe para os componentes filhos.
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
