"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarClock, LayoutDashboard, Zap, ArrowRight, Menu } from "lucide-react";
import { motion } from "motion/react";
import { CopyrightYear } from "./copyright-year";

// --- Animation Variants (Adjusted for smoother, subtle appearance) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
} as const;

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
} as const;

const imageVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1.0, ease: [0.2, 0.65, 0.3, 0.9] as const }, // Custom cubic-bezier for sophisticated feel
  },
} as const;

// --- Helper Component for Border Gradient Effect ---
const BorderGradientCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`p-[1px] rounded-xl bg-gradient-to-br from-primary/50 via-transparent to-primary/20 ${className}`}>
        {children}
    </div>
);


export default function LandingPage() {
  return (
    // [Change 2: High Contrast Dark Theme] Changed background to very dark
    <div className="flex flex-col w-full min-h-screen bg-black text-white antialiased">
      
      {/* --- BACKGROUND GLOW & LAYERS --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle large electric glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[200px] opacity-70 animate-pulse-slow" />
          {/* Subtle vertical grid texture (Simulated) */}
          <div className="w-full h-full bg-grid-white/[0.05] absolute top-0 left-0" />
      </div>

      

      {/* --- HERO SECTION (Asymmetrical Layout) --- */}
      <section className="relative overflow-hidden pt-24 pb-40 md:pt-32 md:pb-48">
        <div className="container px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">

          {/* LEFT: TEXT AND CTA */}
          <motion.div
            className="text-left max-w-xl md:w-1/2 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* [Change 4: Typography] Ultra-heavy font weight and tracking */}
            <motion.h1
              className="text-6xl font-extrabold tracking-tight lg:text-7xl bg-gradient-to-r from-white via-gray-100 to-primary bg-clip-text text-transparent leading-tight pb-2"
              variants={itemVariants}
            >
              Academic Life,
              <br />
              <span className="text-primary/90">Automated.</span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-400 max-w-lg"
              variants={itemVariants}
            >
              Qoldanba is the central nervous system for your university career, automatically syncing deadlines and class schedules.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4 pt-4"
              variants={itemVariants}
            >
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  // [Change 3: Primary Button] Electric, glowing button style
                  className="gap-2 h-14 px-10 text-lg font-semibold bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(37,99,235,0.7)] hover:shadow-[0_0_30px_rgba(37,99,235,1)] transition-all duration-300"
                >
                  Start Organizing <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT: DASHBOARD PREVIEW (Layered Glassmorphism) */}
          <motion.div
            className="w-full md:w-1/2 relative"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            {/* [Change 5: Glassmorphism] Card with border gradient and backdrop blur */}
            <BorderGradientCard className="shadow-2xl shadow-primary/30">
                <div className="p-2 rounded-[11px] bg-black/50 backdrop-blur-xl border border-white/10">
                    <img
                    src="https://placehold.co/1200x600/0f172a/ffffff?text=Dynamic+Schedule+and+Deadlines"
                    alt="Qoldanba Dashboard"
                    className="rounded-lg w-full h-auto object-cover border border-white/10"
                    width={1200}
                    height={600}
                    />
                </div>
            </BorderGradientCard>
            {/* Floating accent elements */}
             <div className="absolute top-[-20px] left-[-20px] w-12 h-12 bg-primary/80 rounded-full blur-xl animate-float-up-down" />
             <div className="absolute bottom-[20px] right-[20px] w-8 h-8 bg-blue-400/80 rounded-full blur-lg animate-float-down-up" />
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES SECTION (Clean Grid) --- */}
      <section id="features" className="py-28 w-full">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full border border-primary/40 text-primary mb-3 uppercase tracking-wider">
                Intelligence built in
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-white mb-4">
              Focus on learning, not logistics.
            </h2>
            <p className="text-gray-400 text-lg">
              Unlock a distraction-free workflow with core features designed specifically for ambitious students.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                icon: CalendarClock,
                title: "Auto-Sync Deadlines",
                desc: "Connect your LMS/calendar once, and we handle the rest. Never miss an assignment or exam again.",
              },
              {
                icon: LayoutDashboard,
                title: "The Ultimate Dashboard",
                desc: "See your week, your grades, and upcoming tasks in one streamlined, customizable view.",
              },
              {
                icon: Zap,
                title: "Real-Time Updates",
                desc: "Get instant notifications for class changes, room shifts, and assignment grade drops.",
              },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants} className="h-full">
                {/* [Change 5: Feature Card Style] Glassy, subtle hover effect */}
                <BorderGradientCard className="h-full transition-all duration-300 hover:shadow-primary/50 hover:shadow-xl">
                    <Card className="h-full bg-black/50 backdrop-blur-md border border-white/10 text-white">
                      <CardHeader>
                        <feature.icon className="h-10 w-10 text-primary mb-2 p-2 rounded-lg bg-primary/10 border border-primary/30" />
                        <CardTitle className="text-xl font-medium">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base text-gray-400">
                          {feature.desc}
                        </CardDescription>
                      </CardContent>
                    </Card>
                </BorderGradientCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* --- FOOTER --- */}
      <footer className="py-12 w-full border-t border-primary/20 bg-black/40">
        <div className="container text-center text-gray-500 text-sm">
           <p>&copy; <CopyrightYear/> Qoldanba. All rights reserved. <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></p>
        </div>
      </footer>
    </div>
  );
}