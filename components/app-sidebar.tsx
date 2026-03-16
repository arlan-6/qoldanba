// "use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

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
        <SidebarHeader className="">
          <div
            className={cn(
              "rounded-xl bg-card/60 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0",
              "",
            )}
          >
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={fullName}
                  isActive={currentUrl === "/my/profile"}
                  className="h-8 rounded-lg"
                >
                  <Link href="/my/profile">
                    <User />
                    <span className="truncate">{fullName}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                <SidebarMenuButton tooltip={group} className="h-8 rounded-lg">
                  <Users />
                  <span>{group}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarHeader>

        <SidebarContent className="overflow-hidden p-0">
          <ScrollArea className="h-full px-1">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 pb-1 text-md  tracking-wide text-muted-foreground/80">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Dashboard"
                      isActive={currentUrl === "/my"}
                    >
                      <Link href="/my">
                        <LayoutDashboard />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Links"
                      isActive={currentUrl.startsWith("/my/links")}
                    >
                      <Link href="/my/links">
                        <LinkIcon />
                        <span>Links</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Map"
                      isActive={currentUrl.startsWith("/my/aitumap")}
                    >
                      <Link href="/my/aitumap">
                        <MapIcon />
                        <span>Map</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Academic year"
                      isActive={currentUrl.startsWith("/my/academic-year")}
                    >
                      <Link href="/my/academic-year">
                        <CalendarIcon />
                        <span>Academic year</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                    <div className="mt-1 rounded-xl  bg-card/50">
                      <SidebarCalendar
                        activities={activitiesList as Activity[]}
                      />
                    </div>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/60 p-2 pt-2">
          {/* <SidebarGroupLabel>Support</SidebarGroupLabel> */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Questions?"
                className="h-10 rounded-lg"
              >
                <Link href="https://t.me/ArLaN_XD" target="_blank">
                  <MailQuestion />
                  <span>Contact Telegram</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarTrigger
                // className="mt-1 w-full cursor-pointer rounded-lg"
                size={"lg"}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    );
  } catch (error) {
    console.error("AppSidebar load failed:", error);
    return renderFallbackSidebar();
  }
}
