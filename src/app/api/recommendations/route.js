import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/Movie";
import SavedMovie from "@/models/SavedMovie";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get current user's saved and rated movies
    const userInteractions = await SavedMovie.find({
      userId: userId,
      $or: [{ saved: true }, { rating: { $gt: 0 } }],
    });

    if (userInteractions.length === 0) {
      // No interactions, return empty recommendations
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: "User has no interactions yet",
      });
    }

    const userMovieIds = userInteractions.map((interaction) =>
      interaction.movieId.toString()
    );
    const userGenres = new Set();
    const userYears = new Set();

    // Get genres and years from user's movies for preference matching
    const userMovies = await Movie.find({
      _id: { $in: userMovieIds },
    });

    userMovies.forEach((movie) => {
      if (movie.genre) {
        movie.genre.split(",").forEach((g) => {
          userGenres.add(g.trim());
        });
      }
      if (movie.year) {
        userYears.add(movie.year);
      }
    });

    // Find other users who have saved/rated at least 1 of the same movies
    const similarUsers = await SavedMovie.distinct("userId", {
      movieId: { $in: userMovieIds },
      userId: { $ne: userId },
    });

    if (similarUsers.length === 0) {
      // No similar users found
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: "No similar users found",
      });
    }

    // Get all movies from similar users that current user hasn't interacted with
    const similarUsersMovies = await SavedMovie.find({
      userId: { $in: similarUsers },
      movieId: { $nin: userMovieIds },
      $or: [{ saved: true }, { rating: { $gt: 0 } }],
    });

    if (similarUsersMovies.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: "No new movies from similar users",
      });
    }

    // Group by movieId and calculate scores
    const movieScores = {};

    similarUsersMovies.forEach((interaction) => {
      const movieId = interaction.movieId.toString();

      if (!movieScores[movieId]) {
        movieScores[movieId] = {
          movieId: movieId,
          fromSimilarUsers: 0,
          totalRatingFromUsers: 0,
          ratingCount: 0,
          savedCount: 0,
        };
      }

      movieScores[movieId].fromSimilarUsers++;

      if (interaction.rating && interaction.rating > 0) {
        movieScores[movieId].totalRatingFromUsers += interaction.rating;
        movieScores[movieId].ratingCount++;
      }

      if (interaction.saved) {
        movieScores[movieId].savedCount++;
      }
    });

    // Fetch movie details for external ratings and metadata
    const movieIds = Object.keys(movieScores);
    const moviesDetails = await Movie.find({
      _id: { $in: movieIds },
    });

    // Get all user interactions for each movie (for saveCount and avg user rating)
    const allMovieInteractions = await SavedMovie.find({
      movieId: { $in: movieIds },
    });

    const movieStats = {};
    allMovieInteractions.forEach((interaction) => {
      const movieId = interaction.movieId.toString();
      if (!movieStats[movieId]) {
        movieStats[movieId] = {
          saveCount: 0,
          totalRating: 0,
          ratingCount: 0,
        };
      }

      if (interaction.saved) {
        movieStats[movieId].saveCount++;
      }
      if (interaction.rating && interaction.rating > 0) {
        movieStats[movieId].totalRating += interaction.rating;
        movieStats[movieId].ratingCount++;
      }
    });

    // Calculate final recommendation scores
    const recommendations = moviesDetails
      .map((movie) => {
        const movieId = movie._id.toString();
        const scores = movieScores[movieId];

        // Score from similar users (0-30 points)
        const similarUserScore = Math.min(scores.fromSimilarUsers * 3, 30);

        // Score from ratings given by similar users (0-25 points)
        const avgUserRating =
          scores.ratingCount > 0
            ? scores.totalRatingFromUsers / scores.ratingCount
            : 0;
        const userRatingScore = (avgUserRating / 10) * 25;

        // Score from external APIs (0-30 points)
        let externalRatingScore = 0;
        let externalRatingCount = 0;
        let totalExternalRating = 0;

        if (movie.imdbRating && movie.imdbRating > 0) {
          totalExternalRating += movie.imdbRating;
          externalRatingCount++;
        }
        if (movie.rating && movie.rating > 0) {
          totalExternalRating += movie.rating;
          externalRatingCount++;
        }
        if (movie.traktRating && movie.traktRating > 0) {
          totalExternalRating += movie.traktRating;
          externalRatingCount++;
        }

        if (externalRatingCount > 0) {
          const avgExternalRating = totalExternalRating / externalRatingCount;
          externalRatingScore = (avgExternalRating / 10) * 30;
        }

        // Genre matching score (0-10 points)
        let genreScore = 0;
        if (movie.genre) {
          const movieGenres = movie.genre.split(",").map((g) => g.trim());
          const matchingGenres = movieGenres.filter((g) => userGenres.has(g));
          genreScore = (matchingGenres.length / movieGenres.length) * 10;
        }

        // Year matching score (0-5 points, low emphasis)
        let yearScore = 0;
        if (movie.year && userYears.size > 0) {
          const yearArray = Array.from(userYears);
          const avgUserYear =
            yearArray.reduce((a, b) => a + b, 0) / yearArray.length;
          const yearDiff = Math.abs(movie.year - avgUserYear);
          // Closer to user's average year = higher score
          yearScore = Math.max(0, 5 - yearDiff / 20);
        }

        // Saved bonus (slight boost if multiple users saved it)
        const savedBonus = Math.min(scores.savedCount * 0.5, 5);

        const totalScore =
          similarUserScore +
          userRatingScore +
          externalRatingScore +
          genreScore +
          yearScore +
          savedBonus;

        return {
          ...movie.toObject(),
          saveCount: movieStats[movieId]?.saveCount || 0,
          appRating:
            movieStats[movieId]?.ratingCount > 0
              ? movieStats[movieId].totalRating /
                movieStats[movieId].ratingCount
              : 0,
          recommendationScore: totalScore,
          scoreBreakdown: {
            similarUserScore,
            userRatingScore,
            externalRatingScore,
            genreScore,
            yearScore,
            savedBonus,
          },
          recommendationReasons: {
            similarUsersCount: scores.fromSimilarUsers,
            avgUserRating: avgUserRating.toFixed(1),
            avgExternalRating:
              externalRatingCount > 0
                ? (totalExternalRating / externalRatingCount).toFixed(1)
                : "N/A",
          },
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    return NextResponse.json({
      success: true,
      recommendations: recommendations,
      totalRecommendations: recommendations.length,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
