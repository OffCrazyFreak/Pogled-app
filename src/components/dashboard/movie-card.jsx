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
    const savedMovies = JSON.parse(localStorage.getItem("savedMovies") || "[]");
    setIsSaved(savedMovies.includes(movie._id));

    const ratings = JSON.parse(localStorage.getItem("movieRatings") || "{}");
    setUserRating(ratings[movie._id] || 0);
  }, [movie._id]);

  function toggleSave() {
    const savedMovies = JSON.parse(localStorage.getItem("savedMovies") || "[]");
    let newSavedMovies;
    if (isSaved) {
      newSavedMovies = savedMovies.filter((id) => id !== movie._id);
    } else {
      newSavedMovies = [...savedMovies, movie._id];
    }
    localStorage.setItem("savedMovies", JSON.stringify(newSavedMovies));
    setIsSaved(!isSaved);
    // Dispatch custom event for other components to listen
    window.dispatchEvent(
      new CustomEvent("savedMoviesChanged", { detail: newSavedMovies })
    );
  }

  function handleRatingChange(newRating) {
    const ratings = JSON.parse(localStorage.getItem("movieRatings") || "{}");
    if (newRating === 0) {
      delete ratings[movie._id];
    } else {
      ratings[movie._id] = newRating;
    }
    localStorage.setItem("movieRatings", JSON.stringify(ratings));
    setUserRating(newRating);
    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("movieRatingsChanged", { detail: ratings })
    );
  }

  // Simulate random rating
  const randomRate = Math.random() * 10; // 0 to 10 stars

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
