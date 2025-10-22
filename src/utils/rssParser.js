/**
 * RSS Feed Parser Utilities for Letterboxd
 * Handles XML to JSON conversion and Letterboxd-specific data extraction
 * Server-side compatible (no browser APIs)
 */

/**
 * Simple XML parser for server-side use
 * @param {string} xmlString - Raw XML string from RSS feed
 * @returns {Object} Parsed JSON object
 */
export function parseXMLToJSON(xmlString) {
  try {
    // Simple regex-based XML parsing for RSS feeds
    const items = extractXMLItems(xmlString);
    return { items };
  } catch (error) {
    throw new Error(`Failed to parse XML: ${error.message}`);
  }
}

/**
 * Extract RSS items using regex patterns
 * @param {string} xmlString - Raw XML string
 * @returns {Array} Array of item objects
 */
function extractXMLItems(xmlString) {
  const items = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xmlString)) !== null) {
    const itemContent = match[1];
    const item = {};
    
    // Extract common RSS fields
    item.title = extractXMLField(itemContent, 'title');
    item.link = extractXMLField(itemContent, 'link');
    item.description = extractXMLField(itemContent, 'description');
    item.pubDate = extractXMLField(itemContent, 'pubDate');
    item.guid = extractXMLField(itemContent, 'guid');
    
    items.push(item);
  }
  
  return items;
}

/**
 * Extract field value from XML content using regex
 * @param {string} content - XML content
 * @param {string} fieldName - Field name to extract
 * @returns {string} Field value or empty string
 */
function extractXMLField(content, fieldName) {
  const regex = new RegExp(`<${fieldName}[^>]*>([\\s\\S]*?)<\\/${fieldName}>`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Convert XML DOM to JavaScript object
 * @param {Document|Element} xml - XML document or element
 * @returns {Object} JavaScript object representation
 */
function xmlToObject(xml) {
  let obj = {};
  
  if (xml.nodeType === 1) { // Element node
    // Handle attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let i = 0; i < xml.attributes.length; i++) {
        const attribute = xml.attributes.item(i);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) { // Text node
    obj = xml.nodeValue.trim();
  }
  
  // Handle child nodes
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;
      
      if (typeof obj[nodeName] === 'undefined') {
        obj[nodeName] = xmlToObject(item);
      } else {
        if (typeof obj[nodeName].push === 'undefined') {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToObject(item));
      }
    }
  }
  
  return obj;
}

/**
 * Extract movie data from Letterboxd diary RSS feed
 * @param {string} xmlString - Raw RSS XML string
 * @returns {Array} Array of diary entry objects
 */
export function parseDiaryFeed(xmlString) {
  try {
    const items = extractXMLItems(xmlString);
    const diaryEntries = [];
    
    items.forEach(item => {
      try {
        const entry = extractDiaryEntry(item);
        if (entry) {
          diaryEntries.push(entry);
        }
      } catch (error) {
        console.warn('Failed to parse diary entry:', error.message);
      }
    });
    
    return diaryEntries;
  } catch (error) {
    throw new Error(`Failed to parse diary feed: ${error.message}`);
  }
}

/**
 * Extract movie data from Letterboxd watchlist RSS feed
 * @param {string} xmlString - Raw RSS XML string
 * @returns {Array} Array of watchlist item objects
 */
export function parseWatchlistFeed(xmlString) {
  try {
    const items = extractXMLItems(xmlString);
    const watchlistItems = [];
    
    items.forEach(item => {
      try {
        const watchlistItem = extractWatchlistItem(item);
        if (watchlistItem) {
          watchlistItems.push(watchlistItem);
        }
      } catch (error) {
        console.warn('Failed to parse watchlist item:', error.message);
      }
    });
    
    return watchlistItems;
  } catch (error) {
    throw new Error(`Failed to parse watchlist feed: ${error.message}`);
  }
}

/**
 * Extract movie data from Letterboxd lists RSS feed
 * @param {string} xmlString - Raw RSS XML string
 * @returns {Array} Array of list objects
 */
export function parseListsFeed(xmlString) {
  try {
    const items = extractXMLItems(xmlString);
    const lists = [];
    
    items.forEach(item => {
      try {
        const list = extractListItem(item);
        if (list) {
          lists.push(list);
        }
      } catch (error) {
        console.warn('Failed to parse list item:', error.message);
      }
    });
    
    return lists;
  } catch (error) {
    throw new Error(`Failed to parse lists feed: ${error.message}`);
  }
}

/**
 * Extract individual diary entry from RSS item
 * @param {Object} item - RSS item object
 * @returns {Object} Diary entry object
 */
