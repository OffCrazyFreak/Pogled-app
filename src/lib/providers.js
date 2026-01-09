"use client";

import { AccessibilityProvider } from "@/hooks/use-accessibility";
import { ThemeApplier } from "@/components/theme-applier";
import SessionProvider from "@/lib/session-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Providers({ children }) {
  return (
    <AccessibilityProvider>
      <ThemeApplier />
      <SessionProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </SessionProvider>
    </AccessibilityProvider>
  );
}
