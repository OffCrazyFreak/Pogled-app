"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { MovieFilter } from "@/components/movie-filter";
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
import {
  SearchIcon,
  FileTextIcon,
  SparklesIcon,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Recommended() {
  const { data: session, status } = useSession();
  const [currentFilter, setCurrentFilter] = useState({ type: "", value: "" });
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
    fetchRecommendations,
  } = useMovies();
  const [announcement, setAnnouncement] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSavedMovies();
      fetchRatedMovies();
      loadRecommendations();
    }
  }, [status]);

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const recs = await fetchRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    if (!loadingRecommendations && recommendations.length > 0) {
      setAnnouncement(`Učitano ${recommendations.length} preporuka`);
    }
  }, [recommendations, loadingRecommendations]);

  const handleSaveToggle = async () => {
    await fetchSavedMovies();
    await loadRecommendations();
  };

  const handleRatingChange = async () => {
    await fetchRatedMovies();
    await loadRecommendations();
  };

  // Apply filters to recommendations
  const filteredRecommendations = recommendations.filter((movie) => {
    if (!currentFilter.type || !currentFilter.value) {
      return true; // No filter applied
    }

    const filterValue = currentFilter.value.toLowerCase();

    switch (currentFilter.type) {
      case "title":
        return movie.title.toLowerCase().includes(filterValue);
      case "year":
        return movie.year === parseInt(currentFilter.value);
      case "yearMin":
        return movie.year >= parseInt(currentFilter.value);
      case "yearMax":
        return movie.year <= parseInt(currentFilter.value);
      case "rating":
        return movie.rating >= parseFloat(currentFilter.value);
      case "genre":
        return movie.genre && movie.genre.toLowerCase().includes(filterValue);
      case "source":
        return movie.source === currentFilter.value.toUpperCase();
      default:
        return true;
    }
  });

  return (
    <div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Suspense fallback={null}>
            <MovieFilter
              fetchMovies={fetchMovies}
              onFilterApplied={setCurrentFilter}
              loading={loading}
            />
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

      {loadingRecommendations && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <Spinner className="size-8" />
            </div>
          </div>
        </div>
      )}

      {!loadingRecommendations && (
        <>
          {filteredRecommendations.length === 0 ? (
            <Empty className="w-fit mx-auto border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-8 rounded-md">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SparklesIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </EmptyMedia>
                <EmptyTitle className="text-base font-medium text-gray-900 dark:text-white">
                  {recommendations.length === 0
                    ? "Nema preporučenih filmova"
                    : "Nema rezultata za primijenjene filtere"}
                </EmptyTitle>
                <EmptyDescription className="text-sm text-gray-500 dark:text-gray-400">
                  {recommendations.length === 0
                    ? "Svi dostupni filmovi su već spremljeni ili ocijenjeni"
                    : "Pokušajte prilagoditi filtere"}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRecommendations.map((movie) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onDelete={deleteMovie}
                  isSaved={false}
                  userRating={0}
                  onSaveToggle={handleSaveToggle}
                  onRatingChange={handleRatingChange}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
