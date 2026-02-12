import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";
import Navigation from "@/components/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/github");
    }
  return (
    
    <SidebarProvider defaultOpen={false}>
      <main className="min-h-screen pb-16 md:pb-0 flex-1 w-full">
        <Suspense
          fallback={
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background/80 backdrop-blur-md sticky top-0 z-50" />
          }
        >
          <Navigation />
        </Suspense>
        <div className="flex">
          <AppSidebar />
          <div className="flex-1 overflow-auto bg-background/80  ">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
