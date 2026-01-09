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
import { SearchIcon, FileTextIcon, TrendingUpIcon } from "lucide-react";

export default function Popular() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState({
    type: searchParams.get("type") || "",
    value: searchParams.get("value") || "",
  });
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

  // Sort movies by a simulated popularity score (random for now)
  const popularMovies = [...movies].sort((a, b) => {
    // Create a consistent "popularity" score based on movie ID
    const scoreA = parseInt(a._id.slice(-4), 16) || Math.random();
    const scoreB = parseInt(b._id.slice(-4), 16) || Math.random();
    return scoreB - scoreA; // Higher score first
  });

  return (
    <div>
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
                {popularMovies.length === 0
                  ? "Nema rezultata za odabrani filter."
                  : `Pronađeno ${popularMovies.length} ${
                      popularMovies.length === 1 ? "rezultat" : "rezultata"
                    }`}
              </p>
            </div>
          )}
          {popularMovies.length === 0 &&
          (!filter.value || filter.value.length === 0) ? (
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
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
