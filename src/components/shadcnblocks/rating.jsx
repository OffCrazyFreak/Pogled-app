"use client";
import { Star, StarHalf } from "lucide-react";

import { cn } from "@/lib/utils";

const MAX_STARS = 10;

export function Rating({ rate, className, onChange, interactive = false }) {
  const renderStars = () => {
    const fullStars = Math.floor(rate || 0);
    const emptyStars = MAX_STARS - fullStars;

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`rating-star-full-${i}`}
          className={cn(
            "fill-yellow-400 stroke-yellow-400",
            interactive && "cursor-pointer hover:scale-110 transition-transform"
          )}
          onClick={() => interactive && onChange && onChange(i + 1)}
          aria-label={interactive ? `Ocijeni ${i + 1} zvjezdica` : undefined}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
        />
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`rating-star-empty-${i}`}
          className={cn(
            "fill-foreground/15 stroke-foreground/15",
            interactive && "cursor-pointer hover:scale-110 transition-transform"
          )}
          onClick={() => interactive && onChange && onChange(fullStars + i + 1)}
          aria-label={
            interactive ? `Ocijeni ${fullStars + i + 1} zvjezdica` : undefined
          }
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
        />
      );
    }

    return stars;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 [&_svg]:size-5 [&>div]:size-5",
        className
      )}
      role={interactive ? "group" : undefined}
      aria-label={interactive ? "Ocjenjivanje filma" : undefined}
    >
      {renderStars()}
    </div>
  );
}
