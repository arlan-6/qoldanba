import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";
import Navigation from "@/components/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <main className="min-h-screen flex-1 w-full">
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
