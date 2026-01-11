"use client";

import * as React from "react";

import { NavUserSidebar } from "@/components/navbar/nav-user-sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Spinner } from "./ui/spinner";
import { usePathname } from "next/navigation";
import { navigationLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { AccessibilityWidget } from "@/components/accessibility-widget";
import { ThemeToggle } from "@/components/navbar/theme-toggle";
import { Eye, X } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppSidebar({ ...props }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-between gap-2 flex-row">
        <h1 className="w-fit text-xl font-semibold text-gray-900 dark:text-white px-4 py-2 uppercase flex items-center gap-1 w-fit flex-0">
          <span>P</span>
          <Eye className="size-5" />
          <span>gled</span>
        </h1>

        <SidebarTrigger close={true} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="">
          {navigationLinks.map((item) => (
            <SidebarMenuItem key={item.title} className={"mx-1"}>
              <Link
                href={item.url}
                className={cn(
                  pathname.includes(item.url)
                    ? "text-primary dark:text-foreground font-bold"
                    : ""
                )}
              >
                <SidebarMenuButton
                  tooltip={item.title}
                  className={"px-2 cursor-pointer"}
                >
                  <item.icon
                    className={`mr-1 ${
                      pathname.includes(item.url) ? "size-5" : "size-4"
                    }`}
                  />

                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center justify-center gap-2">
            <AccessibilityWidget />
            <ThemeToggle />
          </div>
          <NavUserSidebar />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
