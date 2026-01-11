"use client";

import { ThemeToggle } from "@/components/navbar/theme-toggle";
import { AccessibilityWidget } from "@/components/accessibility-widget";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { NavUserNavbar } from "@/components/navbar/nav-user-navbar";
import { navigationLinks } from "@/lib/navigation";
import { usePathname } from "next/navigation";
import { Eye } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="lg:hidden" />

          <h1 className="text-xl font-semibold text-gray-900 dark:text-white uppercase flex items-center gap-1">
            <span>P</span>
            <Eye className="size-5" />
            <span>gled</span>
          </h1>

          <nav className="hidden lg:flex items-center gap-4">
            {navigationLinks.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                className={`hover:text-gray-900 dark:hover:text-white flex items-center gap-1 ${
                  pathname.includes(item.url)
                    ? "text-primary dark:text-foreground font-bold"
                    : ""
                }`}
              >
                <item.icon
                  className={`mr-1 ${
                    pathname.includes(item.url) ? "size-5" : "size-4"
                  }`}
                />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <AccessibilityWidget />
          <ThemeToggle />

          <NavUserNavbar />
        </div>
      </div>
    </header>
  );
}