function extractDiaryEntry(item) {
  const title = item.title || '';
  const link = item.link || '';
  const description = item.description || '';
  const pubDate = item.pubDate || '';
  
  // Extract movie title and year from title
  const movieMatch = title.match(/^(.+?)\s+(\d{4})(?:\s+★+)?/);
  const movieTitle = movieMatch ? movieMatch[1].trim() : title;
  const movieYear = movieMatch ? parseInt(movieMatch[2]) : null;
  
  // Extract rating from title (count stars and half-stars)
  const starMatch = title.match(/★+½?/);
  let rating = null;
  
  if (starMatch) {
    const starString = starMatch[0];
    const fullStars = (starString.match(/★/g) || []).length;
    const hasHalfStar = starString.includes('½');
    rating = fullStars + (hasHalfStar ? 0.5 : 0);
  }
  
  // Extract poster URL from description
  const posterMatch = description.match(/<img[^>]+src="([^"]+)"/);
  const posterUrl = posterMatch ? posterMatch[1] : null;
  
  // Extract review text from description
  // Letterboxd reviews appear after the poster image and before "Watched on" text
  let reviewText = null;
  if (description) {
    // Remove the poster image HTML
    let cleanDescription = description.replace(/<img[^>]*>/g, '');
    
    // Remove "Watched on" and date information
    cleanDescription = cleanDescription.replace(/Watched on [^.]*\./g, '');
    
    // Remove other metadata patterns
    cleanDescription = cleanDescription.replace(/★+½?/g, ''); // Remove stars
    cleanDescription = cleanDescription.replace(/\(rewatch\)/gi, ''); // Remove rewatch indicator
    
    // Strip remaining HTML tags
    cleanDescription = stripHtml(cleanDescription);
    
    // Remove CDATA markers and XML artifacts
    cleanDescription = cleanDescription.replace(/\]\]>/g, '');
    cleanDescription = cleanDescription.replace(/<!\[CDATA\[/g, '');
    
    // Clean up whitespace and extract meaningful review text
    cleanDescription = cleanDescription.trim();
    
    // Only consider it a review if it has substantial content (more than just metadata)
    if (cleanDescription && cleanDescription.length > 5 && !cleanDescription.match(/^(Watched|Added|Liked)/)) {
      reviewText = cleanDescription;
    }
  }
  
  // Check if it's a rewatch
  const isRewatch = title.includes('(rewatch)') || description.includes('rewatch');
  
  return {
    id: generateId(link),
    movie: {
      title: movieTitle,
      year: movieYear,
      poster: posterUrl,
      letterboxdUrl: link,
      source: 'letterboxd'
    },
    watchDate: new Date(pubDate),
    rating: rating,
    rewatch: isRewatch,
    review: reviewText, // Add extracted review text
    description: stripHtml(description),
    letterboxdUrl: link
  };
}

/**
 * Extract individual watchlist item from RSS item
 * @param {Object} item - RSS item object
 * @returns {Object} Watchlist item object
 */
function extractWatchlistItem(item) {
  const title = item.title || '';
  const link = item.link || '';
  const description = item.description || '';
  const pubDate = item.pubDate || '';
  
  // Extract movie title and year
  const movieMatch = title.match(/^(.+?)\s+(\d{4})/);
  const movieTitle = movieMatch ? movieMatch[1].trim() : title;
  const movieYear = movieMatch ? parseInt(movieMatch[2]) : null;
  
  // Extract poster URL from description
  const posterMatch = description.match(/<img[^>]+src="([^"]+)"/);
  const posterUrl = posterMatch ? posterMatch[1] : null;
  
  return {
    id: generateId(link),
    movie: {
      title: movieTitle,
      year: movieYear,
      poster: posterUrl,
      letterboxdUrl: link,
      source: 'letterboxd'
    },
    addedDate: new Date(pubDate)
  };
}

/**
 * Extract individual list from RSS item
 * @param {Object} item - RSS item object
 * @returns {Object} List object
 */
function extractListItem(item) {
  const title = item.title || '';
  const link = item.link || '';
  const description = item.description || '';
  const pubDate = item.pubDate || '';
  
  // Extract movie count from description
  const countMatch = description.match(/(\d+)\s+films?/i);
  const movieCount = countMatch ? parseInt(countMatch[1]) : 0;
  
  // Extract preview images from description
  const imageMatches = description.match(/<img[^>]+src="([^"]+)"/g);
  const previewImages = imageMatches ? 
    imageMatches.slice(0, 4).map(match => match.match(/src="([^"]+)"/)[1]) : [];
  
  return {
    id: generateId(link),
    name: title,
    description: stripHtml(description),
    movieCount: movieCount,
    previewImages: previewImages,
    lastUpdated: new Date(pubDate),
    letterboxdUrl: link
  };
}

/**
 * Strip HTML tags from string using regex (server-safe)
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Generate unique ID from URL
 * @param {string} url - URL to generate ID from
 * @returns {string} Generated ID
 */
function generateId(url) {
  return url.split('/').pop() || Math.random().toString(36).substr(2, 9);
}

/**
 * Validate RSS feed structure using regex
 * @param {string} xmlString - Raw RSS XML string
 * @returns {boolean} True if valid RSS feed
 */
export function validateRSSFeed(xmlString) {
  try {
    // Check for basic RSS structure
    const hasRss = /<rss[^>]*>/i.test(xmlString);
    const hasChannel = /<channel[^>]*>/i.test(xmlString);
    const hasItems = /<item[^>]*>/i.test(xmlString);
    
    return hasRss && hasChannel && hasItems;
  } catch (error) {
    return false;
  }
}

/**
 * Extract feed metadata using regex
 * @param {string} xmlString - Raw RSS XML string
 * @returns {Object} Feed metadata
 */
export function extractFeedMetadata(xmlString) {
  try {
    const channelMatch = xmlString.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i);
    if (!channelMatch) {
      throw new Error('Invalid RSS feed structure');
    }
    
    const channelContent = channelMatch[1];
    const items = extractXMLItems(xmlString);
    
    return {
      title: extractXMLField(channelContent, 'title'),
      description: extractXMLField(channelContent, 'description'),
      link: extractXMLField(channelContent, 'link'),
      lastBuildDate: extractXMLField(channelContent, 'lastBuildDate'),
      itemCount: items.length
    };
  } catch (error) {
    throw new Error(`Failed to extract feed metadata: ${error.message}`);
  }
}