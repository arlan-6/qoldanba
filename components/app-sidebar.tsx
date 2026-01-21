// "use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";
import { createClient } from "@/lib/supabase/server";
import {
  Calendar as CalendarIcon,
  LayoutDashboard,
  User,
  Users,
  MailQuestion,
  Link as LinkIcon,
  MapIcon,
} from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import SidebarCalendar, { Activity } from "./sidebar-calendar";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata || {};
  const fullName =
    metadata.full_name || metadata.name || metadata.user_name || "User";
  const group = metadata.group ? metadata.group.toUpperCase() : "Not assigned";

  const academic_year =
    new Date().getMonth() < 7
      ? `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`
      : `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  const parseCourseYear = (groupValue: string) => {
    const parts = groupValue.split("-");
    if (parts.length < 2) return 0;
    const academicSuffix = academic_year.split("-")[1]?.slice(2);
    const groupYear = parts[1]?.slice(0, 2);
    const academicYear = Number(academicSuffix);
    const groupYearNumber = Number(groupYear);
    if (Number.isNaN(academicYear) || Number.isNaN(groupYearNumber)) return 0;
    return academicYear - groupYearNumber;
  };

  const course_year = metadata.group ? parseCourseYear(group) : 0;

  const renderFallbackSidebar = () => (
    <Sidebar
      className="pt-18"
      side="left"
      variant="floating"
      collapsible="icon"
      {...props}
    >
      <SidebarContent className="overflow-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="p-4 text-sm text-muted-foreground">
              Unable to load sidebar.
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  if (!user) {
    return renderFallbackSidebar();
  }

  try {
    const today = new Date().toISOString();
    const { data: currentTerm } = await supabase
      .from("academic_calendar_activities")
      .select("term")
      .gte("end_date", today)
      .lte("start_date", today)
      .limit(1)
      .single();

    let activitiesQuery = supabase
      .from("academic_calendar_activities")
      .select("*");

    if (metadata.degreeProgram) {
      activitiesQuery = activitiesQuery.eq(
        "program_level",
        metadata.degreeProgram,
      );
    }

    if (course_year > 0) {
      activitiesQuery = activitiesQuery.eq("course_year", course_year);
    }

    if (academic_year) {
      activitiesQuery = activitiesQuery.eq("academic_year", academic_year);
    }

    const termFilter = currentTerm?.term;
    if (termFilter) {
      activitiesQuery = activitiesQuery.eq("term", termFilter);
    }

    const { data: activities } = await activitiesQuery;
    const activitiesList = activities ?? [];

    const headersList = await headers();
    const currentUrl = headersList.get("x-pathname") ?? "";

    return (
      <Sidebar
        className="pt-18"
        side="left"
        variant="floating"
        collapsible="icon"
        {...props}
      >
        <SidebarContent className="overflow-hidden">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={fullName}
                    isActive={currentUrl === "/my/profile"}
                  >
                    <Link href="/my/profile">
                      <User />
                      <span>{fullName}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={group}>
                    <Users />
                    <span>{group}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard">
                    <Link href="/my">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <div className="flex w-full">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="flex-1 w-full"
                      asChild
                      tooltip="Links"
                    >
                      <Link href="/my/links">
                        <LinkIcon />
                        <span>Links</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="flex-1 w-full"
                      asChild
                      tooltip="Links"
                    >
                      <Link href="/my/aitumap">
                        <MapIcon />
                        <span>Map</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Academic year">
                    <Link href="/my/academic-year">
                      <CalendarIcon />
                      <span>Academic year</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarCalendar activities={activitiesList as Activity[]} />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="mt-auto p-2">
            {/* <SidebarGroupLabel>Support</SidebarGroupLabel> */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Questions?">
                <Link href="https://t.me/ArLaN_XD" target="_blank">
                  <MailQuestion />
                  <span>Contact Telegram</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarTrigger className="cursor-pointer" size={"lg"} />
          </div>
        </SidebarContent>
      </Sidebar>
    );
  } catch (error) {
    console.error("AppSidebar load failed:", error);
    return renderFallbackSidebar();
  }
}
