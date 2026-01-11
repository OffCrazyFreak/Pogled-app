import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/Movie";
import mongoose from "mongoose";
import {
  getPopularMovies,
  mapTMDBToMovie,
  getMovieDetails,
} from "@/lib/themoviedb";
import { getIMDBRating } from "@/lib/omdb";
import { getTrailerInfo } from "@/lib/youtube";
import { getTraktInfo } from "@/lib/trakt";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "cron-fetch") {
      const isVercelCron = request.headers.get("x-vercel-cron");
      const cronSecret = searchParams.get("secret");
      const expectedSecret =
        process.env.CRON_SECRET || "your-secret-key-change-this";

      if (!isVercelCron && cronSecret !== expectedSecret) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      await Movie.deleteMany({});

      const requestBody = { action: "fetch-and-save" };
      const postRequest = new Request(request.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      return await POST(postRequest);
    }

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
      await Movie.deleteMany({});

      const savedMovies = [];
      const stats = {
        total: 0,
        new: 0,
        existing: 0,
        withIMDB: 0,
        withoutIMDB: 0,
        withYouTube: 0,
        withoutYouTube: 0,
        withTrakt: 0,
        withoutTrakt: 0,
        errors: 0,
      };

      const tmdbMovies = await getPopularMovies(1);

      let allMovies = [...tmdbMovies];
      if (tmdbMovies.length < 50) {
        const page2 = await getPopularMovies(2);
        allMovies = [...allMovies, ...page2];
      }
      if (allMovies.length < 50) {
        const page3 = await getPopularMovies(3);
        allMovies = [...allMovies, ...page3];
      }

      const selectedTMDB = allMovies.slice(0, 50);
      stats.total = selectedTMDB.length;

      for (let i = 0; i < selectedTMDB.length; i++) {
        const tmdbMovie = selectedTMDB[i];

        try {
          stats.new++;

          const details = await getMovieDetails(tmdbMovie.id);
          const genres = details.genres?.map((g) => g.name).join(", ") || null;

          const year = tmdbMovie.release_date
            ? new Date(tmdbMovie.release_date).getFullYear()
            : null;

          const imdbRating = await getIMDBRating(tmdbMovie.title, year);

          if (imdbRating) {
            stats.withIMDB++;
          } else {
            stats.withoutIMDB++;
          }

          await new Promise((resolve) => setTimeout(resolve, 200));

          const youtubeInfo = await getTrailerInfo(tmdbMovie.title);

          if (youtubeInfo && youtubeInfo.videoId) {
            stats.withYouTube++;
          } else {
            stats.withoutYouTube++;
          }

          await new Promise((resolve) => setTimeout(resolve, 200));

          const traktInfo = await getTraktInfo(tmdbMovie.title, year);

          if (traktInfo && traktInfo.traktId) {
            stats.withTrakt++;
          } else {
            stats.withoutTrakt++;
          }

          await new Promise((resolve) => setTimeout(resolve, 200));

          const movieData = {
            ...mapTMDBToMovie(tmdbMovie),
            genre: genres,
            imdbRating: imdbRating,
          };

          if (youtubeInfo?.videoId) {
            movieData.youtubeVideoId = youtubeInfo.videoId;
            if (youtubeInfo.viewCount)
              movieData.youtubeViews = youtubeInfo.viewCount;
            if (youtubeInfo.likeCount)
              movieData.youtubeLikes = youtubeInfo.likeCount;
            if (youtubeInfo.title) movieData.youtubeTitle = youtubeInfo.title;
            if (youtubeInfo.channelTitle)
              movieData.youtubeChannel = youtubeInfo.channelTitle;
          }

          if (traktInfo) {
            if (traktInfo.traktId) movieData.traktId = traktInfo.traktId;
            if (traktInfo.traktSlug) movieData.traktSlug = traktInfo.traktSlug;
            if (traktInfo.traktRating)
              movieData.traktRating = traktInfo.traktRating;
            if (traktInfo.traktVotes)
              movieData.traktVotes = traktInfo.traktVotes;
            if (traktInfo.traktCertification)
              movieData.traktCertification = traktInfo.traktCertification;
            if (traktInfo.traktTagline)
              movieData.traktTagline = traktInfo.traktTagline;
            if (traktInfo.traktOverview)
              movieData.traktOverview = traktInfo.traktOverview;
            if (traktInfo.traktReleased)
              movieData.traktReleased = traktInfo.traktReleased;
            if (traktInfo.traktRuntime)
              movieData.traktRuntime = traktInfo.traktRuntime;
            if (traktInfo.traktGenres)
              movieData.traktGenres = traktInfo.traktGenres;
            if (traktInfo.traktWatchers)
              movieData.traktWatchers = traktInfo.traktWatchers;
            if (traktInfo.traktPlays)
              movieData.traktPlays = traktInfo.traktPlays;
            if (traktInfo.traktCollectors)
              movieData.traktCollectors = traktInfo.traktCollectors;
          }

          const saved = await Movie.create(movieData);
          savedMovies.push(saved);
        } catch (error) {
          stats.errors++;
          console.error(`Error saving movie "${tmdbMovie.title}":`, error);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Spremljeno ${savedMovies.length} filmova`,
        data: savedMovies,
        stats: stats,
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
