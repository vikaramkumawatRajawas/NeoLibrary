import axios from 'axios';
import { getCache, setCache } from './cacheService.js';
import { getDomainFromUrl, isValidUrl } from '../utils/urlParser.js';

// Topic-based 4K high resolution image bank for deterministic fallback matching
const TOPIC_IMAGE_BANK = {
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
  ],
  architecture: [
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  ],
  cinema: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
  ],
  music: [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  ],
  sports: [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1200&q=80',
  ],
  books: [
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
  ],
  education: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  ],
  aviation: [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
  ],
  science: [
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
  ],
  news: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
  ]
};

// Fallback sample dataset
const SAMPLE_DIGITAL_LIBRARY = [
  {
    id: 'sample-1',
    title: 'The Future of AI Systems: Building Autonomous Agentic Workflows',
    author: 'Dr. Evelyn Vance',
    url: 'https://arxiv.org/abs/2303.08774',
    content: 'An in-depth study of next-generation autonomous AI agents, tool orchestration, self-reflection loops, and multi-agent synergy.',
    category: 'Artificial Intelligence',
    date: '2026-04-15',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'sample-2',
    title: 'Quantum Computing Frontiers: Qubits to Fault-Tolerant Supercomputers',
    author: 'Prof. Marcus Sterling',
    url: 'https://nature.com/articles/s41586-023-00000',
    content: 'Exploring recent breakthroughs in topological qubits, error correction algorithms, and room-temperature quantum processors.',
    category: 'Quantum Physics',
    date: '2026-03-22',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80'
  }
];

export function extractSheetId(sheetInput) {
  if (!sheetInput) return '';
  const match = sheetInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : sheetInput.trim();
}

/**
 * Deterministically pick an image based on title string hash
 */
