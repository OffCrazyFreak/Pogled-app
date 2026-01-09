import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Rating } from "@/components/shadcnblocks/rating";

export function MovieCard({ movie, onDelete }) {
  // Simulate liked state randomly
  const isLiked = Math.random() > 0.5;
  // Simulate random rating
  const randomRating = Math.random() * 5;

  return (
    <Card className="overflow-hidden">
      <div className="relative h-24 sm:h-56 w-full">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/500x750?text=No+Poster";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
            <span className="text-sm text-gray-400 dark:text-gray-500">
              No Poster
            </span>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Badge variant={movie.source === "TMDB" ? "default" : "secondary"}>
            {movie.source}
          </Badge>
        </div>
      </div>

      <CardContent className="p-2 sm:py-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>
            <CardTitle className="line-clamp-2 text-base">
              {movie.title}
            </CardTitle>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {movie.year}
            </div>
          </div>

          <Button variant="ghost" size="sm" className="p-1">
            <Heart
              className={`size-4 sm:size-6 ${
                isLiked
                  ? "fill-red-500 stroke-red-500 dark:fill-red-900 dark:stroke-red-900"
                  : ""
              }`}
            />
          </Button>
        </div>

        <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {movie.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-500">★</span>
              <span>{movie.rating.toFixed(1)}/10</span>
            </div>
          )}
          {movie.genre && (
            <div className="line-clamp-1 text-xs">{movie.genre}</div>
          )}
        </div>
        <Button
          onClick={() => onDelete(movie._id)}
          variant="destructive"
          className="w-full mt-auto"
        >
          Obriši
        </Button>
      </CardContent>
    </Card>
  );
}
