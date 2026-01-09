"use client";
import { Star, StarHalf } from "lucide-react";

import { cn } from "@/lib/utils";

const MAX_STARS = 10;

const Rating = ({ rate, className }) => {
  if (!rate) return;

  const renderStars = () => {
    const fullStars = Math.floor(rate);
    const emptyStars = MAX_STARS - fullStars;

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`rating-star-full-${i}`}
          className="fill-foreground stroke-foreground"
        />
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`rating-star-empty-${i}`}
          className="fill-foreground/15 stroke-foreground/15"
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
    >
      {renderStars()}
    </div>
  );
};

export { Rating };
