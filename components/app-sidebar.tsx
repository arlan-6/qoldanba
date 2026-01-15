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
  SidebarSeparator,
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

  const course_year =
    Number(academic_year.split("-")[1].slice(2)) -
    Number(group.split("-")[1].slice(0, 2));

const today = new Date().toISOString()

const { data: currentTerm, error } = await supabase
  .from("academic_calendar_activities")
  .select("term")
  .gte("end_date", today)
  .lte("start_date", today)
  .limit(1)
  .single();



  const { data: activities } = await supabase
    .from("academic_calendar_activities")
    .select("*")
    .eq("program_level", metadata.degreeProgram)
    .eq("course_year", course_year)
    .eq("academic_year", academic_year)
    // .eq("term", currentTerm?.term || "");

  // console.log(activities);

  const headersList = await headers();
  const currentUrl = headersList.get("x-pathname");
  // console.log(currentUrl);
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
                {/* <SidebarGroupLabel>Profile</SidebarGroupLabel> */}
                <SidebarMenuButton
                  asChild
                  tooltip={fullName}
                  isActive={currentUrl === "/my/profile"}
                >
                  <Link href="/my/profile">
                    {" "}
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
            {/* <SidebarSeparator className="my-2 mx-0" /> */}

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
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Links">
                  <Link href="/my/links">
                    <LinkIcon />
                    <span>Links</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Academic year">
                  <Link href="/my/academic-year">
                    <CalendarIcon />
                    <span>Academic year</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                {/* Calendar */}
                <SidebarCalendar activities={activities as Activity[]} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-2">
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Questions?">
              <Link href="https://t.me/ArLaN_XD" target="_blank">
                <MailQuestion />
                <span>Contact Telegram</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* <SidebarSeparator className="my-2 mx-0" /> */}
          <SidebarTrigger size={"lg"} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
