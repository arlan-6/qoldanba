'use client'

import { SidebarTrigger } from "./animate-ui/components/radix/sidebar";
import { usePathname } from "next/navigation";

export default function SidebarTriggerNav() {

    const router = usePathname()
    if(!router.startsWith("/my")) return null
    return (
        <SidebarTrigger  className="block md:hidden"/>
    )
}