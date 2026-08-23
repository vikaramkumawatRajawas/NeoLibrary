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
  console.log('[THE-HINDU] Fetch started');

  const envSheetId = process.env.THE_HINDU_SHEET_ID || process.env.GOOGLE_SHEET_ID || process.env.DEFAULT_SHEET_ID;
  const envSheetUrl = process.env.THE_HINDU_SHEET_URL || process.env.DEFAULT_SHEET_URL;

  let sheetId = '';
  if (sheetInput && typeof sheetInput === 'string' && sheetInput.trim().length > 0) {
    sheetId = extractSheetId(sheetInput);
  }
  if (!sheetId && envSheetId) {
    sheetId = extractSheetId(envSheetId);
  }
  if (!sheetId && envSheetUrl) {
    sheetId = extractSheetId(envSheetUrl);
  }
  if (!sheetId) {
    sheetId = DEFAULT_THE_HINDU_SHEET_ID;
  }

  const sheetName = process.env.THE_HINDU_SHEET_NAME || process.env.SHEET_NAME || '';
  const sheetRange = process.env.THE_HINDU_SHEET_RANGE || process.env.SHEET_RANGE || 'A1:Z1000';
  const sheetGid = process.env.THE_HINDU_GID || process.env.GID || '';
  const effectiveApiKey = apiKey || process.env.GOOGLE_SHEETS_API_KEY || '';

  console.log(`[THE-HINDU] Spreadsheet configured: YES (${maskSheetId(sheetId)})`);
  console.log(`[THE-HINDU] Worksheet configured: ${sheetName ? `YES (${sheetName})` : 'DEFAULT'}`);
  console.log(`[THE-HINDU] API configuration: ${effectiveApiKey ? 'YES (API Key)' : 'PUBLIC ACCESS'}`);

  const cacheKey = `sheet_data_v3_${sheetId}_${sheetName}_${sheetGid}`;
  const cached = getCache(cacheKey);
  if (cached && cached.success && cached.items && cached.items.length > 0) {
    console.log(`[THE-HINDU] Cache hit: Serving ${cached.items.length} cached articles for ${maskSheetId(sheetId)}`);
    console.log(`[THE-HINDU] API response sent: ${cached.items.length} articles`);
    return cached;
  }
  console.log(`[THE-HINDU] Cache miss: Fetching fresh sheet data for ${maskSheetId(sheetId)}`);

  const httpHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
  };

  // Strategy 1: Google Sheets API v4 with API Key
  if (effectiveApiKey) {
    try {
      const rangeParam = sheetName ? `${encodeURIComponent(sheetName)}!${sheetRange}` : sheetRange;
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${rangeParam}?key=${effectiveApiKey}`;
      const response = await axios.get(apiUrl, { timeout: 15000, headers: httpHeaders });
      if (response.data && response.data.values && response.data.values.length > 0) {
        const rawValues = response.data.values;
        const [headers, ...rows] = rawValues;
        const rowObjects = rows.map(r => {
          const obj = {};
          (headers || []).forEach((h, idx) => {
            obj[h] = r[idx] || '';
          });
          return obj;
        });

        const items = rowObjects.map((row, idx) => normalizeSheetRow(row, idx)).filter(item => item && item.title);
        console.log(`[THE-HINDU] Google response received (API v4)`);
        console.log(`[THE-HINDU] Rows received: ${rows.length}`);
        console.log(`[THE-HINDU] Articles parsed: ${items.length}`);

        if (items.length > 0) {
          const result = {
            success: true,
            source: 'the-hindu',
            sourceType: 'google_sheets_api',
            sheetId,
            count: items.length,
            items,
            data: items,
            categories: [...new Set(items.map(i => i.category))],
            authors: [...new Set(items.map(i => i.author))],
            fetchedAt: new Date().toISOString()
          };
          setCache(cacheKey, result, 600);
          console.log(`[THE-HINDU] API response sent: ${items.length} articles`);
          return result;
        }
      }
    } catch (e) {
      console.warn(`[THE-HINDU] API Key strategy failed: ${e.message}`);
    }
  }

  // Strategy 2: Google Visualization API (GViz Endpoint)
  try {
    let gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    if (sheetName) gvizUrl += `&sheet=${encodeURIComponent(sheetName)}`;
    if (sheetGid) gvizUrl += `&gid=${sheetGid}`;

    const response = await axios.get(gvizUrl, { timeout: 15000, headers: httpHeaders });
    const rowObjects = parseGvizResponse(response.data);
    const items = rowObjects.map((row, idx) => normalizeSheetRow(row, idx)).filter(item => item && item.title);
    console.log(`[THE-HINDU] Google response received (GViz)`);
    console.log(`[THE-HINDU] Rows received: ${rowObjects.length}`);
    console.log(`[THE-HINDU] Articles parsed: ${items.length}`);

    if (items.length > 0) {
      const result = {
        success: true,
        source: 'the-hindu',
        sourceType: 'gviz_public',
        sheetId,
        count: items.length,
        items,
        data: items,
        categories: [...new Set(items.map(i => i.category))],
        authors: [...new Set(items.map(i => i.author))],
        fetchedAt: new Date().toISOString()
      };
      setCache(cacheKey, result, 600);
      console.log(`[THE-HINDU] API response sent: ${items.length} articles`);
      return result;
    }
  } catch (e) {
    console.warn(`[THE-HINDU] GViz strategy failed: ${e.message}`);
  }

  // Strategy 3: Public CSV Export
  try {
    let csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    if (sheetGid) csvUrl += `&gid=${sheetGid}`;
    if (sheetName) csvUrl += `&sheet=${encodeURIComponent(sheetName)}`;

    const response = await axios.get(csvUrl, { timeout: 15000, headers: httpHeaders });
    const rowObjects = parseCsvToObjects(response.data);
    const items = rowObjects.map((row, idx) => normalizeSheetRow(row, idx)).filter(item => item && item.title);
    console.log(`[THE-HINDU] Google response received (CSV)`);
    console.log(`[THE-HINDU] Rows received: ${rowObjects.length}`);
    console.log(`[THE-HINDU] Articles parsed: ${items.length}`);

    if (items.length > 0) {
      const result = {
        success: true,
        source: 'the-hindu',
        sourceType: 'csv_public',
        sheetId,
        count: items.length,
        items,
        data: items,
        categories: [...new Set(items.map(i => i.category))],
        authors: [...new Set(items.map(i => i.author))],
        fetchedAt: new Date().toISOString()
      };
      setCache(cacheKey, result, 600);
      console.log(`[THE-HINDU] API response sent: ${items.length} articles`);
      return result;
    }
  } catch (e) {
    console.warn(`[THE-HINDU] CSV strategy failed: ${e.message}`);
  }

  // If all strategies fail, do NOT return fake/sample data. Throw proper error.
  console.error(`[THE-HINDU] ERROR: Unable to fetch The Hindu Google Sheet for Spreadsheet ID ${maskSheetId(sheetId)}`);
  const err = new Error('Unable to fetch The Hindu Google Sheet');
  err.statusCode = 500;
  throw err;
}


