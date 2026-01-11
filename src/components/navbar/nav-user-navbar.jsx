"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Download, LogOut } from "lucide-react";
import { useMovies } from "@/hooks/use-movies";

export function NavUserNavbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const { fetchAndSave, loading } = useMovies();

  if (!session) {
    return (
      <Button onClick={() => signIn("google")} variant="outline" size="sm">
        Prijavi se
      </Button>
    );
  }

  return (
    <>
      {/* Desktop: Show user info and chevron */}
      <div className="hidden sm:flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900 dark:data-[state=open]:bg-gray-700 dark:data-[state=open]:text-white">
              <Avatar className="size-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronDown className="size-4" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) rounded-lg"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={fetchAndSave} disabled={loading}>
              <Download className="mr-1" />
              {loading ? "Učitavanje..." : "Dohvati filmove"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-1" />
              Odjavi se
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: Show avatar as trigger */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="size-7 ">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-fit rounded-lg"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={fetchAndSave} disabled={loading}>
              <Download className="mr-1" />
              {loading ? "Učitavanje..." : "Dohvati filmove"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-1" />
              Odjavi se
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
