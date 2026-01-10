const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
const TRAKT_CLIENT_SECRET = process.env.TRAKT_CLIENT_SECRET;
const TRAKT_BASE_URL = 'https://api.trakt.tv';

/**
 * Kreira header-e za Trakt.tv API zahtjeve
 */
function getTraktHeaders() {
  if (!TRAKT_CLIENT_ID) {
    return null;
  }
  return {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': TRAKT_CLIENT_ID,
  };
}

/**
 * Pretražuje Trakt.tv za film po naslovu
 * @param {string} movieTitle - Naslov filma
 * @param {number|null} year - Godina filma (opcionalno)
 * @returns {Promise<object|null>} Trakt.tv film podaci ili null
 */
export async function searchMovie(movieTitle, year = null) {
  const headers = getTraktHeaders();
  if (!headers) {
    return null;
  }
  
  try {
    let query = movieTitle;
    if (year) {
      query += ` ${year}`;
    }
    
    const url = `${TRAKT_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&limit=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Trakt API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return data[0].movie;
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching Trakt for "${movieTitle}":`, error.message);
    return null;
  }
}

/**
 * Dohvaća detalje filma iz Trakt.tv
 * @param {string|number} traktId - Trakt.tv ID filma
 * @returns {Promise<object|null>} Detalji filma ili null
 */
export async function getMovieDetails(traktId) {
  const headers = getTraktHeaders();
  if (!headers) {
    return null;
  }
  
  try {
    const url = `${TRAKT_BASE_URL}/movies/${traktId}?extended=full`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Trakt API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error(`Error fetching Trakt details for ${traktId}:`, error.message);
    return null;
  }
}

/**
 * Dohvaća statistiku filma iz Trakt.tv
 * @param {string|number} traktId - Trakt.tv ID filma
 * @returns {Promise<object|null>} Statistika filma ili null
 */
export async function getMovieStats(traktId) {
  const headers = getTraktHeaders();
  if (!headers) {
    return null;
  }
  
  try {
    const url = `${TRAKT_BASE_URL}/movies/${traktId}/stats`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Trakt API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error(`Error fetching Trakt stats for ${traktId}:`, error.message);
    return null;
  }
}

/**
 * Dohvaća sve Trakt.tv podatke za film
 * @param {string} movieTitle - Naslov filma
 * @param {number|null} year - Godina filma (opcionalno)
 * @returns {Promise<object|null>} Objekt s Trakt.tv podacima ili null
 */
export async function getTraktInfo(movieTitle, year = null) {
  try {
    const searchResult = await searchMovie(movieTitle, year);
    
    if (!searchResult || !searchResult.ids) {
      return null;
    }
    
    const traktId = searchResult.ids.trakt;
    if (!traktId) {
      return null;
    }
    
    const [details, stats] = await Promise.all([
      getMovieDetails(traktId),
      getMovieStats(traktId),
    ]);
    
    return {
      traktId: traktId,
      traktSlug: searchResult.ids.slug || null,
      imdbId: searchResult.ids.imdb || null,
      tmdbId: searchResult.ids.tmdb || null,
      traktRating: searchResult.rating || null,
      traktVotes: searchResult.votes || null,
      traktCertification: details?.certification || null,
      traktTagline: details?.tagline || null,
      traktOverview: details?.overview || null,
      traktReleased: details?.released || null,
      traktRuntime: details?.runtime || null,
      traktGenres: details?.genres || null,
      traktWatchers: stats?.watchers || null,
      traktPlays: stats?.plays || null,
      traktCollectors: stats?.collectors || null,
      traktComments: stats?.comments || null,
      traktLists: stats?.lists || null,
    };
  } catch (error) {
    console.error(`Error fetching Trakt info for "${movieTitle}":`, error);
    return null;
  }
}

