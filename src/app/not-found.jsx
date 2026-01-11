"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mx-auto max-w-7xl">
        <Empty>
          <EmptyMedia>
            <HomeIcon className="h-12 w-12 text-gray-400" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Stranica nije pronađena</EmptyTitle>
            <EmptyDescription>
              Tražena stranica ne postoji. Vratite se na početnu stranicu.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button onClick={() => router.back()}>
                <ChevronLeftIcon className="mr-2 size-4" />
                Povratak
              </Button>
              <Link href="/explore">
                <Button variant="outline">
                  <HomeIcon className="mr-2 size-4" />
                  Idi na Explore
                </Button>
              </Link>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
