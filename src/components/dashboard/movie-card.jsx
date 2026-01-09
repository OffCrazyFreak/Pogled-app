import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { Rating } from "@/components/shadcnblocks/rating";
import { useState, useEffect } from "react";

export function MovieCard({ movie, onDelete }) {
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const personalData = JSON.parse(
      localStorage.getItem("DRUMREtempMoviesPersonalData") ||
        '{"ratedMovies":{},"savedMovies":{}}'
    );
    setIsSaved(!!personalData.savedMovies[movie._id]);

    setUserRating(personalData.ratedMovies[movie._id]?.rate || 0);
  }, [movie._id]);

  function toggleSave() {
    const personalData = JSON.parse(
      localStorage.getItem("DRUMREtempMoviesPersonalData") ||
        '{"ratedMovies":{},"savedMovies":{}}'
    );
    if (isSaved) {
      delete personalData.savedMovies[movie._id];
    } else {
      personalData.savedMovies[movie._id] = {
        timestamp: Date.now(),
        like: true,
      };
    }
    localStorage.setItem(
      "DRUMREtempMoviesPersonalData",
      JSON.stringify(personalData)
    );
    setIsSaved(!isSaved);
    // Dispatch custom event for other components to listen
    window.dispatchEvent(
      new CustomEvent("savedMoviesChanged", {
        detail: personalData.savedMovies,
      })
    );
  }

  function handleRatingChange(newRating) {
    const personalData = JSON.parse(
      localStorage.getItem("DRUMREtempMoviesPersonalData") ||
        '{"ratedMovies":{},"savedMovies":{}}'
    );
    if (newRating === 0) {
      delete personalData.ratedMovies[movie._id];
    } else {
      personalData.ratedMovies[movie._id] = {
        rate: newRating,
        timestamp: Date.now(),
      };
    }
    localStorage.setItem(
      "DRUMREtempMoviesPersonalData",
      JSON.stringify(personalData)
    );
    setUserRating(newRating);
    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("movieRatingsChanged", {
        detail: personalData.ratedMovies,
      })
    );
  }

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

          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={toggleSave}
            >
              <Heart
                className={`size-4 sm:size-6 ${
                  isSaved
                    ? "fill-red-500 stroke-red-500 dark:fill-red-900 dark:stroke-red-900"
                    : ""
                }`}
              />
            </Button>
            <span className="text-xs text-muted-foreground">
              ({Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000})
            </span>
          </div>
        </div>

        <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {movie.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="size-4 fill-yellow-400 stroke-yellow-400" />
              <span>{movie.rating.toFixed(1)}/10</span>
            </div>
          )}
          {movie.genre && (
            <div className="line-clamp-1 text-xs">{movie.genre}</div>
          )}
        </div>

        <div className="mt-auto">
          <div className="my-2 flex items-center gap-2 text-sm flex-wrap">
            {userRating === 0
              ? "Ocijeni:"
              : `Tvoja ocjena (${userRating} / 10):`}
            <Rating
              rate={userRating}
              interactive={true}
              onChange={handleRatingChange}
            />
          </div>

          <Button
            onClick={() => onDelete(movie._id)}
            variant="destructive"
            className="w-full mt-auto"
          >
            Obriši
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
