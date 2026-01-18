import { useState } from "react";
import { toast } from "sonner";

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedMovies, setSavedMovies] = useState([]);
  const [ratedMovies, setRatedMovies] = useState([]);

  const fetchMovies = async (filterType = null, filterValue = null) => {
    setLoading(true);
    try {
      let url = "/api/movies?action=fetch";
      if (filterType && filterValue) {
        url += `&filter=${filterType}&value=${encodeURIComponent(filterValue)}`;
      }
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON but got:", text);
        throw new Error("Response is not JSON");
      }

      const data = await response.json();
      if (data.success) {
        setMovies(data.data);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast.error("Greška pri dohvaćanju filmova");
    } finally {
      setLoading(false);
    }
  };

  const fetchAndSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch-and-save" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON but got:", text);
        throw new Error("Response is not JSON");
      }

      const data = await response.json();
      if (data.success) {
        await fetchMovies();
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Error fetching and saving:", error);
      toast.error("Greška pri dohvaćanju podataka");
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (id) => {
    try {
      const response = await fetch(`/api/movies?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await fetchMovies();
        toast.success("Film je obrisan");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Greška pri brisanju");
    }
  };

  const deleteAll = async () => {
    if (!confirm("Jeste li sigurni da želite obrisati sve filmove iz baze?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/movies?all=true`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON but got:", text);
        throw new Error("Response is not JSON");
      }

      const data = await response.json();

      if (data.success) {
        await fetchMovies();
        toast.success(data.message || "Svi filmovi su obrisani");
      } else {
        toast.error(data.message || "Greška pri brisanju");
      }
    } catch (error) {
      console.error("Error deleting all movies:", error);
      toast.error("Greška pri brisanju");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedMovies = async () => {
    try {
      const response = await fetch("/api/saved_movies?filter=saved");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSavedMovies(data.saves || []);
      }
    } catch (error) {
      console.error("Error fetching saved movies:", error);
      toast.error("Greška pri dohvaćanju spremljenih filmova");
    }
  };

  const fetchRatedMovies = async () => {
    try {
      const response = await fetch("/api/saved_movies?filter=rated");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setRatedMovies(data.saves || []);
      }
    } catch (error) {
      console.error("Error fetching rated movies:", error);
      toast.error("Greška pri dohvaćanju ocijenjenih filmova");
    }
  };

  const saveMovie = async (movieId) => {
    try {
      const response = await fetch("/api/saved_movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", movieId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        await fetchSavedMovies();
        toast.success("Film je spremljen");
        return true;
      }
    } catch (error) {
      console.error("Error saving movie:", error);
      toast.error("Greška pri spremanju filma");
      return false;
    }
  };

  const unsaveMovie = async (movieId) => {
    try {
      const response = await fetch("/api/saved_movies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsave", movieId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        await fetchSavedMovies();
        toast.success("Film je uklonjen iz spremljenih");
        return true;
      }
    } catch (error) {
      console.error("Error unsaving movie:", error);
      toast.error("Greška pri uklanjanju filma");
      return false;
    }
  };

  const rateMovie = async (movieId, rating) => {
    try {
      const response = await fetch("/api/saved_movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rate", movieId, rating }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        await fetchRatedMovies();
        if (rating === 0) {
          toast.success("Ocjena je uklonjena");
        } else {
          toast.success(`Film je ocijenjen sa ${rating}/10`);
        }
        return true;
      }
    } catch (error) {
      console.error("Error rating movie:", error);
      toast.error("Greška pri ocjenjivanju filma");
      return false;
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/recommendations");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        return data.recommendations || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
  };

  return {
    movies,
    loading,
    savedMovies,
    ratedMovies,
    fetchMovies,
    fetchAndSave,
    deleteMovie,
    deleteAll,
    fetchSavedMovies,
    fetchRatedMovies,
    saveMovie,
    unsaveMovie,
    rateMovie,
    fetchRecommendations,
  };
}
