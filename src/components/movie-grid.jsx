import { MovieCard } from "./movie-card";

export function MovieGrid({ movies, onDeleteMovie }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {movies.map((movie) => (
        <MovieCard key={movie._id} movie={movie} onDelete={onDeleteMovie} />
      ))}
    </div>
  );
}
