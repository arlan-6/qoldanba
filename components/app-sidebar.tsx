// "use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  Home,
  Calendar,
  LayoutDashboard,
  User,
  Group,
  Users,
  MailQuestion,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { LogoutButton } from "./logout-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

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
  const group = metadata.group.toUpperCase() || "Not assigned";

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
      <SidebarContent>
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
            <SidebarSeparator className="my-2 mx-0" />
            <SidebarMenu>
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Home">
                  <Link href="/">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/my">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Setings">
                  <Link href="/settings">
                    <Calendar />
                    <span>Setings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Questions?">
              <Link href="https://t.me/ArLaN_XD" target="_blank">
                <MailQuestion />
                <span>Contact Telegram</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator className="my-2 mx-0" />
          <SidebarTrigger size={"lg"} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
