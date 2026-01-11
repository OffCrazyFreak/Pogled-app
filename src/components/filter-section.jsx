"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function FilterSection({ fetchMovies, onFilterApplied, loading }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState({
    type: searchParams.get("type") || "",
    value: searchParams.get("value") || "",
  });

  useEffect(() => {
    setFilter({
      type: searchParams.get("type") || "",
      value: searchParams.get("value") || "",
    });
  }, [searchParams]);

  useEffect(() => {
    if (filter.type && filter.value) {
      applyFilter();
    } else {
      fetchMovies();
    }
  }, []);

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
    onFilterApplied(filter);
  };

  const handleClear = () => {
    setFilter({ ...filter, value: "" });
    fetchMovies();
    router.push("?");
    onFilterApplied({ ...filter, value: "" });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 w-full">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <Select
              value={filter.type}
              onValueChange={(value) => setFilter({ ...filter, type: value })}
              aria-labelledby="filter-type-label"
            >
              <SelectTrigger
                id="filter-type"
                className="w-full sm:w-auto sm:min-w-[160px]"
              >
                <SelectValue placeholder="Filtriraj po..." />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="title">Naslov</SelectItem>
                <SelectItem value="year">Godina (točna)</SelectItem>
                <SelectItem value="yearMin">Godina (min)</SelectItem>
                <SelectItem value="rating">Ocjena (min)</SelectItem>
                <SelectItem value="genre">Žanr</SelectItem>
                <SelectItem value="source">Izvor (TMDB/OMDB)</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-0">
              <Input
                id="filter-value"
                aria-labelledby="filter-value-label"
                type="text"
                value={filter.value}
                onChange={(e) =>
                  setFilter({ ...filter, value: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && applyFilter()}
                placeholder="Vrijednost..."
                className="pr-8"
              />

              {filter.value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={handleClear}
                  aria-label="Očisti filter"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <Button
            onClick={applyFilter}
            disabled={!filter.type || !filter.value || loading}
            className="w-full sm:w-auto"
          >
            Filtriraj
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
