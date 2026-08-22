import axios from 'axios';
import { getCache, setCache } from './cacheService.js';
import { isValidUrl } from '../utils/urlParser.js';
import { getUniqueFallbackImage, isUsableImage } from '../utils/imageResolver.js';

const usedFallbackSet = new Set();
const DEFAULT_THE_HINDU_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1KDVGSCjW9CU7-4HLi0hpXotlG8F8yVRIla0Pnw2cdTg/edit?usp=sharing';
const DEFAULT_THE_HINDU_SHEET_ID = '1KDVGSCjW9CU7-4HLi0hpXotlG8F8yVRIla0Pnw2cdTg';

export function extractSheetId(sheetInput) {
  if (!sheetInput) return '';
  const match = sheetInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : sheetInput.trim();
}

/**
 * Mask Spreadsheet ID for secure server logs
 */
function maskSheetId(id) {
  if (!id || id.length < 8) return '****';
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

/**
 * Normalize Spreadsheet Rows
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

  const sheetImage = findValue(['image', 'image_url', 'imageurl', 'thumbnail', 'thumbnail_url', 'cover', 'cover_image', 'featured_image', 'photo']);

  const url = isValidUrl(rawUrl) ? rawUrl : (rawUrl ? `https://${rawUrl}` : '');

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

/**
 * Main Google Sheet Fetcher Service
 */
export async function fetchSheetContent(sheetInput, apiKey = '') {
  const effectiveInput = sheetInput || process.env.DEFAULT_SHEET_URL || DEFAULT_THE_HINDU_SHEET_URL;
  const sheetId = extractSheetId(effectiveInput) || process.env.GOOGLE_SHEET_ID || process.env.DEFAULT_SHEET_ID || DEFAULT_THE_HINDU_SHEET_ID;
  
  console.log(`[Sheet Service] Processing Spreadsheet ID: ${maskSheetId(sheetId)}`);

  const cacheKey = `sheet_data_v2_${sheetId}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log(`[Sheet Service] Serving cached dataset for ${maskSheetId(sheetId)}`);
    return cached;
  }

  const effectiveApiKey = apiKey || process.env.GOOGLE_SHEETS_API_KEY;

  // Strategy 1: Google Sheets API v4 with API Key
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
      console.warn(`[Sheet API Key Strategy Failed] ${e.message}`);
    }
  }

  // Strategy 2: Google Visualization API (Public / Anyone with link)
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
    console.warn(`[GViz Strategy Failed] ${e.message}`);
  }

  // Strategy 3: Public CSV Export
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
    console.warn(`[CSV Export Strategy Failed] ${e.message}`);
  }

  // Strategy 4: Fallback to Curated 3D Library
  console.info(`[Sheet Service] Spreadsheet ${maskSheetId(sheetId)} requires authentication. Serving library fallback.`);
  
  const sampleItems = [
    {
      id: 'sample-1',
      title: 'From heritage to high-rises, how Chennai grew taller',
      author: 'R. Aishwaryaa',
      url: 'https://www.thehindu.com/news/cities/chennai/madras-day-2026-from-heritage-to-high-rises-how-chennai-grew-taller/article71369048.ece',
      content: 'Exploring the architectural transformation of Chennai from heritage colonial landmarks to modern skyscrapers.',
      category: 'News • Cities',
      date: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  const fallbackItems = sampleItems.map((row, idx) => normalizeSheetRow(row, idx));
  const fallbackResult = {
    success: true,
    sourceType: 'sample_fallback',
    sheetId,
    notice: 'Spreadsheet requires private Google sign-in or API Key.',
    count: fallbackItems.length,
    items: fallbackItems,
    categories: [...new Set(fallbackItems.map(i => i.category))],
    authors: [...new Set(fallbackItems.map(i => i.author))],
    fetchedAt: new Date().toISOString()
  };
  setCache(cacheKey, fallbackResult, 300);
  return fallbackResult;
}
