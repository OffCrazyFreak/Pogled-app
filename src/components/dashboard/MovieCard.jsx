import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MovieCard({ movie, onDelete }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-24 sm:h-56 w-full">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/500x750?text=No+Poster";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
            <span className="text-sm text-gray-400 dark:text-gray-500">
              No Poster
            </span>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Badge variant={movie.source === "TMDB" ? "default" : "secondary"}>
            {movie.source}
          </Badge>
        </div>
      </div>

      <CardContent className="py-4 h-full flex flex-col">
        <CardTitle className="line-clamp-2 text-base">{movie.title}</CardTitle>

        <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span>{movie.year}</span>
          </div>
          {movie.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-500">★</span>
              <span>{movie.rating.toFixed(1)}/10</span>
            </div>
          )}
          {movie.genre && (
            <div className="line-clamp-1 text-xs">{movie.genre}</div>
          )}
        </div>
        <Button
          onClick={() => onDelete(movie._id)}
          variant="destructive"
          className="w-full mt-auto"
        >
          Obriši
        </Button>
      </CardContent>
    </Card>
  );
}
