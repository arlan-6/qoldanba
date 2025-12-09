import Navigation from "@/components/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <div className="flex-1 w-full ">
        <Suspense
          fallback={
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background/80 backdrop-blur-md sticky top-0 z-50" />
          }
        >
          <Navigation />
        </Suspense>
        <div className="">
          {children}
        </div>

       
      </div>
    </main>
  );
}
