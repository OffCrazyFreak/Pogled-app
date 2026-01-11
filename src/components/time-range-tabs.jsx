"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIME_RANGES = [
  { key: "today", label: "Danas" },
  { key: "week", label: "Tjedan" },
  { key: "month", label: "Mjesec" },
  { key: "year", label: "Godina" },
  { key: "all", label: "Sve vrijeme" },
];

export function TimeRangeTabs({ onRangeApplied }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timeRange, setTimeRange] = useState(
    searchParams.get("range") || "all"
  );

  useEffect(() => {
    const initialRange = searchParams.get("range") || "all";
    setTimeRange(initialRange);
    if (onRangeApplied) {
      onRangeApplied(initialRange);
    }
  }, [searchParams, onRangeApplied]);

  useEffect(() => {
    // Update URL when time range changes
    const params = new URLSearchParams();
    if (timeRange !== "all") {
      params.set("range", timeRange);
    }
    const newUrl = `?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [timeRange, router]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    if (onRangeApplied) {
      onRangeApplied(range);
    }
  };

  return (
    <div
      role="tablist"
      className="w-full sm:w-auto flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide snap-x snap-mandatory"
    >
      {TIME_RANGES.map((range) => (
        <Button
          key={range.key}
          role="tab"
          aria-selected={timeRange === range.key}
          variant={timeRange === range.key ? "default" : "outline"}
          size="sm"
          onClick={() => handleTimeRangeChange(range.key)}
          className={cn(
            "transition-all flex-shrink-0 snap-start",
            timeRange === range.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted"
          )}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
