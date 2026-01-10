import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  poster: {
    type: String,
  },
  rating: {
    type: Number,
  },
  imdbRating: {
    type: Number,
  },
  genre: {
    type: String,
  },
  youtubeVideoId: {
    type: String,
    default: null,
  },
  youtubeViews: {
    type: Number,
    default: null,
  },
  youtubeLikes: {
    type: Number,
    default: null,
  },
  youtubeTitle: {
    type: String,
    default: null,
  },
  youtubeChannel: {
    type: String,
    default: null,
  },
  traktId: {
    type: Number,
    default: null,
  },
  traktSlug: {
    type: String,
    default: null,
  },
  traktRating: {
    type: Number,
    default: null,
  },
  traktVotes: {
    type: Number,
    default: null,
  },
  traktCertification: {
    type: String,
    default: null,
  },
  traktTagline: {
    type: String,
    default: null,
  },
  traktOverview: {
    type: String,
    default: null,
  },
  traktReleased: {
    type: String,
    default: null,
  },
  traktRuntime: {
    type: Number,
    default: null,
  },
  traktGenres: {
    type: [String],
    default: null,
  },
  traktWatchers: {
    type: Number,
    default: null,
  },
  traktPlays: {
    type: Number,
    default: null,
  },
  traktCollectors: {
    type: Number,
    default: null,
  },
  source: {
    type: String,
    enum: ['TMDB', 'OMDB'],
    required: true,
  },
  sourceId: {
    type: String,
    required: true,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  strict: true,
});

MovieSchema.index({ source: 1, sourceId: 1 }, { unique: true });

let Movie;
try {
  Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);
} catch (error) {
  Movie = mongoose.model('Movie', MovieSchema);
}

export default Movie;

