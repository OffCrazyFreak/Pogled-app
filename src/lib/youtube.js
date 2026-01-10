const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Pretražuje YouTube za trailer filma
 * @param {string} movieTitle - Naslov filma
 * @returns {Promise<string|null>} YouTube video ID ili null ako nije pronađen
 */
export async function searchTrailer(movieTitle) {
  if (!YOUTUBE_API_KEY) {
    return null;
  }
  
  try {
    const searchQuery = `${movieTitle} official trailer`;
    const url = `${YOUTUBE_BASE_URL}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`YouTube API error ${response.status}: ${errorData.error?.message || 'Forbidden'}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching YouTube trailer for "${movieTitle}":`, error.message);
    return null;
  }
}

/**
 * Dohvaća statistiku YouTube videa
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<object|null>} Objekt s statistikom ili null ako nije pronađen
 */
export async function getVideoStatistics(videoId) {
  if (!YOUTUBE_API_KEY) {
    return null;
  }
  
  try {
    const url = `${YOUTUBE_BASE_URL}/videos?part=statistics,snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`YouTube API error ${response.status}: ${errorData.error?.message || 'Forbidden'}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        videoId: videoId,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount || 0),
        likeCount: parseInt(video.statistics.likeCount || 0),
        commentCount: parseInt(video.statistics.commentCount || 0),
        thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching YouTube statistics for ${videoId}:`, error.message);
    return null;
  }
}

/**
 * Dohvaća trailer i statistiku za film
 * @param {string} movieTitle - Naslov filma
 * @returns {Promise<object|null>} Objekt s YouTube podacima ili null
 */
export async function getTrailerInfo(movieTitle) {
  try {
    const videoId = await searchTrailer(movieTitle);
    
    if (!videoId) {
      return null;
    }
    
    const stats = await getVideoStatistics(videoId);
    
    if (!stats) {
      return { videoId };
    }
    
    return stats;
  } catch (error) {
    console.error(`Error fetching YouTube trailer info for "${movieTitle}":`, error);
    return null;
  }
}

