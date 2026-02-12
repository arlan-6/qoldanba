"use client";
import Link from "next/link";

import { CalendarIcon, LayoutDashboard, MapIcon, User } from "lucide-react";
import { usePathname } from "next/navigation";

type BottomNavigationProps = {};

export default function BottomNavigation({}: BottomNavigationProps) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    return pathname === href;
  };
  if (pathname === "/") return null; // Don't show on landing page
  return (
    <nav
      className="md:hidden fixed left-0 right-0 bottom-0 z-50 pb-4 pt-2 h-22 border-t border-primary/20 bg-black/40 backdrop-blur-lg"
      style={{ position: "fixed", left: 0, right: 0, bottom: 0, top: "auto" }}
    >
      <div className="w-full max-w-5xl mx-auto h-full flex justify-between items-center px-5">
        <div className="flex items-center justify-between w-full gap-4">
          {/* {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />} */}

          <div className="">
            <Link
              href={"/my"}
              className={`flex flex-col justify-center items-center gap-1 text-sm transition-colors ${
                isActive("/my") ? "text-primary" : "text-gray-300"
              }`}
            >
              <LayoutDashboard />
              <span className="text-xs">Dashboard</span>
            </Link>
          </div>
          <div className="">
            <Link
              href={"/my/aitumap"}
              className={`flex flex-col justify-center items-center gap-1 text-sm transition-colors ${
                isActive("/my/aitumap") ? "text-primary" : "text-gray-300"
              }`}
            >
              <MapIcon />
              <span className="text-xs">AituMap</span>
            </Link>
          </div>
          <div className="">
            <Link
              href={"/my/academic-year"}
              className={`flex flex-col justify-center items-center gap-1 text-sm transition-colors ${
                isActive("/my/academic-year") ? "text-primary" : "text-gray-300"
              }`}
            >
              <CalendarIcon />
              <span className="text-xs">Academic Year</span>
            </Link>
          </div>
          <div className="">
            <Link
              href={"/my/profile"}
              className={`flex flex-col justify-center items-center gap-1 text-sm transition-colors ${
                isActive("/my/profile") ? "text-primary" : "text-gray-300"
              }`}
            >
              <User />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
