"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FilterSection } from "@/components/dashboard/FilterSection";
import { MovieCard } from "@/components/dashboard/MovieCard";
import { useMovies } from "@/hooks/useMovies";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SearchIcon, FileTextIcon } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState({ type: "", value: "" });
  const { movies, loading, fetchMovies, fetchAndSave, deleteMovie } =
    useMovies();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMovies();
    }
  }, [status]);

  const applyFilter = () => {
    if (filter.type && filter.value) {
      fetchMovies(filter.type, filter.value);
    } else {
      fetchMovies();
    }
  };

  const handleClear = () => {
    fetchMovies();
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader
        user={session.user}
        onFetchMovies={fetchAndSave}
        loading={loading}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
                  {movies.length === 0
                    ? "Nema rezultata za odabrani filter."
                    : `Pronađeno ${movies.length} ${
                        movies.length === 1 ? "rezultat" : "rezultata"
                      }`}
                </p>
              </div>
            )}
            {movies.length === 0 &&
            (!filter.value || filter.value.length === 0) ? (
              <Empty className="w-fit mx-auto border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-8 rounded-md">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </EmptyMedia>
                  <EmptyTitle className="text-base font-medium text-gray-900 dark:text-white">
                    Nema filmova u bazi
                  </EmptyTitle>
                  <EmptyDescription className="text-sm text-gray-500 dark:text-gray-400">
                    Kliknite "Dohvati filmove" za početak
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {movies.map((movie) => (
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
      </main>
    </div>
  );
}
