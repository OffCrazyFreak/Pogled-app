"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useAccessibility } from "@/hooks/use-accessibility";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function ThemeSwitch({ checked, onCheckedChange, className, ...props }) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none flex size-4 items-center justify-center rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      >
        {checked ? (
          <Moon className="h-3 w-3 text-foreground" />
        ) : (
          <Sun className="h-3 w-3 text-foreground" />
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export function ThemeToggle() {
  const { settings, updateSetting, mounted } = useAccessibility();

  if (!mounted) {
    return null;
  }

  const isDark = settings.theme === "dark";

  return (
    <ThemeSwitch
      checked={isDark}
      onCheckedChange={(checked) =>
        updateSetting("theme", checked ? "dark" : "light")
      }
      aria-label="Toggle theme"
    />
  );
}
