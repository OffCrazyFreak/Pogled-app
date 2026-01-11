"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { FilterSection } from "@/components/filter-section";
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
  const [savedMovies, setSavedMovies] = useState({});
  const [movieRatings, setMovieRatings] = useState({});
  const { movies, loading, fetchMovies, fetchAndSave, deleteMovie, deleteAll } =
    useMovies();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      // Get saved and rated movies to exclude from recommendations
      const personalData = JSON.parse(
        localStorage.getItem("DRUMREtempMoviesPersonalData") ||
          '{"ratedMovies":{},"savedMovies":{}}'
      );
      setSavedMovies(personalData.savedMovies);
      setMovieRatings(personalData.ratedMovies);

      // Listen for custom events
      const handleSavedMoviesChanged = (event) => {
        setSavedMovies(event.detail);
      };
      const handleMovieRatingsChanged = (event) => {
        setMovieRatings(event.detail);
      };

      window.addEventListener("savedMoviesChanged", handleSavedMoviesChanged);
      window.addEventListener("movieRatingsChanged", handleMovieRatingsChanged);

      return () => {
        window.removeEventListener(
          "movieRatingsChanged",
          handleMovieRatingsChanged
        );
      };
    }
    return;
  }, [status]);

  useEffect(() => {
    const recommendedMovies = movies.filter(
      (movie) => !savedMovies[movie._id] && !movieRatings[movie._id]?.rate
    );
    if (!loading && recommendedMovies.length > 0) {
      setAnnouncement(`Učitano ${recommendedMovies.length} filmova`);
    }
  }, [savedMovies, movieRatings, movies, loading]);

  // Filter out movies that are already saved or rated
  const recommendedMovies = movies.filter(
    (movie) => !savedMovies[movie._id] && !movieRatings[movie._id]?.rate
  );

  return (
    <div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Suspense fallback={null}>
            <FilterSection
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
              <Download className="h-4 w-4" />
              {loading ? "Učitavanje..." : "Dohvati filmove"}
            </Button>

            {movies.length > 0 && (
              <Button
                onClick={deleteAll}
                disabled={loading}
                variant="destructive"
                className="flex items-center gap-2 flex-1"
              >
                <Trash2 className="h-4 w-4" />
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
              <Spinner className="h-8 w-8" />
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {currentFilter.type && currentFilter.value && (
            <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                {recommendedMovies.length === 0
                  ? "Nema rezultata za odabrani filter."
                  : `Pronađeno ${recommendedMovies.length} ${
                      recommendedMovies.length === 1 ? "rezultat" : "rezultata"
                    }`}
              </p>
            </div>
          )}
          {recommendedMovies.length === 0 ? (
            <Empty className="w-fit mx-auto border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-8 rounded-md">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SparklesIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </EmptyMedia>
                <EmptyTitle className="text-base font-medium text-gray-900 dark:text-white">
                  Nema preporučenih filmova
                </EmptyTitle>
                <EmptyDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Svi filmovi su već spremljeni ili ocijenjeni
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recommendedMovies.map((movie) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onDelete={deleteMovie}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
