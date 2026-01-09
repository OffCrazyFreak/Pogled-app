import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/Movie";
import mongoose from "mongoose";
import {
  getPopularMovies,
  mapTMDBToMovie,
  getMovieDetails,
} from "@/lib/themoviedb";
import {
  getMovieByTitle,
  mapOMDBToMovie,
  getPopularMovieTitles,
} from "@/lib/omdb";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "fetch") {
      let query = {};

      const filter = searchParams.get("filter");
      const value = searchParams.get("value");

      if (filter && value) {
        if (filter === "title") {
          query.title = { $regex: value, $options: "i" };
        } else if (filter === "year") {
          query.year = parseInt(value);
        } else if (filter === "yearMin") {
          query.year = { $gte: parseInt(value) };
        } else if (filter === "yearMax") {
          query.year = { ...query.year, $lte: parseInt(value) };
        } else if (filter === "rating") {
          query.rating = { $gte: parseFloat(value) };
        } else if (filter === "genre") {
          query.genre = { $regex: value, $options: "i" };
        } else if (filter === "source") {
          query.source = value.toUpperCase();
        }
      }

      const movies = await Movie.find(query).sort({ fetchedAt: -1 }).limit(100);
      return NextResponse.json({ success: true, data: movies });
    }

    if (action === "cleanup") {
      try {
        const db = mongoose.connection.db;
        const collection = db.collection("movies");

        const indexes = await collection.indexes();
        for (const index of indexes) {
          if (index.name === "tmdbId_1") {
            await collection.dropIndex("tmdbId_1");
            return NextResponse.json({
              success: true,
              message: "Uklonjen stari tmdbId_1 indeks",
            });
          }
        }
        return NextResponse.json({
          success: true,
          message: "Nisu pronađeni stari indeksi",
        });
      } catch (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: "Nevažeća akcija" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in GET /api/movies:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const { action } = await request.json();

    if (action === "fetch-and-save") {
      const savedMovies = [];

      const tmdbMovies = await getPopularMovies(1);
      const selectedTMDB = tmdbMovies.slice(0, 10);

      for (const tmdbMovie of selectedTMDB) {
        try {
          const existing = await Movie.findOne({
            source: "TMDB",
            sourceId: tmdbMovie.id.toString(),
          });

          if (!existing) {
            const details = await getMovieDetails(tmdbMovie.id);
            const genres =
              details.genres?.map((g) => g.name).join(", ") || null;

            const movieData = {
              ...mapTMDBToMovie(tmdbMovie),
              genre: genres,
            };

            const saved = await Movie.create(movieData);
            savedMovies.push(saved);
          } else {
            savedMovies.push(existing);
          }
        } catch (error) {
          console.error(`Error saving TMDB movie ${tmdbMovie.id}:`, error);
        }
      }

      const popularTitles = getPopularMovieTitles();
      const selectedTitles = popularTitles.slice(0, 10);

      for (const title of selectedTitles) {
        try {
          const omdbMovie = await getMovieByTitle(title);
          const existing = await Movie.findOne({
            source: "OMDB",
            sourceId: omdbMovie.imdbID,
          });

          if (!existing) {
            const movieData = mapOMDBToMovie(omdbMovie);
            const saved = await Movie.create(movieData);
            savedMovies.push(saved);
          } else {
            savedMovies.push(existing);
          }
        } catch (error) {
          console.error(`Error saving OMDB movie ${title}:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Spremljeno ${savedMovies.length} filmova`,
        data: savedMovies,
      });
    }

    return NextResponse.json(
      { success: false, message: "Nevažeća akcija" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in POST /api/movies:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("id");
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      const result = await Movie.deleteMany({});
      return NextResponse.json({
        success: true,
        message: `Obrisano ${result.deletedCount} filmova`,
      });
    }

    if (movieId) {
      const result = await Movie.deleteOne({ _id: movieId });
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { success: false, message: "Film nije pronađen" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: "Film obrisan" });
    }

    return NextResponse.json(
      { success: false, message: "Nevažeći zahtjev" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/movies:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
