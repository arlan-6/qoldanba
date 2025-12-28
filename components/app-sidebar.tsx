// "use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";
import { createClient } from "@/lib/supabase/server";
import { Home, Calendar, LayoutDashboard, User, Group, Users } from "lucide-react";
import Link from "next/link";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata || {};
  const fullName = metadata.full_name || metadata.name || metadata.user_name || "User";
  const group = metadata.group.toUpperCase() || "Not assigned";
  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" {...props}>
      <SidebarContent className="pt-16">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={fullName}>
                  <Link href="/my/profile">  <User />
                  <span>{fullName}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={group}>
                 
                  <Users />
                  <span>{group}</span>
                
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
              <SidebarSeparator className="my-2 mx-0"/>
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
                <SidebarMenuButton asChild tooltip="Dashboard" isActive>
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
          <SidebarTrigger size={"lg"} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
