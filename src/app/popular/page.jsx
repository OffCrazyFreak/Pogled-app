"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { MovieCard } from "@/components/movie-card";
import { useMovies } from "@/hooks/use-movies";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TrendingUpIcon, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { TimeRangeTabs } from "@/components/time-range-tabs";

export default function Popular() {
  const { data: session, status } = useSession();
  const [timeRange, setTimeRange] = useState("today");
  const {
    movies,
    loading,
    savedMovies,
    ratedMovies,
    fetchMovies,
    fetchAndSave,
    fetchSavedMovies,
    fetchRatedMovies,
    deleteMovie,
    deleteAll,
  } = useMovies();
  const [announcement, setAnnouncement] = useState("");
  const [popularityScores, setPopularityScores] = useState({});
  const [loadingPopularity, setLoadingPopularity] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMovies();
      fetchSavedMovies();
      fetchRatedMovies();
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPopularityScores();
    }
  }, [status, timeRange]);

  const fetchPopularityScores = async () => {
    setLoadingPopularity(true);
    try {
      const response = await fetch(
        `/api/saved_movies?type=popularity&timeRange=${timeRange}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const scores = JSON.parse(data.final);
        setPopularityScores(scores);
      }
    } catch (error) {
      console.error("Error fetching popularity scores:", error);
      toast.error("Greška pri dohvaćanju popularnosti");
    } finally {
      setLoadingPopularity(false);
    }
  };

  useEffect(() => {
    if (!loading && movies.length > 0) {
      setAnnouncement(`Učitano ${movies.length} filmova`);
    }
  }, [movies, loading]);

  const handleSaveToggle = async () => {
    await fetchSavedMovies();
    await fetchMovies(); // Refresh to get updated save counts
    await fetchPopularityScores(); // Refresh popularity scores
  };

  const handleRatingChange = async () => {
    await fetchRatedMovies();
    await fetchMovies(); // Refresh to get updated popularity scores
    await fetchPopularityScores(); // Refresh popularity scores
  };

  // Sort movies by real popularity score from database
  const popularMovies = [...movies]
    .filter((movie) => {
      // Filter out movies that are already rated (watched)
      const isRated = ratedMovies.some(
        (rm) => rm.movieId === movie._id && rm.rating > 0
      );
      return !isRated;
    })
    .map((movie) => ({
      ...movie,
      popularityScore: popularityScores[movie._id] || 0,
    }))
    .sort((a, b) => b.popularityScore - a.popularityScore);

  // Create maps for saved/rated status
  const savedMap = {};
  const ratingsMap = {};

  savedMovies.forEach((sm) => {
    savedMap[sm.movieId] = true;
  });
  ratedMovies.forEach((rm) => {
    if (rm.rating && rm.rating > 0) {
      ratingsMap[rm.movieId] = rm.rating;
    }
  });

  return (
    <div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="mb-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Suspense fallback={null}>
            <TimeRangeTabs onRangeApplied={setTimeRange} />
          </Suspense>

          <div className="flex gap-2 items-center justify-between w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <Button
              onClick={fetchAndSave}
              disabled={loading}
              className="flex items-center gap-2 flex-1"
            >
              <Download className="size-4" />
              {loading ? "Učitavanje..." : "Dohvati filmove"}
            </Button>

            {movies.length > 0 && (
              <Button
                onClick={deleteAll}
                disabled={loading}
                variant="destructive"
                className="flex items-center gap-2 flex-1"
              >
                <Trash2 className="size-4" />
                Obriši sve
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <Spinner className="size-8" />
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {popularMovies.length === 0 ? (
            <Empty className="w-fit mx-auto border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-8 rounded-md">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TrendingUpIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </EmptyMedia>
                <EmptyTitle className="text-base font-medium text-gray-900 dark:text-white">
                  Nema popularnih filmova
                </EmptyTitle>
                <EmptyDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Kliknite "Dohvati filmove" za početak
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {popularMovies.map((movie) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onDelete={deleteMovie}
                  isSaved={savedMap[movie._id] || false}
                  userRating={ratingsMap[movie._id] || 0}
                  onSaveToggle={() => {
                    fetchSavedMovies();
                  }}
                  onRatingChange={() => {
                    fetchRatedMovies();
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
