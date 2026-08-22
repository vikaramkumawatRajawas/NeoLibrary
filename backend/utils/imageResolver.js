import { isValidUrl } from './urlParser.js';

// Topic-specific high-resolution Unsplash image repository (40+ unique crisp images)
export const TOPIC_IMAGE_REPOSITORY = {
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=1600&q=85',
  ],
  cinema: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=85',
  ],
  music: [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1600&q=85',
  ],
  sports: [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=85',
  ],
  books: [
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=85',
  ],
  education: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=85',
  ],
  aviation: [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1600&q=85',
  ],
  science: [
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1600&q=85',
  ],
  architecture: [
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
  ],
  news: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=85',
  ]
};

/**
 * Phase 5 — Reject low-quality placeholders, trackers, avatars & logos
 */
export function isUsableImage(url) {
  if (!url || typeof url !== 'string' || url.trim().length === 0) return false;
  const lower = url.toLowerCase();

  // Obvious low-quality/placeholder patterns
  const REJECT_PATTERNS = [
    'placeholder', 'default_image', 'dummy', 'loading', 'loader', 'skeleton',
    'avatar-placeholder', 'blank.gif', 'blank.png', 'transparent.gif', '1x1',
    'pixel.gif', 'tracking', 'pixel.png', 'logo.png', 'logo.svg', 'favicon',
    'ad_banner', 'advertisement', 'icon-set', 'social-share', 'button-bg'
  ];

  if (REJECT_PATTERNS.some(p => lower.includes(p))) {
    return false;
  }

  // Must be valid HTTP/HTTPS URL or data URI
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/');
}

/**
 * Phase 12 — Normalize & resolve relative URLs against base URL
 */
export function normalizeImageUrl(rawUrl, baseUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let cleaned = rawUrl.trim();

  // Clean trailing query params or space-separated descriptors
  if (cleaned.includes(' ')) {
    cleaned = cleaned.split(' ')[0];
  }

  if (cleaned.startsWith('//')) {
    return `https:${cleaned}`;
  }

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned;
  }

  if (baseUrl) {
    try {
      return new URL(cleaned, baseUrl).href;
    } catch (e) {
      return '';
    }
  }

  return '';
}

/**
 * Phase 4 — Proper srcset Parsing
 * Parses srcset strings (e.g. "image-small.jpg 480w, image-large.jpg 1200w")
 * and extracts candidates ordered by width descriptor descending.
 */
export function parseSrcset(srcsetStr, baseUrl) {
  if (!srcsetStr || typeof srcsetStr !== 'string') return [];
  const entries = srcsetStr.split(',').map(e => e.trim()).filter(Boolean);
  const candidates = [];

  for (const entry of entries) {
    const parts = entry.split(/\s+/);
    const url = parts[0];
    const descriptor = parts[1] || '';

    let width = 0;
    if (descriptor.endsWith('w')) {
      width = parseInt(descriptor.replace('w', ''), 10) || 0;
    } else if (descriptor.endsWith('x')) {
      width = Math.round((parseFloat(descriptor.replace('x', '')) || 1) * 800);
    }

    const normalized = normalizeImageUrl(url, baseUrl);
    if (normalized && isUsableImage(normalized)) {
      candidates.push({ url: normalized, width });
    }
  }

  // Sort candidates by width descending (highest resolution first)
  candidates.sort((a, b) => b.width - a.width);
  return candidates.map(c => c.url);
}

/**
 * Phase 3 — Extract ALL Image Candidate URLs from an HTML element
 */
export function extractAllElementImageCandidates(el, $, baseUrl) {
  const candidates = [];
  const addCandidate = (raw) => {
    if (raw) {
      const norm = normalizeImageUrl(raw, baseUrl);
      if (norm && isUsableImage(norm) && !candidates.includes(norm)) {
        candidates.push(norm);
      }
    }
  };

  const $el = $(el);

  // Check picture tag sources first if parent is picture
  if ($el.parent('picture').length > 0) {
    $el.parent('picture').find('source').each((_, srcEl) => {
      const srcset = $(srcEl).attr('srcset') || $(srcEl).attr('data-srcset');
      if (srcset) {
        parseSrcset(srcset, baseUrl).forEach(addCandidate);
      }
    });
  }

  // Check srcset and data-srcset attributes
  const srcset = $el.attr('srcset') || $el.attr('data-srcset') || $el.attr('data-lazy-srcset');
  if (srcset) {
    parseSrcset(srcset, baseUrl).forEach(addCandidate);
  }

  // Check all common lazy loading attributes
  const lazyAttrs = [
    'src', 'data-src', 'data-original', 'data-lazy-src', 
    'data-image', 'data-fsrc', 'data-url', 'data-hi-res-src'
  ];

  for (const attr of lazyAttrs) {
    addCandidate($el.attr(attr));
  }

  return candidates;
}

/**
 * Phase 6 — Unique Deterministic Fallback Selection
 * Ensures adjacent cards & items in feed do NOT repeat the same fallback image!
 */
export function getUniqueFallbackImage(title = '', category = '', index = 0, usedSet = new Set()) {
  const text = (category + ' ' + title).toLowerCase();
  let pool = TOPIC_IMAGE_REPOSITORY.news;

  if (text.includes('food') || text.includes('dining') || text.includes('recipe') || text.includes('cocktail') || text.includes('restaurant')) {
    pool = TOPIC_IMAGE_REPOSITORY.food;
  } else if (text.includes('movie') || text.includes('cinema') || text.includes('film') || text.includes('janaki') || text.includes('sowcar')) {
    pool = TOPIC_IMAGE_REPOSITORY.cinema;
  } else if (text.includes('music') || text.includes('song') || text.includes('concert')) {
    pool = TOPIC_IMAGE_REPOSITORY.music;
  } else if (text.includes('sport') || text.includes('cricket') || text.includes('hockey') || text.includes('sindhu') || text.includes('match')) {
    pool = TOPIC_IMAGE_REPOSITORY.sports;
  } else if (text.includes('book') || text.includes('comic') || text.includes('nanavu') || text.includes('review')) {
    pool = TOPIC_IMAGE_REPOSITORY.books;
  } else if (text.includes('education') || text.includes('college') || text.includes('test') || text.includes('net')) {
    pool = TOPIC_IMAGE_REPOSITORY.education;
  } else if (text.includes('indigo') || text.includes('flight') || text.includes('aircraft')) {
    pool = TOPIC_IMAGE_REPOSITORY.aviation;
  } else if (text.includes('sci') || text.includes('health') || text.includes('tech') || text.includes('virus')) {
    pool = TOPIC_IMAGE_REPOSITORY.science;
  } else if (text.includes('chennai') || text.includes('madras') || text.includes('city') || text.includes('building')) {
    pool = TOPIC_IMAGE_REPOSITORY.architecture;
  }

  // Hash title for deterministic base selection
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }

  let selectedIndex = (Math.abs(hash) + index) % pool.length;
  let candidate = pool[selectedIndex];

  // If already used in feed and pool has unused options, pick an unused one
  if (usedSet.has(candidate)) {
    for (let offset = 1; offset < pool.length; offset++) {
      const altCandidate = pool[(selectedIndex + offset) % pool.length];
      if (!usedSet.has(altCandidate)) {
        candidate = altCandidate;
        break;
      }
    }
  }

  usedSet.add(candidate);
  return candidate;
}
