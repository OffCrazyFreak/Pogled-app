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
import { SearchIcon, FileTextIcon, HeartIcon } from "lucide-react";

export default function Favorites() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState({
    type: searchParams.get("type") || "",
    value: searchParams.get("value") || "",
  });
  const [savedMovies, setSavedMovies] = useState([]);
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
    // Load saved movies from localStorage
    const saved = JSON.parse(localStorage.getItem("savedMovies") || "[]");
    setSavedMovies(saved);

    // Listen for storage changes
    const handleStorageChange = () => {
      const saved = JSON.parse(localStorage.getItem("savedMovies") || "[]");
      setSavedMovies(saved);
    };

    window.addEventListener("storage", handleStorageChange);
    // Listen for custom event
    const handleSavedMoviesChanged = (event) => {
      setSavedMovies(event.detail);
    };
    window.addEventListener("savedMoviesChanged", handleSavedMoviesChanged);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "savedMoviesChanged",
        handleSavedMoviesChanged
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

  const savedMoviesList = movies.filter((movie) =>
    savedMovies.includes(movie._id)
  );

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
                {savedMoviesList.length === 0
                  ? "Nema rezultata za odabrani filter."
                  : `Pronađeno ${savedMoviesList.length} ${
                      savedMoviesList.length === 1 ? "rezultat" : "rezultata"
                    }`}
              </p>
            </div>
          )}
          {savedMoviesList.length === 0 ? (
            <Empty className="w-fit mx-auto border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-8 rounded-md">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HeartIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </EmptyMedia>
                <EmptyTitle className="text-base font-medium text-gray-900 dark:text-white">
                  Nema spremljenih filmova
                </EmptyTitle>
                <EmptyDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Kliknite na srce da spremite filmove
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedMoviesList.map((movie) => (
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
