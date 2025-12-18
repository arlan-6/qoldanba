import Navigation from "@/components/navigation";
import LandingPage from "@/components/landing-page"; // Import the client component
import { Suspense } from "react";
import { Metadata } from "next";

// Define SEO Metadata here
export const metadata: Metadata = {
  title: "Intelligent Academic Autopilot",
  description:
    "Centralize your university life. Auto-sync deadlines from LMS and view your class schedule in one dashboard.",
  openGraph: {
    title: "Qoldanba - Intelligent Academic Autopilot",
    description: "The intelligent academic autopilot for modern students.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qoldanba - Intelligent Academic Autopilot",
    description:
      "Centralize your university life. Auto-sync deadlines from LMS.",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background">
      <div className="flex-1 w-full flex flex-col items-center">
        {/* Navigation wrapped in Suspense (as requested) */}
        <Suspense
          fallback={
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background/80 backdrop-blur-md sticky top-0 z-50" />
          }
        >
          <Navigation />
        </Suspense>

        <div className="w-full flex-1">
          {/* The Animated Client Component */}
          <LandingPage />
        </div>
      </div>
    </main>
  );
}
