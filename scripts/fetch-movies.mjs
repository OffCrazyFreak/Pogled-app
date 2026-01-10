#!/usr/bin/env node

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

config({ path: join(projectRoot, '.env.local') });

const mongodbModule = await import('../src/lib/mongodb.js');
const MovieModule = await import('../src/models/Movie.js');
const tmdbModule = await import('../src/lib/themoviedb.js');
const omdbModule = await import('../src/lib/omdb.js');
const youtubeModule = await import('../src/lib/youtube.js');
const traktModule = await import('../src/lib/trakt.js');

const connectDB = mongodbModule.default;
const Movie = MovieModule.default;
const { getPopularMovies, mapTMDBToMovie, getMovieDetails } = tmdbModule;
const { getIMDBRating } = omdbModule;
const { getTrailerInfo } = youtubeModule;
const { getTraktInfo } = traktModule;

async function fetchAndSaveMovies(limit = 50) {
  try {
    await connectDB();
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
    if (tmdbMovies.length < limit) {
      const page2 = await getPopularMovies(2);
      allMovies = [...allMovies, ...page2];
    }
    if (allMovies.length < limit) {
      const page3 = await getPopularMovies(3);
      allMovies = [...allMovies, ...page3];
    }
    
    const selectedTMDB = allMovies.slice(0, limit);
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
        
        await new Promise(resolve => setTimeout(resolve, 200));

        const youtubeInfo = await getTrailerInfo(tmdbMovie.title);
        
        if (youtubeInfo && youtubeInfo.videoId) {
          stats.withYouTube++;
        } else {
          stats.withoutYouTube++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));

        const traktInfo = await getTraktInfo(tmdbMovie.title, year);
        
        if (traktInfo && traktInfo.traktId) {
          stats.withTrakt++;
        } else {
          stats.withoutTrakt++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));

        const movieData = {
          ...mapTMDBToMovie(tmdbMovie),
          genre: genres,
          imdbRating: imdbRating,
        };

        if (youtubeInfo?.videoId) {
          movieData.youtubeVideoId = youtubeInfo.videoId;
          if (youtubeInfo.viewCount) movieData.youtubeViews = youtubeInfo.viewCount;
          if (youtubeInfo.likeCount) movieData.youtubeLikes = youtubeInfo.likeCount;
          if (youtubeInfo.title) movieData.youtubeTitle = youtubeInfo.title;
          if (youtubeInfo.channelTitle) movieData.youtubeChannel = youtubeInfo.channelTitle;
        }

        if (traktInfo) {
          if (traktInfo.traktId) movieData.traktId = traktInfo.traktId;
          if (traktInfo.traktSlug) movieData.traktSlug = traktInfo.traktSlug;
          if (traktInfo.traktRating) movieData.traktRating = traktInfo.traktRating;
          if (traktInfo.traktVotes) movieData.traktVotes = traktInfo.traktVotes;
          if (traktInfo.traktCertification) movieData.traktCertification = traktInfo.traktCertification;
          if (traktInfo.traktTagline) movieData.traktTagline = traktInfo.traktTagline;
          if (traktInfo.traktOverview) movieData.traktOverview = traktInfo.traktOverview;
          if (traktInfo.traktReleased) movieData.traktReleased = traktInfo.traktReleased;
          if (traktInfo.traktRuntime) movieData.traktRuntime = traktInfo.traktRuntime;
          if (traktInfo.traktGenres) movieData.traktGenres = traktInfo.traktGenres;
          if (traktInfo.traktWatchers) movieData.traktWatchers = traktInfo.traktWatchers;
          if (traktInfo.traktPlays) movieData.traktPlays = traktInfo.traktPlays;
          if (traktInfo.traktCollectors) movieData.traktCollectors = traktInfo.traktCollectors;
        }

        const saved = await Movie.create(movieData);
        savedMovies.push(saved);
      } catch (error) {
        stats.errors++;
        console.error(`Error saving movie "${tmdbMovie.title}":`, error);
      }
    }

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

const limit = process.argv[2] ? parseInt(process.argv[2]) : 50;
fetchAndSaveMovies(limit);

