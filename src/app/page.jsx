"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function Favorites() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/") {
      router.replace("/explore");
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-dvh">
      <Spinner className={"size-10"} />
    </div>
  );
}
