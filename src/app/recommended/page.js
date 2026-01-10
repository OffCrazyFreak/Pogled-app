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
import { SearchIcon, FileTextIcon, SparklesIcon, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Recommended() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState({
    type: searchParams.get("type") || "",
    value: searchParams.get("value") || "",
  });
  const { movies, loading, fetchMovies, fetchAndSave, deleteMovie, deleteAll } =
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

  // Get saved and rated movies to exclude from recommendations
  const savedMovies = JSON.parse(
    localStorage.getItem("DRUMREsavedMovies") || "[]"
  );
  const movieRatings = JSON.parse(
    localStorage.getItem("DRUMREmovieRatings") || "{}"
  );

  // Filter out movies that are already saved or rated
  const recommendedMovies = movies.filter(
    (movie) =>
      !savedMovies.some((item) => item.id === movie._id) &&
      !movieRatings[movie._id]?.rating
  );

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <FilterSection
              filter={filter}
              setFilter={setFilter}
              onApplyFilter={applyFilter}
              onClear={handleClear}
              loading={loading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchAndSave}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? "Učitavanje..." : "Dohvati filmove"}
            </Button>
            {movies.length > 0 && (
              <Button
                onClick={deleteAll}
                disabled={loading}
                variant="destructive"
                className="flex items-center gap-2"
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
          {filter.type && filter.value && (
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
