import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Heart, Star, Play, Eye, ThumbsUp, Users, Clock } from "lucide-react";
import { Rating } from "@/components/shadcnblocks/rating";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export function MovieCard({
  movie,
  onDelete,
  isSaved: initialSaved = false,
  userRating: initialRating = 0,
  onSaveToggle,
  onRatingChange,
  isAuthenticated = true,
}) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [userRating, setUserRating] = useState(initialRating);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(false);
  const [saveCount, setSaveCount] = useState(movie?.saveCount || 0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogMessage, setAuthDialogMessage] = useState("");

  // Update internal state when props change
  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  useEffect(() => {
    setUserRating(initialRating);
  }, [initialRating]);

  useEffect(() => {
    setSaveCount(movie?.saveCount || 0);
  }, [movie?.saveCount]);

  async function toggleSave() {
    if (!isAuthenticated) {
      setAuthDialogMessage("Prijavi se kako bi spremio film");
      setShowAuthDialog(true);
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        const response = await fetch("/api/saved_movies", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "unsave",
            movieId: movie._id,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setIsSaved(false);
          setSaveCount((prev) => Math.max(0, prev - 1)); // Decrease count by 1
          toast.success("Film je uklonjen iz spremljenih");
          if (onSaveToggle) await onSaveToggle();
        }
      } else {
        const response = await fetch("/api/saved_movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save",
            movieId: movie._id,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setIsSaved(true);
          setSaveCount((prev) => prev + 1); // Increase count by 1
          toast.success("Film je spremljen");
          if (onSaveToggle) await onSaveToggle();
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast.error("Greška pri spremanju filma");
    } finally {
      setSaving(false);
    }
  }

  async function handleRatingChange(newRating) {
    if (!isAuthenticated) {
      setAuthDialogMessage("Prijavi se kako bi ocijenio film");
      setShowAuthDialog(true);
      return;
    }

    setRating(true);
    try {
      const response = await fetch("/api/saved_movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rate",
          movieId: movie._id,
          rating: newRating,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setUserRating(newRating);
        if (newRating === 0) {
          toast.success("Ocjena je uklonjena");
        } else {
          toast.success(`Film je ocijenjen sa ${newRating}/10`);
        }
        if (onRatingChange) await onRatingChange();
      }
    } catch (error) {
      console.error("Error rating movie:", error);
      toast.error("Greška pri ocjenjivanju filma");
    } finally {
      setRating(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative h-24 sm:h-56 w-full">
          {movie.poster ? (
            <Image
              width={560}
              height={840}
              src={movie.poster}
              alt={`Poster za ${movie.title}`}
              loading="eager"
              className="object-cover h-full w-full"
              unoptimized
              onError={(e) => {
                e.target.src = "https://placehold.co/500x750?text=No+Poster";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
              <span className="text-sm text-gray-400 dark:text-gray-500">
                No Poster
              </span>
            </div>
          )}
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

              {movie.genre && (
                <div className="line-clamp-1 text-xs">{movie.genre}</div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={toggleSave}
                aria-label={
                  isSaved ? "Ukloni iz spremljenih" : "Dodaj u spremljene"
                }
                disabled={saving}
              >
                <Heart
                  className={`size-4 sm:size-6 ${
                    isSaved
                      ? "fill-red-500 stroke-red-500 dark:fill-red-900 dark:stroke-red-900"
                      : ""
                  }`}
                />
              </Button>
              {movie.saveCount !== undefined && (
                <span className="text-xs text-muted-foreground">
                  ({saveCount})
                </span>
              )}
            </div>
          </div>

          <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {/* Ratings */}
            <div>
              {movie.imdbRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star
                    className="size-4 fill-yellow-400 stroke-yellow-400"
                    aria-hidden="true"
                  />

                  {movie.imdbId ? (
                    <Link
                      href={`https://www.imdb.com/title/${movie.imdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      IMDb: {movie.imdbRating.toFixed(1)} / 10
                    </Link>
                  ) : (
                    <span className="">
                      IMDb: {movie.imdbRating.toFixed(1)} / 10
                    </span>
                  )}
                  {movie.imdbVotes && (
                    <span className="text-xs text-gray-500">
                      (
                      {movie.imdbVotes > 1000000
                        ? `${(movie.imdbVotes / 1000000).toFixed(1)}M`
                        : movie.imdbVotes > 1000
                        ? `${(movie.imdbVotes / 1000).toFixed(1)}K`
                        : movie.imdbVotes}
                      )
                    </span>
                  )}
                </div>
              )}
              {movie.rating > 0 && movie.source === "TMDB" && (
                <div className="flex items-center gap-1">
                  <Star
                    className="size-4 fill-blue-400 stroke-blue-400"
                    aria-hidden="true"
                  />
                  <Link
                    href={`https://www.themoviedb.org/movie/${movie.sourceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    TMDB: {movie.rating.toFixed(1)} / 10
                  </Link>
                  {movie.tmdbVotes && (
                    <span className="text-xs text-gray-500">
                      (
                      {movie.tmdbVotes > 1000
                        ? `${(movie.tmdbVotes / 1000).toFixed(1)}K`
                        : movie.tmdbVotes}
                      )
                    </span>
                  )}
                </div>
              )}
              {movie.traktRating && (
                <div className="flex items-center gap-1">
                  <Star
                    className="size-4 fill-green-400 stroke-green-400"
                    aria-hidden="true"
                  />

                  {movie.traktSlug ? (
                    <Link
                      href={`https://trakt.tv/movies/${movie.traktSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Trakt: {movie.traktRating.toFixed(1)} / 10
                    </Link>
                  ) : (
                    <span className="text-xs">
                      Trakt: {movie.traktRating.toFixed(1)} / 10
                    </span>
                  )}

                  {movie.traktVotes && (
                    <span className="text-xs text-gray-500">
                      (
                      {movie.traktVotes > 1000
                        ? `${(movie.traktVotes / 1000).toFixed(1)}K`
                        : movie.traktVotes}
                      )
                    </span>
                  )}
                </div>
              )}

              {movie.appRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star
                    className="size-4 fill-purple-400 stroke-purple-400"
                    aria-hidden="true"
                  />

                  <span className="">
                    Pogled: {movie.appRating.toFixed(1)} / 10
                  </span>
                  {movie.ratingCount && movie.ratingCount > 0 && (
                    <span className="text-xs text-gray-500">
                      ({movie.ratingCount})
                    </span>
                  )}
                </div>
              )}
            </div>

            {movie.traktWatchers && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Users className="size-3" />
                <span>{movie.traktWatchers} gledatelja</span>
              </div>
            )}
            {movie.traktRuntime && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="size-3" />
                <span>{movie.traktRuntime} min</span>
              </div>
            )}
            {movie.youtubeVideoId && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <Link
                  href={`https://www.youtube.com/watch?v=${movie.youtubeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline"
                >
                  <Play className="size-4" />
                  <span className="text-xs font-medium">Pogledaj trailer</span>
                </Link>
                {movie.youtubeViews > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    <Eye className="size-3" />
                    <span>
                      {movie.youtubeViews >= 1000000
                        ? `${(movie.youtubeViews / 1000000).toFixed(1)}M`
                        : movie.youtubeViews >= 1000
                        ? `${(movie.youtubeViews / 1000).toFixed(1)}K`
                        : movie.youtubeViews}{" "}
                      pregleda
                    </span>
                    {movie.youtubeLikes > 0 && (
                      <>
                        <ThumbsUp className="size-3 ml-2" />
                        <span>
                          {movie.youtubeLikes >= 1000000
                            ? `${(movie.youtubeLikes / 1000000).toFixed(1)}M`
                            : movie.youtubeLikes >= 1000
                            ? `${(movie.youtubeLikes / 1000).toFixed(0)}K`
                            : movie.youtubeLikes}{" "}
                          lajkova
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
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

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prijava obavezna</DialogTitle>
            <DialogDescription>{authDialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowAuthDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
