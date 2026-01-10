import { useState } from "react";
import { toast } from "sonner";

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return {
    movies,
    loading,
    fetchMovies,
    fetchAndSave,
    deleteMovie,
    deleteAll,
  };
}