function getDeterministicImage(bank, titleString) {
  let hash = 0;
  for (let i = 0; i < titleString.length; i++) {
    hash = (hash << 5) - hash + titleString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % bank.length;
  return bank[index];
}

import { getUniqueFallbackImage, isUsableImage } from '../utils/imageResolver.js';

// Global used image set per request
const usedFallbackSet = new Set();

/**
 * Flexible Data-Mapping Layer with Priority 1 (Sheet Image) and Priority 3 (Unique Topic Fallback)
 */
export function normalizeSheetRow(rowObj, index) {
  const keys = Object.keys(rowObj);

  const findValue = (patterns) => {
    for (const key of keys) {
      const normalizedKey = key.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
      if (patterns.some(p => normalizedKey.includes(p))) {
        const val = rowObj[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
    return '';
  };

  const title = findValue(['title', 'name', 'headline', 'topic', 'article', 'heading']) || `Article #${index + 1}`;
  const author = findValue(['author', 'by', 'creator', 'writer', 'byline', 'source']) || 'The Hindu Editorial';
  const rawUrl = findValue(['url', 'link', 'website', 'sourceurl', 'articleurl', 'href']);
  const content = findValue(['content', 'description', 'summary', 'excerpt', 'text', 'abstract', 'details', 'body']);
  let category = findValue(['category', 'type', 'tag', 'topic', 'section', 'genre']);
  const date = findValue(['date', 'published', 'timestamp', 'created', 'time']);

  // Priority 1 — Detect Image Column from Google Sheet
  const sheetImage = findValue(['image', 'image_url', 'imageurl', 'thumbnail', 'thumbnail_url', 'cover', 'cover_image', 'featured_image', 'photo']);

  const url = isValidUrl(rawUrl) ? rawUrl : (rawUrl ? `https://${rawUrl}` : '');

  // Derive Category from URL path if not in column
  if (!category && url) {
    try {
      const pathParts = new URL(url).pathname.split('/').filter(p => p && !p.endsWith('.ece') && !p.startsWith('article'));
      if (pathParts.length >= 2) {
        category = pathParts.slice(0, 2).map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')).join(' • ');
      } else if (pathParts.length === 1) {
        category = pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1).replace(/-/g, ' ');
      }
    } catch (e) {}
  }
  if (!category) category = 'News & Feature';

  // Priority 1 vs Priority 3: Title-Based Topic Fallback Engine
  let image = '';
  let imageSource = 'fallback';

  if (sheetImage && isValidUrl(sheetImage) && isUsableImage(sheetImage)) {
    image = sheetImage;
    imageSource = 'sheet';
  } else {
    image = getUniqueFallbackImage(title, category, index, usedFallbackSet);
    imageSource = 'fallback';
  }

  return {
    id: `item-${index}-${Date.now().toString(36)}`,
    title,
    author: author || 'The Hindu Editorial',
    url,
    content: content || `Click to read full article from ${url ? new URL(url).hostname : 'source'}.`,
    category,
    date: date || new Date().toISOString().split('T')[0],
    image,
    imageSource,
  };
}

function parseCsvToObjects(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const parseLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    if (Object.values(obj).some(v => v.length > 0)) {
      rows.push(obj);
    }
  }
  return rows;
}

function parseGvizResponse(gvizText) {
  const jsonMatch = gvizText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
  if (!jsonMatch) throw new Error('Invalid GViz response format');
  const parsed = JSON.parse(jsonMatch[1]);
  if (!parsed.table || !parsed.table.rows || parsed.table.rows.length === 0) return [];

  let headers = (parsed.table.cols || []).map(col => (col.label || col.id || '').trim());
  let rows = parsed.table.rows;

  const firstRowCells = rows[0]?.c || [];
  const firstRowValues = firstRowCells.map(c => c ? String(c.v || '').trim() : '');
  
  const isHeaderRow = firstRowValues.some(val => 
    ['title', 'name', 'headline', 'url', 'link', 'author', 'by', 'category', 'date', 'image', 'photo', 'cover', 'thumbnail'].some(term => val.toLowerCase().includes(term))
  );

  if (isHeaderRow) {
    headers = firstRowValues.map((val, idx) => val || headers[idx] || `col_${idx}`);
    rows = rows.slice(1);
  }

  return rows.map(row => {
    const obj = {};
    (row.c || []).forEach((cell, idx) => {
      const header = headers[idx] || `col_${idx}`;
      obj[header] = cell ? (cell.v !== null ? String(cell.v).trim() : '') : '';
    });
    return obj;
  });
}

export async function fetchSheetContent(sheetInput, apiKey = '') {
  const sheetId = extractSheetId(sheetInput) || process.env.DEFAULT_SHEET_ID;
  const cacheKey = `sheet_data_v2_${sheetId}`;
  
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const effectiveApiKey = apiKey || process.env.GOOGLE_SHEETS_API_KEY;

  if (effectiveApiKey) {
    try {
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${effectiveApiKey}`;
      const response = await axios.get(apiUrl, { timeout: 8000 });
      if (response.data && response.data.values && response.data.values.length > 1) {
        const [headers, ...rows] = response.data.values;
        const rowObjects = rows.map(r => {
          const obj = {};
          headers.forEach((h, idx) => {
            obj[h] = r[idx] || '';
          });
          return obj;
        });

        const items = rowObjects.map((row, idx) => normalizeSheetRow(row, idx));
        const result = {
          success: true,
          sourceType: 'google_sheets_api',
          sheetId,
          count: items.length,
          items,
          categories: [...new Set(items.map(i => i.category))],
          authors: [...new Set(items.map(i => i.author))],
          fetchedAt: new Date().toISOString()
        };
        setCache(cacheKey, result, 600);
        return result;
      }
    } catch (e) {
      console.warn(`[Sheet API Error] ${e.message}`);
    }
  }

  try {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    const response = await axios.get(gvizUrl, { timeout: 8000 });
    const rowObjects = parseGvizResponse(response.data);
    if (rowObjects.length > 0) {
      const items = rowObjects.map((row, idx) => normalizeSheetRow(row, idx));
      const result = {
        success: true,
        sourceType: 'gviz_public',
        sheetId,
        count: items.length,
        items,
        categories: [...new Set(items.map(i => i.category))],
        authors: [...new Set(items.map(i => i.author))],
        fetchedAt: new Date().toISOString()
      };
      setCache(cacheKey, result, 600);
      return result;
    }
  } catch (e) {
    console.warn(`[GViz Fetch Error] ${e.message}`);
  }

  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await axios.get(csvUrl, { timeout: 8000 });
    const rowObjects = parseCsvToObjects(response.data);
    if (rowObjects.length > 0) {
      const items = rowObjects.map((row, idx) => normalizeSheetRow(row, idx));
      const result = {
        success: true,
        sourceType: 'csv_public',
        sheetId,
        count: items.length,
        items,
        categories: [...new Set(items.map(i => i.category))],
        authors: [...new Set(items.map(i => i.author))],
        fetchedAt: new Date().toISOString()
      };
      setCache(cacheKey, result, 600);
      return result;
    }
  } catch (e) {
    console.warn(`[CSV Fetch Error] ${e.message}`);
  }

  const items = SAMPLE_DIGITAL_LIBRARY.map((row, idx) => normalizeSheetRow(row, idx));
  const fallbackResult = {
    success: true,
    sourceType: 'sample_fallback',
    sheetId,
    notice: 'Spreadsheet requires private Google sign-in or API Key.',
    count: items.length,
    items,
    categories: [...new Set(items.map(i => i.category))],
    authors: [...new Set(items.map(i => i.author))],
    fetchedAt: new Date().toISOString()
  };
  setCache(cacheKey, fallbackResult, 300);
  return fallbackResult;
}
