"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FilterSection } from "@/components/dashboard/filter-section";
import { MovieCard } from "@/components/dashboard/movie-card";
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
import { SearchIcon, FileTextIcon, StarIcon } from "lucide-react";

export default function Watched() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState({
    type: searchParams.get("type") || "",
    value: searchParams.get("value") || "",
  });
  const [movieRatings, setMovieRatings] = useState({});
  const { movies, loading, fetchMovies, fetchAndSave, deleteMovie } =
    useMovies();

  useEffect(() => {
    if (status === "authenticated") {
      const type = searchParams.get("type");
      const value = searchParams.get("value");
      if (type && value) {
        fetchMovies(type, value);
      } else {
        fetchMovies();
      }
    }
    // Load movie ratings from localStorage
    const personalData = JSON.parse(
      localStorage.getItem("DRUMREtempMoviesPersonalData") ||
        '{"ratedMovies":{},"savedMovies":{}}'
    );
    setMovieRatings(personalData.ratedMovies);

    // Listen for storage changes
    const handleStorageChange = () => {
      const personalData = JSON.parse(
        localStorage.getItem("DRUMREtempMoviesPersonalData") ||
          '{"ratedMovies":{},"savedMovies":{}}'
      );
      setMovieRatings(personalData.ratedMovies);
    };

    // Listen for custom event
    const handleMovieRatingsChanged = (event) => {
      setMovieRatings(event.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("movieRatingsChanged", handleMovieRatingsChanged);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "movieRatingsChanged",
        handleMovieRatingsChanged
      );
    };
  }, [status, searchParams]);

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (filter.type && filter.value) {
      params.set("type", filter.type);
      params.set("value", filter.value);
      fetchMovies(filter.type, filter.value);
    } else {
      fetchMovies();
    }
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setFilter({ type: "", value: "" });
    fetchMovies();
    router.push("?");
  };

  const ratedMoviesList = movies.filter(
    (movie) => movieRatings[movie._id]?.rate && movieRatings[movie._id].rate > 0
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <FilterSection
          filter={filter}
          setFilter={setFilter}
          onApplyFilter={applyFilter}
          onClear={handleClear}
          loading={loading}
        />
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
          {filter.type && filter.value && (
            <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                {ratedMoviesList.length === 0
                  ? "Nema rezultata za odabrani filter."
                  : `Pronađeno ${ratedMoviesList.length} ${
                      ratedMoviesList.length === 1 ? "rezultat" : "rezultata"
                    }`}
              </p>
            </div>
          )}
          {ratedMoviesList.length === 0 ? (
            <Empty className="w-fit mx-auto border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-8 rounded-md">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <StarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </EmptyMedia>
                <EmptyTitle className="text-base font-medium text-gray-900 dark:text-white">
                  Nema ocijenjenih filmova
                </EmptyTitle>
                <EmptyDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Kliknite na zvjezdice da ocijenite filmove
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ratedMoviesList.map((movie) => (
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
