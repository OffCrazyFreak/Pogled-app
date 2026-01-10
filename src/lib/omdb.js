const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = 'https://www.omdbapi.com';

export async function getMovieByTitle(title, year = null) {
  try {
    let url = `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`;
    if (year) {
      url += `&y=${year}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Movie not found');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching movie from OMDB:', error);
    throw error;
  }
}

export function mapOMDBToMovie(omdbMovie) {
  const runtimeMatch = omdbMovie.Runtime?.match(/(\d+)/);
  const runtime = runtimeMatch ? parseInt(runtimeMatch[1]) : null;
  
  return {
    title: omdbMovie.Title,
    year: omdbMovie.Year ? parseInt(omdbMovie.Year) : 0,
    poster: omdbMovie.Poster && omdbMovie.Poster !== 'N/A' 
      ? omdbMovie.Poster 
      : null,
    rating: omdbMovie.imdbRating ? parseFloat(omdbMovie.imdbRating) : 0,
    genre: omdbMovie.Genre && omdbMovie.Genre !== 'N/A' 
      ? omdbMovie.Genre 
      : null,
    source: 'OMDB',
    sourceId: omdbMovie.imdbID || '',
  };
}

/**
 * Dohvaća IMDb ocjenu za film iz OMDB API-ja
 * @param {string} title - Naslov filma
 * @param {number|null} year - Godina filma (opcionalno)
 * @returns {Promise<number|null>} IMDb ocjena ili null ako nije pronađena
 */
export async function getIMDBRating(title, year = null) {
  try {
    const omdbMovie = await getMovieByTitle(title, year);
    
    if (omdbMovie.imdbRating && omdbMovie.imdbRating !== 'N/A') {
      return parseFloat(omdbMovie.imdbRating);
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

