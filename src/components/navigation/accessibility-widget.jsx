"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersonStanding, Check } from "lucide-react";
import { useAccessibility } from "@/hooks/use-accessibility";

export function AccessibilityWidget() {
  const { settings, updateSetting } = useAccessibility();

  const toggleDyslexiaMode = () => {
    updateSetting("dyslexiaMode", !settings.dyslexiaMode);
  };

  const toggleUnderlineLinks = () => {
    updateSetting("underlineLinks", !settings.underlineLinks);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-9 p-0"
          aria-label="Pristupačnost - opcije za osobe s disleksijom"
        >
          <PersonStanding className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="">
        <DropdownMenuItem
          onClick={toggleDyslexiaMode}
          className="flex items-center justify-between"
        >
          <span>Disleksija</span>
          {settings.dyslexiaMode && <Check className="size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={toggleUnderlineLinks}
          className="flex items-center justify-between"
        >
          <span>Podcrtaj linkove</span>
          {settings.underlineLinks && <Check className="size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
